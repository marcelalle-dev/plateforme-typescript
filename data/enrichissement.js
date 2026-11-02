// Pour chaque exercice : un essai à faire, les liens avec les autres notions,
// et une explication approfondie pour les notions les plus difficiles.
export const ENRICHISSEMENT = {
  1: { essai: 'Remplacez `80_000` par `"80000"` à la ligne 9, puis relancez : observez l’erreur TS2345.', apres: [[34, 'les paramètres typés reviennent avec des objets'], [2, 'le mode strict devient plus exigeant']] },
  2: { essai: 'Retirez `?? 0` à la ligne 8, puis relancez : observez pourquoi le type ne convient plus.', avant: [[1, 'les annotations de type']], apres: [[17, 'le même problème avec les dictionnaires'], [23, '`??` comparé à `||`']] },
  3: { essai: 'Retirez `return "Expert";` à la ligne 24 : l’erreur apparaît sur la ligne de la fonction.', avant: [[1, 'le type de retour d’une fonction']], apres: [[25, 'vérifier que tous les cas sont traités']] },
  4: { essai: 'Retirez le test `if` des lignes 7 à 9 : TypeScript signale que `deadline` peut être `null`.', avant: [[2, 'le test qui rétrécit un type']], apres: [[19, 'rétrécir une union plus large']] },
  5: { essai: 'Écrivez `value: any` à la ligne 6, puis `double("abc")` : tout compile, et le résultat est `NaN`.', avant: [[1, 'les annotations']], apres: [[14, '`unknown`, l’alternative sûre à `any`']] },
  6: {
    essai: 'Remplacez `const title` par `let title` à la ligne 5 : le type devient `string` et une vérification échoue.',
    avant: [[1, 'les annotations écrites à la main']],
    apres: [[31, '`as const` pour créer une union'], [29, '`Equal` et `Expect` reviennent']],
    approfondir: {
      titre: 'Comment fonctionnent `Equal` et `Expect` ?',
      textes: [
        'Imaginez deux serrures à comparer. On ne peut pas les ouvrir pour regarder dedans, mais on peut les essayer avec **toutes les clés possibles**. Si elles réagissent de la même façon à chaque clé, ce sont les mêmes serrures.',
        '`<T>() => T extends A ? 1 : 2` est une serrure liée au type `A` : pour une clé `T`, elle donne `1` si `T` rentre dans `A`, sinon `2`. `Equal<A, B>` compare la serrure de `A` à celle de `B`. TypeScript ne les juge compatibles que si `A` et `B` sont vraiment identiques, d’où `true` ou `false`.',
        '`Expect<T extends true>` n’accepte que `true`. Si la comparaison donne `false`, la compilation échoue. L’ensemble forme un **test sur les types**, qui n’existe plus à l’exécution. Vous n’avez pas besoin de savoir réécrire `Equal` : il suffit de comprendre qu’il vérifie l’égalité exacte de deux types.',
      ],
    },
  },
  7: { essai: 'Retirez le test des lignes 2 à 4 : `average([])` affiche alors `NaN`, car le code divise 0 par 0. TypeScript ne le signale pas.', avant: [[1, 'paramètres et retour typés']], apres: [[34, '`reduce` sur des objets'], [46, 'des tableaux de n’importe quel type']] },
  8: { essai: 'Remplacez `[50_000, 100_000]` par `[50_000]` à la ligne 8 : TypeScript signale la longueur.', avant: [[7, 'les tableaux ordinaires']], apres: [[9, 'renvoyer un tuple'], [44, 'le tuple obtenu avec `Promise.all`']] },
  9: { essai: 'Retirez `?? ""` à la ligne 6 : `last` peut être `undefined`, et le tuple est refusé.', avant: [[8, 'les tuples'], [2, 'l’accès par indice']], apres: [[44, 'déstructurer plusieurs résultats']] },
  10: { essai: 'Ajoutez un champ `color: "bleu"` dans `offer` : TypeScript le refuse comme propriété inconnue.', avant: [[1, 'les types de base']], apres: [[11, 'la même idée avec `interface`'], [12, '`readonly` et les champs facultatifs']] },
  11: { essai: 'Retirez `dailyRate` de l’objet `awa` : l’erreur indique le champ manquant.', avant: [[10, 'décrire un objet']], apres: [[13, 'choisir entre `type` et `interface`'], [33, 'combiner des types avec `&`']] },
  12: { essai: 'Retirez le mot `readonly` à la ligne 4 : le commentaire `@ts-expect-error` devient inutile et TS2578 apparaît.', avant: [[10, 'les propriétés facultatives']], apres: [[33, 'créer un nouvel objet avec le spread']] },
  13: { essai: 'Écrivez `interface Currency = "XOF" | "EUR";` : l’erreur montre qu’une interface ne peut pas nommer une union.', avant: [[11, '`interface`'], [10, '`type`']], apres: [[18, 'les unions de littéraux'], [33, 'les intersections']] },
  14: {
    essai: 'Retirez `typeof input === "number"` à la ligne 2 : TypeScript refuse les opérations sur `unknown`.',
    avant: [[5, 'les dangers de `any`']],
    apres: [[15, 'lire une propriété sur `unknown`'], [50, 'valider une réponse d’API']],
    approfondir: {
      titre: 'Pourquoi `unknown` plutôt que `any` ?',
      textes: [
        'Pensez à un colis reçu sans étiquette. Avec `any`, vous l’ouvrez et l’utilisez sans regarder : si c’est du verre, vous ne le découvrirez qu’en le cassant. Avec `unknown`, on vous interdit d’y toucher tant que vous ne l’avez pas contrôlé.',
        'Les deux acceptent n’importe quelle valeur. La différence est dans ce qui vient **après** : `any` autorise tout sans vérifier, tandis que `unknown` n’autorise rien avant un test comme `typeof`.',
      ],
    },
  },
  15: { essai: 'Retirez `payload !== null` à la ligne 4 : TypeScript signale que `payload` peut être `null`.', avant: [[14, '`unknown`']], apres: [[22, 'l’opérateur `in`'], [27, 'réunir ces contrôles dans une garde']] },
  16: {
    essai: 'Remplacez `never` par `void` à la ligne 1 : le retour de `requireBudget` n’est plus accepté.',
    avant: [[4, 'les valeurs absentes']],
    apres: [[25, '`never` pour vérifier tous les cas'], [45, 'une promesse de type `never`']],
    approfondir: {
      titre: 'À quoi sert un type sans aucune valeur ?',
      textes: [
        'Voyez les types comme des ensembles de valeurs : `boolean` contient deux valeurs, `string` en contient une infinité. `never` est l’**ensemble vide**. Ajouter l’ensemble vide à un autre ne change rien : `number | never` reste `number`.',
        'Il sert à exprimer l’impossible : une fonction qui ne rend jamais la main, ou un cas qui ne peut pas arriver. C’est différent de `void`, où la fonction se termine bien, sans valeur utile. C’est la différence entre « je reviens les mains vides » et « je ne reviens jamais ».',
      ],
    },
  },
  17: { essai: 'Écrivez `labels["draft"].toUpperCase();` sans le commentaire de la ligne 10 : l’erreur apparaît.', avant: [[2, 'le même risque sur les tableaux']], apres: [[49, '`Partial<Record<...>>`']] },
  18: { essai: 'Écrivez `isFinal("clossed")` avec la faute de frappe : TypeScript la détecte.', avant: [[3, 'une première union de littéraux']], apres: [[19, 'rétrécir une union'], [32, 'construire des unions de textes']] },
  19: { essai: 'Retirez le test sur `null` des lignes 2 à 4 : la suite n’est plus acceptée.', avant: [[18, 'les unions'], [4, 'le test `=== null`']], apres: [[20, 'les méthodes permises sur une union'], [21, 'rétrécir avec `instanceof`']] },
  20: { essai: 'Appelez `id.toUpperCase()` avant le `if`, à la ligne 2 : la méthode est refusée, car elle n’existe pas sur `number`.', avant: [[19, '`typeof`']], apres: [[21, '`instanceof`']] },
  21: { essai: 'Retirez le `if` des lignes 2 à 4, puis écrivez `error.message` : TS18046 apparaît.', avant: [[20, 'rétrécir avec `typeof`']], apres: [[22, 'rétrécir avec `in`']] },
  22: { essai: 'Lisez `item.budget` hors du `if` : TypeScript rappelle qu’une `Application` n’a pas ce champ.', avant: [[15, 'l’opérateur `in`']], apres: [[24, 'distinguer des états avec un champ commun']] },
  23: { essai: 'Remplacez `0` par `5` à la ligne 9 : `||` et `??` donnent alors le même résultat pour cette valeur. Le piège ne concerne que le zéro.', avant: [[2, 'l’opérateur `??`']], apres: [[50, 'traiter proprement les valeurs absentes']] },
  24: {
    essai: 'Lisez `payment.fee` dans le `case "held"` : TS2339 montre que ce champ appartient à un autre état.',
    avant: [[22, 'rétrécir une union d’objets'], [18, 'les unions de littéraux']],
    apres: [[25, 'vérifier que tous les états sont traités']],
    approfondir: {
      titre: 'Pourquoi une union plutôt que des champs facultatifs ?',
      textes: [
        'Un seul type avec `fee?`, `reason?` et `providerRef?` autoriserait des états absurdes, comme un paiement en attente avec une commission. C’est comme un formulaire où toutes les cases seraient facultatives : rien n’empêche de le remplir de travers.',
        'L’union discriminée donne un **formulaire différent par état**. Le champ `status` dit lequel s’applique, et TypeScript n’ouvre que les bonnes cases.',
      ],
    },
  },
  25: {
    essai: 'Retirez les lignes 23 et 24 : `assertNever` signale le cas oublié par TS2345.',
    avant: [[24, 'les unions discriminées'], [16, 'le type `never`']],
    apres: [[26, 'la même vérification sans fonction']],
    approfondir: {
      titre: 'Comment `assertNever` détecte-t-elle un oubli ?',
      textes: [
        'Imaginez un trieur de courrier : chaque `case` retire une catégorie du tas. Si toutes les catégories ont été traitées, le tas est vide, et son type est `never`.',
        '`assertNever` n’accepte qu’un tas vide. S’il reste une catégorie, l’appel ne compile plus, et le message la nomme. Ajouter un état à l’union fait donc sonner l’alarme à chaque `switch` à compléter.',
      ],
    },
  },
  26: { essai: 'Ajoutez `"archived"` au type `TaskStatus` de la ligne 1 : la ligne 31 signale le cas à traiter.', avant: [[25, '`assertNever`']], apres: [[32, 'réutiliser la même union']] },
  27: {
    essai: 'Remplacez `value is ApiError` par `boolean` à la ligne 3 : `response.statusCode` n’est plus accepté.',
    avant: [[15, 'les contrôles d’une valeur `unknown`']],
    apres: [[28, 'une garde pour un tableau'], [30, 'une assertion']],
    approfondir: {
      titre: 'Une garde, c’est une promesse',
      textes: [
        'Une garde est un contrôleur à l’entrée : elle examine la valeur et annonce le résultat au compilateur. Une fonction qui renvoie seulement `boolean` répond « oui » à voix basse : le compilateur n’entend rien. Le prédicat `value is ApiError` le dit à voix haute.',
        'Attention, le compilateur **croit** le contrôleur sans vérifier. Si votre test est incomplet, il annoncera une `ApiError` qui n’en est pas une, et le plantage arrivera plus tard.',
      ],
    },
  },
  28: { essai: 'Remplacez `value.every(...)` par `true` à la ligne 2 : `["Figma", 42]` passe alors la garde par erreur.', avant: [[27, 'les gardes']], apres: [[29, 'une garde générique']] },
  29: {
    essai: 'Remplacez `value is T` par `boolean` à la ligne 5 : la vérification de la ligne 14 échoue, car le tableau peut encore contenir `undefined`.',
    avant: [[28, 'les gardes'], [6, '`Equal` et `Expect`']],
    apres: [[46, 'les génériques en détail']],
    approfondir: {
      titre: 'Rappel sur `Equal` et `Expect`',
      textes: [
        'Ces deux types forment un test à la compilation, expliqué à l’exercice 6 : `Expect<Equal<typeof definedIds, string[]>>` ne compile que si `definedIds` a exactement le type `string[]`.',
        'Ici, ils prouvent que la garde a bien retiré `undefined` du type, ce qu’aucun `console.log` ne pourrait montrer.',
      ],
    },
  },
  30: {
    essai: 'Retirez l’appel `assertIsOffer(payload);` à la ligne 17 : `payload.id` n’est plus accepté.',
    avant: [[27, 'les gardes']],
    apres: [[50, 'valider une réponse externe']],
    approfondir: {
      titre: 'Garde ou assertion : laquelle choisir ?',
      textes: [
        'Une garde est une **question** : « est-ce une offre ? ». Vous décidez ensuite quoi faire dans un `if`. Une assertion est un **portique** : si la valeur est mauvaise, tout s’arrête par une erreur.',
        'Choisissez la garde quand un cas invalide est normal et doit être géré, et l’assertion quand il s’agit d’une anomalie qui rend la suite impossible.',
      ],
    },
  },
  31: {
    essai: 'Retirez `as const` à la ligne 1 : `Status` devient `string`, et la ligne 17 ne produit plus d’erreur.',
    avant: [[6, '`as const`'], [27, 'les gardes']],
    apres: [[32, 'construire des types de textes']],
    approfondir: {
      titre: 'Lire `(typeof STATUS)[keyof typeof STATUS]`',
      textes: [
        'Lisez de l’intérieur vers l’extérieur. `typeof STATUS` donne le type de l’objet. `keyof` en extrait les clés : `"DRAFT" | "PUBLISHED" | "CLOSED"`.',
        'Les crochets posent ensuite une question, comme avec une valeur : « que trouve-t-on à ces clés ? ». Le résultat est l’union des valeurs : `"draft" | "published" | "closed"`.',
      ],
    },
  },
  32: { essai: 'Ajoutez `"archived"` à `TaskStatus`, puis écrivez `"task:archived"` dans `events` : il devient valide.', avant: [[18, 'les unions de statuts'], [31, 'les types dérivés']], apres: [[33, 'combiner des types']] },
  33: { essai: 'Remplacez `&` par `|` à la ligne 3 : observez ce que TypeScript n’accepte plus à la ligne 13.', avant: [[11, '`extends`'], [12, 'le spread']], apres: [[37, 'les paramètres objets']] },
  34: { essai: 'Retirez le `, 0` de `reduce` à la ligne 4 : TypeScript refuse le code, car `total` ne serait plus un nombre mais une ligne du panier.', avant: [[1, 'les fonctions typées'], [7, '`reduce`']], apres: [[35, 'les paramètres par défaut']] },
  35: { essai: 'Appelez `formatAmount(1_000, "USD")` sans commentaire : observez TS2345.', avant: [[34, 'les paramètres typés'], [18, 'les unions']], apres: [[37, 'plusieurs options dans un objet']] },
  36: { essai: 'Ajoutez des accolades autour de `0 < min && min <= max` à la ligne 1, sans `return` : TypeScript signale le problème.', avant: [[34, 'les fonctions classiques']], apres: [[41, 'des fonctions qui renvoient des fonctions']] },
  37: { essai: 'Appelez `searchOffers({ budget: 50 })` : TypeScript signale cette option inconnue.', avant: [[35, 'les valeurs par défaut'], [10, 'les types d’objets']], apres: [[46, 'la pagination générique']] },
  38: { essai: 'Écrivez `sum(amounts)` sans les `...` : TypeScript refuse le tableau.', avant: [[37, 'les paramètres'], [12, 'le spread sur un objet']], apres: [[40, 'typer une fonction en paramètre']] },
  39: {
    essai: 'Retirez les lignes 6 et 7 : le type de retour redevient `string | Date`, et la ligne 32 est refusée.',
    avant: [[19, 'rétrécir une union'], [6, '`Equal` et `Expect`']],
    apres: [[46, 'les génériques, souvent plus simples']],
    approfondir: {
      titre: 'Pourquoi des surcharges ?',
      textes: [
        'Pensez à un guichet de change : si vous donnez des euros, vous recevez des francs CFA ; si vous donnez des francs CFA, vous recevez des euros. Avec un simple retour `string | Date`, il faudrait vérifier ce qu’on a reçu à chaque fois.',
        'Les surcharges affichent le tarif du guichet : chaque entrée est liée à sa sortie. L’implémentation est le travail derrière le guichet, invisible des clients.',
        'Utilisez-les avec modération : si le type de sortie suit simplement celui de l’entrée, un générique suffit.',
      ],
    },
  },
  40: { essai: 'Écrivez `onDecision(candidateId, "peut-être");` à la ligne 6 : TypeScript refuse cette décision.', avant: [[36, 'les fonctions fléchées'], [18, 'les unions']], apres: [[41, 'les fonctions d’ordre supérieur'], [42, 'ce que signifie `void`']] },
  41: {
    essai: 'Inversez `tenPercent` et `fivePercent` à la ligne 13, puis ajoutez `console.log(compose((x) => x + 1, (x) => x * 2)(3));` : l’ordre compte.',
    avant: [[40, 'les fonctions en paramètre']],
    apres: [[45, 'une fonction générique sur des promesses']],
    approfondir: {
      titre: 'Une fermeture, c’est quoi ?',
      textes: [
        'Pensez à un tampon encreur réglé sur « -10 % ». `makeDiscount(0.1)` fabrique ce tampon, puis se termine. Pourtant, le tampon se souvient de son réglage à chaque utilisation.',
        'C’est une **fermeture** : la fonction renvoyée garde accès aux variables de la fonction qui l’a créée. Le pas à pas le montre bien : `rate` reste visible après la fin de `makeDiscount`.',
      ],
    },
  },
  42: { essai: 'Annotez `const returnsSeven = (): void => 7;` à la ligne 3 : cette fois, c’est refusé.', avant: [[40, 'le retour `void` des callbacks']], apres: [[43, 'les fonctions asynchrones']] },
  43: {
    essai: 'Retirez `await` à la ligne 19 : `offer.title` est refusé, car `offer` est une promesse.',
    avant: [[42, 'les fonctions et leurs retours']],
    apres: [[44, 'plusieurs promesses à la fois'], [45, 'limiter le temps d’attente']],
    approfondir: {
      titre: 'Comprendre une promesse',
      textes: [
        'Dans un restaurant, on vous donne un **bipeur** à la commande. Ce n’est pas le repas, mais la garantie d’en avoir un, ou d’être prévenu s’il y a un problème. `Promise<Offer>` est ce bipeur, et `await` signifie « j’attends qu’il sonne ».',
        'Pendant ce temps, le programme peut faire autre chose : `await` met en pause cette fonction seulement. Si la commande échoue, la promesse est rejetée, et le `catch` reçoit l’erreur.',
      ],
    },
  },
  44: { essai: 'Échangez les deux fonctions dans `Promise.all` à la ligne 20 : les types `Expect` signalent l’inversion.', avant: [[43, 'les promesses'], [8, 'les tuples']], apres: [[45, '`Promise.race`']] },
  45: {
    essai: 'Remplacez `20` par `500` à la ligne 15 : la seconde promesse a maintenant le temps de finir.',
    avant: [[44, 'plusieurs promesses'], [16, 'le type `never`']],
    apres: [[50, 'un client d’API complet']],
    approfondir: {
      titre: 'Une course entre deux promesses',
      textes: [
        'Imaginez une course entre votre livreur et un chronomètre. `Promise.race` prend le premier arrivé. Si le livreur gagne, vous avez le colis ; si le chronomètre gagne, vous avez une erreur « délai dépassé ».',
        'Le chronomètre ne livre jamais de colis : il ne peut qu’échouer. Son type `Promise<never>` n’ajoute donc rien au résultat, qui reste `T`. Le perdant continue sa course, mais son résultat est ignoré.',
      ],
    },
  },
  46: {
    essai: 'Lisez `offerPage.items[0]?.budget` à la ligne 19 : TypeScript sait qu’une `Offer` de cet exercice n’a pas de budget.',
    avant: [[29, 'une première garde générique'], [37, 'la pagination']],
    apres: [[47, 'de petites fonctions génériques'], [48, 'contraindre un générique']],
    approfondir: {
      titre: 'Un générique, c’est un paramètre pour les types',
      textes: [
        'Une fonction a des paramètres pour ses valeurs. Un générique est la même idée **pour les types**. `Page<T>` est un moule à gâteau : la forme reste la même, et `T` indique ce qu’on met dedans.',
        'Contrairement à `any`, l’information n’est pas perdue : avec `Page<Offer>`, TypeScript sait que chaque élément est une offre. Le plus souvent, vous n’écrivez même pas `T` : il est déduit de l’argument.',
      ],
    },
  },
  47: { essai: 'Écrivez `const x: string = first([1, 2]);` : TypeScript signale le nombre et le `undefined` possible.', avant: [[46, 'les génériques'], [2, 'l’accès par indice']], apres: [[48, 'les contraintes']] },
  48: {
    essai: 'Retirez `extends { id: string }` à la ligne 1 : `item.id` n’est plus accepté.',
    avant: [[47, 'les génériques simples']],
    apres: [[49, 'plusieurs paramètres de type']],
    approfondir: {
      titre: 'Contraindre sans perdre d’information',
      textes: [
        'C’est comme un parking réservé aux véhicules « avec une plaque » : motos et camions entrent, chacun reste ce qu’il est. `T extends { id: string }` accepte tout ce qui a un `id`, tout en gardant le type complet.',
        'Avec un simple paramètre `{ id: string }`, le résultat aurait perdu `title` : le camion serait ressorti sous le nom « véhicule ». C’est la différence qu’apporte le générique.',
      ],
    },
  },
  49: {
    essai: 'Remplacez `Partial<Record<K, T[]>>` par `Record<K, T[]>` à la ligne 2 : l’objet vide `{}` est refusé.',
    avant: [[48, 'les génériques'], [17, '`Record`']],
    apres: [[50, 'le dernier exercice réunit tout']],
    approfondir: {
      titre: 'Lire `Partial<Record<K, T[]>>`',
      textes: [
        'Lisez de l’intérieur vers l’extérieur. `T[]` : une liste d’éléments. `Record<K, T[]>` : une armoire avec un tiroir par clé possible, chacun contenant une liste. `Partial<...>` : certains tiroirs peuvent ne pas exister.',
        'C’est plus honnête que `Record` seul : aucune tâche `closed` n’implique aucun tiroir `closed`. TypeScript vous oblige donc à vérifier qu’un tiroir existe avant de l’utiliser.',
      ],
    },
  },
  50: {
    essai: 'Remplacez `goodFetcher` par `badFetcher` à la ligne 30 : l’erreur de validation arrête le programme.',
    avant: [[14, '`unknown`'], [27, 'les contrôles de forme'], [46, 'les génériques'], [43, 'les promesses']],
    apres: [],
    approfondir: {
      titre: 'Pourquoi passer `fetcher` et `parse` en paramètres ?',
      textes: [
        'C’est comme tester une voiture sur un banc d’essai : on remplace la vraie route par une simulation. Un faux `Fetcher` permet de tester `apiGet` sans réseau, et même de simuler une réponse invalide.',
        '`parse` est la douane : ce qui vient de l’extérieur est `unknown`, et seul ce qui passe le contrôle reçoit un vrai type. `raw as Offer` reviendrait à tamponner le passeport sans ouvrir la valise.',
      ],
    },
  },
  51: {
    essai: 'Retirez `budget: 75_000` à la ligne 33 : le dépôt a été créé pour des `Offer`, et l’erreur TS2345 apparaît.',
    avant: [[47, 'les fonctions génériques'], [48, 'la contrainte `extends`']],
    apres: [[56, 'une autre classe générique'], [68, '`implements` en détail']],
  },
  52: {
    essai: 'Écrivez `label.foo` à la ligne 15 : `T` a été déduit comme `string`, et l’erreur TS2339 apparaît.',
    avant: [[47, 'un seul paramètre de type']],
    apres: [[55, 'trois paramètres de type dans `mapResult`']],
  },
  53: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 24 : l’erreur TS2345 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[48, 'les contraintes sur un générique']],
    apres: [[63, '`keyof typeof` sur un objet'], [64, '`keyof` dans un type mappé']],
    approfondir: {
      titre: 'Que signifie `K extends keyof T` ?',
      textes: [
        'Imaginez un tableau et le nom de ses colonnes. `keyof T` est la liste de ces noms, sous forme d’union. `K extends keyof T` signifie : « `K` doit être l’une de ces colonnes ».',
        '`T[K]` est alors le type de la colonne choisie. C’est ce lien qui donne un résultat précis : la colonne `budget` donne des `number`, et la colonne `title` donne des `string`.',
      ],
    },
  },
  54: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 9 : l’erreur TS18046 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[46, 'un type générique']],
    apres: [[55, 'une valeur par défaut pour le type de l’erreur']],
  },
  55: {
    essai: 'Écrivez `doubled.value` à la ligne 28 : dans ce cas, le résultat est un échec, et l’erreur TS2339 apparaît.',
    avant: [[24, 'l’union discriminée'], [54, 'le paramètre de type par défaut']],
    apres: [[83, 'renvoyer un résultat plutôt que lever une erreur'], [84, 'convertir une exception en résultat']],
    approfondir: {
      titre: 'Pourquoi renvoyer un `Result` ?',
      textes: [
        'Pensez à un colis livré avec un bordereau : soit « livré », avec le contenu, soit « échec », avec la raison. Celui qui le reçoit doit lire le bordereau avant d’ouvrir le colis.',
        'Dans le code, c’est `ok` qui joue ce rôle. Le compilateur refuse de lire `value` avant le test. `mapResult` applique sa fonction au contenu, et laisse passer un échec sans y toucher.',
      ],
    },
  },
  56: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 24 : l’erreur TS2345 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[51, 'une classe générique et ses méthodes']],
    apres: [[66, 'les classes en détail']],
  },
  57: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 29 : l’erreur TS2353 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[11, 'les champs facultatifs']],
    apres: [[58, '`Omit`, l’inverse de `Pick`'], [64, 'comment ces types sont construits']],
  },
  58: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 30 : l’erreur TS2353 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[57, '`Pick`']],
    apres: [[59, '`Required` et `Readonly`']],
  },
  59: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 15 : l’erreur TS2540 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[12, '`readonly` sur un champ'], [57, '`Partial`']],
    apres: [[64, 'écrire soi-même un tel type']],
  },
  60: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 27 : l’erreur TS2741 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[17, 'les dictionnaires'], [18, 'l’union des statuts']],
    apres: [[63, 'les clés d’un objet constant'], [96, 'le plan des transitions']],
  },
  61: {
    essai: 'Écrivez `[80_000]` à la ligne 14 : `Parameters` exige les deux arguments, et l’erreur TS2322 apparaît.',
    avant: [[32, '`typeof` dans un type']],
    apres: [[65, 'comment ces types utilisent `infer`']],
  },
  62: {
    essai: 'Gardez seulement `"closed"` à la ligne 17 : `FinalStatus` change, et la vérification de la ligne 28 donne l’erreur TS2344.',
    avant: [[18, 'l’union des statuts'], [29, '`Equal` et `Expect`']],
    apres: [[65, 'les types conditionnels qu’ils utilisent']],
  },
  63: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 11 : l’erreur TS2345 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[31, '`as const`'], [60, '`Record`']],
    apres: [[64, '`keyof` dans un type mappé']],
  },
  64: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 17 : l’erreur TS2540 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[53, '`keyof`'], [59, '`Readonly`']],
    apres: [[65, 'les types conditionnels']],
    approfondir: {
      titre: 'Qu’est-ce qu’un type mappé ?',
      textes: [
        'C’est un tampon appliqué à chaque ligne d’un formulaire. `[K in keyof T]` parcourt les champs un par un, et décrit ce que devient chacun d’eux.',
        '`-readonly` retire la protection du champ, et `| null` accepte une case vide. `Partial` et `Readonly` sont écrits de cette façon dans TypeScript.',
      ],
    },
  },
  65: {
    essai: 'Écrivez `? U : never` à la ligne 6 : la vérification de la ligne 11 donne l’erreur TS2344.',
    avant: [[29, '`Equal` et `Expect`'], [61, '`ReturnType`']],
    apres: [[78, 'les types d’entrée et de sortie']],
    approfondir: {
      titre: 'Comment lire `T extends Promise<infer U> ? U : T` ?',
      textes: [
        'C’est un `if` sur les types : « si `T` a la forme d’une promesse, alors donne son contenu, sinon donne `T` ». Il est calculé à la compilation.',
        '`infer U` est comme un trou dans un moule : le compilateur compare `T` au moule, et nomme `U` ce qui remplit le trou. Ce nom n’existe que dans la branche « alors ».',
      ],
    },
  },
  66: {
    essai: 'Écrivez `account.#held = 0;` à la ligne 28 : un champ `#` est refusé hors de sa classe, avec l’erreur TS18013.',
    avant: [[56, 'une première classe']],
    apres: [[67, '`private` et `protected`'], [70, 'un objet-valeur']],
    approfondir: {
      titre: 'Quelle différence entre `#held` et `private` ?',
      textes: [
        '`private` est un panneau « entrée interdite » : le compilateur le fait respecter, mais à l’exécution, la porte reste ouverte.',
        '`#held` est une vraie serrure : même en JavaScript, sans le compilateur, le code extérieur ne peut pas y accéder.',
      ],
    },
  },
  67: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 23 : l’erreur TS2341 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[66, 'une première classe complète']],
    apres: [[69, 'une classe abstraite et ses filles']],
  },
  68: {
    essai: 'Écrivez `{}` à la place de `new FakeGateway()`, à la ligne 28 : cet objet n’a pas de méthode `charge`, et l’erreur TS2345 apparaît.',
    avant: [[51, 'une interface et sa classe']],
    apres: [[69, 'une classe abstraite']],
    approfondir: {
      titre: 'Pourquoi dépendre d’une interface ?',
      textes: [
        'Une prise électrique ne connaît pas l’appareil qu’on y branche : elle connaît seulement la forme de la fiche. `PaymentGateway` est cette forme.',
        '`CheckoutService` fonctionne donc avec une fausse passerelle pendant les tests, puis avec un vrai service de paiement, sans changer une ligne.',
      ],
    },
  },
  69: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 31 : l’erreur TS2511 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[67, 'l’héritage'], [68, 'les interfaces']],
    apres: [[81, 'hériter de `Error`']],
  },
  70: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 51 : l’erreur TS2673 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[66, 'les classes']],
    apres: [[99, 'calculer de l’argent sans perte']],
  },
  71: {
    essai: 'Écrivez `describePayout(80_000)` à la ligne 28 : il manque le taux, et l’erreur TS2554 apparaît.',
    apres: [[72, 'ranger les types par fonctionnalité'], [95, 'l’erreur d’un import incorrect']],
  },
  72: {
    essai: 'Écrivez `offer.titre` à la ligne 17 : le type vient de `Offer`, et l’erreur TS2551 propose un nom proche.',
    avant: [[71, 'les modules']],
    apres: [[96, 'un projet organisé par domaine']],
  },
  73: {
    avant: [[14, '`unknown` et la validation']],
    apres: [[74, 'des règles personnalisées']],
    approfondir: {
      titre: 'Pourquoi déduire le type depuis un schéma ?',
      textes: [
        'Un type n’existe qu’à la compilation : il ne peut pas contrôler une donnée reçue à l’exécution. Un schéma, lui, reste dans le programme et vérifie vraiment.',
        '`z.infer` évite d’écrire deux fois la même chose : on décrit la forme une seule fois, et on obtient à la fois le contrôle et le type.',
      ],
    },
  },
  74: {
    avant: [[73, 'les schémas zod']],
    apres: [[75, 'les données d’un formulaire']],
  },
  75: {
    avant: [[74, 'valider un formulaire']],
    apres: [[78, '`transform`']],
  },
  76: {
    avant: [[24, 'l’union discriminée'], [73, 'les schémas zod']],
    apres: [[79, 'valider une réponse d’API']],
  },
  77: {
    avant: [[73, 'les schémas zod']],
    apres: [[100, 'une validation complète']],
  },
  78: {
    avant: [[75, 'la conversion avant validation'], [65, 'les types calculés']],
    apres: [[79, 'valider une liste']],
  },
  79: {
    avant: [[73, 'les schémas zod'], [43, 'les fonctions `async`']],
    apres: [[100, 'le projet complet']],
  },
  80: {
    essai: 'Écrivez `true` à la place du test, à la ligne 2 : `error` reste `unknown`, et l’erreur TS18046 apparaît.',
    avant: [[14, '`unknown`'], [21, '`instanceof`']],
    apres: [[81, 'des erreurs métier'], [84, 'transformer une erreur en résultat']],
  },
  81: {
    essai: 'Retirez `super(message);` à la ligne 6 : une classe fille doit appeler le constructeur parent, et l’erreur TS2377 apparaît.',
    avant: [[69, 'l’héritage'], [80, 'lire une erreur inconnue']],
    apres: [[82, 'conserver la cause'], [97, 'une erreur métier dans TaskD']],
  },
  82: {
    essai: 'Écrivez `true` à la place du test, à la ligne 16 : `error` reste `unknown`, et l’erreur TS18046 apparaît.',
    avant: [[81, 'les erreurs métier']],
    apres: [[85, 'traduire les erreurs']],
  },
  83: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 16 : l’erreur TS2339 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[24, 'l’union discriminée'], [55, 'le type `Result`']],
    apres: [[84, 'convertir une exception en résultat']],
  },
  84: {
    essai: 'Écrivez `result.value` à la ligne 29 : le résultat est un échec dans ce cas, et l’erreur TS2339 apparaît.',
    avant: [[55, 'le type `Result`'], [83, 'renvoyer un résultat']],
    apres: [[85, 'traduire les erreurs en HTTP']],
  },
  85: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 23 : l’erreur TS2741 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[60, '`Record`'], [81, 'les erreurs métier']],
    apres: [[89, 'un contrôleur HTTP']],
  },
  86: {
    avant: [[11, 'les types d’objet']],
    apres: [[87, 'l’état d’un composant']],
  },
  87: {
    avant: [[86, 'les propriétés d’un composant'], [27, 'les fonctions de garde']],
    apres: [[88, 'un hook personnalisé']],
  },
  88: {
    avant: [[87, '`useState`']],
    apres: [[90, '`satisfies`']],
  },
  89: {
    avant: [[85, 'les statuts HTTP'], [79, 'valider une donnée externe']],
    apres: [[100, 'le projet complet']],
  },
  90: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 28 : l’erreur TS2322 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[31, '`as const`'], [60, '`Record`']],
    apres: [[96, 'le domaine de TaskD']],
    approfondir: {
      titre: 'Quelle différence entre `: Type` et `satisfies Type` ?',
      textes: [
        'Une annotation, c’est ranger un objet dans une boîte étiquetée : il est contrôlé, mais on ne voit plus que l’étiquette. Les détails précis sont perdus.',
        '`satisfies` est un contrôle au guichet : l’objet est vérifié, puis il repart tel quel. On obtient donc le contrôle, et on garde les types exacts.',
      ],
    },
  },
  91: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 3 : l’erreur TS2322 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[14, '`unknown`']],
    apres: [[92, 'une autre erreur fréquente']],
  },
  92: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 4 : l’erreur TS2551 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[91, 'la structure d’un message']],
    apres: [[93, 'une valeur peut-être absente']],
  },
  93: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 5 : l’erreur TS18048 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[2, 'les valeurs absentes'], [92, 'lire un message']],
    apres: [[94, 'les erreurs d’arguments']],
  },
  94: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 5 : l’erreur TS2345 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[1, 'les paramètres typés'], [93, 'lire un message']],
    apres: [[95, 'les erreurs d’import']],
  },
  95: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 1 : l’erreur TS2307 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[71, 'les modules']],
    apres: [[96, 'le projet TaskD']],
  },
  96: {
    essai: 'Retirez le commentaire `@ts-expect-error` de la ligne 89 : l’erreur TS2322 apparaît sur la ligne suivante. Lisez son explication.',
    avant: [[12, '`readonly`'], [24, 'l’union discriminée'], [60, '`Record`']],
    apres: [[97, 'appliquer les transitions']],
  },
  97: {
    essai: 'Écrivez `task.status = to; return task;` à la ligne 69 : le champ est en lecture seule, et l’erreur TS2540 apparaît.',
    avant: [[96, 'le plan des transitions'], [81, 'les erreurs métier']],
    apres: [[98, 'postuler à une tâche']],
  },
  98: {
    essai: 'Écrivez `"publishd"` à la ligne 59 : ce statut n’existe pas, et l’erreur TS2367 signale une comparaison impossible.',
    avant: [[97, 'les transitions']],
    apres: [[99, 'la commission et le paiement']],
  },
  99: {
    essai: 'Écrivez `"hled"` à la ligne 57 : ce statut n’existe pas, et l’erreur TS2367 signale une comparaison impossible.',
    avant: [[98, 'les règles métier'], [70, 'un montant bien traité']],
    apres: [[100, 'assembler le projet']],
  },
  100: {
    avant: [[73, 'les schémas zod'], [99, 'la commission et le paiement']],
  },
};
