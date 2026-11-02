// Web Worker : compile et exécute le code hors du fil principal, pour que la page reste réactive.
importScripts("../vendor/typescript.js", "ts-core.js");

let compilateur = null;

async function preparer() {
  if (compilateur) return;
  const reponse = await fetch("../vendor/ts-libs.json");
  if (!reponse.ok) throw new Error("Bibliothèques TypeScript introuvables");
  compilateur = TsCore.creerCompilateur(ts, await reponse.json());
  // Compilation à vide pour charger les types une fois pour toutes.
  compilateur.diagnostiquer("", "");
}

self.onmessage = async ({ data }) => {
  try {
    await preparer();
    self.postMessage({ id: data.id, type: "pret" });
    const resultat = await TsCore.corriger(ts, compilateur, data.code, data.pratique);
    self.postMessage({ id: data.id, type: "resultat", resultat });
  } catch (erreur) {
    self.postMessage({ id: data.id, type: "panne", message: erreur instanceof Error ? erreur.message : String(erreur) });
  }
};
