// Page d'introduction : les bases de JavaScript nécessaires avant l'exercice 1.
// outils/verifier.mjs exécute chaque exemple et compare sa sortie à celle indiquée ici.
export const BASES = [
  {
    titre: 'Un programme, c’est quoi ?',
    textes: [
      'Un programme est une suite d’instructions que l’ordinateur exécute **dans l’ordre**, de haut en bas. `console.log` affiche une valeur à l’écran : c’est votre outil pour voir ce qui se passe.',
      'Une ligne qui commence par `//` est un commentaire : l’ordinateur l’ignore. Il sert à expliquer le code aux humains.',
    ],
    code: '// Ce commentaire est ignoré\nconsole.log("Bonjour");\nconsole.log(2 + 3);',
    sortie: 'Bonjour\n5',
  },
  {
    titre: 'Les variables',
    textes: [
      'Une variable est une boîte portant une étiquette : elle garde une valeur pour la réutiliser. `const` crée une boîte dont le contenu ne changera pas. `let` crée une boîte dont le contenu peut changer.',
    ],
    code: 'const name = "Awa";\nlet score = 10;\nscore = score + 5;\nconsole.log(name, score);',
    sortie: 'Awa 15',
  },
  {
    titre: 'Les types de valeurs',
    textes: [
      'Chaque valeur a une nature : un **nombre** (`number`), un **texte** (`string`, entre guillemets) ou un **booléen** (`boolean`, `true` ou `false`).',
      '`typeof` donne le nom du type d’une valeur. Deux valeurs indiquent une absence : `undefined` (rien n’a été défini) et `null` (absence volontaire).',
    ],
    code: 'console.log(typeof 42);\nconsole.log(typeof "42");\nconsole.log(typeof true);',
    sortie: 'number\nstring\nboolean',
  },
  {
    titre: 'Assembler du texte',
    textes: [
      'Un texte écrit entre accents graves `` ` `` est un **gabarit**. Chaque `${...}` y est remplacé par la valeur de l’expression. C’est plus lisible que d’assembler des morceaux avec `+`.',
    ],
    code: 'const amount = 80000;\nconsole.log(`Montant : ${amount} XOF`);\nconsole.log(`Le double : ${amount * 2}`);',
    sortie: 'Montant : 80000 XOF\nLe double : 160000',
  },
  {
    titre: 'Les conditions',
    textes: [
      '`if` exécute un bloc seulement si la condition est vraie, et `else` exécute l’autre bloc sinon. `===` teste l’égalité, `!==` la différence, `&&` signifie « et », `||` signifie « ou ».',
    ],
    code: 'const budget = 75000;\nif (budget > 50000) {\n  console.log("Grand budget");\n} else {\n  console.log("Petit budget");\n}',
    sortie: 'Grand budget',
  },
  {
    titre: 'Les fonctions',
    textes: [
      'Une fonction est une recette réutilisable. Ses **paramètres** sont les ingrédients, `return` donne le résultat, et on l’**appelle** avec des parenthèses. Déclarer une fonction ne l’exécute pas : il faut l’appeler.',
      'La forme courte `(a, b) => a + b` s’appelle une fonction fléchée. Elle fait la même chose.',
    ],
    code: 'function double(value) {\n  return value * 2;\n}\nconst add = (a, b) => a + b;\n\nconsole.log(double(21));\nconsole.log(add(2, 3));',
    sortie: '42\n5',
    compileMal: true,
    note: 'Cet exemple est en JavaScript pur : sans les types, TypeScript le signale en mode strict. C’est justement ce que vous apprendrez à corriger dans l’exercice 1.',
  },
  {
    titre: 'Les tableaux',
    textes: [
      'Un tableau est une liste ordonnée. On compte **à partir de zéro** : `scores[0]` est le premier élément. `length` donne le nombre d’éléments et `push` en ajoute un à la fin.',
    ],
    code: 'const scores = [45, 72, 90];\nconsole.log(scores[0]);\nconsole.log(scores.length);\nscores.push(100);\nconsole.log(scores.length);',
    sortie: '45\n3\n4',
  },
  {
    titre: 'Les objets',
    textes: [
      'Un objet regroupe des valeurs nommées, comme une fiche : chaque **clé** a une **valeur**. On y accède avec un point : `offer.title`.',
    ],
    code: 'const offer = { title: "Logo", budget: 75000 };\nconsole.log(offer.title);\nconsole.log(offer.budget);',
    sortie: 'Logo\n75000',
  },
  {
    titre: 'Les boucles',
    textes: [
      'Une boucle répète un bloc. `for...of` parcourt les éléments d’un tableau, un par un.',
    ],
    code: 'const words = ["Figma", "Logo"];\nfor (const word of words) {\n  console.log(word);\n}',
    sortie: 'Figma\nLogo',
  },
  {
    titre: 'JavaScript et TypeScript',
    textes: [
      'JavaScript est le langage qui s’exécute réellement. TypeScript, c’est JavaScript **avec des types en plus** : `amount: number` annonce que `amount` doit être un nombre. Le compilateur vérifie ces annonces avant l’exécution, puis les **efface** pour produire du JavaScript.',
      'Conséquence importante, que vous reverrez souvent : les types protègent à la compilation, mais n’existent plus à l’exécution. Vos documents Word contiennent d’ailleurs le JavaScript obtenu, sans les types.',
      'Sur votre ordinateur, `npx tsx fichier.ts` exécute un fichier, et `npx tsc --noEmit` vérifie les types sans rien exécuter.',
    ],
    code: 'function netAmount(amount: number, fee: number): number {\n  return amount - fee;\n}\nconsole.log(netAmount(80000, 8000));',
    sortie: '72000',
  },
  {
    titre: 'Lire une erreur',
    textes: [
      'Une erreur TypeScript n’est pas un échec : c’est un bug évité. Elle indique un numéro de ligne, un code comme `TS2322`, et un message. Dans cette plateforme, chaque erreur est aussi expliquée en français.',
      'Essayez : dans l’exemple ci-dessous, cliquez sur « Essayer ce code », remplacez `10` par `"10"`, puis lancez-le.',
    ],
    code: 'const score: number = 10;\nconsole.log(score);',
    sortie: '10',
  },
];
