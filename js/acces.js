// Accès libre pendant 5 minutes à partir de la première visite, puis compte obligatoire.
// La date de première visite est gardée à trois endroits : la plus ancienne l'emporte,
// pour qu'effacer un seul stockage ne relance pas le compteur.
import { SUPABASE } from "./config.js";

const REGLES = Object.freeze({ DUREE_ESSAI: 5 * 60 * 1000, INTERVALLE_SERVICE: 60 * 1000 });
const CLE = "ts50.premiere-visite";
const BASE = "ts50-acces";
const UN_AN = 365 * 24 * 3600;

let debut = null;
let plusRecent = 0; // Reculer l'horloge de l'ordinateur ne redonne pas de temps.
let service = "inconnu"; // inconnu, disponible, panne
let dernierTestService = 0;

function dateValide(valeur) {
  const n = Number(valeur);
  return Number.isFinite(n) && n > 0 && n <= Date.now() + 86_400_000 ? n : null;
}

function lireCookie() {
  const m = new RegExp(`(?:^|; )${CLE.replace(".", "\\.")}=(\\d+)`).exec(document.cookie);
  return m ? dateValide(m[1]) : null;
}

function lireLocal() {
  try {
    return dateValide(localStorage.getItem(CLE));
  } catch {
    return null;
  }
}

function ouvrirBase() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(BASE, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("v");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function lireBase() {
  const base = await ouvrirBase();
  return new Promise((resolve) => {
    const r = base.transaction("v").objectStore("v").get("debut");
    r.onsuccess = () => {
      base.close();
      resolve(dateValide(r.result));
    };
    r.onerror = () => {
      base.close();
      resolve(null);
    };
  });
}

async function ecrireBase(valeur) {
  const base = await ouvrirBase();
  base.transaction("v", "readwrite").objectStore("v").put(valeur, "debut");
  base.close();
}

function memoriserRapide() {
  document.cookie = `${CLE}=${debut}; max-age=${UN_AN}; path=/; SameSite=Lax`;
  try {
    localStorage.setItem(CLE, String(debut));
  } catch {
    // Le cookie et la base restent.
  }
}

// La base est lue avant toute écriture : une date plus ancienne ne doit pas être écrasée.
export async function demarrerEssai() {
  debut = Math.min(...[lireCookie(), lireLocal(), Date.now()].filter(Boolean));
  try {
    const enBase = await lireBase();
    if (enBase && enBase < debut) debut = enBase;
    await ecrireBase(debut);
  } catch {
    // Sans base disponible, le cookie et localStorage suffisent.
  }
  memoriserRapide();
}

export function tempsRestant() {
  plusRecent = Math.max(plusRecent, Date.now());
  return Math.max(0, debut + REGLES.DUREE_ESSAI - plusRecent);
}

export function essaiTermine() {
  return debut !== null && tempsRestant() === 0;
}

export function etatService() {
  return service;
}

// Si le service est en pause ou injoignable, personne ne peut s'inscrire : l'accès reste ouvert.
export async function testerService() {
  if (Date.now() - dernierTestService < REGLES.INTERVALLE_SERVICE && service !== "inconnu") return service;
  dernierTestService = Date.now();
  try {
    const r = await fetch(`${SUPABASE.url}/auth/v1/settings`, { headers: { apikey: SUPABASE.clePublique } });
    service = r.ok ? "disponible" : "panne";
  } catch {
    service = "panne";
  }
  return service;
}
