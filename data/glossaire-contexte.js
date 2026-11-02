// Sens précis d'un mot dans un exercice donné, quand il diffère de l'explication générale.
export const CONTEXTE = {
  first: {
    2: '« Premier ». Ici, le premier score, ou 0 s’il est absent.',
    9: '« Premier » : ici, le prénom, soit tous les mots sauf le dernier.',
    47: '« Premier » : ici, la fonction qui renvoie le premier élément d’un tableau.',
  },
  last: {
    9: '« Dernier » : ici, le nom de famille, soit le dernier mot.',
    47: '« Dernier » : ici, la fonction qui renvoie le dernier élément d’un tableau.',
  },
  total: {
    7: 'La somme de toutes les notes.',
    34: 'Le montant accumulé du panier, ligne après ligne.',
    38: 'Le total en cours de calcul dans `reduce`.',
  },
  sum: {
    7: '« Somme » : le total en cours dans `reduce`.',
    38: '« Somme » : ici, la fonction qui additionne tous ses arguments.',
  },
  range: {
    6: '« Intervalle » : ici, le tuple `[1, 2]` figé par `as const`.',
    8: '« Fourchette » : ici, le paramètre qui reçoit le budget minimum et maximum.',
  },
  min: {
    8: '« Minimum » : la position 0 du tuple, le budget le plus bas.',
    36: 'Ici, le budget minimum, et aussi `Math.min`, qui renvoie le plus petit nombre.',
  },
  max: {
    8: '« Maximum » : la position 1 du tuple, le budget le plus haut.',
    36: 'Ici, le budget maximum, et aussi `Math.max`, qui renvoie le plus grand nombre.',
  },
  value: {
    5: '« Valeur » : le nombre à doubler.',
    27: '« Valeur » : la donnée inconnue contrôlée par la garde.',
    28: '« Valeur » : la donnée qui est peut-être un tableau de textes.',
    30: '« Valeur » : la donnée à contrôler. Elle lève une erreur si la forme est fausse.',
    31: '« Valeur » : le texte à tester, ou la valeur courante de la boucle.',
    36: '« Valeur » : le nombre à maintenir entre `low` et `high`.',
  },
  values: {
    27: '« Valeurs » : le tableau des données à tester.',
    31: '`Object.values` renvoie les valeurs de l’objet `STATUS`.',
  },
  error: {
    14: '« Erreur » : la valeur reçue par `catch`, de type `unknown`.',
    21: '« Erreur » : la valeur à décrire, de nature inconnue.',
    27: '« Erreur » : ici, un champ de `ApiError` qui contient le message.',
  },
  status: {
    18: '« Statut » : le paramètre de `isFinal`, et une variable modifiée plus bas.',
    24: '« Statut » : le champ discriminant, qui indique l’état du paiement.',
    26: '« Statut » : le paramètre testé par le `switch`.',
    32: '« Statut » : le paramètre inséré dans le nom de l’événement.',
    49: '« Statut » : le champ qui sert de clé de regroupement.',
  },
  Offer: {
    10: '« Offre » : ici, avec identifiant, titre, budget, devise et échéance.',
    22: '« Offre » : ici, seulement un titre et un budget.',
    37: '« Offre » : ici, avec identifiant, titre, compétences et budget.',
    43: '« Offre » : ici, avec identifiant, titre et budget.',
    44: '« Offre » : ici, seulement un identifiant et un titre.',
    46: '« Offre » : ici, seulement un identifiant et un titre.',
    48: '« Offre » : ici, avec identifiant, titre et budget.',
    50: '« Offre » : ici, le type obtenu après validation de la réponse du serveur.',
  },
  Task: {
    12: '« Tâche » : ici, avec un identifiant, un nom, une date de création et une description.',
    33: '« Tâche » : ici, seulement un identifiant et un nom.',
    49: '« Tâche » : ici, avec un identifiant, un nom et un statut.',
  },
  page: {
    37: 'Option de recherche : le numéro de page voulu. Vaut 1 par défaut.',
    46: 'Numéro de la page demandée, recopié dans le résultat.',
  },
  key: {
    10: '« Clé » : chaque nom de champ testé par `filter`.',
    49: '« Clé » : le nom de la boîte où ranger l’élément.',
  },
  start: {
    37: '« Début » : l’indice du premier élément de la page, calculé depuis `page`.',
    46: '« Début » : l’indice du premier élément de la page.',
  },
  T: {
    6: 'Variable de type interne à `Equal`. Elle sert à comparer `A` et `B`, voir « Pour aller plus loin ».',
    29: 'Le type des éléments restants : ici, `string`.',
    45: 'Le type du résultat de la promesse, conservé par `withTimeout`.',
    46: 'Le type des éléments de la page : `number`, puis `Offer`.',
    47: 'Le type des éléments du tableau : `number` ou `string` selon l’appel.',
    48: 'Le type complet des éléments, qui doit au moins avoir un `id`.',
    49: 'Le type des éléments à regrouper : ici, `Task`.',
    50: 'Le type produit par `parse` : ici, `Offer`.',
  },
  item: {
    22: '« Élément » : soit une offre, soit une candidature.',
    28: '« Élément » : une case du tableau, contrôlée par `every`.',
    34: '« Élément » : une ligne du panier.',
    48: '« Élément » : une entrée du tableau, comparée à l’identifiant cherché.',
    49: '« Élément » : la valeur à ranger dans un groupe.',
  },
  name: {
    12: '« Nom » : le nom de la tâche.',
    49: '« Nom » : le nom de la tâche, affiché dans son groupe.',
  },
  task: {
    12: '« Tâche » : l’objet créé, puis le paramètre de `describeTask`.',
    33: '« Tâche » : la tâche de départ, qui n’est jamais modifiée.',
    49: '« Tâche » : le paramètre reçu par la fonction qui donne la clé.',
  },
  n: {
    38: 'Nom court : le nombre courant dans `reduce`.',
    42: 'Nom court : le nombre courant dans `forEach`.',
  },
  x: {
    41: 'Nom court : le nombre qui entre dans la fonction.',
  },
  checks: {
    39: '« Vérifications » : tuple qui ne compile que si les deux types sont justes.',
    44: '« Vérifications » : tuple qui ne compile que si les deux résultats ont le bon type.',
  },
  pending: {
    43: '« En attente » : la promesse obtenue sans `await`.',
  },
};
