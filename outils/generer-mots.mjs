// Génère data/mots.js : les mots qui apparaissent pour la première fois dans chaque exercice,
// et ceux du code de départ de la pratique que le cours n'a pas encore présentés.
// Lancer : node outils/generer-mots.mjs
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXERCICES } from "../data/index.js";
import { extraireMots } from "../js/mots-code.js";

const ici = dirname(fileURLToPath(import.meta.url));
const ts = createRequire(import.meta.url)(join(ici, "..", "vendor", "typescript.js"));
const vus = new Set();
const nouveaux = {};

const pratique = {};

for (const { id, ts: code, pratique: exercice } of EXERCICES) {
  nouveaux[id] = extraireMots(ts, code).filter((mot) => !vus.has(mot));
  nouveaux[id].forEach((mot) => vus.add(mot));
  pratique[id] = extraireMots(ts, exercice.depart).filter((mot) => !vus.has(mot));
}

writeFileSync(
  join(ici, "..", "data", "mots.js"),
  `// Fichier généré par outils/generer-mots.mjs : ne pas modifier à la main.\nexport const MOTS_NOUVEAUX = ${JSON.stringify(nouveaux, null, 1)};\nexport const MOTS_PRATIQUE = ${JSON.stringify(pratique, null, 1)};\n`,
);
console.log("data/mots.js écrit :", vus.size, "mots");
