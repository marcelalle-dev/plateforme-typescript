// Composants d’affichage réutilisables.

export function h(balise, attributs = {}, ...enfants) {
  const el = document.createElement(balise);
  for (const [cle, valeur] of Object.entries(attributs ?? {})) {
    if (valeur === undefined || valeur === null || valeur === false) continue;
    if (cle.startsWith("on")) el.addEventListener(cle.slice(2).toLowerCase(), valeur);
    else if (cle === "html") el.innerHTML = valeur;
    else if (cle === "value" || cle === "checked" || cle === "disabled") el[cle] = valeur;
    else el.setAttribute(cle, valeur === true ? "" : valeur);
  }
  for (const enfant of enfants.flat()) {
    if (enfant === null || enfant === undefined || enfant === false) continue;
    el.append(enfant);
  }
  return el;
}

export function echapper(texte) {
  return String(texte).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Mise en forme légère : `code` (ou ``code`` s’il contient un accent grave) et **gras**.
export function enLigne(texte) {
  return echapper(texte)
    .replace(/``\s?(.+?)\s?``|`([^`]+)`/g, (_, double, simple) => `<code>${double ?? simple}</code>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function riche(balise, texte, attributs = {}) {
  return h(balise, { ...attributs, html: enLigne(texte) });
}

const MOTS_CLES = new Set("abstract as asserts async await break case catch class const continue default delete do else export extends false finally for from function if implements import in instanceof interface is keyof let new null of readonly return satisfies static super switch this throw true try type typeof undefined var void while".split(" "));
const TYPES = new Set("string number boolean unknown any never object bigint symbol".split(" "));
const JETONS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

export function colorer(code) {
  let sortie = "";
  let position = 0;
  for (const m of code.matchAll(JETONS)) {
    sortie += echapper(code.slice(position, m.index));
    position = m.index + m[0].length;
    const texte = echapper(m[0]);
    if (m[1]) sortie += `<span class="t-co">${texte}</span>`;
    else if (m[2]) sortie += `<span class="t-ch">${texte}</span>`;
    else if (m[3]) sortie += `<span class="t-nb">${texte}</span>`;
    else if (MOTS_CLES.has(m[0])) sortie += `<span class="t-mc">${texte}</span>`;
    else if (TYPES.has(m[0]) || /^[A-Z]/.test(m[0])) sortie += `<span class="t-ty">${texte}</span>`;
    else sortie += texte;
  }
  return sortie + echapper(code.slice(position));
}

export function blocCode(code, { numeros = false, debut = 1 } = {}) {
  const lignes = code.split("\n");
  const largeur = numeros
    ? lignes.map((_, i) => `<span class="num-ligne">${debut + i}</span>`)
    : null;
  const html = colorer(code)
    .split("\n")
    .map((l, i) => (largeur ? largeur[i] : "") + l)
    .join("\n");
  return h("pre", { class: "code", tabindex: "0" }, h("code", { html }));
}

export function etatCase(suivi) {
  if (suivi?.meilleur === undefined || suivi?.meilleur === null) return "vierge";
  return suivi.valide ? "valide" : "essaye";
}

export function noteTexte(n) {
  return String(n).replace(".", ",");
}

export function melanger(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export function legendeGrille() {
  return h("ul", { class: "legende" },
    h("li", {}, h("i", {}), "Pas encore tenté"),
    h("li", {}, h("i", { "data-etat": "essaye" }), "Tenté, moins de 8/10"),
    h("li", {}, h("i", { "data-etat": "valide" }), "Validé, 8/10 ou plus"));
}
