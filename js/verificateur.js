// Dialogue avec le worker de vérification ; une boucle infinie est interrompue après le délai.
const DELAI_EXECUTION = 6000;
let worker = null;
let compteur = 0;

function obtenirWorker() {
  worker ??= new Worker("js/ts-worker.js");
  return worker;
}

export function verifierCode(code, pratique, surProgression) {
  return new Promise((resolve) => {
    const id = (compteur += 1);
    const w = obtenirWorker();
    let minuteur = null;

    const terminer = (issue) => {
      clearTimeout(minuteur);
      w.removeEventListener("message", ecouter);
      w.removeEventListener("error", panne);
      resolve(issue);
    };
    const panne = (evenement) => {
      worker = null;
      w.terminate();
      terminer({ panne: evenement.message || "Le vérificateur n’a pas pu démarrer." });
    };
    const ecouter = ({ data }) => {
      if (data.id !== id) return;
      if (data.type === "pret") {
        surProgression?.("execution");
        minuteur = setTimeout(() => {
          w.terminate();
          worker = null;
          terminer({ delaiDepasse: true });
        }, DELAI_EXECUTION);
      } else if (data.type === "resultat") {
        terminer({ resultat: data.resultat });
      } else {
        terminer({ panne: data.message });
      }
    };

    w.addEventListener("message", ecouter);
    w.addEventListener("error", panne);
    surProgression?.("preparation");
    w.postMessage({ id, code, pratique: { tests: pratique.tests, types: pratique.types } });
  });
}
