// Correction des quiz : fonctions pures, sans dépendance à la page.

export const SEUIL_VALIDATION = 8;

function normaliser(texte) {
  return String(texte ?? "").replace(/\s+/g, "").replace(/;$/, "");
}

export function estRepondue(question, reponse) {
  if (reponse === undefined || reponse === null) return false;
  if (question.t === "multi") return reponse.length > 0;
  if (question.t === "completer") return normaliser(reponse) !== "";
  return true;
}

export function estJuste(question, reponse) {
  if (!estRepondue(question, reponse)) return false;
  if (question.t === "multi") {
    const attendu = [...question.a].sort();
    const donne = [...reponse].sort();
    return attendu.length === donne.length && attendu.every((valeur, i) => valeur === donne[i]);
  }
  if (question.t === "completer") {
    return question.r.some((r) => normaliser(r) === normaliser(reponse));
  }
  return reponse === question.a;
}

// Score sur 10 arrondi à une décimale ; une question sans réponse ne rapporte aucun point.
export function corrigerQuiz(questions, reponses) {
  const details = questions.map((question, i) => ({
    repondue: estRepondue(question, reponses[i]),
    juste: estJuste(question, reponses[i]),
  }));
  const justes = details.filter((d) => d.juste).length;
  const score = Math.round((justes / questions.length) * 100) / 10;
  return {
    details,
    justes,
    total: questions.length,
    sansReponse: details.filter((d) => !d.repondue).length,
    score,
    valide: score >= SEUIL_VALIDATION,
  };
}
