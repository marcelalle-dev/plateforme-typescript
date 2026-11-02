// Composants du cours : erreurs en français, essai du code et exécution pas à pas.
import { creerEditeur } from "./editeur.js";
import { expliquerErreur, expliquerExecution } from "./erreurs-fr.js";
import { colorer, enLigne, h, riche } from "./ui.js";
import { verifierCode } from "./verificateur.js";

export function listeErreurs(diagnostics) {
  return h("ul", { class: "diag" }, diagnostics.map((d) => {
    const e = expliquerErreur(d);
    const lieu = d.dansTests ? "Contrôle de types" : `Ligne ${d.ligne}`;
    return h("li", {},
      h("strong", {}, `${lieu} : ${e.titre}`),
      riche("p", e.cause),
      riche("p", `**À faire :** ${e.solution}`),
      h("span", { class: "msg" }, `TS${d.code} : ${d.message}`));
  }));
}

export function erreurExecution(message) {
  return h("div", { class: "verdict", "data-etat": "faux" },
    h("h3", {}, "Erreur à l’exécution"),
    riche("p", expliquerExecution(message)),
    h("p", { class: "note" }, message));
}

export function resultatDelai() {
  return h("div", { class: "verdict", "data-etat": "faux" },
    h("h3", {}, "Exécution interrompue après 6 secondes"),
    h("p", {}, "Le code ne se termine pas : vérifiez les boucles et les promesses."));
}

export function resultatPanne(message) {
  return h("div", { class: "verdict", "data-etat": "faux" },
    h("h3", {}, "La vérification n’a pas pu démarrer"),
    h("p", {}, `Rechargez la page. Détail : ${message}`));
}

// Éditeur replié : l'apprenant modifie le code et observe la réaction du compilateur.
export function bacASable({ code, essai, libelle }) {
  const zone = h("div", { class: "bac", hidden: true });
  const resultat = h("div", { class: "bac-resultat", "aria-live": "polite" });
  let editeur = null;
  let lancerBouton = null;

  async function lancer() {
    if (lancerBouton.disabled) return;
    lancerBouton.disabled = true;
    const issue = await verifierCode(editeur.valeur, { tests: [] }, (phase) => {
      resultat.replaceChildren(h("p", { class: "statut-comp" }, phase === "preparation"
        ? "Préparation du compilateur TypeScript. La première fois, cela prend quelques secondes."
        : "Exécution du code en cours."));
    });
    lancerBouton.disabled = false;
    if (issue.panne) return void resultat.replaceChildren(resultatPanne(issue.panne));
    if (issue.delaiDepasse) return void resultat.replaceChildren(resultatDelai());
    const r = issue.resultat;
    const blocs = [];
    if (r.diagnostics.length) {
      blocs.push(h("div", { class: "verdict", "data-etat": "faux" },
        h("h3", {}, `${r.diagnostics.length} erreur${r.diagnostics.length > 1 ? "s" : ""} TypeScript`),
        h("p", {}, "Le JavaScript s’exécute quand même : les types n’existent plus à l’exécution.")));
      blocs.push(listeErreurs(r.diagnostics));
    } else {
      blocs.push(h("div", { class: "verdict", "data-etat": "juste" },
        h("h3", {}, "Aucune erreur TypeScript"),
        h("p", {}, "Le compilateur accepte ce code.")));
    }
    if (r.erreur) blocs.push(erreurExecution(r.erreur));
    blocs.push(h("div", {},
      h("h3", {}, "Résultat de l’exécution"),
      h("pre", { class: "terminal", tabindex: "0" }, r.sortie.join("\n") || "(rien n’a été affiché)")));
    resultat.replaceChildren(...blocs);
  }

  function ouvrir() {
    if (!editeur) {
      editeur = creerEditeur({ valeur: code, libelle, surValidation: lancer });
      lancerBouton = h("button", { class: "bouton fort", type: "button", onclick: lancer }, "Lancer le code");
      zone.append(
        essai ? riche("p", `**Essai à faire :** ${essai}`, { class: "essai" }) : null,
        editeur.element,
        h("p", { class: "aide" }, "Rien n’est enregistré ici : cassez le code sans crainte. Ctrl + Entrée lance le code."),
        h("div", { class: "actions" },
          lancerBouton,
          h("button", { class: "bouton", type: "button", onclick: () => { editeur.definir(code); resultat.replaceChildren(); } }, "Revenir au code d’origine")),
        resultat);
    }
    zone.hidden = !zone.hidden;
    bouton.setAttribute("aria-expanded", String(!zone.hidden));
    bouton.textContent = zone.hidden ? "Essayer ce code" : "Refermer l’essai";
  }

  const bouton = h("button", { class: "bouton", type: "button", "aria-expanded": "false", onclick: ouvrir }, "Essayer ce code");
  return h("div", { class: "bloc-essai" }, bouton, zone);
}

function phraseEtape(etape) {
  switch (etape.g) {
    case "condition":
      return etape.r === "true"
        ? "La condition est **vraie** : le bloc qui suit s’exécute."
        : "La condition est **fausse** : le bloc qui suit est ignoré.";
    case "retour":
      return etape.r === undefined ? "La fonction se termine." : `La fonction renvoie \`${etape.r}\`.`;
    case "aiguillage":
      return `Le \`switch\` examine la valeur \`${etape.r}\` pour choisir un cas.`;
    case "boucle":
      return "Nouveau tour de boucle : la variable reçoit l’élément suivant.";
    case "erreur":
      return "Une erreur est levée : le code s’interrompt ici.";
    case "attrape":
      return "Le `catch` reçoit l’erreur, et le programme continue.";
    default:
      return "Cette ligne vient de s’exécuter.";
  }
}

// Rejoue l'exécution réelle enregistrée : ligne en cours, variables et affichages.
export function pasAPas({ code, trace, mots }) {
  const etapes = trace.etapes;
  const lignes = colorer(code, mots).split("\n").map((html, i) =>
    h("div", { class: "pas-ligne", "data-n": String(i + 1) },
      h("span", { class: "num-ligne" }, String(i + 1)),
      h("span", { html: html || " " })));
  const codeBloc = h("pre", { class: "code pas-code", tabindex: "0" }, h("code", {}, lignes));
  const compteur = h("strong", {});
  const phrase = h("p", { class: "pas-phrase", "aria-live": "polite" });
  const variables = h("div", { class: "pas-variables" });
  const sortie = h("pre", { class: "terminal pas-sortie", tabindex: "0" });
  let position = 0;

  function afficher() {
    const etape = etapes[position];
    const precedente = etapes[position - 1];
    compteur.textContent = `Étape ${position + 1} sur ${etapes.length}`;
    let premiere = null;
    for (const ligne of lignes) {
      const n = Number(ligne.dataset.n);
      const active = n >= etape.l[0] && n <= etape.l[1];
      ligne.classList.toggle("active", active);
      if (active && !premiere) premiere = ligne;
    }
    if (premiere) codeBloc.scrollTop = Math.max(0, premiere.offsetTop - codeBloc.clientHeight / 2);
    phrase.innerHTML = `<span>Ligne ${etape.l[0]}.</span> ${enLigne(phraseEtape(etape))}`;

    const noms = Object.keys(etape.v);
    variables.replaceChildren(...(noms.length
      ? noms.map((nom) => {
        const change = !precedente || precedente.v[nom] !== etape.v[nom];
        return h("div", { class: `pas-var${change ? " change" : ""}` },
          h("code", {}, nom), h("span", {}, etape.v[nom]));
      })
      : [h("p", { class: "note" }, "Aucune variable à afficher à cette étape.")]));

    const lignesSortie = etapes.slice(0, position + 1).flatMap((e) => e.s ?? []);
    sortie.textContent = lignesSortie.join("\n") || "(rien pour l’instant)";
    avant.disabled = position === 0;
    apres.disabled = position === etapes.length - 1;
  }

  const avant = h("button", { class: "bouton", type: "button", onclick: () => { position -= 1; afficher(); } }, "Étape précédente");
  const apres = h("button", { class: "bouton fort", type: "button", onclick: () => { position += 1; afficher(); } }, "Étape suivante");
  const debut = h("button", { class: "bouton", type: "button", onclick: () => { position = 0; afficher(); } }, "Recommencer");

  afficher();
  return h("div", { class: "pas" },
    codeBloc,
    h("div", { class: "pas-panneau" },
      compteur,
      phrase,
      h("div", { class: "actions pas-actions" }, avant, apres, debut),
      h("h3", {}, "Variables"),
      variables,
      h("h3", {}, "Affichage du programme"),
      sortie,
      trace.tronque ? h("p", { class: "note" }, `Seules les ${etapes.length} premières étapes sont montrées, sur ${trace.total}.`) : null));
}

// Sommaire latéral des longs cours, sur les grands écrans. La section visible y est signalée.
export function sommaire(racine) {
  const titres = [...racine.querySelectorAll(":scope > section > h2")];
  const boutons = titres.map((titre) => h("button", {
    class: "sommaire-lien",
    type: "button",
    onclick: () => titre.scrollIntoView({ behavior: "smooth", block: "start" }),
  }, titre.textContent));
  const nav = h("nav", { class: "sommaire", "aria-label": "Sur cette page" },
    h("h2", {}, "Sur cette page"),
    boutons);
  if ("IntersectionObserver" in window) {
    const suivi = new IntersectionObserver((entrees) => {
      for (const e of entrees) {
        if (!e.isIntersecting) continue;
        const i = titres.indexOf(e.target);
        boutons.forEach((b, n) => b.toggleAttribute("data-actif", n === i));
      }
    }, { rootMargin: "-10% 0px -75% 0px" });
    titres.forEach((t) => suivi.observe(t));
  }
  return nav;
}
