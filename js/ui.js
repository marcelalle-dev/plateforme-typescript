// Composants d’affichage réutilisables.
import { definition } from "../data/glossaire.js";

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
const JETONS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(`(?:\\.|[^`\\])*`)|((?<=[(,=]\s*)\/(?![/*])(?:\\.|\[[^\]\n]*\]|[^/\\\n])+\/[gimsuy]*)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(=>|\?\?|\?\.|===|!==|\|\||&&|\.\.\.|<=|>=|\+=|[!|&?])/g;
const DIRECTIVE = "@ts-expect-error";

function attribut(texte) {
  return echapper(texte).replace(/"/g, "&quot;");
}

// Enveloppe un mot expliqué par le glossaire ; un mot nouveau est souligné et atteignable au clavier.
function marquer(mot, html, contexte) {
  if (!contexte || !definition(mot)) return html;
  const nouveau = contexte.nouveau(mot);
  const acces = nouveau ? ' tabindex="0" role="button"' : "";
  return `<span class="mot${nouveau ? " mot-nouveau" : ""}" data-mot="${attribut(mot)}"${acces}>${html}</span>`;
}

function colorerGabarit(texte, contexte) {
  let sortie = "";
  let position = 0;
  for (const m of texte.matchAll(/\$\{([^}]*)\}/g)) {
    sortie += `<span class="t-ch">${echapper(texte.slice(position, m.index))}</span>`;
    sortie += marquer("${", '<span class="t-ch">${</span>', contexte);
    sortie += colorer(m[1], contexte);
    sortie += '<span class="t-ch">}</span>';
    position = m.index + m[0].length;
  }
  return sortie + `<span class="t-ch">${echapper(texte.slice(position))}</span>`;
}

function colorerCommentaire(texte, contexte) {
  const i = texte.indexOf(DIRECTIVE);
  if (i < 0) return `<span class="t-co">${echapper(texte)}</span>`;
  const avant = echapper(texte.slice(0, i));
  const apres = echapper(texte.slice(i + DIRECTIVE.length));
  return `<span class="t-co">${avant}${marquer(DIRECTIVE, DIRECTIVE, contexte)}${apres}</span>`;
}

// contexte (facultatif) : { nouveau(mot) } rend les mots du code explicables au clic.
export function colorer(code, contexte) {
  let sortie = "";
  let position = 0;
  for (const m of code.matchAll(JETONS)) {
    sortie += echapper(code.slice(position, m.index));
    position = m.index + m[0].length;
    const texte = echapper(m[0]);
    if (m[1]) sortie += colorerCommentaire(m[0], contexte);
    else if (m[2]) sortie += marquer(m[0], `<span class="t-ch">${texte}</span>`, contexte);
    else if (m[3]) sortie += colorerGabarit(m[0], contexte);
    else if (m[4]) sortie += marquer(m[0], `<span class="t-ch">${texte}</span>`, contexte);
    else if (m[5]) sortie += `<span class="t-nb">${texte}</span>`;
    else if (m[7]) sortie += marquer(m[0], texte, contexte);
    else if (MOTS_CLES.has(m[0])) sortie += marquer(m[0], `<span class="t-mc">${texte}</span>`, contexte);
    else if (TYPES.has(m[0]) || /^[A-Z]/.test(m[0])) sortie += marquer(m[0], `<span class="t-ty">${texte}</span>`, contexte);
    else sortie += marquer(m[0], texte, contexte);
  }
  return sortie + echapper(code.slice(position));
}

export function blocCode(code, { numeros = false, debut = 1, mots = null } = {}) {
  const lignes = code.split("\n");
  const largeur = numeros
    ? lignes.map((_, i) => `<span class="num-ligne">${debut + i}</span>`)
    : null;
  const html = colorer(code, mots)
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
