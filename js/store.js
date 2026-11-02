// Sauvegarde locale de la progression (localStorage).
import { SEUIL_VALIDATION } from "./quiz-core.js";

const CLE = "ts50.progression.v1";
const MAX_TENTATIVES = 30;
const JOUR = 86_400_000;
const INTERVALLES = [1, 3, 7, 14, 30];
let memoire = lire();

// Un autre onglet a enregistré : on reprend ses données pour ne pas les écraser.
window.addEventListener("storage", (e) => {
  if (e.key === CLE || e.key === null) memoire = lire();
});

function lire() {
  try {
    const brut = localStorage.getItem(CLE);
    const donnees = brut ? JSON.parse(brut) : null;
    if (donnees && typeof donnees === "object" && donnees.exercices) return donnees;
  } catch {
    // Stockage indisponible ou illisible : la progression repart de zéro pour cette session.
  }
  return { exercices: {}, dernier: null };
}

function ecrire() {
  try {
    localStorage.setItem(CLE, JSON.stringify(memoire));
    return true;
  } catch {
    return false;
  }
}

export function stockageDisponible() {
  try {
    localStorage.setItem(`${CLE}.test`, "1");
    localStorage.removeItem(`${CLE}.test`);
    return true;
  } catch {
    return false;
  }
}

export function suivi(id) {
  return memoire.exercices[id] ?? null;
}

function creer(id) {
  memoire.exercices[id] ??= { meilleur: null, dernier: null, valide: false, tentatives: [], pratique: null };
  return memoire.exercices[id];
}

export function marquerVisite(id) {
  memoire.dernier = id;
  ecrire();
}

export function dernierVisite() {
  return memoire.dernier;
}

export function enregistrerQuiz(id, resultat) {
  const s = creer(id);
  s.tentatives.push({ score: resultat.score, date: new Date().toISOString() });
  s.tentatives = s.tentatives.slice(-MAX_TENTATIVES);
  s.dernier = resultat.score;
  const nouveauRecord = s.meilleur === null || resultat.score > s.meilleur;
  if (nouveauRecord) s.meilleur = resultat.score;
  s.valide = s.valide || resultat.score >= SEUIL_VALIDATION;
  s.ratees = resultat.details.flatMap((d, i) => (d.juste ? [] : [i]));
  if (resultat.score >= SEUIL_VALIDATION && !s.revision) {
    s.revision = { niveau: 0, prochaine: Date.now() + JOUR };
  }
  ecrire();
  return { nouveauRecord };
}

// Une réponse donnée hors du quiz officiel met à jour les questions à reprendre.
export function noterReponse(id, indice, juste) {
  const s = creer(id);
  const ratees = new Set(s.ratees ?? []);
  if (juste) ratees.delete(indice);
  else ratees.add(indice);
  s.ratees = [...ratees].sort((a, b) => a - b);
  ecrire();
}

export function noterRevision(id, reussi) {
  const s = creer(id);
  const niveau = reussi ? Math.min((s.revision?.niveau ?? -1) + 1, INTERVALLES.length - 1) : 0;
  s.revision = { niveau, prochaine: Date.now() + INTERVALLES[niveau] * JOUR };
  ecrire();
}

export function aReviser(exercices) {
  const maintenant = Date.now();
  return exercices.filter((e) => {
    const r = suivi(e.id)?.revision;
    return r && r.prochaine <= maintenant;
  });
}

export function brouillon(id) {
  return memoire.exercices[id]?.pratique?.code ?? null;
}

export function enregistrerBrouillon(id, code) {
  const s = creer(id);
  s.pratique = { reussi: false, essais: 0, ...s.pratique, code };
  ecrire();
}

export function enregistrerPratique(id, code, reussi) {
  const s = creer(id);
  const avant = s.pratique ?? { reussi: false, essais: 0 };
  s.pratique = { code, essais: avant.essais + 1, reussi: avant.reussi || reussi };
  ecrire();
  return s.pratique;
}

export function effacerBrouillon(id) {
  const s = memoire.exercices[id];
  if (s?.pratique) {
    s.pratique.code = null;
    ecrire();
  }
}

export function reinitialiser() {
  memoire = { exercices: {}, dernier: null };
  ecrire();
}

// Statistiques de la page de progression.
export function statistiques(exercices) {
  const suivis = exercices.map((e) => suivi(e.id));
  const tentes = suivis.filter((s) => s?.meilleur !== null && s?.meilleur !== undefined);
  const valides = suivis.filter((s) => s?.valide).length;
  const somme = tentes.reduce((total, s) => total + s.meilleur, 0);
  return {
    total: exercices.length,
    valides,
    nonValides: exercices.length - valides,
    tentes: tentes.length,
    pourcentage: Math.round((valides / exercices.length) * 100),
    moyenne: tentes.length ? Math.round((somme / tentes.length) * 10) / 10 : null,
    meilleur: tentes.length ? Math.max(...tentes.map((s) => s.meilleur)) : null,
    tentatives: suivis.reduce((total, s) => total + (s?.tentatives.length ?? 0), 0),
    pratiques: suivis.filter((s) => s?.pratique?.reussi).length,
  };
}
