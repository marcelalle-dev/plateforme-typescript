// Repère les notions les moins bien maîtrisées à partir des quiz déjà tentés.
import { SEUIL_VALIDATION } from "./quiz-core.js";
import { suivi } from "./store.js";

// Note de maîtrise d'un exercice déjà tenté, sur 10.
function maitriseExercice(s) {
  // TODO(human) : choisir comment mesurer la maîtrise à partir de l'historique du quiz.
  return s.meilleur;
}

export function notionsFragiles(exercices) {
  const parNotion = new Map();
  for (const exercice of exercices) {
    const s = suivi(exercice.id);
    const groupe = parNotion.get(exercice.notion) ?? { notion: exercice.notion, notes: [], total: 0, aRevoir: [] };
    groupe.total += 1;
    if (s?.meilleur !== null && s?.meilleur !== undefined) {
      const note = maitriseExercice(s);
      groupe.notes.push(note);
      if (note < SEUIL_VALIDATION) groupe.aRevoir.push(exercice);
    }
    parNotion.set(exercice.notion, groupe);
  }
  return [...parNotion.values()]
    .filter((g) => g.notes.length > 0)
    .map((g) => ({
      ...g,
      moyenne: Math.round((g.notes.reduce((a, b) => a + b, 0) / g.notes.length) * 10) / 10,
    }))
    .filter((g) => g.moyenne < SEUIL_VALIDATION || g.aRevoir.length > 0)
    .sort((a, b) => a.moyenne - b.moyenne);
}
