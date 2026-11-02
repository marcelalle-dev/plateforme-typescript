// Fusion de deux progressions (cet appareil et le compte) : rien de ce qui est acquis n'est perdu.
// Fonctions pures, testées par outils/test-fusion.mjs.
const MAX_TENTATIVES = 30;

function fusionnerTentatives(a, b) {
  const parCle = new Map();
  for (const t of [...a, ...b]) parCle.set(`${t.date}|${t.score}`, t);
  return [...parCle.values()].sort((x, y) => x.date.localeCompare(y.date)).slice(-MAX_TENTATIVES);
}

function dateDerniere(s) {
  return s.tentatives?.at(-1)?.date ?? "";
}

function plusGrand(a, b) {
  if (a === null || a === undefined) return b ?? null;
  if (b === null || b === undefined) return a;
  return Math.max(a, b);
}

// Les questions ratées suivent la tentative la plus récente ; à égalité, seules restent celles ratées des deux côtés.
function fusionnerRatees(a, b) {
  const da = dateDerniere(a);
  const db = dateDerniere(b);
  if (da > db) return a.ratees ?? [];
  if (db > da) return b.ratees ?? [];
  const autre = new Set(b.ratees ?? []);
  return (a.ratees ?? []).filter((i) => autre.has(i));
}

function fusionnerRevision(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  return a.prochaine >= b.prochaine ? a : b;
}

function fusionnerPratique(a, b) {
  if (!a) return b ?? null;
  if (!b) return a;
  return {
    code: a.code ?? b.code ?? null,
    essais: Math.max(a.essais ?? 0, b.essais ?? 0),
    reussi: Boolean(a.reussi || b.reussi),
  };
}

function fusionnerExercice(local, distant) {
  if (!local) return distant;
  if (!distant) return local;
  const tentatives = fusionnerTentatives(local.tentatives ?? [], distant.tentatives ?? []);
  return {
    ...distant,
    ...local,
    tentatives,
    meilleur: plusGrand(local.meilleur, distant.meilleur),
    dernier: tentatives.at(-1)?.score ?? local.dernier ?? distant.dernier ?? null,
    valide: Boolean(local.valide || distant.valide),
    ratees: fusionnerRatees(local, distant),
    revision: fusionnerRevision(local.revision, distant.revision),
    pratique: fusionnerPratique(local.pratique, distant.pratique),
  };
}

export function fusionnerProgressions(local, distant) {
  const a = local?.exercices ?? {};
  const b = distant?.exercices ?? {};
  const exercices = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    exercices[id] = fusionnerExercice(a[id], b[id]);
  }
  return { exercices, dernier: local?.dernier ?? distant?.dernier ?? null };
}
