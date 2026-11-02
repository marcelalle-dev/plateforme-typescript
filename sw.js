// Fichier généré par outils/generer-hors-ligne.mjs : ne pas modifier à la main.
const GROUPES = {
 "ts50-site-0836d342fea8": [
  "index.html",
  "manifest.webmanifest",
  "icone-192.png",
  "icone-512.png",
  "css/app.css",
  "css/motion.css",
  "js/acces.js",
  "js/app.js",
  "js/composants.js",
  "js/compte.js",
  "js/config.js",
  "js/editeur.js",
  "js/erreurs-fr.js",
  "js/fusion.js",
  "js/hors-ligne.js",
  "js/icones.js",
  "js/motion.js",
  "js/mots-code.js",
  "js/mots-ui.js",
  "js/notions.js",
  "js/quiz-core.js",
  "js/store.js",
  "js/ts-core.js",
  "js/ts-worker.js",
  "js/ui.js",
  "js/verificateur.js",
  "js/vues-avis.js",
  "js/vues-bases.js",
  "js/vues-compte.js",
  "js/vues-exercice.js",
  "js/vues-generales.js",
  "js/vues-revision.js",
  "data/bases.js",
  "data/enrichissement.js",
  "data/glossaire-contexte.js",
  "data/glossaire.js",
  "data/index.js",
  "data/lignes-detail.js",
  "data/module1.js",
  "data/module2.js",
  "data/module3.js",
  "data/module4.js",
  "data/module5.js",
  "data/mots.js",
  "data/sources.js",
  "data/traces.js",
  "vendor/fonts/atkinson-hyperlegible-latin-400-normal.woff2",
  "vendor/fonts/atkinson-hyperlegible-latin-700-normal.woff2",
  "vendor/fonts/bricolage-grotesque-latin-wght-normal.woff2",
  "vendor/fonts/jetbrains-mono-latin-wght-normal.woff2",
  "vendor/supabase.js"
 ],
 "ts50-compilateur-433b3b24514e": [
  "vendor/typescript.js",
  "vendor/ts-libs.json"
 ]
};
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
