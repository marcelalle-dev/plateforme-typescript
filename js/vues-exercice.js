// Page d’un exercice : cours, quiz et exercice pratique.
import { EXERCICES, MODULES, NIVEAUX } from "../data/index.js";
import { MOTS_NOUVEAUX, MOTS_PRATIQUE } from "../data/mots.js";
import { creerEditeur } from "./editeur.js";
import { lexique, motsDeLExercice, motsDuCours } from "./mots-ui.js";
import { corrigerQuiz, SEUIL_VALIDATION } from "./quiz-core.js";
import { blocCode, enLigne, h, melanger, noteTexte, riche } from "./ui.js";
import * as store from "./store.js";
import { verifierCode } from "./verificateur.js";

const nn = (id) => String(id).padStart(2, "0");

const FORMATS = {
  choix: "Question de compréhension, une seule réponse",
  multi: "QCM, plusieurs réponses possibles",
  vf: "Vrai ou faux",
  prediction: "Prédire le résultat du code",
  erreur: "Identifier l’erreur TypeScript",
  completer: "Compléter le code",
};

function entete(ex, etape) {
  const module = MODULES.find((m) => m.id === ex.module);
  const s = store.suivi(ex.id);
  const lien = (cible, texte, cle, fait) =>
    h("li", {}, h("a", { href: `#/exercice/${ex.id}${cible}`, "aria-current": etape === cle ? "step" : null },
      texte, fait ? h("span", { class: "fait" }, " ✓") : null));
  return h("header", {},
    h("p", { class: "fil" }, h("a", { href: `#/module/${module.id}` }, `Module ${module.id}, ${module.nom}`)),
    h("h1", {}, `Exercice ${nn(ex.id)} : ${ex.titre}`),
    h("div", { class: "etiquettes" },
      h("span", { class: "etiquette", "data-niveau": ex.niveau }, NIVEAUX[ex.niveau].nom),
      h("span", { class: "etiquette" }, ex.notion),
      s?.meilleur !== null && s?.meilleur !== undefined
        ? h("span", { class: "etiquette" }, `Meilleur score : ${noteTexte(s.meilleur)}/10`)
        : null),
    h("ol", { class: "etapes" },
      lien("", "Cours", "cours", false),
      lien("/quiz", "Quiz", "quiz", s?.valide),
      lien("/pratique", "Pratique", "pratique", s?.pratique?.reussi)));
}

function voisins(ex) {
  return {
    precedent: EXERCICES.find((e) => e.id === ex.id - 1) ?? null,
    suivant: EXERCICES.find((e) => e.id === ex.id + 1) ?? null,
  };
}

// --- Cours ---------------------------------------------------------------------------------

function coderOriginal(ex) {
  const mots = motsDuCours(ex.id);
  const zone = h("div", {}, blocCode(ex.ts, { numeros: true, mots }));
  const volets = [
    { nom: `Code TypeScript (exercice${nn(ex.id)}.ts)`, code: ex.ts },
    { nom: `Version du document (exercice${nn(ex.id)}.js)`, code: ex.js },
  ];
  const boutons = volets.map((v, i) =>
    h("button", {
      class: "volet",
      type: "button",
      role: "tab",
      "aria-selected": i === 0 ? "true" : "false",
      onclick: (e) => {
        boutons.forEach((b) => b.setAttribute("aria-selected", "false"));
        e.currentTarget.setAttribute("aria-selected", "true");
        zone.replaceChildren(blocCode(v.code, { numeros: true, mots }));
      },
    }, v.nom));
  return h("div", {},
    h("div", { class: "volets", role: "tablist", "aria-label": "Versions du code" }, boutons),
    zone,
    h("p", { class: "note" }, "Les documents contiennent le code compilé en JavaScript, avec ses commentaires. Le TypeScript d’origine montre les types étudiés ici. Les deux versions proviennent de vos fichiers, sans modification."));
}

function ligneParLigne(ex) {
  const lignes = ex.ts.split("\n");
  const mots = motsDuCours(ex.id);
  return h("div", { class: "annote" }, ex.lignes.map(([plage, texte]) => {
    const [debut, fin = debut] = plage.split("-").map(Number);
    return h("div", { class: "annote-ligne" },
      blocCode(lignes.slice(debut - 1, fin).join("\n"), { numeros: true, debut, mots }),
      riche("div", texte, { class: "texte" }));
  }));
}

export function vueCours(ex) {
  store.marquerVisite(ex.id);
  const { precedent } = voisins(ex);
  return [
    entete(ex, "cours"),
    h("div", { class: "cours" },
      h("section", { class: "objectif" }, h("h2", {}, "Objectif"), riche("p", ex.objectif)),
      h("section", {}, h("h2", {}, "Explication simple"), ex.simple.map((p) => riche("p", p))),
      h("section", {},
        h("h2", {}, "Code original"),
        h("p", {}, "Les mots soulignés apparaissent pour la première fois. Cliquez sur n’importe quel mot du code, ou survolez-le, pour lire son explication."),
        coderOriginal(ex)),
      h("section", {},
        h("h2", {}, `Mots nouveaux (${MOTS_NOUVEAUX[ex.id].length})`),
        lexique(MOTS_NOUVEAUX[ex.id])),
      h("section", {}, h("h2", {}, "Explication ligne par ligne"), ligneParLigne(ex)),
      h("section", {},
        h("h2", {}, "Résultat attendu"),
        h("pre", { class: "terminal", tabindex: "0" }, ex.sortie),
        h("p", { class: "note" }, "Résultat obtenu en exécutant réellement ce fichier."),
        ex.noteSortie ? riche("p", ex.noteSortie, { class: "note" }) : null),
      h("section", {},
        h("h2", {}, "Erreurs fréquentes"),
        h("div", { class: "erreurs-freq" }, ex.erreurs.map(([titre, texte]) =>
          h("div", {}, riche("h3", titre), riche("p", texte))))),
      h("section", {}, h("h2", {}, "À retenir"), h("ul", { class: "retenir" }, ex.retenir.map((r) => riche("li", r)))),
      h("div", { class: "actions" },
        h("a", { class: "bouton fort", href: `#/exercice/${ex.id}/quiz` }, "Passer au quiz"),
        precedent ? h("a", { class: "bouton", href: `#/exercice/${precedent.id}` }, `Revoir l’exercice ${nn(precedent.id)}`) : null)),
  ];
}

// --- Quiz ----------------------------------------------------------------------------------

function champOption(question, i, indexOption, texte, reponses, type) {
  const nom = `q${i}`;
  const valeur = question.t === "vf" ? indexOption === 0 : indexOption;
  const entree = h("input", {
    type,
    name: nom,
    onchange: (e) => {
      if (type === "checkbox") {
        const courant = new Set(reponses[i] ?? []);
        if (e.target.checked) courant.add(valeur);
        else courant.delete(valeur);
        reponses[i] = [...courant];
      } else {
        reponses[i] = valeur;
      }
    },
  });
  const contenu = question.t === "prediction"
    ? h("span", { class: "sortie" }, texte)
    : riche("span", texte);
  return h("label", { class: "option", "data-valeur": String(valeur) }, entree, h("span", {}, contenu));
}

function carteQuestion(question, i, reponses, mots) {
  const titre = h("legend", {},
    h("span", { class: "format" }, FORMATS[question.t]),
    h("span", { html: `${i + 1}. ${enLigne(question.q)}` }));
  const corps = [];

  if (question.t === "completer") {
    const [avant, apres] = question.code.split("___");
    const trou = h("input", {
      class: "trou",
      type: "text",
      "aria-label": `Réponse de la question ${i + 1}`,
      autocapitalize: "off",
      autocomplete: "off",
      spellcheck: "false",
      oninput: (e) => { reponses[i] = e.target.value; },
    });
    const pre = blocCode(avant, { mots });
    pre.firstChild.append(trou, blocCode(apres, { mots }).firstChild.cloneNode(true));
    corps.push(pre);
  } else {
    if (question.code) corps.push(blocCode(question.code, { mots }));
    let options;
    if (question.t === "vf") {
      options = [[0, "Vrai"], [1, "Faux"]];
    } else {
      options = melanger(question.o.map((texte, index) => [index, texte]));
    }
    const type = question.t === "multi" ? "checkbox" : "radio";
    corps.push(h("div", { class: "options" }, options.map(([index, texte]) =>
      champOption(question, i, index, texte, reponses, type))));
  }
  return h("fieldset", { class: "question" }, titre, corps);
}

function estBonneOption(question, valeurTexte) {
  if (question.t === "vf") return String(question.a) === valeurTexte;
  if (question.t === "multi") return question.a.includes(Number(valeurTexte));
  return question.a === Number(valeurTexte);
}

function afficherCorrection(carte, question, detail, reponse) {
  carte.querySelectorAll("input").forEach((entree) => { entree.disabled = true; });

  if (question.t === "completer") {
    const trou = carte.querySelector(".trou");
    trou.dataset.correction = detail.juste ? "juste" : "faux";
  } else {
    carte.querySelectorAll(".option").forEach((option) => {
      const valeur = option.dataset.valeur;
      const bonne = estBonneOption(question, valeur);
      const cochee = option.querySelector("input").checked;
      if (bonne) option.dataset.correction = "juste";
      else if (cochee) option.dataset.correction = "faux";
      if (bonne || cochee) {
        const etiquette = bonne
          ? (cochee ? "Bonne réponse, sélectionnée" : "Bonne réponse")
          : "Votre réponse, incorrecte";
        option.lastChild.append(h("span", { class: "marque-correction" }, etiquette));
      }
    });
  }

  const statut = detail.juste ? "Bonne réponse" : (detail.repondue ? "Réponse incorrecte" : "Sans réponse : aucun point");
  const solution = question.t === "completer" && !detail.juste
    ? h("p", { html: `Réponse attendue : <code>${enLigne(question.r[0]).replace(/<\/?code>/g, "")}</code>` })
    : null;
  void reponse;
  carte.append(h("div", { class: "explication", "data-etat": detail.juste ? "juste" : "faux" },
    h("strong", {}, statut), solution, riche("span", question.e)));
}

export function vueQuiz(ex, naviguer) {
  store.marquerVisite(ex.id);
  const conteneur = h("div", { class: "quiz" });
  const mots = motsDeLExercice(ex.id);

  function demarrer() {
    const reponses = new Array(ex.quiz.length);
    const cartes = ex.quiz.map((q, i) => carteQuestion(q, i, reponses, mots));
    const zoneResultat = h("div", { tabindex: "-1", "aria-live": "polite" });
    const verifier = h("button", {
      class: "bouton fort",
      type: "button",
      onclick: () => {
        const correction = corrigerQuiz(ex.quiz, reponses);
        const { nouveauRecord } = store.enregistrerQuiz(ex.id, correction);
        ex.quiz.forEach((q, i) => afficherCorrection(cartes[i], q, correction.details[i], reponses[i]));
        pied.remove();
        afficherResultat(correction, nouveauRecord, zoneResultat);
        naviguer.rafraichirRail();
        zoneResultat.focus();
        zoneResultat.scrollIntoView({ block: "start" });
      },
    }, "Vérifier mes réponses");
    const pied = h("div", { class: "pied-quiz" }, verifier,
      h("span", {}, `${ex.quiz.length} questions. Vous pouvez modifier vos réponses avant de vérifier. Une question sans réponse ne rapporte aucun point.`));
    conteneur.replaceChildren(zoneResultat, ...cartes, pied);
  }

  function afficherResultat(correction, nouveauRecord, zone) {
    const s = store.suivi(ex.id);
    const message = correction.valide
      ? `Exercice validé : il fallait au moins ${SEUIL_VALIDATION}/10.`
      : `Il faut au moins ${SEUIL_VALIDATION}/10 pour valider cet exercice. Lisez les explications, puis réessayez.`;
    zone.replaceChildren(h("div", { class: "resultat" },
      h("div", { class: "note-sur" }, `${noteTexte(correction.score)}/10`),
      h("p", {}, `${correction.justes} bonne${correction.justes > 1 ? "s" : ""} réponse${correction.justes > 1 ? "s" : ""} sur ${correction.total}${correction.sansReponse ? `, ${correction.sansReponse} sans réponse` : ""}. ${message}`),
      h("p", {}, nouveauRecord ? "C’est votre meilleur score sur ce quiz." : `Votre meilleur score reste ${noteTexte(s.meilleur)}/10.`),
      h("div", { class: "actions" },
        h("a", { class: "bouton fort", href: `#/exercice/${ex.id}/pratique` }, "Faire l’exercice pratique"),
        h("button", { class: "bouton", type: "button", onclick: () => { demarrer(); window.scrollTo(0, 0); } }, "Recommencer le quiz"))));
  }

  demarrer();
  return [entete(ex, "quiz"), conteneur];
}

// --- Exercice pratique ---------------------------------------------------------------------

function afficherVerification(zone, issue) {
  if (issue.panne) {
    zone.replaceChildren(h("div", { class: "verdict", "data-etat": "faux" },
      h("h3", {}, "La vérification n’a pas pu démarrer"),
      h("p", {}, `Lancez la plateforme avec « npm start », puis rechargez la page. Détail : ${issue.panne}`)));
    return false;
  }
  if (issue.delaiDepasse) {
    zone.replaceChildren(h("div", { class: "verdict", "data-etat": "faux" },
      h("h3", {}, "Exécution interrompue après 6 secondes"),
      h("p", {}, "Votre code ne se termine pas : vérifiez vos boucles et vos promesses.")));
    return false;
  }
  const r = issue.resultat;
  const nbOk = r.tests.filter((t) => t.ok).length;
  const blocs = [h("div", { class: "verdict", "data-etat": r.reussi ? "juste" : "faux" },
    h("h3", {}, r.reussi ? "Exercice réussi" : "Pas encore"),
    h("p", {}, r.reussi
      ? "Le compilateur ne signale aucune erreur et tous les tests passent."
      : `${r.diagnostics.length} erreur${r.diagnostics.length > 1 ? "s" : ""} TypeScript, ${nbOk} test${nbOk > 1 ? "s" : ""} réussi${nbOk > 1 ? "s" : ""} sur ${r.tests.length}.`))];

  if (r.any) {
    blocs.push(h("p", { class: "diag" }, riche("span", "Votre code utilise `any` : remplacez-le par un type précis.")));
  }
  if (r.diagnostics.length) {
    blocs.push(h("div", {},
      h("h3", {}, "Erreurs du compilateur"),
      h("ul", { class: "diag" }, r.diagnostics.map((d) => h("li", {},
        h("strong", {}, d.dansTests ? `Contrôle de types, TS${d.code}` : `Ligne ${d.ligne}, TS${d.code}`),
        h("span", { class: "msg" }, d.dansTests ? `Votre code ne respecte pas le type demandé. ${d.message}` : d.message)))),
      h("p", { class: "note" }, "Les messages restent en anglais, comme dans votre terminal.")));
  }
  blocs.push(h("div", {},
    h("h3", {}, "Tests"),
    h("ul", { class: "tests" }, r.tests.map((t) => h("li", {},
      h("span", { class: t.ok ? "ok" : "ko" }, t.ok ? "Réussi" : "Échoué"),
      h("span", {}, t.libelle, t.erreur && !t.ok ? ` (${t.erreur})` : ""))))));
  if (r.erreur) {
    blocs.push(h("p", { class: "note" }, `Erreur à l’exécution : ${r.erreur}`));
  }
  if (r.sortie.length) {
    blocs.push(h("div", {}, h("h3", {}, "Sortie de votre programme"), h("pre", { class: "terminal", tabindex: "0" }, r.sortie.join("\n"))));
  }
  zone.replaceChildren(...blocs);
  return r.reussi;
}

export function vuePratique(ex, naviguer) {
  store.marquerVisite(ex.id);
  const p = ex.pratique;
  const { suivant } = voisins(ex);
  const zoneResultat = h("div", { style: "display:grid;gap:18px", "aria-live": "polite" });
  const zoneCorrection = h("div", {});
  let minuteurSauvegarde = null;

  const editeur = creerEditeur({
    valeur: store.brouillon(ex.id) ?? p.depart,
    libelle: `Éditeur de code de l’exercice pratique ${nn(ex.id)}`,
    surChangement: (code) => {
      clearTimeout(minuteurSauvegarde);
      minuteurSauvegarde = setTimeout(() => store.enregistrerBrouillon(ex.id, code), 400);
    },
    surValidation: () => soumettre(),
  });

  const boutonCorrection = h("button", {
    class: "bouton",
    type: "button",
    disabled: !store.suivi(ex.id)?.pratique?.essais,
    onclick: () => {
      zoneCorrection.replaceChildren(h("div", { style: "display:grid;gap:12px" },
        h("h2", {}, "Correction détaillée"),
        riche("p", p.correction),
        blocCode(p.solution, { numeros: true, mots: motsDeLExercice(ex.id) })));
      zoneCorrection.scrollIntoView({ block: "nearest" });
    },
  }, "Voir la correction");

  const boutonVerifier = h("button", { class: "bouton fort", type: "button", onclick: () => soumettre() }, "Vérifier mon code");

  async function soumettre() {
    if (boutonVerifier.disabled) return;
    boutonVerifier.disabled = true;
    const code = editeur.valeur;
    const issue = await verifierCode(code, p, (phase) => {
      zoneResultat.replaceChildren(h("p", { class: "statut-comp" }, phase === "preparation"
        ? "Préparation du compilateur TypeScript. La première fois, cela prend quelques secondes."
        : "Vérification du code en cours."));
    });
    boutonVerifier.disabled = false;
    const reussi = afficherVerification(zoneResultat, issue);
    if (issue.resultat) {
      store.enregistrerPratique(ex.id, code, reussi);
      boutonCorrection.disabled = false;
      naviguer.rafraichirRail();
      suite.hidden = !reussi;
    }
  }

  const suite = h("div", { class: "actions", hidden: !store.suivi(ex.id)?.pratique?.reussi },
    suivant
      ? h("a", { class: "bouton fort", href: `#/exercice/${suivant.id}` }, `Commencer l’exercice ${nn(suivant.id)}`)
      : h("a", { class: "bouton fort", href: "#/progression" }, "Voir ma progression"));

  return [
    entete(ex, "pratique"),
    h("div", { class: "pratique" },
      h("section", {}, h("h2", {}, "Votre mission"), riche("p", p.enonce)),
      MOTS_PRATIQUE[ex.id].length
        ? h("section", {}, h("h2", {}, "Mots nouveaux du code de départ"), lexique(MOTS_PRATIQUE[ex.id]))
        : null,
      h("section", {},
        editeur.element,
        h("p", { class: "aide" }, "Ctrl + Entrée vérifie le code. Pour quitter l’éditeur au clavier : Échap, puis Tab. Votre code est enregistré automatiquement."),
        h("div", { class: "actions" },
          boutonVerifier,
          boutonCorrection,
          h("button", {
            class: "bouton",
            type: "button",
            onclick: () => {
              editeur.definir(p.depart);
              store.effacerBrouillon(ex.id);
              zoneResultat.replaceChildren();
            },
          }, "Revenir au code de départ"))),
      zoneResultat,
      zoneCorrection,
      suite),
  ];
}
