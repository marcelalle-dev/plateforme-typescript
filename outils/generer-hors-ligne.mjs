// Génère sw.js (les fichiers gardés sur l'appareil pour fonctionner sans Internet) et les icônes.
// À relancer après toute modification du site : npm run hors-ligne
// Avec --verifier, le script échoue si sw.js n'est plus à jour.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

function lister(dossier, filtre = () => true) {
  return readdirSync(join(racine, dossier)).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(join(racine, chemin)).isDirectory() ? lister(chemin, filtre) : [chemin];
  }).filter(filtre).map((c) => c.replace(/\\/g, "/"));
}

// --- Icônes : un carré bleu avec « TS », dessiné sans dépendance.
function crc32(octets) {
  let c = ~0;
  for (const o of octets) {
    c ^= o;
    for (let i = 0; i < 8; i += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function bloc(type, donnees) {
  const entete = Buffer.alloc(4);
  entete.writeUInt32BE(donnees.length);
  const corps = Buffer.concat([Buffer.from(type), donnees]);
  const fin = Buffer.alloc(4);
  fin.writeUInt32BE(crc32(corps));
  return Buffer.concat([entete, corps, fin]);
}

// Chaque rectangle est en fractions de l'icône : x, y, largeur, hauteur.
const LETTRES = [
  [0.17, 0.40, 0.30, 0.08], [0.28, 0.40, 0.08, 0.36],
  [0.53, 0.40, 0.30, 0.08], [0.53, 0.40, 0.08, 0.22], [0.53, 0.54, 0.30, 0.08], [0.75, 0.54, 0.08, 0.22], [0.53, 0.68, 0.30, 0.08],
];

function icone(taille) {
  const lignes = [];
  for (let y = 0; y < taille; y += 1) {
    const ligne = Buffer.alloc(1 + taille * 3);
    for (let x = 0; x < taille; x += 1) {
      const blanc = LETTRES.some(([a, b, l, h]) => x / taille >= a && x / taille < a + l && y / taille >= b && y / taille < b + h);
      const [r, v, b] = blanc ? [255, 255, 255] : [47, 111, 189];
      ligne.set([r, v, b], 1 + x * 3);
    }
    lignes.push(ligne);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(taille, 0);
  ihdr.writeUInt32BE(taille, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloc("IHDR", ihdr),
    bloc("IDAT", deflateSync(Buffer.concat(lignes), { level: 9 })),
    bloc("IEND", Buffer.alloc(0)),
  ]);
}

const verifier = process.argv.includes("--verifier");
if (!verifier) {
  for (const taille of [192, 512]) writeFileSync(join(racine, `icone-${taille}.png`), icone(taille));
}

// --- Liste des fichiers, en deux groupes : le compilateur, lourd, n'est retéléchargé que s'il change.
const lourds = ["vendor/typescript.js", "vendor/ts-libs.json"];
const site = [
  "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png",
  ...lister("css"), ...lister("js"), ...lister("data"),
  ...lister("vendor/fonts"), "vendor/supabase.js",
];

function empreinte(fichiers) {
  const h = createHash("sha256");
  for (const f of fichiers) {
    h.update(f);
    // Les fins de ligne dépendent de la plateforme : elles ne doivent pas changer l'empreinte.
    h.update(/\.(png|woff2)$/.test(f) ? readFileSync(join(racine, f)) : readFileSync(join(racine, f), "utf8").replace(/\r\n/g, "\n"));
  }
  return h.digest("hex").slice(0, 12);
}

const code = `// Fichier généré par outils/generer-hors-ligne.mjs : ne pas modifier à la main.
const GROUPES = ${JSON.stringify({
  [`ts50-site-${empreinte(site)}`]: site,
  [`ts50-compilateur-${empreinte(lourds)}`]: lourds,
}, null, 1)};
const NOMS = Object.keys(GROUPES);

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    for (const nom of NOMS) {
      if (await caches.has(nom)) continue;
      const cache = await caches.open(nom);
      try {
        await cache.addAll(GROUPES[nom].map((f) => new Request(f, { cache: "reload" })));
      } catch (erreur) {
        // Un groupe incomplet ne doit pas être pris pour un groupe prêt.
        await caches.delete(nom);
        throw erreur;
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const nom of await caches.keys()) {
      if (nom.startsWith("ts50-") && !NOMS.includes(nom)) await caches.delete(nom);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Les comptes (Supabase) et les liens externes passent directement par le réseau.
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const trouve = await caches.match(e.request.mode === "navigate" ? "index.html" : e.request, { ignoreSearch: true });
    return trouve ?? fetch(e.request);
  })());
});
`;

const fichierSw = join(racine, "sw.js");
if (verifier) {
  const actuel = existsSync(fichierSw) ? readFileSync(fichierSw, "utf8").replace(/\r\n/g, "\n") : "";
  if (actuel !== code) {
    console.error("sw.js n'est pas à jour : lancez npm run hors-ligne");
    process.exit(1);
  }
  console.log("sw.js est à jour.");
} else {
  writeFileSync(fichierSw, code);
  const taille = [...site, ...lourds].reduce((t, f) => t + statSync(join(racine, f)).size, 0);
  console.log(`sw.js écrit : ${site.length + lourds.length} fichiers, ${(taille / 1048576).toFixed(1)} Mo`);
}
