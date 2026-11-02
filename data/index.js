// Assemble les sources générées et le contenu pédagogique des cinq modules.
import { ENRICHISSEMENT } from "./enrichissement.js";
import { detaillerLignes } from "./lignes-detail.js";
import { SOURCES } from "./sources.js";
import { MODULE1 } from "./module1.js";
import { MODULE2 } from "./module2.js";
import { MODULE3 } from "./module3.js";
import { MODULE4 } from "./module4.js";
import { MODULE5 } from "./module5.js";
import { MODULE6 } from "./module6.js";
import { MODULE7 } from "./module7.js";
import { MODULE8 } from "./module8.js";
import { MODULE9 } from "./module9.js";
import { MODULE10 } from "./module10.js";

const CONTENU = { ...MODULE1, ...MODULE2, ...MODULE3, ...MODULE4, ...MODULE5, ...MODULE6, ...MODULE7, ...MODULE8, ...MODULE9, ...MODULE10 };

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
  { id: 6, nom: "Classes et types utilitaires", premier: 51, dernier: 60, resume: "Dépôts et piles génériques, keyof, Result, Partial, Pick, Omit et Record." },
  { id: 7, nom: "Types avancés et classes", premier: 61, dernier: 70, resume: "ReturnType, Exclude, types mappés, types conditionnels, héritage et objets-valeurs." },
  { id: 8, nom: "Modules et validation", premier: 71, dernier: 80, resume: "Organisation du code, schémas zod, formulaires, environnement et erreurs." },
  { id: 9, nom: "Erreurs, React et Express", premier: 81, dernier: 90, resume: "Erreurs métier, Result, composants React, contrôleurs Express et satisfies." },
  { id: 10, nom: "Lire les erreurs et projet TaskD", premier: 91, dernier: 100, resume: "Comprendre les messages du compilateur, puis modéliser un domaine complet." },
];

export const EXERCICES = SOURCES.map((source) => ({
  ...source,
  module: MODULES.find((m) => source.id >= m.premier && source.id <= m.dernier).id,
  ...CONTENU[source.id],
  ...ENRICHISSEMENT[source.id],
  lignes: detaillerLignes(source.id, CONTENU[source.id]?.lignes ?? []),
}));
