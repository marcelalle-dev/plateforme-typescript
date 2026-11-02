// Explications plus fines : chaque groupe de lignes est remplacé par des explications ligne à ligne.
const STATUTS_TACHE = [
  ['1', 'Déclare le type `TaskStatus`. Chaque ligne suivante, commençant par `|`, ajoute une valeur possible.'],
  ['2', '`"draft"` : brouillon, la tâche n’est pas encore publiée.'],
  ['3', '`"published"` : publiée, visible par les collaborateurs.'],
  ['4', '`"in_selection"` : le client choisit parmi les candidats.'],
  ['5', '`"assigned"` : attribuée à un collaborateur.'],
  ['6', '`"in_progress"` : le travail est en cours.'],
  ['7', '`"delivered"` : le travail a été livré.'],
  ['8', '`"validated"` : le client a validé la livraison.'],
  ['9', '`"closed"` : la tâche est terminée et fermée.'],
  ['10', '`"disputed"` : la tâche fait l’objet d’un litige.'],
  ['11', '`"cancelled"` : la tâche est annulée. Le `;` termine le type.'],
];

export const LIGNES_DETAIL = {
  2: {
    '19-23': [
      ['19', 'Teste si `sixth` contient une valeur. Ici, `sixth` vaut `undefined`, donc le test est faux.'],
      ['20', 'Bloc ignoré dans cet exemple : il afficherait la valeur si elle existait.'],
      ['21', '`else` ouvre le bloc exécuté quand le test est faux.'],
      ['22', 'Affiche le message d’absence : c’est cette ligne qui s’exécute.'],
      ['23', 'Ferme le bloc `else`.'],
    ],
  },
  3: {
    '5-9': [
      ['5', 'Déclare `brokenLevelLabel`, sans annotation de retour. C’est ici que l’erreur TS7030 est signalée.'],
      ['6', 'Teste si le niveau vaut `"beginner"`.'],
      ['7', 'Renvoie le libellé pour ce seul cas.'],
      ['8', 'Ferme le `if`. Si le test est faux, le code continue après cette accolade.'],
      ['9', 'Fin de la fonction sans `return` : pour `"expert"`, le résultat est `undefined`.'],
    ],
    '13-17': [
      ['13', 'La même fonction, avec `: string` annoncé. La promesse de renvoyer un texte rend l’oubli encore plus grave : TS2366.'],
      ['14', 'Même test sur le niveau.'],
      ['15', 'Renvoie le libellé de ce cas.'],
      ['16', 'Ferme le `if`.'],
      ['17', 'La fonction peut arriver ici sans valeur, alors qu’elle a promis un `string`.'],
    ],
  },
  10: {
    '2-4': [
      ['2', '`id` : identifiant de l’offre, sous forme de texte.'],
      ['3', '`title` : titre de l’offre, sous forme de texte.'],
      ['4', '`budget` : montant de l’offre, sous forme de nombre.'],
    ],
    '10-16': [
      ['10', 'Crée `offer` et annonce qu’il doit respecter le type `Offer`.'],
      ['11', 'Fournit `id` : un texte, comme demandé.'],
      ['12', 'Fournit `title`.'],
      ['13', 'Fournit `budget` : le nombre 75000.'],
      ['14', 'Fournit `currency` : `"XOF"` fait partie des deux valeurs permises.'],
      ['15', 'Fournit `deadline` : `new Date(...)` crée un objet `Date`.'],
      ['16', 'Ferme l’objet. `description` manque, mais elle est optionnelle.'],
    ],
    '18-24': [
      ['18', 'Crée un second objet du type `Offer`.'],
      ['19', 'Son identifiant.'],
      ['20', 'Son titre.'],
      ['21', 'Son budget.'],
      ['22', 'Sa devise.'],
      ['23', 'Son échéance.'],
      ['24', 'Remplit cette fois le champ facultatif `description`.'],
    ],
  },
  11: {
    '2-5': [
      ['2', '`id` : identifiant, un texte.'],
      ['3', '`fullName` : nom complet, un texte.'],
      ['4', '`skills` : compétences, un tableau de textes.'],
      ['5', 'Ferme l’interface.'],
    ],
    '15-20': [
      ['15', 'Crée `awa`, annotée `Freelancer` : tous les champs hérités et ajoutés sont exigés.'],
      ['16', 'Champ hérité de `Collaborator`.'],
      ['17', 'Champ hérité de `Collaborator`.'],
      ['18', 'Champ hérité : un tableau de deux textes.'],
      ['19', 'Le seul champ propre à `Freelancer`.'],
      ['20', 'Ferme l’objet.'],
    ],
  },
  14: {
    '12-15': [
      ['12', '`Number(cleaned)` convertit le texte de chiffres en vrai nombre.'],
      ['13', 'Refuse 0 : un budget doit être strictement positif.'],
      ['14', 'Renvoie le nombre validé.'],
      ['15', 'Ferme ce test.'],
    ],
    '26-28': [
      ['26', '`catch` reçoit l’erreur levée dans le `try`. En mode strict, `error` a le type `unknown`.'],
      ['27', 'Si c’est une `Error`, lit son `message` ; sinon, convertit la valeur en texte.'],
      ['28', 'Affiche l’entrée et le message d’erreur.'],
    ],
  },
  15: {
    '18-20': [
      ['18', 'Reçoit l’erreur levée par `readTitle`, de type `unknown`.'],
      ['19', 'Lit le message si c’est une `Error`, sinon convertit la valeur en texte.'],
      ['20', 'Affiche la donnée testée et le message.'],
    ],
  },
  18: { '1-11': STATUTS_TACHE },
  25: {
    '1-6': [
      ['1', 'Déclare l’union `Payment`. Chaque membre est un état du paiement.'],
      ['2', 'État `pending` : en attente, avec sa date de demande.'],
      ['3', 'État `held` : bloqué, avec sa date et la référence du prestataire.'],
      ['4', 'État `released` : libéré, avec sa date et la commission.'],
      ['5', 'État `refunded` : remboursé, avec sa date et son motif.'],
      ['6', 'État `failed`, le nouveau : échoué, avec sa date et son code d’erreur.'],
    ],
    '15-22': [
      ['15-16', 'Si le statut est `pending`, renvoie `En attente`.'],
      ['17-18', 'Si le statut est `held`, renvoie `Bloqué`.'],
      ['19-20', 'Si le statut est `released`, renvoie `Libéré`.'],
      ['21-22', 'Si le statut est `refunded`, renvoie `Remboursé`.'],
    ],
    '33-40': [
      ['33-34', 'Traite `pending`.'],
      ['35-36', 'Traite `held`.'],
      ['37-38', 'Traite `released`.'],
      ['39-40', 'Traite `refunded`. Il manque volontairement `failed` après cette ligne.'],
    ],
  },
  26: {
    '1-11': STATUTS_TACHE,
    '17-19': [
      ['17', 'Premier cas : `validated`. Ce `case` est vide, l’exécution continue au suivant.'],
      ['18', 'Deuxième cas : `closed`, regroupé avec le précédent.'],
      ['19', 'Ces deux statuts donnent `green`.'],
    ],
    '22-29': [
      ['22', '`draft` rejoint le groupe gris.'],
      ['23', '`published` rejoint le groupe gris.'],
      ['24', '`in_selection` rejoint le groupe gris.'],
      ['25', '`assigned` rejoint le groupe gris.'],
      ['26', '`in_progress` rejoint le groupe gris.'],
      ['27', '`delivered` rejoint le groupe gris.'],
      ['28', '`cancelled` rejoint le groupe gris.'],
      ['29', 'Les sept statuts ci-dessus donnent `grey`.'],
    ],
    '30-33': [
      ['30', '`default` s’exécute si aucun `case` ne correspond. Ses accolades créent un bloc propre.'],
      ['31', 'Tous les cas sont traités : `status` a le type `never`, donc l’affectation est permise.'],
      ['32', 'Satisfait le retour annoncé : `never` est accepté partout.'],
      ['33', 'Ferme le bloc du `default`.'],
    ],
    '42-55': [
      ['42', 'Même `switch`, sur le type élargi.'],
      ['43-44', '`validated` et `closed` regroupés.'],
      ['45', 'Ils donnent `green`.'],
      ['46-47', '`disputed` donne `orange`.'],
      ['48-54', 'Les sept mêmes statuts regroupés. `archived` n’est pas dans la liste.'],
      ['55', 'Ils donnent `grey`.'],
    ],
    '56-60': [
      ['56', 'Le `default` est désormais atteignable, avec `"archived"`.'],
      ['57', 'Annonce l’erreur attendue sur la ligne suivante.'],
      ['58', '`status` vaut `"archived"`, qui n’est pas `never` : voilà l’alarme recherchée.'],
      ['59', 'Renvoie la valeur.'],
      ['60', 'Ferme le bloc.'],
    ],
    '65-68': [
      ['65', 'Crée un tableau, annoté `TaskStatus[]`.'],
      ['66', 'Les cinq premiers statuts.'],
      ['67', 'Les cinq derniers statuts.'],
      ['68', 'Ferme le tableau.'],
    ],
  },
  27: {
    '14-20': [
      ['14', 'Tableau de valeurs à tester, de type `unknown[]`.'],
      ['15', '`null` : refusé, car ce n’est pas un objet utilisable.'],
      ['16', 'Un texte : refusé.'],
      ['17', 'Il manque `statusCode` : refusé.'],
      ['18', 'Les deux champs ont le bon type : accepté.'],
      ['19', 'Il manque `error` : refusé.'],
      ['20', 'Ferme le tableau.'],
    ],
  },
  30: {
    '4-11': [
      ['4', 'Ouvre un test inversé : il est vrai dès qu’un contrôle échoue. Les `||` signifient « ou ».'],
      ['5', 'Ce n’est pas un objet : invalide.'],
      ['6', 'C’est `null` : invalide.'],
      ['7', 'La clé `id` manque : invalide. Le `!` inverse le test `in`.'],
      ['8', '`id` n’est pas un texte : invalide.'],
      ['9', 'La clé `budget` manque : invalide.'],
      ['10', '`budget` n’est pas un nombre : invalide.'],
      ['11', 'Ferme la condition et ouvre le bloc d’erreur.'],
    ],
  },
  32: { '1-11': STATUTS_TACHE },
  34: {
    '7-11': [
      ['7', 'Crée le panier, un tableau de `CartLine`.'],
      ['8', '2 articles à 5000 : 10000 XOF.'],
      ['9', '3 articles à 2500 : 7500 XOF.'],
      ['10', '1 article à 4000 : 4000 XOF.'],
      ['11', 'Ferme le tableau.'],
    ],
  },
  37: {
    '3-8': [
      ['3', 'Déclare le type des options de recherche.'],
      ['4', '`query?` : le texte recherché, facultatif.'],
      ['5', '`skills?` : les compétences recherchées, facultatives.'],
      ['6', '`minBudget?` : le budget minimum, facultatif.'],
      ['7', '`page?` : le numéro de page, facultatif.'],
      ['8', 'Ferme le type.'],
    ],
    '12-17': [
      ['12', 'Crée la liste des offres.'],
      ['13', 'Offre `o1` : compétences Figma et Illustrator, 75 000 XOF.'],
      ['14', 'Offre `o2` : compétences Figma et React, 300 000 XOF.'],
      ['15', 'Offre `o3` : compétence Photoshop, 40 000 XOF.'],
      ['16', 'Offre `o4` : compétence Illustrator, 30 000 XOF.'],
      ['17', 'Ferme le tableau.'],
    ],
  },
  44: {
    '10-13': [
      ['10', 'Fonction asynchrone qui promet une `Offer`.'],
      ['11', 'Attend 10 ms, pour simuler le réseau.'],
      ['12', 'Renvoie l’offre : `id` seul équivaut à `id: id`.'],
      ['13', 'Ferme la fonction.'],
    ],
    '15-18': [
      ['15', 'Fonction asynchrone qui promet un `Collaborator`.'],
      ['16', 'Attend 10 ms.'],
      ['17', 'Renvoie le collaborateur.'],
      ['18', 'Ferme la fonction.'],
    ],
  },
  46: {
    '11-15': [
      ['11', 'Crée un tableau d’offres.'],
      ['12', 'Première offre.'],
      ['13', 'Deuxième offre.'],
      ['14', 'Troisième offre.'],
      ['15', 'Ferme le tableau.'],
    ],
  },
  48: {
    '8-11': [
      ['8', 'Crée un tableau d’offres.'],
      ['9', 'L’offre `o1`.'],
      ['10', 'L’offre `o2`, cherchée plus bas.'],
      ['11', 'Ferme le tableau.'],
    ],
  },
  49: {
    '18-24': [
      ['18', 'Crée la liste des tâches.'],
      ['19', '`t1` : statut `draft`.'],
      ['20', '`t2` : statut `published`.'],
      ['21', '`t3` : statut `published`.'],
      ['22', '`t4` : statut `closed`.'],
      ['23', '`t5` : statut `published`.'],
      ['24', 'Ferme le tableau.'],
    ],
  },
  50: {
    '11-13': [
      ['11', 'Ouvre la condition de validation.'],
      ['12', 'La valeur doit être de type objet.'],
      ['13', 'Elle ne doit pas être `null`, qui passe aussi le test précédent.'],
    ],
    '18-20': [
      ['18', 'La clé `budget` doit exister.'],
      ['19', '`budget` doit être un nombre.'],
      ['20', 'Ferme la condition et ouvre le bloc de succès.'],
    ],
  },
};

// Remplace chaque groupe concerné par son détail, sans changer l'ordre des explications.
export function detaillerLignes(id, lignes) {
  const details = LIGNES_DETAIL[id];
  if (!details) return lignes;
  return lignes.flatMap((entree) => details[entree[0]] ?? [entree]);
}
