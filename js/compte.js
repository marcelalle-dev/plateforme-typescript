// Comptes et synchronisation. Si le service est indisponible, tout continue dans le navigateur.
import { SUPABASE } from "./config.js";
import * as store from "./store.js";

const DELAI_ENVOI = 2000;
const etat = {
  actif: false,
  pret: false,
  session: null,
  desactive: false,
  recuperation: false,
  statut: "local", // local, envoi, a-jour, indisponible
  derniereSynchro: null,
};
const ecouteurs = new Set();
let client = null;
let minuteur = null;
let enCours = false;
let aRefaire = false;
let versAccueil = false; // Vrai seulement après une connexion demandée, pas à chaque retour sur l'onglet.

export function etatCompte() {
  return etat;
}

export function surChangementCompte(fn) {
  ecouteurs.add(fn);
}

function prevenir(detail = {}) {
  for (const fn of ecouteurs) fn(detail);
}

export function clePermise(cle) {
  if (!cle || cle.startsWith("sb_secret_")) return false;
  const morceaux = cle.split(".");
  if (morceaux.length !== 3) return true;
  try {
    return JSON.parse(atob(morceaux[1].replace(/-/g, "+").replace(/_/g, "/"))).role !== "service_role";
  } catch {
    return false;
  }
}

function chargerBibliotheque() {
  return new Promise((resolve, reject) => {
    if (window.supabase) return resolve(window.supabase);
    const script = document.createElement("script");
    script.src = "vendor/supabase.js";
    script.onload = () => resolve(window.supabase);
    script.onerror = () => reject(new Error("Bibliothèque de connexion introuvable"));
    document.head.append(script);
    return undefined;
  });
}

export function traduireErreur(erreur) {
  const message = erreur?.message ?? String(erreur);
  if (/invalid login credentials/i.test(message)) return "E-mail ou mot de passe incorrect.";
  if (/email not confirmed/i.test(message)) return "Confirmez d’abord votre adresse : ouvrez le lien reçu par e-mail.";
  if (/already registered|already been registered/i.test(message)) return "Cette adresse a déjà un compte. Connectez-vous, ou réinitialisez le mot de passe.";
  if (/rate limit|too many requests|for security purposes/i.test(message)) return "Trop de tentatives ou d’e-mails envoyés. Réessayez un peu plus tard.";
  if (/password/i.test(message) && /(least|short|weak)/i.test(message)) return "Ce mot de passe est trop faible : utilisez au moins 8 caractères.";
  if (/same password|different from the old/i.test(message)) return "Choisissez un mot de passe différent de l’ancien.";
  if (/invalid.*email|email.*invalid/i.test(message)) return "Cette adresse e-mail n’est pas valide.";
  if (/fetch|network|load failed|timed? ?out/i.test(message)) return "Le service de comptes ne répond pas. Il est peut-être en pause. Votre progression reste enregistrée dans ce navigateur.";
  return `Une erreur est survenue : ${message}`;
}

function changerStatut(statut) {
  etat.statut = statut;
  if (statut === "a-jour") etat.derniereSynchro = new Date();
  prevenir({ statut: true });
}

// Récupère le compte, fusionne avec cet appareil, puis renvoie le résultat.
async function synchroniser({ remplacer = false } = {}) {
  if (!etat.session || etat.desactive) return;
  if (enCours) {
    aRefaire = true;
    return;
  }
  enCours = true;
  changerStatut("envoi");
  try {
    const id = etat.session.user.id;
    if (!remplacer) {
      const { data, error } = await client.from("progressions").select("donnees").eq("id_utilisateur", id).maybeSingle();
      if (error) throw error;
      if (store.integrer(data?.donnees ?? null)) prevenir({ donnees: true });
    }
    const { error } = await client.from("progressions").upsert({
      id_utilisateur: id,
      donnees: store.exporter(),
      modifie_le: new Date().toISOString(),
    });
    if (error) throw error;
    changerStatut("a-jour");
  } catch {
    changerStatut("indisponible");
  } finally {
    enCours = false;
    if (aRefaire) {
      aRefaire = false;
      planifierEnvoi();
    }
  }
}

function planifierEnvoi() {
  clearTimeout(minuteur);
  minuteur = setTimeout(() => synchroniser(), DELAI_ENVOI);
}

export function synchroniserMaintenant() {
  clearTimeout(minuteur);
  return synchroniser();
}

async function lireDesactivation(id) {
  try {
    const { data } = await client.from("profils").select("desactive_le").eq("id", id).maybeSingle();
    return Boolean(data?.desactive_le);
  } catch {
    return false;
  }
}

async function surSession(session, evenement) {
  const avant = etat.session?.user.id;
  const nouvelle = session && session.user.id !== avant;
  if (nouvelle) etat.desactive = await lireDesactivation(session.user.id);
  if (!session) etat.desactive = false;
  etat.session = session;
  etat.pret = true;
  if (evenement === "PASSWORD_RECOVERY") etat.recuperation = true;
  if (nouvelle && versAccueil) location.hash = "#/";
  versAccueil = false;
  prevenir({ session: true });
  if (nouvelle) {
    client.rpc("noter_visite").then(undefined, () => {});
    await synchroniser();
  }
  if (!session) changerStatut("local");
}

// `clientFourni` permet de tester la plateforme sans service réel.
export async function demarrerCompte(clientFourni) {
  if (!clientFourni && !(SUPABASE.url && SUPABASE.clePublique)) return;
  if (!clientFourni && !clePermise(SUPABASE.clePublique)) {
    console.error("Clé secrète refusée dans js/config.js : utilisez la clé publique.");
    return;
  }
  etat.actif = true;
  prevenir({ session: true });
  try {
    if (clientFourni) {
      client = clientFourni;
    } else {
      const bibliotheque = await chargerBibliotheque();
      client = bibliotheque.createClient(SUPABASE.url, SUPABASE.clePublique, {
        auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
    }
    // La bibliothèque interdit d'attendre un appel au service dans ce rappel : on le reporte.
    client.auth.onAuthStateChange((evenement, session) => {
      setTimeout(() => surSession(session, evenement), 0);
    });
    store.surModification(({ remplacer }) => {
      if (!etat.session) return;
      if (remplacer) {
        clearTimeout(minuteur);
        synchroniser({ remplacer: true });
      } else {
        planifierEnvoi();
      }
    });
    window.addEventListener("online", () => synchroniser());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && etat.session) synchroniser();
    });
  } catch {
    etat.pret = true;
    changerStatut("indisponible");
  }
}

function adresseRetour() {
  return `${location.origin}${location.pathname}`;
}

export async function inscrire({ prenom, email, motDePasse }) {
  versAccueil = true;
  const { data, error } = await client.auth.signUp({
    email,
    password: motDePasse,
    options: { data: { prenom }, emailRedirectTo: adresseRetour() },
  });
  if (error || !data.session) versAccueil = false;
  if (error) throw error;
  return { confirmationRequise: !data.session };
}

export async function connecter({ email, motDePasse }) {
  versAccueil = true;
  const { error } = await client.auth.signInWithPassword({ email, password: motDePasse });
  if (error) {
    versAccueil = false;
    throw error;
  }
}

export async function demanderReinitialisation(email) {
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: adresseRetour() });
  if (error) throw error;
}

export async function changerMotDePasse(motDePasse) {
  const { error } = await client.auth.updateUser({ password: motDePasse });
  if (error) throw error;
  etat.recuperation = false;
  prevenir({ session: true });
}

// La progression est retirée de l'appareil : la personne suivante n'y aura pas accès.
export async function deconnecter() {
  clearTimeout(minuteur);
  await synchroniser();
  await client.auth.signOut({ scope: "local" });
  store.oublier();
  prevenir({ donnees: true });
}

// Le compte et ses données sont conservés ; une reconnexion propose de le réactiver.
export async function desactiverCompte() {
  clearTimeout(minuteur);
  await synchroniser();
  const { error } = await client.rpc("desactiver_mon_compte");
  if (error) throw error;
  await client.auth.signOut({ scope: "local" });
  store.oublier();
  prevenir({ donnees: true });
}

export async function reactiverCompte() {
  const { error } = await client.rpc("reactiver_mon_compte");
  if (error) throw error;
  etat.desactive = false;
  location.hash = "#/";
  prevenir({ session: true });
  await synchroniser();
}

export async function lireAvis() {
  const { data, error } = await client.from("avis").select("note, commentaire").eq("id_utilisateur", etat.session.user.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function envoyerAvis({ note, commentaire }) {
  const { error } = await client.from("avis").upsert({
    id_utilisateur: etat.session.user.id,
    note,
    commentaire,
    modifie_le: new Date().toISOString(),
  });
  if (error) throw error;
}
