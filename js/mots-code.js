// Découpe un code TypeScript en « mots » : noms, mots-clés, opérateurs, valeurs textuelles et regex.
// Script utilisé par outils/generer-mots.mjs. Il s'appuie sur l'analyseur du compilateur pour ne
// rien confondre : un mot écrit dans un commentaire ou une phrase n'est pas un mot du code.

const OPERATEURS = new Set([
  "=>", "??", "?.", "===", "!==", "||", "&&", "!", "|", "&", "...", "?", "%", "+=", "<=", ">=", "**",
  ":", "=", "+", "-", "*", "/", "<", ">",
]);
const DIRECTIVE = /@ts-expect-error/;
// Une valeur textuelle n'est un mot à expliquer que si elle ressemble à un identifiant : "draft", "XOF".
const TEXTE_MOT = /^[A-Za-z][A-Za-z_]*$/;

export function extraireMots(ts, code) {
  const source = ts.createSourceFile("/m.ts", code, ts.ScriptTarget.ES2022, true);
  const mots = new Set();
  const K = ts.SyntaxKind;

  function visiter(noeud) {
    if (noeud.kind === K.Identifier || (noeud.kind >= K.FirstKeyword && noeud.kind <= K.LastKeyword)) {
      const nom = noeud.getText(source);
      // Un nom vide vient d'un code incomplet, comme une question à trou.
      if (nom) mots.add(nom);
    } else if (noeud.kind === K.StringLiteral) {
      const texte = noeud.text;
      if (TEXTE_MOT.test(texte)) mots.add(`"${texte}"`);
    } else if (noeud.kind === K.RegularExpressionLiteral) {
      mots.add(noeud.getText(source));
    } else if (noeud.kind >= K.FirstPunctuation && noeud.kind <= K.LastPunctuation) {
      const texte = noeud.getText(source);
      if (OPERATEURS.has(texte)) mots.add(texte);
    }
    // getChildren parcourt aussi les jetons, comme le | entre deux types.
    for (const enfant of noeud.getChildren(source)) visiter(enfant);
  }
  visiter(source);
  if (DIRECTIVE.test(code)) mots.add("@ts-expect-error");
  if (code.includes("${")) mots.add("${");
  return [...mots];
}
