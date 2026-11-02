// Tableau de bord, modules, liste des exercices et progression.
import { EXERCICES, MODULES, NIVEAUX } from "../data/index.js";
import { etatCompte } from "./compte.js";
import { notionsFragiles } from "./notions.js";
import { etatCase, h, legendeGrille, noteTexte, riche } from "./ui.js";
import * as store from "./store.js";

const nn = (id) => String(id).padStart(2, "0");
const exercicesDu = (module) => EXERCICES.filter((e) => e.module === module.id);

export function grille(exercices, courant) {
  return h("div", { class: "grille" }, exercices.map((e) => {
    const s = store.suivi(e.id);
    const etat = etatCase(s);
    const detail = etat === "vierge" ? "pas encore tenté" : `meilleur score ${noteTexte(s.meilleur)} sur 10`;
    return h("a", {
      class: "case",
      href: `#/exercice/${e.id}`,
      "data-etat": etat,
      "data-courant": e.id === courant ? "" : null,
      title: `${e.titre} (${detail})`,
      "aria-label": `Exercice ${e.id}, ${e.titre}, ${detail}`,
    }, nn(e.id));
  }));
}

export function barreModule(module) {
  return h("div", { class: "barre-mini", "aria-hidden": "true" },
    exercicesDu(module).map((e) => h("i", { "data-etat": etatCase(store.suivi(e.id)) })));
}

function prochainExercice() {
  return EXERCICES.find((e) => !store.suivi(e.id)?.valide) ?? null;
}

function pointDeReprise(ex) {
  const s = store.suivi(ex.id);
  if (s?.meilleur === null || s?.meilleur === undefined) return { lien: `#/exercice/${ex.id}`, texte: "Commencer le cours" };
  return { lien: `#/exercice/${ex.id}/quiz`, texte: "Reprendre le quiz" };
}

function chiffre(valeur, libelle) {
  return h("div", { class: "chiffre" }, h("strong", {}, valeur), h("span", {}, libelle));
}

function listeNotions(limite) {
  const notions = notionsFragiles(EXERCICES).slice(0, limite);
  if (!notions.length) {
    const st = store.statistiques(EXERCICES);
    return h("p", { class: "vide" }, st.tentes
      ? "Aucune notion fragile pour le moment : tous vos quiz tentés atteignent 8/10."
      : "Terminez un premier quiz pour voir ici les notions à consolider.");
  }
  return h("ul", { class: "notions" }, notions.map((n) => h("li", {},
    h("strong", {}, n.notion),
    h("span", {}, `${noteTexte(n.moyenne)}/10`),
    n.aRevoir.length
      ? h("span", { class: "pistes" }, "À revoir : ", n.aRevoir.flatMap((e, i) => [
        i ? ", " : "",
        h("a", { href: `#/exercice/${e.id}/quiz` }, `exercice ${nn(e.id)}`),
      ]))
      : null)));
}

export function vueTableau() {
  const st = store.statistiques(EXERCICES);
  const prochain = prochainExercice();
  const reprise = prochain ? pointDeReprise(prochain) : null;
  const dues = store.aReviser(EXERCICES).length;
  return [
    dues
      ? h("p", { class: "rappel" }, h("a", { href: "#/revisions" }, `${dues} exercice${dues > 1 ? "s" : ""} à réviser aujourd’hui`))
      : null,
    h("div", { class: "accueil" },
      h("div", {},
        prochain
          ? h("h1", {}, st.tentes ? "Votre prochain exercice" : "Comprenez TypeScript, un exercice à la fois")
          : h("h1", {}, "Les 50 exercices sont validés"),
        prochain
          ? h("p", { class: "intro" }, h("strong", {}, `Exercice ${nn(prochain.id)} : ${prochain.titre}. `), `Niveau ${NIVEAUX[prochain.niveau].nom.toLowerCase()}. Chaque exercice se déroule en trois étapes : le cours, le quiz, puis du code à écrire.`)
          : h("p", { class: "intro" }, "Vous pouvez refaire n’importe quel quiz pour améliorer votre score."),
        h("div", { class: "actions" },
          prochain ? h("a", { class: "bouton fort", href: reprise.lien }, reprise.texte) : null,
          st.tentes ? h("a", { class: "bouton", href: "#/progression" }, "Voir ma progression") : h("a", { class: "bouton", href: "#/bases" }, "Je débute : voir les bases"))),
      h("div", {},
        grille(EXERCICES, prochain?.id),
        legendeGrille())),
    h("div", { class: "chiffres" },
      chiffre(`${st.pourcentage} %`, "de progression"),
      chiffre(`${st.valides}/${st.total}`, "exercices validés"),
      chiffre(st.moyenne === null ? "Aucune" : `${noteTexte(st.moyenne)}/10`, "moyenne des quiz"),
      chiffre(st.meilleur === null ? "Aucun" : `${noteTexte(st.meilleur)}/10`, "meilleur score")),
    h("section", { class: "section" },
      h("h2", {}, "Les cinq modules"),
      h("div", { class: "lignes-module" }, MODULES.map((m) => {
        const liste = exercicesDu(m);
        const valides = liste.filter((e) => store.suivi(e.id)?.valide).length;
        return h("div", { class: "bloc-module" },
          h("div", {},
            h("h3", {}, h("a", { href: `#/module/${m.id}` }, `Module ${m.id} : ${m.nom}`)),
            h("p", {}, `Exercices ${nn(m.premier)} à ${nn(m.dernier)}. ${m.resume}`),
            h("span", {}, `${valides} sur ${liste.length} validés`)),
          grille(liste, prochain?.id));
      }))),
    h("section", { class: "section" }, h("h2", {}, "Notions à consolider"), listeNotions(3)),
  ];
}

export function vueModules() {
  return [
    h("h1", {}, "Les cinq modules"),
    h("p", { class: "sous-titre" }, "Les exercices sont organisés du plus simple au plus avancé. Ouvrez un module pour voir ses dix exercices."),
    h("div", { class: "section" }, MODULES.map((m) => {
      const liste = exercicesDu(m);
      const valides = liste.filter((e) => store.suivi(e.id)?.valide).length;
      return h("div", { class: "bloc-module" },
        h("div", {},
          h("h2", {}, h("a", { href: `#/module/${m.id}` }, `Module ${m.id} : ${m.nom}`)),
          h("p", {}, `Exercices ${nn(m.premier)} à ${nn(m.dernier)}. ${m.resume}`),
          h("span", {}, `${valides} sur ${liste.length} validés`)),
        grille(liste));
    })),
  ];
}

function ligneExercice(e) {
  const s = store.suivi(e.id);
  const etat = etatCase(s);
  return h("li", {}, h("a", { href: `#/exercice/${e.id}` },
    h("span", { class: "num" }, nn(e.id)),
    h("span", { class: "ti" }, e.titre),
    h("span", { class: "meta" }, `${NIVEAUX[e.niveau].nom}, ${e.notion}${s?.pratique?.reussi ? ", pratique réussie" : ""}`),
    h("span", { class: "sc", "data-etat": etat }, etat === "vierge" ? "À faire" : `${noteTexte(s.meilleur)}/10`)));
}

export function vueModule(module) {
  const liste = exercicesDu(module);
  const suivant = MODULES.find((m) => m.id === module.id + 1);
  return [
    h("p", { class: "fil" }, h("a", { href: "#/modules" }, "Tous les modules")),
    h("h1", {}, `Module ${module.id} : ${module.nom}`),
    h("p", { class: "sous-titre" }, `Exercices ${nn(module.premier)} à ${nn(module.dernier)}. ${module.resume}`),
    h("ul", { class: "liste-ex section" }, liste.map(ligneExercice)),
    h("section", { class: "section" },
      h("h2", {}, "L’essentiel du module"),
      h("ul", { class: "retenir" }, liste.map((e) => h("li", {},
        h("a", { href: `#/exercice/${e.id}` }, `Exercice ${nn(e.id)}`), " : ", riche("span", e.retenir[0])))),
      h("div", { class: "actions" }, h("a", { class: "bouton fort", href: `#/revisions/module/${module.id}` }, "Faire le quiz de révision du module"))),
    suivant ? h("div", { class: "actions" }, h("a", { class: "bouton", href: `#/module/${suivant.id}` }, `Voir le module ${suivant.id}`)) : null,
  ];
}

export function vueExercices(filtres) {
  const liste = h("ul", { class: "liste-ex" });
  const compte = h("p", { class: "note", "aria-live": "polite" });

  function appliquer() {
    const texte = filtres.texte.trim().toLowerCase();
    const resultat = EXERCICES.filter((e) => {
      const valide = Boolean(store.suivi(e.id)?.valide);
      if (filtres.etat === "termines" && !valide) return false;
      if (filtres.etat === "non-termines" && valide) return false;
      if (filtres.niveau !== "tous" && e.niveau !== filtres.niveau) return false;
      if (filtres.module !== "tous" && String(e.module) !== filtres.module) return false;
      return !texte || `${e.id} ${e.titre} ${e.notion}`.toLowerCase().includes(texte);
    });
    liste.replaceChildren(...resultat.map(ligneExercice));
    compte.textContent = resultat.length
      ? `${resultat.length} exercice${resultat.length > 1 ? "s" : ""}`
      : "Aucun exercice ne correspond à ces filtres. Élargissez votre recherche.";
  }

  const selection = (cle, libelle, options) => h("label", {}, libelle,
    h("select", { onchange: (e) => { filtres[cle] = e.target.value; appliquer(); } },
      options.map(([valeur, nom]) => h("option", { value: valeur, selected: filtres[cle] === valeur }, nom))));

  appliquer();
  return [
    h("h1", {}, "Les 50 exercices"),
    h("div", { class: "filtres" },
      h("label", {}, "Rechercher",
        h("input", { type: "search", value: filtres.texte, placeholder: "Titre ou notion", oninput: (e) => { filtres.texte = e.target.value; appliquer(); } })),
      selection("etat", "État", [["tous", "Tous"], ["termines", "Terminés"], ["non-termines", "Non terminés"]]),
      selection("module", "Module", [["tous", "Tous"], ...MODULES.map((m) => [String(m.id), `Module ${m.id}`])]),
      selection("niveau", "Niveau", [["tous", "Tous"], ...Object.entries(NIVEAUX).map(([k, n]) => [k, n.nom])])),
    compte,
    liste,
  ];
}

export function vueProgression(naviguer) {
  const st = store.statistiques(EXERCICES);
  const termines = EXERCICES.filter((e) => store.suivi(e.id)?.valide);
  const nonTermines = EXERCICES.filter((e) => !store.suivi(e.id)?.valide);
  const tentes = EXERCICES.filter((e) => {
    const s = store.suivi(e.id);
    return s?.meilleur !== null && s?.meilleur !== undefined;
  });

  const zoneReset = h("div", { class: "actions" });
  const afficherReset = () => zoneReset.replaceChildren(
    h("button", {
      class: "bouton danger",
      type: "button",
      onclick: () => zoneReset.replaceChildren(
        h("button", {
          class: "bouton danger",
          type: "button",
          onclick: () => { store.reinitialiser(); naviguer.rafraichirTout(); },
        }, "Oui, tout effacer"),
        h("button", { class: "bouton", type: "button", onclick: afficherReset }, "Annuler")),
    }, "Effacer ma progression"));
  afficherReset();

  return [
    h("h1", {}, "Ma progression"),
    h("p", { class: "sous-titre" }, "Un exercice est validé à partir de 8/10 au quiz. Vous pouvez le refaire autant de fois que vous le souhaitez."),
    h("div", { class: "jauge", role: "progressbar", "aria-valuenow": String(st.pourcentage), "aria-valuemin": "0", "aria-valuemax": "100", "aria-label": "Pourcentage de progression" },
      h("i", { style: `width:${st.pourcentage}%` })),
    h("div", { class: "chiffres" },
      chiffre(`${st.pourcentage} %`, "de progression"),
      chiffre(String(st.valides), st.valides > 1 ? "exercices terminés" : "exercice terminé"),
      chiffre(String(st.nonValides), st.nonValides > 1 ? "exercices non terminés" : "exercice non terminé"),
      chiffre(st.meilleur === null ? "Aucun" : `${noteTexte(st.meilleur)}/10`, "meilleur score obtenu"),
      chiffre(st.moyenne === null ? "Aucune" : `${noteTexte(st.moyenne)}/10`, `moyenne des quiz (${st.tentes} tenté${st.tentes > 1 ? "s" : ""})`),
      chiffre(String(st.pratiques), st.pratiques > 1 ? "exercices pratiques réussis" : "exercice pratique réussi")),
    h("div", {}, grille(EXERCICES), legendeGrille()),
    h("section", { class: "section" }, h("h2", {}, "Notions que je maîtrise moins bien"),
      h("p", { class: "note" }, "Moyenne des quiz tentés pour chaque notion, de la plus fragile à la plus solide."),
      listeNotions(Infinity)),
    h("div", { class: "section deux" },
      h("section", {},
        h("h2", {}, `Exercices terminés (${termines.length})`),
        termines.length
          ? h("ul", { class: "liste-ex" }, termines.map(ligneExercice))
          : h("p", { class: "vide" }, "Obtenez au moins 8/10 à un quiz pour terminer votre premier exercice.")),
      h("section", {},
        h("h2", {}, `Exercices non terminés (${nonTermines.length})`),
        nonTermines.length
          ? h("ul", { class: "liste-ex" }, nonTermines.map(ligneExercice))
          : h("p", { class: "vide" }, "Tous les exercices sont terminés."))),
    h("section", { class: "section" },
      h("h2", {}, "Détail des scores"),
      tentes.length
        ? h("div", { class: "tableau-wrap", tabindex: "0" }, h("table", { class: "scores" },
          h("thead", {}, h("tr", {}, ["Exercice", "Meilleur", "Dernier", "Tentatives", "Pratique"].map((t) => h("th", { scope: "col" }, t)))),
          h("tbody", {}, tentes.map((e) => {
            const s = store.suivi(e.id);
            return h("tr", {},
              h("td", {}, h("a", { href: `#/exercice/${e.id}/quiz` }, `${nn(e.id)} : ${e.titre}`)),
              h("td", { class: "n" }, `${noteTexte(s.meilleur)}/10`),
              h("td", { class: "n" }, `${noteTexte(s.dernier)}/10`),
              h("td", { class: "n" }, String(s.tentatives.length)),
              h("td", {}, s.pratique?.reussi ? "Réussie" : "À faire"));
          }))))
        : h("p", { class: "vide" }, "Aucun quiz terminé pour le moment.")),
    h("section", { class: "section" },
      h("h2", {}, "Sauvegarde"),
      etatCompte().session
        ? h("p", {}, "Votre progression est enregistrée dans ce navigateur et dans votre compte. ", h("a", { href: "#/compte" }, "Voir mon compte"))
        : h("p", {}, "Votre progression est enregistrée dans ce navigateur, sur cet appareil. ",
          etatCompte().actif ? h("a", { href: "#/compte" }, "Créer un compte pour la retrouver partout") : null),
      store.stockageDisponible() ? null : h("p", { class: "explication", "data-etat": "faux" }, "Le stockage local est bloqué : votre progression sera perdue à la fermeture de la page."),
      zoneReset),
  ];
}
