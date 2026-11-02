// Contrôle automatique des contenus : chaque affirmation vérifiable est confrontée au vrai compilateur.
//   - explications ligne par ligne : chaque ligne non vide du code est couverte
//   - quiz : formats, réponses, prédictions exécutées, erreurs compilées
//   - pratique : la solution réussit, le code de départ échoue
// Lancer : node outils/verifier.mjs [numéro d'exercice]
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "node:util";

const ici = dirname(fileURLToPath(import.meta.url));
const racine = join(ici, "..");
const ts = createRequire(import.meta.url)(join(racine, "vendor", "typescript.js"));
await import("../js/ts-core.js");
const { TsCore } = globalThis;
const libs = JSON.parse(readFileSync(join(racine, "vendor", "ts-libs.json"), "utf8"));
const { EXERCICES } = await import("../data/index.js");
const { definition, GLOSSAIRE, cleMot } = await import("../data/glossaire.js");
const { MOTS_NOUVEAUX } = await import("../data/mots.js");
const { extraireMots } = await import("../js/mots-code.js");
const { creerCompilateur, executer, corriger } = TsCore;
const compilateur = creerCompilateur(ts, libs);

const seul = process.argv[2] ? Number(process.argv[2]) : null;
const problemes = [];
const FORMATS = ["choix", "multi", "vf", "prediction", "erreur", "completer"];
const CHAMPS = ["objectif", "simple", "lignes", "erreurs", "retenir", "quiz", "pratique", "notion"];
const ecrire = (args) => args.map((a) => (typeof a === "string" ? a : inspect(a))).join(" ");
const stats = { questions: 0, predictions: 0, erreurs: 0, mots: 0 };
const motsUtilises = new Set();
const motsDejaVus = new Set();

function controlerMots(code, signaler, origine) {
  for (const mot of extraireMots(ts, code)) {
    motsUtilises.add(cleMot(mot));
    if (!definition(mot)) signaler(`mot sans explication (${origine}) : ${mot}`);
  }
}
const formatsVus = new Set();

function plage(spec) {
  const m = /^(\d+)(?:-(\d+))?$/.exec(spec);
  if (!m) return null;
  return [Number(m[1]), Number(m[2] ?? m[1])];
}

for (const ex of EXERCICES) {
  if (seul && ex.id !== seul) continue;
  const signaler = (texte) => problemes.push(`Ex ${ex.id} : ${texte}`);

  for (const champ of CHAMPS) if (!ex[champ] || ex[champ].length === 0) signaler(`champ absent : ${champ}`);
  if (!ex.lignes) continue;

  controlerMots(ex.ts, signaler, "cours");
  const attendus = extraireMots(ts, ex.ts).filter((mot) => !motsDejaVus.has(mot));
  attendus.forEach((mot) => motsDejaVus.add(mot));
  stats.mots += attendus.length;
  if (!seul && JSON.stringify(attendus) !== JSON.stringify(MOTS_NOUVEAUX[ex.id])) signaler("data/mots.js n'est pas à jour");

  const lignes = ex.ts.split("\n");
  const couvertes = new Map();
  for (const [spec, texte] of ex.lignes) {
    const p = plage(spec);
    if (!p) { signaler(`plage illisible : ${spec}`); continue; }
    if (!texte) signaler(`explication vide : ${spec}`);
    for (let n = p[0]; n <= p[1]; n += 1) {
      if (n > lignes.length) signaler(`ligne ${n} hors du fichier`);
      if (couvertes.has(n)) signaler(`ligne ${n} expliquée deux fois`);
      couvertes.set(n, true);
    }
  }
  lignes.forEach((l, i) => {
    if (l.trim() && !couvertes.has(i + 1)) signaler(`ligne ${i + 1} non expliquée : ${l.trim()}`);
  });

  const quiz = ex.quiz ?? [];
  if (quiz.length < 5 || quiz.length > 10) signaler(`quiz de ${quiz.length} questions`);
  if (new Set(quiz.map((q) => q.t)).size < 4) signaler("quiz avec moins de 4 formats");

  for (const [i, q] of quiz.entries()) {
    const nom = `Q${i + 1} (${q.t})`;
    stats.questions += 1;
    formatsVus.add(q.t);
    if (!FORMATS.includes(q.t)) signaler(`${nom} : format inconnu`);
    if (!q.q || !q.e) signaler(`${nom} : question ou explication absente`);
    if (["choix", "prediction", "erreur"].includes(q.t) && (!q.o?.[q.a])) signaler(`${nom} : réponse hors des options`);
    if (q.t === "multi" && (!Array.isArray(q.a) || q.a.length < 2 || q.a.some((a) => !q.o[a]))) signaler(`${nom} : réponses multiples invalides`);
    if (q.t === "vf" && typeof q.a !== "boolean") signaler(`${nom} : vrai/faux invalide`);
    if (q.t === "completer" && (!q.r?.length || !q.code?.includes("___"))) signaler(`${nom} : complétion invalide`);
    if (q.code) controlerMots(q.t === "completer" ? q.code.replace(/___/g, q.r[0]) : q.code, signaler, nom);
    if (q.o && new Set(q.o).size !== q.o.length) signaler(`${nom} : options en double`);

    if (q.t === "prediction") {
      stats.predictions += 1;
      const r = await executer(compilateur.transpiler(q.code), [], ecrire);
      const attendu = String(q.o[q.a]).replace(/`/g, "");
      if (r.erreur) signaler(`${nom} : le code plante : ${r.erreur}`);
      else if (r.sortie.join("\n") !== attendu) signaler(`${nom} : sortie réelle ${JSON.stringify(r.sortie.join("\n"))}, réponse ${JSON.stringify(attendu)}`);
      for (const [j, opt] of q.o.entries()) {
        if (j !== q.a && String(opt).replace(/`/g, "") === attendu) signaler(`${nom} : deux options justes`);
      }
      const d = compilateur.diagnostiquer(q.code, "");
      if (d.length && !q.compileMal) signaler(`${nom} : erreurs de compilation : ${d.map((x) => `TS${x.code}`).join(",")}`);
    }
    if (q.t === "erreur" && q.ts) {
      stats.erreurs += 1;
      const d = compilateur.diagnostiquer(q.code, "");
      if (!d.some((x) => x.code === q.ts)) signaler(`${nom} : TS${q.ts} attendu, obtenu ${d.map((x) => `TS${x.code}`).join(",") || "aucune erreur"}`);
    } else if (q.t === "erreur") {
      signaler(`${nom} : code d'erreur non déclaré`);
    }
    if (q.t === "completer" && q.verifier !== false) {
      const code = q.code.replace(/___/g, q.r[0]);
      if (q.prelude !== undefined) {
        const d = compilateur.diagnostiquer(q.prelude + "\n" + code, "");
        if (d.length) signaler(`${nom} : la réponse ne compile pas : ${d.map((x) => `TS${x.code} ${x.message}`).join(" ; ")}`);
      }
    }
  }

  const p = ex.pratique;
  if (p) {
    controlerMots(p.depart, signaler, "départ de la pratique");
    controlerMots(p.solution, signaler, "solution de la pratique");
    const sol = await corriger(ts, compilateur, p.solution, p, ecrire);
    if (!sol.reussi) {
      const detail = [
        ...sol.diagnostics.map((d) => `TS${d.code} l.${d.ligne} ${d.message}`),
        ...sol.tests.filter((t) => !t.ok).map((t) => `test « ${t.libelle} » ${t.erreur ?? ""}`),
        sol.erreur ?? "",
        sol.any ? "any" : "",
      ].filter(Boolean);
      signaler(`solution rejetée : ${detail.join(" | ")}`);
    }
    const dep = await corriger(ts, compilateur, p.depart, p, ecrire);
    if (dep.reussi) signaler("le code de départ réussit déjà");
    if (!p.enonce || !p.correction || !p.tests?.length) signaler("pratique incomplète");
  }
}

for (const f of FORMATS) if (!seul && !formatsVus.has(f)) problemes.push(`format jamais utilisé : ${f}`);

if (!seul) {
  for (const cle of Object.keys(GLOSSAIRE)) if (!motsUtilises.has(cle)) problemes.push(`explication inutile : ${cle}`);
}

console.log(`${stats.questions} questions, ${stats.predictions} prédictions exécutées, ${stats.erreurs} erreurs compilées, ${stats.mots} mots nouveaux`);
if (problemes.length) {
  console.log(`\n${problemes.length} problème(s) :`);
  for (const p of problemes) console.log(" -", p);
  process.exit(1);
}
console.log("Aucun problème détecté.");
