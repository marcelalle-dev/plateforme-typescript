// Génère data/traces.js : le déroulement réel de chaque exercice, étape par étape.
// Le code est instrumenté puis exécuté : les valeurs affichées sont celles du vrai programme.
// La sortie obtenue doit être identique à celle de l'exercice, sinon le script échoue.
// Lancer (fuseau UTC, comme les sources) : node outils/generer-traces.mjs
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "node:util";
import { SOURCES } from "../data/sources.js";

process.env.TZ = "UTC";
const ici = dirname(fileURLToPath(import.meta.url));
const ts = createRequire(import.meta.url)(join(ici, "..", "vendor", "typescript.js"));
const MAX_ETAPES = 120;

function nomsDe(nom, noms = []) {
  if (ts.isIdentifier(nom)) noms.push(nom.text);
  else for (const e of nom.elements) if (e.name) nomsDe(e.name, noms);
  return noms;
}

function instrumenter(source) {
  return (contexte) => {
    const f = contexte.factory;
    const ligne = (pos) => source.getLineAndCharacterOfPosition(pos).line + 1;
    const plage = (n) => [ligne(n.getStart(source)), ligne(n.getEnd())];

    const variables = (pile) => f.createArrayLiteralExpression(
      [...new Set(pile.flatMap((s) => [...s]))].map((nom) => f.createArrayLiteralExpression([
        f.createStringLiteral(nom),
        f.createArrowFunction(undefined, undefined, [], undefined, undefined, f.createIdentifier(nom)),
      ])),
    );
    const appel = (nomFn, n, genre, pile, valeur) => f.createCallExpression(f.createIdentifier(nomFn), undefined, [
      f.createNumericLiteral(plage(n)[0]),
      f.createNumericLiteral(plage(n)[1]),
      f.createStringLiteral(genre),
      variables(pile),
      ...(valeur ? [valeur] : []),
    ]);
    const pas = (n, genre, pile, valeur) => f.createExpressionStatement(appel("__pas", n, genre, pile, valeur));

    function fonction(n, pile) {
      const portee = new Set(n.parameters.flatMap((p) => nomsDe(p.name)));
      const interne = pile.length === 1 ? [portee] : [...pile, portee];
      let corps;
      if (ts.isBlock(n.body)) {
        corps = bloc(n.body, interne);
      } else {
        const valeur = expression(n.body, interne);
        const temp = f.createUniqueName("__r");
        corps = f.createBlock([
          f.createVariableStatement(undefined, f.createVariableDeclarationList(
            [f.createVariableDeclaration(temp, undefined, undefined, valeur)], ts.NodeFlags.Const)),
          pas(n.body, "retour", interne, temp),
          f.createReturnStatement(temp),
        ], true);
      }
      if (ts.isArrowFunction(n)) {
        return f.updateArrowFunction(n, n.modifiers, n.typeParameters, n.parameters, n.type, n.equalsGreaterThanToken, corps);
      }
      return f.updateFunctionDeclaration(n, n.modifiers, n.asteriskToken, n.name, n.typeParameters, n.parameters, n.type, corps);
    }

    function expression(n, pile) {
      const visiter = (e) => {
        if (ts.isArrowFunction(e)) return fonction(e, pile);
        return ts.visitEachChild(e, visiter, contexte);
      };
      return visiter(n);
    }

    function bloc(n, pile, avant = []) {
      const portee = new Set();
      const interne = [...pile, portee];
      return f.updateBlock(n, [...avant, ...instructions(n.statements, interne, portee)]);
    }

    function instructions(liste, pile, portee) {
      const sortie = [];
      for (const s of liste) sortie.push(...instruction(s, pile, portee));
      return sortie;
    }

    function instruction(s, pile, portee) {
      if (ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isExportDeclaration(s)) return [s];
      if (ts.isFunctionDeclaration(s)) return s.body ? [fonction(s, pile)] : [s];
      if (ts.isVariableStatement(s)) {
        const visite = expression(s, pile);
        for (const d of s.declarationList.declarations) nomsDe(d.name).forEach((nom) => portee.add(nom));
        return [visite, pas(s, "instruction", pile)];
      }
      if (ts.isExpressionStatement(s)) return [expression(s, pile), pas(s, "instruction", pile)];
      if (ts.isReturnStatement(s)) {
        if (!s.expression) return [pas(s, "retour", pile), s];
        const temp = f.createUniqueName("__r");
        return [f.createBlock([
          f.createVariableStatement(undefined, f.createVariableDeclarationList(
            [f.createVariableDeclaration(temp, undefined, undefined, expression(s.expression, pile))], ts.NodeFlags.Const)),
          pas(s, "retour", pile, temp),
          f.createReturnStatement(temp),
        ], true)];
      }
      if (ts.isThrowStatement(s)) return [pas(s, "erreur", pile), expression(s, pile)];
      if (ts.isIfStatement(s)) {
        const test = appel("__test", s.expression, "condition", pile, expression(s.expression, pile));
        return [f.updateIfStatement(s, test, bloc(s.thenStatement, pile),
          s.elseStatement ? (ts.isIfStatement(s.elseStatement)
            ? f.createBlock(instruction(s.elseStatement, pile, portee), true)
            : bloc(s.elseStatement, pile)) : undefined)];
      }
      if (ts.isSwitchStatement(s)) {
        const clauses = s.caseBlock.clauses.map((c) => {
          const interne = new Set();
          const corps = instructions(c.statements, [...pile, interne], interne);
          return ts.isCaseClause(c) ? f.updateCaseClause(c, c.expression, corps) : f.updateDefaultClause(c, corps);
        });
        return [pas(s.expression, "aiguillage", pile, expression(s.expression, pile)),
          f.updateSwitchStatement(s, s.expression, f.updateCaseBlock(s.caseBlock, clauses))];
      }
      if (ts.isForOfStatement(s)) {
        const portee2 = new Set(nomsDe(s.initializer.declarations[0].name));
        const interne = [...pile, portee2];
        const entete = f.createExpressionStatement(appel("__pas", s.initializer, "boucle", interne));
        return [f.updateForOfStatement(s, s.awaitModifier, s.initializer, expression(s.expression, pile), bloc(s.statement, interne, [entete]))];
      }
      if (ts.isTryStatement(s)) {
        let attrape;
        if (s.catchClause) {
          const nom = s.catchClause.variableDeclaration;
          const portee2 = new Set(nom ? nomsDe(nom.name) : []);
          const interne = [...pile, portee2];
          const entete = f.createExpressionStatement(appel("__pas", s.catchClause, "attrape", interne));
          attrape = f.updateCatchClause(s.catchClause, nom, bloc(s.catchClause.block, interne, [entete]));
        }
        return [f.updateTryStatement(s, bloc(s.tryBlock, pile), attrape, s.finallyBlock)];
      }
      if (ts.isBlock(s)) return [bloc(s, pile)];
      return [expression(s, pile)];
    }

    return (fichier) => {
      const portee = new Set();
      return f.updateSourceFile(fichier, instructions(fichier.statements, [portee], portee));
    };
  };
}

function formater(valeur) {
  const texte = inspect(valeur, { depth: 2, breakLength: Infinity, compact: true });
  return texte.length > 140 ? `${texte.slice(0, 137)}...` : texte;
}

async function tracer({ id, ts: code, sortie: attendue }) {
  const source = ts.createSourceFile("/e.ts", code, ts.ScriptTarget.ES2022, true);
  const js = ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    transformers: { before: [instrumenter(source)] },
  }).outputText.replace(/^\s*export\s*\{\s*\}\s*;?\s*$/gm, "");

  const etapes = [];
  const sorties = [];
  let enAttente = [];
  let actif = true;

  function noter(debut, fin, genre, vars, valeur, aValeur) {
    if (!actif) return;
    const v = {};
    for (const [nom, lire] of vars) {
      try {
        const x = lire();
        if (typeof x !== "function") v[nom] = formater(x);
      } catch {
        // Variable pas encore initialisée à cet endroit.
      }
    }
    const etape = { l: [debut, fin], g: genre, v };
    if (aValeur) etape.r = formater(valeur);
    if (enAttente.length) {
      etape.s = enAttente;
      enAttente = [];
    }
    etapes.push(etape);
  }
  const __pas = (debut, fin, genre, vars, ...valeur) => noter(debut, fin, genre, vars, valeur[0], valeur.length > 0);
  const __test = (debut, fin, genre, vars, valeur) => {
    noter(debut, fin, genre, vars, Boolean(valeur), true);
    return valeur;
  };
  const consoleTrace = {
    log: (...args) => {
      const ligne = args.map((a) => (typeof a === "string" ? a : inspect(a))).join(" ");
      sorties.push(ligne);
      enAttente.push(ligne);
    },
  };
  const Asynchrone = Object.getPrototypeOf(async function () {}).constructor;
  await new Asynchrone("console", "__pas", "__test", js)(consoleTrace, __pas, __test);
  actif = false;

  const obtenue = sorties.join("\n");
  if (obtenue !== attendue) {
    throw new Error(`Exercice ${id} : sortie différente\n--- attendue\n${attendue}\n--- obtenue\n${obtenue}`);
  }
  const tronque = etapes.length > MAX_ETAPES;
  return { etapes: etapes.slice(0, MAX_ETAPES), tronque, total: etapes.length };
}

const traces = {};
const seul = process.argv[2] ? Number(process.argv[2]) : null;
for (const source of SOURCES) {
  if (seul && source.id !== seul) continue;
  traces[source.id] = await tracer(source);
}
if (seul) {
  console.log(JSON.stringify(traces[seul].etapes.slice(0, 12), null, 0));
} else {
  writeFileSync(
    join(ici, "..", "data", "traces.js"),
    `// Fichier généré par outils/generer-traces.mjs : ne pas modifier à la main.\nexport const TRACES = ${JSON.stringify(traces)};\n`,
  );
  const totaux = Object.entries(traces).map(([id, t]) => `${id}:${t.total}`).join(" ");
  console.log("data/traces.js écrit\n" + totaux);
}
