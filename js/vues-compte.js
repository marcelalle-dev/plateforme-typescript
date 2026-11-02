// Page Compte : inscription, connexion, mot de passe, synchronisation et suppression.
import * as compte from "./compte.js";
import { h } from "./ui.js";

const MIN_MOT_DE_PASSE = 8;

function champ(libelle, attributs) {
  return h("label", { class: "champ" }, libelle, h("input", attributs));
}

function formulaire({ champs, action, libelle, surEnvoi }) {
  const message = h("p", { class: "message-form", role: "status" });
  const bouton = h("button", { class: "bouton fort", type: "submit" }, libelle ?? action);
  return h("form", {
    class: "formulaire",
    onsubmit: async (e) => {
      e.preventDefault();
      const valeurs = Object.fromEntries(new FormData(e.currentTarget));
      bouton.disabled = true;
      message.textContent = "Un instant.";
      message.dataset.etat = "";
      try {
        const texte = await surEnvoi(valeurs);
        message.textContent = texte ?? "";
        message.dataset.etat = "juste";
      } catch (erreur) {
        message.textContent = compte.traduireErreur(erreur);
        message.dataset.etat = "faux";
      } finally {
        bouton.disabled = false;
      }
    },
  }, champs, bouton, message);
}

function noteDonnees() {
  return h("details", { class: "note-donnees" },
    h("summary", {}, "Quelles données sont enregistrées ?"),
    h("p", {}, "Votre prénom, votre adresse e-mail, vos dates d’inscription et de dernière visite, vos scores et le code de vos exercices pratiques. Ces données sont hébergées par Supabase."),
    h("p", {}, "Le responsable de cette plateforme peut les consulter pour suivre votre progression. Elles ne servent à rien d’autre. Vous pouvez désactiver votre compte à tout moment depuis cette page : vos données sont alors conservées. Pour demander leur effacement, contactez le responsable de la plateforme."));
}

function vueAnonyme({ obligatoire = false } = {}) {
  const zone = h("div", {});
  const lien = (texte, fn) => h("button", { class: "lien", type: "button", onclick: fn }, texte);
  const courriel = () => champ("Adresse e-mail", { type: "email", name: "email", required: true, autocomplete: "email", maxlength: "254" });

  function afficherConnexion() {
    zone.replaceChildren(
      h("h2", {}, "Se connecter"),
      formulaire({
        action: "Se connecter",
        champs: [courriel(), champ("Mot de passe", { type: "password", name: "motDePasse", required: true, autocomplete: "current-password" })],
        surEnvoi: async ({ email, motDePasse }) => {
          await compte.connecter({ email, motDePasse });
          return "Connexion réussie.";
        },
      }),
      h("div", { class: "liens-form" },
        lien("Créer un compte", afficherInscription),
        lien("Mot de passe oublié", afficherOubli)));
  }

  function afficherInscription() {
    zone.replaceChildren(
      h("h2", {}, "Créer un compte"),
      h("p", {}, "Votre progression actuelle sera reprise dans votre compte."),
      formulaire({
        action: "Créer mon compte",
        champs: [
          champ("Prénom", { type: "text", name: "prenom", required: true, autocomplete: "given-name", maxlength: "60" }),
          courriel(),
          champ(`Mot de passe (au moins ${MIN_MOT_DE_PASSE} caractères)`, { type: "password", name: "motDePasse", required: true, autocomplete: "new-password", minlength: String(MIN_MOT_DE_PASSE) }),
        ],
        surEnvoi: async ({ prenom, email, motDePasse }) => {
          const { confirmationRequise } = await compte.inscrire({ prenom: prenom.trim(), email, motDePasse });
          return confirmationRequise
            ? "Presque terminé : ouvrez le lien envoyé par e-mail, puis connectez-vous. Regardez aussi dans les courriers indésirables."
            : "Compte créé.";
        },
      }),
      noteDonnees(),
      h("div", { class: "liens-form" }, lien("J’ai déjà un compte", afficherConnexion)));
  }

  function afficherOubli() {
    zone.replaceChildren(
      h("h2", {}, "Mot de passe oublié"),
      formulaire({
        action: "Recevoir le lien",
        champs: [courriel()],
        surEnvoi: async ({ email }) => {
          await compte.demanderReinitialisation(email);
          return "Si cette adresse a un compte, un lien de réinitialisation vient d’être envoyé.";
        },
      }),
      h("div", { class: "liens-form" }, lien("Revenir à la connexion", afficherConnexion)));
  }

  if (obligatoire) afficherInscription();
  else afficherConnexion();
  return [
    h("p", { class: "sous-titre" }, obligatoire
      ? "Vos 5 minutes de découverte sont terminées. Pour continuer, créez un compte gratuit ou connectez-vous. Votre progression sera reprise."
      : "Un compte est gratuit. Il permet de retrouver votre progression sur tous vos appareils. Après 5 minutes de découverte, il devient nécessaire."),
    h("div", { class: "section bloc-compte" }, zone),
  ];
}

function texteStatut(etat) {
  if (etat.statut === "envoi") return "Synchronisation en cours.";
  if (etat.statut === "indisponible") return "Le service ne répond pas pour le moment. Votre progression reste enregistrée dans ce navigateur et sera envoyée dès son retour.";
  if (etat.statut === "a-jour" && etat.derniereSynchro) return `Progression synchronisée à ${etat.derniereSynchro.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.`;
  return "En attente de synchronisation.";
}

function vueConnecte(etat) {
  const utilisateur = etat.session.user;
  const statut = h("p", { class: "statut-comp", "aria-live": "polite" }, texteStatut(etat));
  const zoneDesactivation = h("div", { class: "actions" });

  const afficherDesactivation = () => zoneDesactivation.replaceChildren(
    h("button", {
      class: "bouton danger",
      type: "button",
      onclick: () => zoneDesactivation.replaceChildren(
        h("p", { class: "message-form", "data-etat": "faux" }, "Votre compte sera désactivé et vous serez déconnecté. Vos données sont conservées, et vous pourrez le réactiver en vous reconnectant."),
        h("button", {
          class: "bouton danger",
          type: "button",
          onclick: async (e) => {
            e.currentTarget.disabled = true;
            try {
              await compte.desactiverCompte();
            } catch (erreur) {
              zoneDesactivation.replaceChildren(h("p", { class: "message-form", "data-etat": "faux" }, compte.traduireErreur(erreur)));
            }
          },
        }, "Oui, désactiver mon compte"),
        h("button", { class: "bouton", type: "button", onclick: afficherDesactivation }, "Annuler")),
    }, "Désactiver mon compte"));
  afficherDesactivation();

  return [
    h("p", { class: "sous-titre" }, `Bonjour ${utilisateur.user_metadata?.prenom || ""}. Vous êtes connecté avec ${utilisateur.email}.`.replace("Bonjour .", "Bonjour.")),
    h("section", { class: "section bloc-compte" },
      h("h2", {}, "Synchronisation"),
      statut,
      h("div", { class: "actions" },
        h("button", { class: "bouton", type: "button", onclick: () => compte.synchroniserMaintenant() }, "Synchroniser maintenant"),
        h("button", {
          class: "bouton",
          type: "button",
          onclick: async (e) => {
            e.currentTarget.disabled = true;
            await compte.deconnecter();
          },
        }, "Se déconnecter")),
      h("p", { class: "note" }, "Se déconnecter retire votre progression de cet appareil. Elle reste dans votre compte. Un compte sera nécessaire pour revenir.")),
    h("section", { class: "section bloc-compte" },
      h("h2", {}, "Changer de mot de passe"),
      formulaireMotDePasse()),
    h("section", { class: "section bloc-compte" },
      h("h2", {}, "Mes données"),
      noteDonnees(),
      zoneDesactivation),
  ];
}

function formulaireMotDePasse() {
  return formulaire({
    action: "Enregistrer le mot de passe",
    champs: [champ(`Nouveau mot de passe (au moins ${MIN_MOT_DE_PASSE} caractères)`, { type: "password", name: "motDePasse", required: true, autocomplete: "new-password", minlength: String(MIN_MOT_DE_PASSE) })],
    surEnvoi: async ({ motDePasse }) => {
      await compte.changerMotDePasse(motDePasse);
      return "Mot de passe modifié.";
    },
  });
}

export function vueCompteDesactive() {
  const message = h("p", { class: "message-form", role: "status" });
  return [
    h("h1", {}, "Votre compte est désactivé"),
    h("p", { class: "sous-titre" }, "Vos données sont conservées. Réactivez votre compte pour retrouver votre progression."),
    h("div", { class: "actions" },
      h("button", {
        class: "bouton fort",
        type: "button",
        onclick: async (e) => {
          e.currentTarget.disabled = true;
          try {
            await compte.reactiverCompte();
          } catch (erreur) {
            message.textContent = compte.traduireErreur(erreur);
            message.dataset.etat = "faux";
            e.target.disabled = false;
          }
        },
      }, "Réactiver mon compte"),
      h("button", { class: "bouton", type: "button", onclick: () => compte.deconnecter() }, "Se déconnecter")),
    message,
  ];
}

export function vueCompte({ obligatoire = false } = {}) {
  const etat = compte.etatCompte();
  const titre = h("h1", {}, obligatoire ? "Créez votre compte pour continuer" : "Mon compte");
  if (obligatoire) return [titre, ...vueAnonyme({ obligatoire })];
  if (!etat.actif) {
    return [titre, h("p", { class: "vide" }, "Les comptes ne sont pas encore activés sur cette plateforme. Votre progression est enregistrée dans ce navigateur.")];
  }
  if (etat.recuperation && etat.session) {
    return [titre, h("section", { class: "section bloc-compte" }, h("h2", {}, "Choisir un nouveau mot de passe"), formulaireMotDePasse())];
  }
  return [titre, ...(etat.session ? vueConnecte(etat) : vueAnonyme())];
}
