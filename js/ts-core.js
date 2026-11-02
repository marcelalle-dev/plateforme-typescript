// Cœur de la vérification du code : compilation TypeScript stricte puis exécution.
// Script classique sans import : chargé par le worker (importScripts) et par outils/verifier.mjs.
(function (global) {
  const OPTIONS = {
    target: 9, // ES2022
    module: 99, // ESNext
    moduleResolution: 100, // Bundler
    strict: true,
    noUncheckedIndexedAccess: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noImplicitOverride: true,
    skipLibCheck: true,
    noEmit: true,
    lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
  };

  const FICHIER = "/exercice.ts";

  function creerCompilateur(ts, libs) {
    const fichiersLib = new Map();

    function lireLib(nom) {
      if (!(nom in libs)) return undefined;
      if (!fichiersLib.has(nom)) {
        fichiersLib.set(nom, ts.createSourceFile("/lib/" + nom, libs[nom], ts.ScriptTarget.ES2022, true));
      }
      return fichiersLib.get(nom);
    }

    // Renvoie les erreurs TypeScript de `code`, avec les vérifications de types ajoutées à la fin.
    function diagnostiquer(code, testsTypes) {
      const texte = code + "\n" + (testsTypes || "") + "\nexport {};\n";
      const nbLignes = code.split("\n").length;
      const source = ts.createSourceFile(FICHIER, texte, ts.ScriptTarget.ES2022, true);
      const hote = {
        getSourceFile: (nom) => (nom === FICHIER ? source : lireLib(nom.split("/").pop())),
        getDefaultLibFileName: () => "/lib/lib.es2022.d.ts",
        getDefaultLibLocation: () => "/lib",
        writeFile: () => {},
        getCurrentDirectory: () => "/",
        getDirectories: () => [],
        getCanonicalFileName: (nom) => nom,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => "\n",
        fileExists: (nom) => nom === FICHIER || nom.split("/").pop() in libs,
        readFile: (nom) => (nom === FICHIER ? texte : libs[nom.split("/").pop()]),
      };
      const programme = ts.createProgram([FICHIER], OPTIONS, hote);
      const bruts = [...programme.getSyntacticDiagnostics(source), ...programme.getSemanticDiagnostics(source)];
      return bruts.map((d) => {
        const ligne = d.start === undefined ? 0 : source.getLineAndCharacterOfPosition(d.start).line + 1;
        return {
          code: d.code,
          ligne,
          message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
          dansTests: ligne > nbLignes,
        };
      });
    }

    function transpiler(code) {
      const js = ts.transpileModule(code, {
        compilerOptions: { target: OPTIONS.target, module: OPTIONS.module },
      }).outputText;
      return js.replace(/^\s*export\s*\{\s*\}\s*;?\s*$/gm, "");
    }

    return { diagnostiquer, transpiler };
  }

  function egal(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function formater(valeur, profondeur) {
    if (typeof valeur === "string") return profondeur ? "'" + valeur + "'" : valeur;
    if (valeur === null || typeof valeur !== "object") return String(valeur);
    if (valeur instanceof Date) return valeur.toISOString();
    if (valeur instanceof Error) return "Error: " + valeur.message;
    if (Array.isArray(valeur)) {
      return valeur.length ? "[ " + valeur.map((v) => formater(v, 1)).join(", ") + " ]" : "[]";
    }
    const cles = Object.keys(valeur);
    return cles.length ? "{ " + cles.map((k) => k + ": " + formater(valeur[k], 1)).join(", ") + " }" : "{}";
  }

  // Exécute le JavaScript obtenu et évalue les vérifications (expressions JS) dans sa portée.
  async function executer(js, verifications, ecrire) {
    const sortie = [];
    const consoleCapture = {};
    for (const nom of ["log", "info", "warn", "error", "debug"]) {
      consoleCapture[nom] = (...args) => {
        const ligne = ecrire ? ecrire(args) : args.map((a) => formater(a, 0)).join(" ");
        sortie.push(ligne);
      };
    }
    const Asynchrone = Object.getPrototypeOf(async function () {}).constructor;
    const corps = js + "\n;return [" + (verifications || []).map((v) => "async () => (" + v + ")").join(",\n") + "];";
    let tests = [];
    let erreur = null;
    try {
      tests = await new Asynchrone("console", "__egal", "__sortie", corps)(consoleCapture, egal, sortie);
    } catch (e) {
      erreur = e instanceof Error ? e.message : String(e);
    }
    const resultats = [];
    for (let i = 0; i < (verifications || []).length; i += 1) {
      if (!tests[i]) {
        resultats.push({ ok: false, erreur });
        continue;
      }
      try {
        resultats.push({ ok: Boolean(await tests[i]()), erreur: null });
      } catch (e) {
        resultats.push({ ok: false, erreur: e instanceof Error ? e.message : String(e) });
      }
    }
    return { sortie, erreur, resultats };
  }

  // any explicite refusé dans le code de l'apprenant : commentaires et chaînes ignorés.
  function contientAny(ts, code) {
    const scanner = ts.createScanner(ts.ScriptTarget.ES2022, true, ts.LanguageVariant.Standard, code);
    let jeton = scanner.scan();
    while (jeton !== ts.SyntaxKind.EndOfFileToken) {
      if (jeton === ts.SyntaxKind.AnyKeyword) return true;
      jeton = scanner.scan();
    }
    return false;
  }

  // Vérifie une réponse d'exercice pratique : mêmes règles dans le worker et dans le vérificateur.
  async function corriger(ts, compilateur, code, pratique, ecrire) {
    const diagnostics = compilateur.diagnostiquer(code, pratique.types);
    const any = contientAny(ts, code);
    let execution;
    try {
      execution = await executer(compilateur.transpiler(code), pratique.tests.map((t) => t[1]), ecrire);
    } catch (e) {
      execution = { sortie: [], erreur: String(e), resultats: pratique.tests.map(() => ({ ok: false, erreur: null })) };
    }
    const tests = pratique.tests.map((t, i) => ({ libelle: t[0], ...execution.resultats[i] }));
    const reussi = !diagnostics.length && !any && !execution.erreur && tests.every((t) => t.ok);
    return { reussi, diagnostics, any, tests, sortie: execution.sortie, erreur: execution.erreur };
  }

  global.TsCore = { creerCompilateur, executer, corriger, formater };
})(typeof self !== "undefined" ? self : globalThis);
