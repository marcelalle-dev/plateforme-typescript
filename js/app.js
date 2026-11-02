// Point d’entrée : navigation par ancres (#/...) et cadre commun des pages.
import { EXERCICES, MODULES } from "../data/index.js";
import { h } from "./ui.js";
import { barreModule, vueExercices, vueModule, vueModules, vueProgression, vueTableau } from "./vues-generales.js";
import { vueCours, vuePratique, vueQuiz } from "./vues-exercice.js";

const rail = document.getElementById("rail");
const onglets = document.getElementById("onglets");
const principal = document.getElementById("contenu");

const LIENS = [
  ["#/", "Tableau de bord", "tableau"],
  ["#/modules", "Modules", "modules"],
  ["#/exercices", "Exercices", "exercices"],
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
  rail.replaceChildren(
    h("a", { class: "marque", href: "#/" }, "TypeScript en 50 exercices", h("span", {}, "Cours, quiz et pratique")),
    h("nav", { "aria-label": "Navigation principale" },
      h("ul", { class: "nav-rail" }, LIENS.map((l) => h("li", {}, lien(l))))),
    h("h2", {}, "Modules"),
    ...MODULES.map((m) => h("a", { class: "mod-rail", href: `#/module/${m.id}` },
      h("span", { class: "mod-nom" }, `${m.id}. ${m.nom}`),
      h("small", {}, `Exercices ${m.premier} à ${m.dernier}`),
      barreModule(m))));
  onglets.replaceChildren(...LIENS.map(([href, nom, cle]) =>
    h("a", { href, "aria-current": actif === cle ? "page" : null }, nom === "Tableau de bord" ? "Accueil" : nom)));
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

function afficher() {
  dessinerRail(section());
  principal.replaceChildren(...contenu().flat().filter(Boolean));
  window.scrollTo(0, 0);
  const titre = principal.querySelector("h1");
  document.title = titre ? `${titre.textContent} | TypeScript en 50 exercices` : "TypeScript en 50 exercices";
  principal.focus({ preventScroll: true });
}

window.addEventListener("hashchange", afficher);
afficher();
