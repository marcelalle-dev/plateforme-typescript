// Génère data/sources.js à partir des documents fournis et du code des exercices :
//   - le code TypeScript vient de ../src/exerciceNN.ts
//   - le code JavaScript, le titre et le niveau viennent de ../docs/*.docx
//   - la sortie vient de l'exécution réelle de chaque exercice (fuseau UTC)
// Lancer : node outils/generer-sources.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { inflateRawSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const racine = join(ici, "..", "..");
const PLAGES = ["001-010", "011-020", "021-030", "031-040", "041-050"];

function lireDansZip(chemin, nom) {
  const zip = readFileSync(chemin);
  let fin = zip.length - 22;
  while (zip.readUInt32LE(fin) !== 0x06054b50) fin -= 1;
  let pos = zip.readUInt32LE(fin + 16);
  for (let i = 0; i < zip.readUInt16LE(fin + 10); i += 1) {
    const methode = zip.readUInt16LE(pos + 10);
    const tailleComp = zip.readUInt32LE(pos + 20);
    const lgNom = zip.readUInt16LE(pos + 28);
    const lgExtra = zip.readUInt16LE(pos + 30);
    const lgComm = zip.readUInt16LE(pos + 32);
    const local = zip.readUInt32LE(pos + 42);
    if (zip.toString("utf8", pos + 46, pos + 46 + lgNom) === nom) {
      const debut = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const brut = zip.subarray(debut, debut + tailleComp);
      return (methode === 0 ? brut : inflateRawSync(brut)).toString("utf8");
    }
    pos += 46 + lgNom + lgExtra + lgComm;
  }
  throw new Error(`${nom} absent de ${chemin}`);
}

const decoder = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

function paragraphes(xml) {
  return [...xml.matchAll(/<w:p(?: [^>]*)?>([\s\S]*?)<\/w:p>|<w:p(?: [^>]*)?\/>/g)].map((m) => {
    const contenu = m[1] ?? "";
    const style = /<w:pStyle w:val="([^"]+)"/.exec(contenu)?.[1] ?? "";
    let texte = "";
    for (const n of contenu.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>|<w:br\s*\/>|<w:tab\s*\/>/g)) {
      if (n[0].startsWith("<w:br")) texte += "\n";
      else if (n[0].startsWith("<w:tab")) texte += "\t";
      else texte += decoder(n[1] ?? "");
    }
    return { style, texte };
  });
}

const blocsDoc = new Map();
for (const plage of PLAGES) {
  const xml = lireDansZip(join(racine, "docs", `exercices_${plage}.docx`), "word/document.xml");
  let courant = null;
  for (const { style, texte } of paragraphes(xml)) {
    const titre = /^exercice(\d+)\.js$/.exec(texte.trim());
    if (style.startsWith("Heading") && titre) {
      courant = [];
      blocsDoc.set(Number(titre[1]), courant);
    } else if (courant) {
      courant.push(texte);
    }
  }
}

const NIVEAUX = { "Débutant": "debutant", "Élémentaire": "elementaire", "Intermédiaire": "intermediaire", "Avancé": "avance" };
const tsx = join(racine, "node_modules", "tsx", "dist", "cli.mjs");
const sources = [];

for (let id = 1; id <= 50; id += 1) {
  const nn = String(id).padStart(2, "0");
  const doc = blocsDoc.get(id);
  if (!doc) throw new Error(`Exercice ${id} absent des documents`);
  const js = doc.join("\n").replace(/\s+$/, "");
  const entete = /^\/\/ Exercice \d+ · (★+☆*) (\S+) — (.+)$/m.exec(js);
  if (!entete) throw new Error(`En-tête illisible pour l'exercice ${id}`);
  const fichier = join(racine, "src", `exercice${nn}.ts`);
  const ts = readFileSync(fichier, "utf8").replace(/\r\n/g, "\n").replace(/\s+$/, "");
  const sortie = execFileSync(process.execPath, [tsx, fichier], {
    env: { ...process.env, TZ: "UTC", NO_COLOR: "1" },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  sources.push({
    id,
    titre: entete[3].trim(),
    niveau: NIVEAUX[entete[2]],
    ts,
    js,
    sortie: sortie.replace(/\r\n/g, "\n").replace(/\s+$/, ""),
  });
  process.stdout.write(`${nn} `);
}

writeFileSync(
  join(ici, "..", "data", "sources.js"),
  `// Fichier généré par outils/generer-sources.mjs : ne pas modifier à la main.\nexport const SOURCES = ${JSON.stringify(sources, null, 1)};\n`,
);
console.log("\ndata/sources.js écrit :", sources.length, "exercices");
