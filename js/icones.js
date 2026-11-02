// Icônes de navigation, décoratives : le texte reste toujours affiché à côté.
const TRACES = {
  tableau: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
  bases: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 21H20v-3"/>',
  modules: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  exercices: '<path d="m8.5 8-4 4 4 4"/><path d="m15.5 8 4 4-4 4"/><path d="m13.5 5-3 14"/>',
  revisions: '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M21 3.5V8h-4.5"/><path d="M12 7.5V12l3 2"/>',
  progression: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21 20H3"/>',
  avis: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12z"/>',
  compte: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
};

export function icone(nom) {
  const conteneur = document.createElement("span");
  conteneur.className = "icone";
  conteneur.setAttribute("aria-hidden", "true");
  conteneur.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${TRACES[nom] ?? ""}</svg>`;
  return conteneur;
}
