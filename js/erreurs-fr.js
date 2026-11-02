// Traduit les erreurs du compilateur et de l'exécution en français, avec leur correction.
// Les valeurs entre apostrophes du message d'origine sont reprises dans l'explication.
const ERREURS = {
  1005: ['Il manque un signe', 'Un caractère attendu manque, souvent `;`, `)` ou `}`.', 'Regardez la ligne indiquée et celle d’avant, puis ajoutez le signe manquant.'],
  1003: ['Un nom est attendu', 'Le compilateur attendait un nom à cet endroit.', 'Vérifiez qu’aucun mot n’a été oublié.'],
  1109: ['Une expression est attendue', 'Une valeur manque à cet endroit.', 'Complétez le code, par exemple après un `=` ou un `return`.'],
  1128: ['Instruction attendue', 'Ce texte n’est pas une instruction valide ici. Il y a souvent une accolade en trop.', 'Vérifiez que chaque `{` a son `}`.'],
  1014: ['Le reste doit être en dernier', 'Un paramètre `...reste` doit être le dernier de la liste.', 'Déplacez-le à la fin des paramètres.'],
  1016: ['Paramètre obligatoire mal placé', 'Un paramètre obligatoire ne peut pas suivre un paramètre facultatif.', 'Placez les paramètres facultatifs à la fin.'],
  1161: ['Texte non terminé', 'Une expression régulière ou un texte n’est pas fermé.', 'Ajoutez le caractère de fermeture.'],
  1308: ['`await` au mauvais endroit', '`await` ne s’utilise que dans une fonction `async`, ou au niveau principal d’un module.', 'Ajoutez `async` devant la fonction.'],
  1345: ['Tester une expression `void`', 'Une fonction `void` ne fournit aucune valeur à tester.', 'Changez son type de retour si cette valeur compte.'],
  2315: ['Type non générique', (a) => `Le type ${a[0] ?? ""} n’accepte pas d’argument entre \`< >\`.`, 'Retirez les `< >`, ou déclarez-le avec un paramètre, comme `type Result<T> = ...`.'],
  2588: ['Une constante ne change pas', (a) => `${a[0] ?? "Cette variable"} est déclarée avec \`const\` : on ne peut pas la réaffecter.`, 'Utilisez `let` si sa valeur doit changer.'],
  2300: ['Nom déjà utilisé', (a) => `Le nom ${a[0] ?? ""} est déclaré plusieurs fois.`, 'Renommez l’une des déclarations.'],
  2304: ['Nom inconnu', (a) => `Le nom ${a[0] ?? ""} n’existe pas à cet endroit.`, 'Vérifiez son orthographe, ou déclarez-le avant de l’utiliser.'],
  2314: ['Type générique sans argument', 'Ce type a besoin d’un type entre `< >`.', 'Écrivez par exemple `Page<number>`.'],
  2322: ['Type incompatible', (a) => `Une valeur de type ${a[0] ?? "différent"} ne peut pas aller là où ${a[1] ?? "un autre type"} est attendu.`, 'Corrigez la valeur, ou changez le type annoncé si c’est lui qui est faux.'],
  2339: ['Propriété inexistante', (a) => `La propriété ${a[0] ?? ""} n’existe pas sur le type ${a[1] ?? "de cette valeur"}.`, 'Vérifiez son orthographe. Dans une union, rétrécissez d’abord le type. Sur une promesse, ajoutez `await`.'],
  2344: ['Contrainte de type non respectée', 'Le type fourni ne respecte pas la condition `extends` du générique.', 'Fournissez un type qui remplit la condition.'],
  2345: ['Mauvais argument', (a) => `L’argument de type ${a[0] ?? ""} ne convient pas au paramètre de type ${a[1] ?? ""}.`, 'Passez une valeur du type attendu, ou convertissez-la.'],
  2349: ['Ce n’est pas une fonction', 'Vous appelez une valeur qui ne peut pas être appelée.', 'Vérifiez que cette valeur est bien une fonction.'],
  2353: ['Propriété en trop', (a) => `La propriété ${a[0] ?? ""} n’existe pas dans le type ${a[1] ?? "attendu"}.`, 'Corrigez la faute, retirez-la, ou ajoutez-la au type.'],
  2355: ['Valeur de retour manquante', 'La fonction annonce une valeur de retour, mais n’en renvoie aucune.', 'Ajoutez un `return` avec une valeur.'],
  2358: ['`instanceof` mal utilisé', 'La partie gauche de `instanceof` doit pouvoir être un objet.', 'Vérifiez la valeur testée.'],
  2362: ['Calcul impossible', 'La partie gauche du calcul doit être un nombre.', 'Convertissez-la avec `Number(...)`, ou corrigez son type.'],
  2363: ['Calcul impossible', 'La partie droite du calcul doit être un nombre.', 'Convertissez-la avec `Number(...)`, ou corrigez son type.'],
  2365: ['Opération impossible', 'Cet opérateur ne peut pas être utilisé entre ces deux types.', 'Vérifiez le type des deux côtés.'],
  2366: ['`return` final manquant', 'La fonction peut se terminer sans renvoyer la valeur annoncée.', 'Ajoutez un `return` pour le cas oublié.'],
  2367: ['Comparaison impossible', 'Ces deux valeurs n’ont aucun type en commun : le test ne peut jamais être vrai.', 'Corrigez la valeur comparée. Il y a souvent une faute de frappe.'],
  2394: ['Surcharge incompatible', 'La signature d’implémentation ne couvre pas cette surcharge.', 'Élargissez les paramètres et le retour de l’implémentation.'],
  2403: ['Redéclaration incompatible', 'Cette variable est déclarée deux fois avec des types différents.', 'Utilisez un seul nom ou un seul type.'],
  2448: ['Utilisée trop tôt', 'Cette variable est utilisée avant sa déclaration.', 'Déplacez sa déclaration plus haut.'],
  2451: ['Variable déjà déclarée', (a) => `La variable ${a[0] ?? ""} est déclarée plusieurs fois.`, 'Renommez l’une des deux, ou retirez une déclaration.'],
  2454: ['Variable sans valeur', 'Cette variable peut être lue avant d’avoir reçu une valeur.', 'Donnez-lui une valeur initiale, ou acceptez `undefined` dans son type.'],
  2488: ['Déstructuration impossible', 'Cette valeur ne peut pas être parcourue. C’est souvent une promesse sans `await`.', 'Ajoutez `await`, ou vérifiez le type de la valeur.'],
  2532: ['Valeur peut-être absente', 'Cette valeur peut être `undefined` : y accéder pourrait provoquer un plantage.', 'Utilisez `?.`, `??`, ou testez-la avant.'],
  2531: ['Valeur peut-être nulle', 'Cette valeur peut être `null`.', 'Testez-la avant : `if (x !== null)`.'],
  2534: ['Une fonction `never` se termine', 'Une fonction annoncée `never` ne doit jamais atteindre sa fin.', 'Terminez-la par un `throw`.'],
  2540: ['Propriété en lecture seule', (a) => `${a[0] ?? "Cette propriété"} est marquée \`readonly\` : on ne peut pas la réaffecter.`, 'Créez un nouvel objet avec `{ ...objet }`, ou retirez `readonly`.'],
  2551: ['Propriété mal orthographiée', (a) => `${a[0] ?? "Cette propriété"} n’existe pas. TypeScript suggère ${a[2] ?? "un autre nom"}.`, 'Utilisez le nom suggéré.'],
  2554: ['Mauvais nombre d’arguments', 'La fonction ne reçoit pas le nombre d’arguments attendu.', 'Comparez l’appel à la liste des paramètres.'],
  2555: ['Trop peu d’arguments', 'La fonction attend plus d’arguments.', 'Ajoutez ceux qui manquent.'],
  2556: ['Spread mal utilisé', 'Un tableau éclaté avec `...` doit correspondre à un paramètre du reste, ou à un tuple.', 'Utilisez un paramètre `...reste`, ou annotez un tuple.'],
  2561: ['Propriété mal orthographiée', (a) => `${a[0] ?? "Cette propriété"} n’existe pas. TypeScript suggère un autre nom.`, 'Utilisez le nom suggéré.'],
  2578: ['`@ts-expect-error` inutile', 'Le commentaire annonce une erreur, mais la ligne suivante n’en contient plus.', 'Bonne nouvelle : le code est juste. Retirez le commentaire.'],
  2678: ['Cas impossible', 'Cette valeur de `case` ne fait pas partie du type testé.', 'Corrigez l’orthographe, ou ajoutez la valeur au type.'],
  2739: ['Plusieurs champs manquants', (a) => `Le type ${a[0] ?? ""} ne contient pas tous les champs de ${a[1] ?? "ce qui est attendu"}.`, 'Ajoutez les champs manquants.'],
  2741: ['Champ manquant', (a) => `Le champ ${a[0] ?? ""} manque dans l’objet.`, 'Ajoutez ce champ, ou rendez-le facultatif avec `?` si c’est justifié.'],
  2769: ['Aucune surcharge ne convient', 'Aucune des signatures de cette fonction n’accepte ces arguments.', 'Passez des arguments d’un des types prévus.'],
  2775: ['Assertion sans annotation', 'Une fonction d’assertion doit avoir un type écrit explicitement.', 'Utilisez une déclaration `function`, ou annotez la variable.'],
  2801: ['`await` probablement oublié', 'Cette condition teste une promesse, qui est toujours vraie.', 'Ajoutez `await` devant la promesse.'],
  2869: ['Repli inutile', 'La partie droite de `??` ne sera jamais utilisée : la gauche n’est jamais absente.', 'Retirez le `??`.'],
  2881: ['Repli inutile', 'Cette expression n’est jamais `null` ni `undefined`.', 'Retirez le `??`.'],
  5076: ['Parenthèses nécessaires', '`??` ne peut pas être mélangé directement avec `||` ou `&&`.', 'Ajoutez des parenthèses pour préciser l’ordre.'],
  7006: ['Paramètre sans type', (a) => `Le paramètre ${a[0] ?? ""} n’a pas de type, et rien ne permet de le déduire.`, 'Annotez-le, par exemple `amount: number`.'],
  7005: ['Variable sans type', (a) => `La variable ${a[0] ?? ""} a implicitement le type \`any\`.`, 'Donnez-lui un type ou une valeur initiale.'],
  7029: ['Passage au cas suivant', 'Ce `case` non vide continue dans le suivant sans `return` ni `break`.', 'Terminez-le par `return` ou `break`.'],
  7030: ['Chemin sans `return`', 'Un chemin de la fonction se termine sans renvoyer de valeur.', 'Ajoutez un `return` pour ce cas.'],
  7031: ['Élément sans type', (a) => `L’élément déstructuré ${a[0] ?? ""} a implicitement le type \`any\`.`, 'Annotez le paramètre.'],
  7034: ['Variable sans type', (a) => `La variable ${a[0] ?? ""} a implicitement le type \`any\`.`, 'Donnez-lui un type explicite.'],
  18049: ['Valeur peut-être absente', (a) => `${a[0] ?? "Cette valeur"} peut être \`null\` ou \`undefined\`.`, 'Utilisez `?.`, `??`, ou testez-la avant.'],
  18050: ['Valeur inutilisable', (a) => `La valeur ${a[0] ?? ""} ne peut pas être utilisée ici : elle ne contient rien.`, 'Remplacez-la par une vraie valeur, ou testez-la avant.'],
  2533: ['Valeur peut-être absente', 'Cette valeur peut être `null` ou `undefined`.', 'Utilisez `?.`, `??`, ou testez-la avant.'],
  2722: ['Fonction peut-être absente', 'Cette fonction peut être `undefined` : l’appeler pourrait échouer.', 'Testez-la avant, ou appelez-la avec `?.()`.'],
  18046: ['Valeur de type inconnu', (a) => `${a[0] ?? "Cette valeur"} est de type \`unknown\` : on ne peut pas l’utiliser sans la vérifier.`, 'Testez-la d’abord avec `typeof`, `instanceof` ou une garde.'],
  18047: ['Valeur peut-être nulle', (a) => `${a[0] ?? "Cette valeur"} peut être \`null\`.`, 'Testez-la avant : `if (x !== null)`.'],
  18048: ['Valeur peut-être absente', (a) => `${a[0] ?? "Cette valeur"} peut être \`undefined\`.`, 'Utilisez `?.`, `??`, ou testez-la avant.'],
};

export function expliquerErreur({ code, message }) {
  const entree = ERREURS[code];
  if (!entree) {
    return { connue: false, titre: `Erreur TS${code}`, cause: "Cette erreur n’a pas encore d’explication en français.", solution: "Lisez la ligne indiquée et le message d’origine ci-dessous." };
  }
  const valeurs = (message.match(/'[^']*'/g) ?? []).map((v) => `\`${v.slice(1, -1)}\``);
  const [titre, cause, solution] = entree;
  return { connue: true, titre, cause: typeof cause === "function" ? cause(valeurs) : cause, solution };
}

export function codeTraduit(code) {
  return code in ERREURS;
}

const EXECUTION = [
  [/^(.+) is not a function$/, (m) => `\`${m[1]}\` n’est pas une fonction : le programme a essayé de l’appeler.`],
  [/^Cannot read properties of (undefined|null) \(reading '(.+)'\)$/, (m) => `Lecture de \`${m[2]}\` sur une valeur \`${m[1]}\` : la valeur attendue est absente.`],
  [/^(.+) is not defined$/, (m) => `\`${m[1]}\` n’existe pas : vérifiez son orthographe.`],
  [/^Cannot access '(.+)' before initialization$/, (m) => `\`${m[1]}\` est utilisée avant sa déclaration.`],
  [/^Assignment to constant variable\.$/, () => "Une variable `const` ne peut pas être réaffectée. Utilisez `let` si sa valeur doit changer."],
  [/^Unexpected /, () => "Le code contient une erreur de syntaxe."],
];

export function expliquerExecution(message) {
  for (const [motif, texte] of EXECUTION) {
    const m = motif.exec(message);
    if (m) return texte(m);
  }
  return message;
}
