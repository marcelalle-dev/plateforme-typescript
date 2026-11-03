// Lecture à voix haute de la page affichée, avec la synthèse vocale du navigateur.
// Le texte est pris dans la page au moment du clic : une correction encore cachée n'est donc jamais lue.
import { h } from "./ui.js";

const voix = "speechSynthesis" in window ? window.speechSynthesis : null;
const CLE_VITESSE = "ts50.vitesse-lecture";
const VITESSES = [0.75, 1, 1.25, 1.5];
const LONGUEUR_MAX = 200;
const BLOCS = "h1, h2, h3, p, li, dt, dd, pre";
// Les commandes, les éditeurs et le pas à pas ne se lisent pas : ils se manipulent.
const IGNORES = "button, input, select, textarea, nav, .lecteur, .bandeau-essai, .etapes, .volets, .actions, .grille, .editeur, .pas, [aria-hidden='true'], [hidden]";

let file = [];
let position = 0;
let etat = "arret"; // arret, lecture, pause
let courant = null; // Garder l'énoncé en mémoire : certains navigateurs l'oublient en pleine lecture.
let surveillance = null;
let marque = null;
let vitesse = lireVitesse();

voix?.getVoices(); // Chrome ne charge ses voix qu'à la première demande.
if (voix) window.addEventListener("pagehide", () => voix.cancel());

function lireVitesse() {
  try {
    const valeur = Number(localStorage.getItem(CLE_VITESSE));
    return VITESSES.includes(valeur) ? valeur : 1;
  } catch {
    return 1;
  }
}

function voixFrancaise() {
  const francaises = voix.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr"));
  return francaises.find((v) => v.localService && v.lang === "fr-FR") ?? francaises[0] ?? null;
}

// Rend le code écrit agréable à écouter. Le texte reçu peut compter plusieurs lignes : les sauts de ligne doivent rester.
function prononcerCode(code) {
  // TODO(human) : remplacer les symboles du code par des mots français.
  return code;
}

function texteDe(noeud) {
  if (noeud.nodeType === Node.TEXT_NODE) return noeud.textContent;
  if (noeud.nodeType !== Node.ELEMENT_NODE || noeud.matches(`${IGNORES}, .num-ligne`)) return "";
  const texte = [...noeud.childNodes].map(texteDe).join("");
  return noeud.localName === "code" ? prononcerCode(texte) : texte;
}

// Phrase par phrase et ligne par ligne : la pause et le changement de vitesse reprennent ainsi au bon endroit.
function decouper(texte) {
  return texte
    .split(/\n|(?<=\D[.!?])\s+/)
    .flatMap((morceau) => (morceau.length > LONGUEUR_MAX ? morceau.split(/(?<=,)\s+/) : [morceau]))
    .map((morceau) => morceau.trim())
    .filter((morceau) => /[\p{L}\p{N}]/u.test(morceau));
}

function segments(element, liste = []) {
  if (element.matches(IGNORES) || !element.getClientRects().length) return liste;
  const aDuTexte = [...element.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  if (aDuTexte || (element.matches(BLOCS) && !element.querySelector(BLOCS))) {
    for (const texte of decouper(texteDe(element))) liste.push({ element, texte });
  } else {
    for (const enfant of element.children) segments(enfant, liste);
  }
  return liste;
}

function surligner(element) {
  if (marque === element) return;
  marque?.classList.remove("en-lecture");
  marque = element;
  if (!element) return;
  element.classList.add("en-lecture");
  const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ block: "nearest", behavior: reduit ? "auto" : "smooth" });
}

function changerEtat(nouveau, message = "") {
  etat = nouveau;
  surveillance?.(message);
}

function dire() {
  const segment = file[position];
  // La page a pu changer sous la lecture, par exemple quand un quiz est corrigé.
  if (!segment?.element.isConnected) return void arreterLecture();
  surligner(segment.element);
  const enonce = new SpeechSynthesisUtterance(segment.texte);
  enonce.lang = "fr-FR";
  enonce.voice = voixFrancaise();
  enonce.rate = vitesse;
  enonce.onend = () => {
    if (enonce !== courant) return;
    position += 1;
    dire();
  };
  enonce.onerror = () => {
    if (enonce === courant) arreterLecture("La lecture a échoué sur ce navigateur.");
  };
  courant = enonce;
  voix.speak(enonce);
  surveillance?.();
}

function couper() {
  courant = null;
  voix?.cancel();
}

export function lectureEnCours() {
  return etat !== "arret";
}

export function arreterLecture(message = "") {
  couper();
  file = [];
  position = 0;
  surligner(null);
  changerEtat("arret", message);
}

function demarrer(racine) {
  couper();
  file = segments(racine);
  position = 0;
  if (!file.length) return void changerEtat("arret", "Rien à lire sur cette page.");
  const message = voixFrancaise() ? "" : "Aucune voix française sur cet appareil : la voix par défaut est utilisée.";
  changerEtat("lecture", message);
  dire();
}

function mettreEnPause() {
  couper();
  changerEtat("pause");
}

function reprendre() {
  changerEtat("lecture");
  dire();
}

// Début du bloc courant, ou du bloc précédent si la lecture y est déjà.
function blocPrecedent() {
  const debutDuBloc = (i) => {
    let debut = i;
    while (debut > 0 && file[debut - 1].element === file[i].element) debut -= 1;
    return debut;
  };
  const debut = debutDuBloc(position);
  return debut === position && debut > 0 ? debutDuBloc(debut - 1) : debut;
}

function blocSuivant() {
  let suivant = position;
  while (file[suivant]?.element === file[position].element) suivant += 1;
  return suivant;
}

function allerA(nouvellePosition) {
  couper();
  position = nouvellePosition;
  if (etat === "lecture") return void dire();
  if (file[position]) surligner(file[position].element);
  surveillance?.();
}

function changerVitesse(valeur) {
  vitesse = valeur;
  try {
    localStorage.setItem(CLE_VITESSE, String(valeur));
  } catch {
    // La vitesse reste valable jusqu'à la fermeture de la page.
  }
  if (etat !== "lecture") return;
  couper();
  dire();
}

// racine : la zone de la page à lire. Sans synthèse vocale, le lecteur n'apparaît pas.
export function lecteur(racine) {
  if (!voix) return null;
  const principal = h("button", {
    class: "bouton fort",
    type: "button",
    onclick: () => {
      if (etat === "arret") demarrer(racine);
      else if (etat === "lecture") mettreEnPause();
      else reprendre();
    },
  });
  const precedent = h("button", { class: "bouton", type: "button", "aria-label": "Revenir au bloc précédent", onclick: () => allerA(blocPrecedent()) }, "Précédent");
  const suivant = h("button", {
    class: "bouton",
    type: "button",
    "aria-label": "Passer au bloc suivant",
    onclick: () => {
      const cible = blocSuivant();
      if (cible < file.length) allerA(cible);
      else arreterLecture();
    },
  }, "Suivant");
  const arreter = h("button", { class: "bouton", type: "button", onclick: () => arreterLecture() }, "Arrêter");
  const choixVitesse = h("select", { onchange: (e) => changerVitesse(Number(e.target.value)) },
    VITESSES.map((v) => h("option", { value: v }, `${String(v).replace(".", ",")} ×`)));
  choixVitesse.value = String(vitesse);
  const avancee = h("span", { class: "lecteur-avancee" });
  const statut = h("span", { class: "lecteur-statut", role: "status" });
  const zone = h("div", { class: "lecteur", role: "group", "aria-label": "Lecture à voix haute" },
    principal, precedent, suivant, arreter,
    h("label", {}, "Vitesse ", choixVitesse),
    avancee, statut);

  surveillance = (message) => {
    const actif = etat !== "arret";
    zone.dataset.etat = etat;
    principal.textContent = { arret: "Écouter la page", lecture: "Pause", pause: "Reprendre" }[etat];
    precedent.hidden = !actif;
    suivant.hidden = !actif;
    arreter.hidden = !actif;
    avancee.hidden = !actif;
    if (actif) avancee.textContent = `${Math.round((position / file.length) * 100)} %`;
    if (message !== undefined) statut.textContent = message;
  };
  surveillance("");
  return zone;
}
