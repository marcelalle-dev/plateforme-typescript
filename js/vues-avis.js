// Page « Mon avis » : une note et un commentaire, modifiables, liés au compte.
import * as compte from "./compte.js";
import { h } from "./ui.js";

const MAX_COMMENTAIRE = 1000;
const LIBELLES = ["Très insuffisant", "Insuffisant", "Correct", "Bien", "Excellent"];

export function vueAvis() {
  const titre = h("h1", {}, "Mon avis");
  const etat = compte.etatCompte();
  if (!etat.session) {
    return [
      titre,
      h("p", { class: "sous-titre" }, "Connectez-vous pour donner votre avis sur la plateforme."),
      h("div", { class: "actions" }, h("a", { class: "bouton fort", href: "#/compte" }, etat.actif ? "Se connecter" : "Mon compte")),
    ];
  }

  const message = h("p", { class: "message-form", role: "status" });
  const champs = LIBELLES.map((libelle, i) => h("label", { class: "option option-note" },
    h("input", { type: "radio", name: "note", value: String(i + 1), required: true }),
    h("span", {}, `${i + 1} sur 5 : ${libelle}`)));
  const commentaire = h("textarea", { name: "commentaire", rows: "5", maxlength: String(MAX_COMMENTAIRE), class: "zone-avis" });
  const bouton = h("button", { class: "bouton fort", type: "submit" }, "Envoyer mon avis");

  compte.lireAvis().then((avis) => {
    if (!avis) return;
    const choix = champs[avis.note - 1]?.querySelector("input");
    if (choix) choix.checked = true;
    commentaire.value = avis.commentaire;
    bouton.textContent = "Modifier mon avis";
  }).catch(() => {
    message.textContent = "Votre avis précédent n’a pas pu être chargé.";
  });

  return [
    titre,
    h("p", { class: "sous-titre" }, "Votre avis aide à améliorer la plateforme. Seul son responsable peut le lire, avec votre prénom et votre adresse e-mail."),
    h("form", {
      class: "formulaire section bloc-compte",
      onsubmit: async (e) => {
        e.preventDefault();
        const donnees = new FormData(e.currentTarget);
        bouton.disabled = true;
        message.textContent = "Envoi en cours.";
        message.dataset.etat = "";
        try {
          await compte.envoyerAvis({ note: Number(donnees.get("note")), commentaire: String(donnees.get("commentaire")).trim() });
          message.textContent = "Merci, votre avis est enregistré.";
          message.dataset.etat = "juste";
          bouton.textContent = "Modifier mon avis";
        } catch (erreur) {
          message.textContent = compte.traduireErreur(erreur);
          message.dataset.etat = "faux";
        } finally {
          bouton.disabled = false;
        }
      },
    },
    h("fieldset", { class: "groupe-note" }, h("legend", {}, "Votre note"), h("div", { class: "options" }, champs)),
    h("label", { class: "champ" }, `Votre commentaire (facultatif, ${MAX_COMMENTAIRE} caractères au plus)`, commentaire),
    bouton,
    message),
  ];
}
