// Copie dans vendor/ le compilateur TypeScript 5.9 et ses bibliothèques de types.
// Lancer : node outils/preparer-vendor.mjs <dossier contenant node_modules/typescript/lib>
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const lib = process.argv[2];
const vendor = join(dirname(fileURLToPath(import.meta.url)), "..", "vendor");
const libs = {};

function ajouter(nom) {
  if (nom in libs) return;
  const texte = readFileSync(join(lib, nom), "utf8");
  libs[nom] = texte;
  for (const m of texte.matchAll(/\/\/\/\s*<reference lib="([^"]+)"/g)) ajouter(`lib.${m[1]}.d.ts`);
}

ajouter("lib.es2022.d.ts");
ajouter("lib.dom.d.ts");
writeFileSync(join(vendor, "ts-libs.json"), JSON.stringify(libs));
copyFileSync(join(lib, "typescript.js"), join(vendor, "typescript.js"));
console.log(Object.keys(libs).length, "bibliothèques copiées");
