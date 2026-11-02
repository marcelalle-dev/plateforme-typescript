// Page d'introduction : les bases de JavaScript, avec des exemples à essayer.
import { BASES } from "../data/bases.js";
import { bacASable } from "./composants.js";
import { blocCode, h, riche } from "./ui.js";

const MOTS = { nouveau: () => false };

export function vueBases() {
  return [
    h("h1", {}, "Les bases de JavaScript"),
    h("p", { class: "sous-titre" }, "Tout ce qu’il faut savoir avant l’exercice 1. Si vous débutez, lisez cette page dans l’ordre et essayez chaque exemple. Cliquez sur un mot du code pour lire son explication."),
    h("div", { class: "cours section" }, BASES.map((b, i) => h("section", {},
      h("h2", {}, `${i + 1}. ${b.titre}`),
      b.textes.map((t) => riche("p", t)),
      blocCode(b.code, { numeros: true, mots: MOTS }),
      h("h3", { class: "titre-sortie" }, "Résultat"),
      h("pre", { class: "terminal", tabindex: "0" }, b.sortie),
      b.note ? riche("p", b.note, { class: "note" }) : null,
      bacASable({ code: b.code, libelle: `Éditeur de l’exemple ${i + 1}` })))),
    h("div", { class: "actions" }, h("a", { class: "bouton fort", href: "#/exercice/1" }, "Commencer l’exercice 1")),
  ];
}
