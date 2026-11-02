// Tests de la fusion des progressions. Lancer : node outils/test-fusion.mjs
import assert from "node:assert/strict";
import { fusionnerProgressions as fusion } from "../js/fusion.js";

const T1 = { date: "2026-11-01T10:00:00.000Z", score: 5 };
const T2 = { date: "2026-11-02T10:00:00.000Z", score: 9 };
const T3 = { date: "2026-11-03T10:00:00.000Z", score: 3.3 };
const ex = (champs) => ({ meilleur: null, dernier: null, valide: false, tentatives: [], pratique: null, ...champs });

let r = fusion({ exercices: { 1: ex({ meilleur: 5 }) } }, { exercices: { 2: ex({ meilleur: 7 }) } });
assert.deepEqual(Object.keys(r.exercices).sort(), ["1", "2"], "les exercices des deux côtés sont gardés");

r = fusion(
  { exercices: { 1: ex({ meilleur: 5, dernier: 5, tentatives: [T1], ratees: [0, 1] }) } },
  { exercices: { 1: ex({ meilleur: 9, dernier: 9, valide: true, tentatives: [T2], ratees: [4] }) } },
).exercices[1];
assert.equal(r.meilleur, 9, "le meilleur score l'emporte");
assert.equal(r.valide, true, "une validation n'est jamais perdue");
assert.equal(r.dernier, 9, "le dernier score vient de la tentative la plus récente");
assert.equal(r.tentatives.length, 2, "les tentatives sont réunies");
assert.deepEqual(r.ratees, [4], "les questions ratées suivent la tentative la plus récente");

r = fusion(
  { exercices: { 1: ex({ tentatives: [T1, T3], dernier: 3.3, meilleur: 5, ratees: [2] }) } },
  { exercices: { 1: ex({ tentatives: [T1, T2], dernier: 9, meilleur: 9, valide: true, ratees: [] }) } },
).exercices[1];
assert.equal(r.tentatives.length, 3, "une tentative commune n'est pas comptée deux fois");
assert.equal(r.dernier, 3.3);
assert.equal(r.meilleur, 9);
assert.equal(r.valide, true);
assert.deepEqual(r.ratees, [2]);

r = fusion(
  { exercices: { 1: ex({ tentatives: [T1], ratees: [0] }) } },
  { exercices: { 1: ex({ tentatives: [T1], ratees: [0, 1] }) } },
).exercices[1];
assert.deepEqual(r.ratees, [0], "une question reprise avec succès sur un appareil reste corrigée");

r = fusion(
  { exercices: { 1: ex({ pratique: { code: "local", essais: 1, reussi: false }, revision: { niveau: 0, prochaine: 10 } }) } },
  { exercices: { 1: ex({ pratique: { code: "distant", essais: 3, reussi: true }, revision: { niveau: 2, prochaine: 99 } }) } },
).exercices[1];
assert.deepEqual(r.pratique, { code: "local", essais: 3, reussi: true }, "le code de cet appareil est gardé, la réussite aussi");
assert.equal(r.revision.prochaine, 99, "la révision la plus lointaine l'emporte");

r = fusion({ exercices: {}, dernier: null }, null);
assert.deepEqual(r, { exercices: {}, dernier: null }, "un compte encore vide ne pose pas de problème");

const beaucoup = Array.from({ length: 40 }, (_, i) => ({ date: `2026-10-${String(i % 28 + 1).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:00:00.000Z`, score: 5 }));
r = fusion({ exercices: { 1: ex({ tentatives: beaucoup }) } }, { exercices: { 1: ex({ tentatives: [T3] }) } }).exercices[1];
assert.ok(r.tentatives.length <= 30, "l'historique reste limité");
assert.equal(r.tentatives.at(-1).date, T3.date);

const a = { exercices: { 1: ex({ meilleur: 5, tentatives: [T1], ratees: [1] }) }, dernier: 1 };
const b = { exercices: { 1: ex({ meilleur: 9, tentatives: [T2], valide: true, ratees: [] }) }, dernier: 2 };
assert.deepEqual(fusion(fusion(a, b), b), fusion(a, b), "refaire la fusion ne change rien");

console.log("Fusion : tous les tests réussissent.");
