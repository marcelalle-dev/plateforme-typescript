// Mots du code : quels mots sont nouveaux, et bulle d'explication au clic ou au survol.
import { definition } from "../data/glossaire.js";
import { MOTS_NOUVEAUX } from "../data/mots.js";
import { enLigne, h, riche } from "./ui.js";

const premierExercice = new Map();
for (const [id, mots] of Object.entries(MOTS_NOUVEAUX)) {
  for (const mot of mots) premierExercice.set(mot, Number(id));
}

// Dans le cours : les mots qui apparaissent pour la première fois dans cet exercice.
export function motsDuCours(id) {
  return { nouveau: (mot) => premierExercice.get(mot) === id };
}

// Dans le quiz et la pratique : les mots que les cours précédents n'ont pas encore présentés.
export function motsDeLExercice(id) {
  return {
    nouveau: (mot) => {
      const premier = premierExercice.get(mot);
      return premier === undefined || premier > id;
    },
  };
}

export function lexique(mots) {
  return h("dl", { class: "lexique" }, mots.flatMap((mot) => [
    h("dt", {}, h("code", {}, mot)),
    riche("dd", definition(mot) ?? ""),
  ]));
}

let bulle = null;
let cible = null;
let epinglee = false;

function fermer() {
  bulle?.remove();
  bulle = null;
  cible = null;
  epinglee = false;
}

function ouvrir(element) {
  fermer();
  cible = element;
  const mot = element.dataset.mot;
  bulle = h("div", { class: "bulle-mot", role: "status" },
    h("code", {}, mot),
    h("span", { html: enLigne(definition(mot) ?? "") }));
  document.body.append(bulle);
  const zone = element.getBoundingClientRect();
  const largeur = bulle.offsetWidth;
  const hauteur = bulle.offsetHeight;
  const gauche = Math.max(8, Math.min(zone.left, window.innerWidth - largeur - 8));
  const dessous = zone.bottom + 8 + hauteur < window.innerHeight;
  bulle.style.left = `${gauche}px`;
  bulle.style.top = `${dessous ? zone.bottom + 8 : Math.max(8, zone.top - hauteur - 8)}px`;
}

export function activerBullesMots() {
  document.addEventListener("click", (e) => {
    const mot = e.target.closest?.(".mot");
    if (!mot) {
      if (!e.target.closest?.(".bulle-mot")) fermer();
      return;
    }
    const memeMotEpingle = cible === mot && epinglee;
    if (memeMotEpingle) {
      fermer();
      return;
    }
    ouvrir(mot);
    epinglee = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermer();
    const mot = e.target.closest?.(".mot");
    if (mot && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      ouvrir(mot);
      epinglee = true;
    }
  });
  document.addEventListener("mouseover", (e) => {
    const mot = e.target.closest?.(".mot");
    if (mot && !epinglee && cible !== mot) ouvrir(mot);
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest?.(".mot") && !epinglee) fermer();
  });
  window.addEventListener("scroll", fermer, true);
  window.addEventListener("hashchange", fermer);
}
