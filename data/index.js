// Assemble les sources générées et le contenu pédagogique des cinq modules.
import { SOURCES } from "./sources.js";
import { MODULE1 } from "./module1.js";
import { MODULE2 } from "./module2.js";
import { MODULE3 } from "./module3.js";
import { MODULE4 } from "./module4.js";
import { MODULE5 } from "./module5.js";

const CONTENU = { ...MODULE1, ...MODULE2, ...MODULE3, ...MODULE4, ...MODULE5 };

export const NIVEAUX = {
  debutant: { nom: "Débutant", rang: 1 },
  elementaire: { nom: "Élémentaire", rang: 2 },
  intermediaire: { nom: "Intermédiaire", rang: 3 },
  avance: { nom: "Avancé", rang: 4 },
};

export const MODULES = [
  { id: 1, nom: "Les bases strictes", premier: 1, dernier: 10, resume: "Options strictes, inférence, tableaux, tuples et objets." },
  { id: 2, nom: "Modéliser et rétrécir", premier: 11, dernier: 20, resume: "Interfaces, unknown, never, signatures d’index et premières unions." },
  { id: 3, nom: "Unions et gardes", premier: 21, dernier: 30, resume: "Rétrécissement, unions discriminées, exhaustivité et assertions." },
  { id: 4, nom: "Types précis et fonctions", premier: 31, dernier: 40, resume: "as const, gabarits, intersections, paramètres et surcharges." },
  { id: 5, nom: "Asynchrone et génériques", premier: 41, dernier: 50, resume: "Ordre supérieur, Promise, void et fonctions génériques." },
];

export const EXERCICES = SOURCES.map((source) => ({
  ...source,
  module: MODULES.find((m) => source.id >= m.premier && source.id <= m.dernier).id,
  ...CONTENU[source.id],
}));
