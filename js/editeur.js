// Éditeur de code : une zone de texte transparente au-dessus du code colorisé.
import { colorer, h } from "./ui.js";

export function creerEditeur({ valeur, libelle, surChangement, surValidation }) {
  const numeros = h("div", { class: "editeur-num", "aria-hidden": "true" });
  const rendu = h("pre", { "aria-hidden": "true" }, h("code"));
  const zone = h("textarea", {
    spellcheck: "false",
    autocapitalize: "off",
    autocomplete: "off",
    autocorrect: "off",
    wrap: "off",
    "aria-label": libelle,
    value: valeur,
  });

  function rafraichir() {
    const nb = zone.value.split("\n").length;
    numeros.textContent = Array.from({ length: nb }, (_, i) => i + 1).join("\n");
    // Le saut de ligne final garde la dernière ligne visible et alignée.
    rendu.firstChild.innerHTML = `${colorer(zone.value)}\n`;
    synchroniser();
  }

  function synchroniser() {
    rendu.scrollTop = zone.scrollTop;
    rendu.scrollLeft = zone.scrollLeft;
    numeros.scrollTop = zone.scrollTop;
  }

  function inserer(texte) {
    zone.setRangeText(texte, zone.selectionStart, zone.selectionEnd, "end");
    zone.dispatchEvent(new Event("input"));
  }

  let sortieClavier = false;
  zone.addEventListener("input", () => {
    rafraichir();
    surChangement?.(zone.value);
  });
  zone.addEventListener("scroll", synchroniser);
  zone.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      surValidation?.();
    } else if (e.key === "Escape") {
      sortieClavier = true;
    } else if (e.key === "Tab" && !sortieClavier) {
      e.preventDefault();
      inserer("  ");
    } else if (e.key === "Enter") {
      e.preventDefault();
      const debut = zone.value.lastIndexOf("\n", zone.selectionStart - 1) + 1;
      const retrait = /^\s*/.exec(zone.value.slice(debut, zone.selectionStart))[0];
      inserer(`\n${retrait}`);
    }
    if (e.key !== "Escape" && e.key !== "Shift") sortieClavier = false;
  });

  rafraichir();
  return {
    element: h("div", { class: "editeur" }, numeros, h("div", { class: "editeur-zone" }, rendu, zone)),
    get valeur() {
      return zone.value;
    },
    definir(texte) {
      zone.value = texte;
      rafraichir();
      surChangement?.(texte);
    },
  };
}
