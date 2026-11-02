// Petit serveur statique sans dépendance.
// node serve.mjs            : accessible sur cet ordinateur uniquement
// node serve.mjs --reseau   : accessible aussi depuis un téléphone sur le même réseau
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const racine = fileURLToPath(new URL(".", import.meta.url));
const reseau = process.argv.includes("--reseau");
const port = Number(process.env.PORT) || 5173;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};

const serveur = createServer((requete, reponse) => {
  const chemin = decodeURIComponent(new URL(requete.url, "http://localhost").pathname);
  const fichier = normalize(join(racine, chemin === "/" ? "index.html" : chemin));
  const interdit = !fichier.startsWith(racine.endsWith(sep) ? racine : racine + sep);
  let existe = false;
  try {
    existe = !interdit && statSync(fichier).isFile();
  } catch {
    existe = false;
  }
  if (!existe) {
    reponse.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    reponse.end("Fichier introuvable");
    return;
  }
  reponse.writeHead(200, { "Content-Type": TYPES[extname(fichier)] ?? "application/octet-stream" });
  createReadStream(fichier).pipe(reponse);
});

serveur.listen(port, reseau ? "0.0.0.0" : "127.0.0.1", () => {
  console.log(`Plateforme TypeScript : http://localhost:${port}`);
  if (reseau) {
    for (const adresses of Object.values(networkInterfaces())) {
      for (const a of adresses ?? []) {
        if (a.family === "IPv4" && !a.internal) console.log(`Depuis un téléphone : http://${a.address}:${port}`);
      }
    }
  }
  console.log("Arrêter le serveur : Ctrl + C");
});
