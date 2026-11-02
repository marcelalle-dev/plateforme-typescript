// Révisions : exercices à revoir, quiz mélangés et quiz de module.
import { EXERCICES, MODULES } from "../data/index.js";
import { h, melanger, noteTexte } from "./ui.js";
import * as store from "./store.js";
import { construireQuiz } from "./vues-exercice.js";

const TAILLE = 10;
const nn = (id) => String(id).padStart(2, "0");

function questionsDe(exercice, indices) {
  return indices.map((i) => ({ ...exercice.quiz[i], _ex: exercice.id, _i: i }));
}

function tousIndices(exercice) {
  return exercice.quiz.map((_, i) => i);
}

// Les questions ratées d'abord, puis d'autres questions des mêmes exercices.
function selection(exercices) {
  const ratees = exercices.flatMap((e) => questionsDe(e, store.suivi(e.id)?.ratees ?? []));
  const autres = exercices.flatMap((e) => {
    const deja = new Set(store.suivi(e.id)?.ratees ?? []);
    return questionsDe(e, tousIndices(e).filter((i) => !deja.has(i)));
  });
  return melanger([...melanger(ratees), ...melanger(autres)].slice(0, TAILLE));
}

function revisionsTentees() {
  return EXERCICES.filter((e) => store.suivi(e.id)?.meilleur !== null && store.suivi(e.id)?.meilleur !== undefined);
}

export function vueRevisions() {
  const dues = store.aReviser(EXERCICES);
  const tentes = revisionsTentees();
  const ratees = tentes.reduce((total, e) => total + (store.suivi(e.id)?.ratees?.length ?? 0), 0);
  return [
    h("h1", {}, "Mes révisions"),
    h("p", { class: "sous-titre" }, "Revoir une notion au bon moment la fixe en mémoire. Un exercice validé revient après 1 jour, puis 3, 7, 14 et 30 jours si vous réussissez. Une erreur le ramène au lendemain."),
    h("div", { class: "chiffres" },
      h("div", { class: "chiffre" }, h("strong", {}, String(dues.length)), h("span", {}, dues.length > 1 ? "exercices à réviser" : "exercice à réviser")),
      h("div", { class: "chiffre" }, h("strong", {}, String(ratees)), h("span", {}, ratees > 1 ? "questions ratées à reprendre" : "question ratée à reprendre"))),
    dues.length
      ? h("section", { class: "section" },
        h("h2", {}, "À réviser aujourd’hui"),
        h("ul", { class: "liste-simple" }, dues.map((e) => h("li", {}, h("a", { href: `#/exercice/${e.id}` }, `Exercice ${nn(e.id)} : ${e.titre}`)))),
        h("div", { class: "actions" }, h("a", { class: "bouton fort", href: "#/revisions/quiz" }, "Commencer la révision")))
      : h("section", { class: "section" },
        h("h2", {}, "Rien à réviser aujourd’hui"),
        tentes.length
          ? h("div", { class: "actions" }, h("a", { class: "bouton", href: "#/revisions/quiz" }, "Réviser quand même"))
          : h("p", { class: "vide" }, "Validez un premier exercice : il reviendra ici au bon moment.")),
    h("section", { class: "section" },
      h("h2", {}, "Réviser un module"),
      h("p", {}, `${TAILLE} questions tirées au hasard. Ce quiz ne change pas vos scores.`),
      h("div", { class: "actions" }, MODULES.map((m) => h("a", { class: "bouton", href: `#/revisions/module/${m.id}` }, `Module ${m.id}`)))),
  ];
}

function panneauFin(titre, correction, liens) {
  return h("div", { class: "resultat" },
    h("div", { class: "note-sur" }, `${noteTexte(correction.score)}/10`),
    h("p", {}, `${correction.justes} bonne${correction.justes > 1 ? "s" : ""} réponse${correction.justes > 1 ? "s" : ""} sur ${correction.total}. ${titre}`),
    h("div", { class: "actions" }, liens));
}

export function vueQuizRevision(naviguer) {
  const dues = store.aReviser(EXERCICES);
  const source = dues.length ? dues : revisionsTentees();
  if (!source.length) {
    return [
      h("h1", {}, "Révision"),
      h("p", { class: "vide" }, "Il n’y a encore rien à réviser. Terminez d’abord un quiz."),
      h("div", { class: "actions" }, h("a", { class: "bouton fort", href: "#/exercices" }, "Voir les exercices")),
    ];
  }
  const questions = selection(source);
  const concernes = new Set(questions.map((q) => q._ex));
  const liste = construireQuiz({
    questions,
    avecExercice: true,
    surCorrection: (correction, zone, recommencer) => {
      questions.forEach((q, i) => store.noterReponse(q._ex, q._i, correction.details[i].juste));
      for (const id of concernes) {
        const reussi = questions.every((q, i) => q._ex !== id || correction.details[i].juste);
        store.noterRevision(id, reussi);
      }
      naviguer.rafraichirRail();
      zone.replaceChildren(panneauFin("Les exercices réussis reviendront plus tard, les autres dès demain.", correction, [
        h("a", { class: "bouton fort", href: "#/revisions" }, "Revenir aux révisions"),
        h("button", { class: "bouton", type: "button", onclick: recommencer }, "Recommencer le quiz"),
      ]));
    },
  });
  return [h("h1", {}, "Révision"), h("p", { class: "sous-titre section-courte" }, `${questions.length} questions, en commençant par celles que vous avez ratées.`), liste];
}

export function vueQuizModule(module, naviguer) {
  const exercices = EXERCICES.filter((e) => e.module === module.id);
  const questions = selection(exercices);
  const liste = construireQuiz({
    questions,
    avecExercice: true,
    surCorrection: (correction, zone, recommencer) => {
      questions.forEach((q, i) => {
        if (store.suivi(q._ex)) store.noterReponse(q._ex, q._i, correction.details[i].juste);
      });
      naviguer.rafraichirRail();
      zone.replaceChildren(panneauFin("Ce quiz ne change pas vos scores.", correction, [
        h("a", { class: "bouton fort", href: `#/module/${module.id}` }, "Revenir au module"),
        h("button", { class: "bouton", type: "button", onclick: recommencer }, "Recommencer le quiz"),
      ]));
    },
  });
  return [
    h("p", { class: "fil" }, h("a", { href: `#/module/${module.id}` }, `Module ${module.id}, ${module.nom}`)),
    h("h1", {}, `Révision du module ${module.id}`),
    h("p", { class: "sous-titre section-courte" }, `${questions.length} questions tirées des dix exercices du module.`),
    liste,
  ];
}
