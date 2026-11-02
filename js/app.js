// Point d’entrée : navigation par ancres (#/...) et cadre commun des pages.
import { EXERCICES, MODULES } from "../data/index.js";
import { h } from "./ui.js";
import { barreModule, vueExercices, vueModule, vueModules, vueProgression, vueTableau } from "./vues-generales.js";
import { demarrerEssai, essaiTermine, etatService, tempsRestant, testerService } from "./acces.js";
import { demarrerCompte, etatCompte, surChangementCompte } from "./compte.js";
import { activerBullesMots } from "./mots-ui.js";
import { vueCompte, vueCompteDesactive } from "./vues-compte.js";
import { vueBases } from "./vues-bases.js";
import { vueQuizModule, vueQuizRevision, vueRevisions } from "./vues-revision.js";
import { vueCours, vuePratique, vueQuiz } from "./vues-exercice.js";

const rail = document.getElementById("rail");
const onglets = document.getElementById("onglets");
const principal = document.getElementById("contenu");

const LIENS = [
  ["#/", "Tableau de bord", "tableau"],
  ["#/bases", "Les bases", "bases"],
  ["#/modules", "Modules", "modules"],
  ["#/exercices", "Exercices", "exercices"],
  ["#/revisions", "Révisions", "revisions"],
  ["#/progression", "Progression", "progression"],
];

const filtres = { texte: "", etat: "tous", niveau: "tous", module: "tous" };
const naviguer = { rafraichirRail: () => dessinerRail(section()), rafraichirTout: () => afficher() };

function analyser() {
  const parties = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [page, id, etape] = parties;
  return { page: page ?? "tableau", id: Number(id), etape };
}

function section() {
  const { page } = analyser();
  if (page === "module" || page === "modules") return "modules";
  if (page === "exercice" || page === "exercices") return "exercices";
  return page;
}

function dessinerRail(actif) {
  const lien = ([href, nom, cle]) =>
    h("a", { href, "aria-current": actif === cle ? "page" : null }, nom);
  const compte = etatCompte();
  const liensRail = compte.actif
    ? [...LIENS, ["#/compte", compte.session ? "Mon compte" : "Se connecter", "compte"]]
    : LIENS;
  rail.replaceChildren(
    h("a", { class: "marque", href: "#/" }, "TypeScript en 50 exercices", h("span", {}, "Cours, quiz et pratique")),
    h("nav", { "aria-label": "Navigation principale" },
      h("ul", { class: "nav-rail" }, liensRail.map((l) => h("li", {}, lien(l))))),
    h("h2", {}, "Modules"),
    ...MODULES.map((m) => h("a", { class: "mod-rail", href: `#/module/${m.id}` },
      h("span", { class: "mod-nom" }, `${m.id}. ${m.nom}`),
      h("small", {}, `Exercices ${m.premier} à ${m.dernier}`),
      barreModule(m))));
  onglets.replaceChildren(...LIENS.filter(([, , cle]) => cle !== "modules").map(([href, nom, cle]) =>
    h("a", { href, "aria-current": actif === cle ? "page" : null }, nom === "Tableau de bord" ? "Accueil" : nom === "Les bases" ? "Bases" : nom)));
}

function texteRestant() {
  const minutes = Math.ceil(tempsRestant() / 60_000);
  return `Découverte libre : encore ${minutes} minute${minutes > 1 ? "s" : ""}. Un compte gratuit sera ensuite nécessaire.`;
}

function bandeauEssai() {
  const compte = etatCompte();
  if (!compte.actif || compte.session) return null;
  if (essaiTermine()) {
    return h("p", { class: "bandeau-essai", role: "status" }, "Le service de comptes ne répond pas : l’accès reste ouvert en attendant son retour.");
  }
  return h("p", { class: "bandeau-essai", id: "bandeau-essai" }, texteRestant(), " ", h("a", { href: "#/compte" }, "Créer un compte"));
}

function pageIntrouvable() {
  return [
    h("h1", {}, "Page introuvable"),
    h("p", { class: "sous-titre" }, "Cette adresse ne correspond à aucune page de la plateforme."),
    h("div", { class: "actions" }, h("a", { class: "bouton fort", href: "#/" }, "Revenir au tableau de bord")),
  ];
}

function contenu() {
  const { page, id, etape } = analyser();
  if (page === "tableau") return vueTableau();
  if (page === "modules") return vueModules();
  if (page === "exercices") return vueExercices(filtres);
  if (page === "progression") return vueProgression(naviguer);
  if (page === "bases") return vueBases();
  if (page === "compte") return vueCompte();
  if (page === "revisions") {
    const [, cible, numero] = location.hash.replace(/^#\/?/, "").split("/");
    if (!cible) return vueRevisions();
    if (cible === "quiz") return vueQuizRevision(naviguer);
    const module = MODULES.find((m) => m.id === Number(numero));
    return cible === "module" && module ? vueQuizModule(module, naviguer) : pageIntrouvable();
  }
  if (page === "module") {
    const module = MODULES.find((m) => m.id === id);
    return module ? vueModule(module) : pageIntrouvable();
  }
  if (page === "exercice") {
    const exercice = EXERCICES.find((e) => e.id === id);
    if (!exercice) return pageIntrouvable();
    if (etape === "quiz") return vueQuiz(exercice, naviguer);
    if (etape === "pratique") return vuePratique(exercice, naviguer);
    if (!etape) return vueCours(exercice);
  }
  return pageIntrouvable();
}

// bloque : le compte est exigé ; attente : la session ou le service ne sont pas encore connus.
function acces() {
  const compte = etatCompte();
  if (compte.actif && compte.session && compte.desactive) return "desactive";
  if (!compte.actif || compte.session || !essaiTermine()) return "libre";
  if (!compte.pret || etatService() === "inconnu") return "attente";
  return etatService() === "disponible" ? "bloque" : "libre";
}

let accesAffiche = null;

function afficher() {
  const situation = acces();
  accesAffiche = situation;
  document.body.classList.toggle("verrou", situation !== "libre");
  if (situation === "attente") {
    principal.replaceChildren(h("p", { class: "statut-comp" }, "Un instant."));
    return;
  }
  if (situation === "desactive") {
    principal.replaceChildren(...vueCompteDesactive());
    document.title = "Compte désactivé | TypeScript en 50 exercices";
    window.scrollTo(0, 0);
    return;
  }
  if (situation === "bloque") {
    principal.replaceChildren(...vueCompte({ obligatoire: true }).filter(Boolean));
    document.title = "Créer un compte | TypeScript en 50 exercices";
    window.scrollTo(0, 0);
    return;
  }
  dessinerRail(section());
  principal.replaceChildren(...[bandeauEssai(), ...contenu().flat()].filter(Boolean));
  window.scrollTo(0, 0);
  const titre = principal.querySelector("h1");
  document.title = titre ? `${titre.textContent} | TypeScript en 50 exercices` : "TypeScript en 50 exercices";
  principal.focus({ preventScroll: true });
}

// Un changement de compte redessine la page, sauf pendant un quiz ou de la pratique en cours.
surChangementCompte(({ session, donnees, statut }) => {
  const { page, etape } = analyser();
  const enTravail = (page === "exercice" && etape) || (page === "revisions" && location.hash.split("/").length > 2);
  if (acces() !== accesAffiche) return void afficher();
  if (accesAffiche !== "libre") return;
  dessinerRail(section());
  if ((session || donnees) && !enTravail) afficher();
  else if (statut && page === "compte") afficher();
});
activerBullesMots();
window.addEventListener("hashchange", afficher);

// Vérifie régulièrement la règle : le blocage s'applique même au milieu d'une page.
async function surveiller() {
  const compte = etatCompte();
  if (compte.actif && !compte.session && essaiTermine()) await testerService();
  if (acces() !== accesAffiche) afficher();
  const bandeau = document.getElementById("bandeau-essai");
  if (bandeau && !essaiTermine()) bandeau.firstChild.textContent = `${texteRestant()} `;
}

await demarrerEssai();
afficher();
demarrerCompte();
setInterval(surveiller, 5000);
surveiller();
