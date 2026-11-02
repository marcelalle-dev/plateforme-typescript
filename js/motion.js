// Mouvements de l'interface. Chacun répond à une action ou montre un changement ;
// tous disparaissent si la personne a demandé de réduire les animations.
const reduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const CLE_VAGUE = "ts50.vague-vue";

// Transition entre deux pages : le sens du glissement suit l'ordre de progression.
export function transitionPage(rendre, sens) {
  if (reduit() || !document.startViewTransition) {
    rendre();
    return;
  }
  document.documentElement.dataset.sens = sens;
  document.startViewTransition(rendre);
}

// Le compteur part de zéro, mais le texte final reste exactement celui de la page.
export function compter(element, duree = 650) {
  if (reduit()) return;
  const final = element.textContent;
  const m = /\d+(?:,\d+)?/.exec(final);
  if (!m) return;
  const cible = Number(m[0].replace(",", "."));
  if (cible === 0) return;
  const decimales = (m[0].split(",")[1] ?? "").length;
  element.setAttribute("aria-label", final);
  const debut = performance.now();
  const etape = (t) => {
    if (!element.isConnected) return;
    const avance = Math.min(1, (t - debut) / duree);
    const valeur = cible * (1 - (1 - avance) ** 3);
    const texte = valeur.toFixed(decimales).replace(".", ",");
    element.textContent = final.replace(m[0], texte);
    if (avance < 1) requestAnimationFrame(etape);
    else element.textContent = final;
  };
  requestAnimationFrame(etape);
}

let observateur = null;

function reveler(racine) {
  observateur?.disconnect();
  if (reduit() || !("IntersectionObserver" in window)) return;
  observateur = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (e.isIntersecting) {
        e.target.classList.add("apparu");
        observateur.unobserve(e.target);
      }
    }
  }, { rootMargin: "0px 0px -6% 0px" });
  for (const el of racine.querySelectorAll(".cours > section, .section, .bloc-module, .question, .liste-ex > li")) {
    el.classList.add("a-reveler");
    observateur.observe(el);
  }
}

// La vague de l'accueil n'est jouée qu'une fois par visite : elle ne doit pas lasser.
function vagueGrille(racine) {
  const grille = racine.querySelector(".accueil .grille");
  if (!grille || reduit()) return;
  try {
    if (sessionStorage.getItem(CLE_VAGUE)) return;
    // Noté à la fin seulement : si la page est redessinée entre-temps, la vague repart.
    setTimeout(() => sessionStorage.setItem(CLE_VAGUE, "1"), 1200);
  } catch {
    // Sans stockage, la vague est simplement rejouée.
  }
  [...grille.children].forEach((c, i) => c.style.setProperty("--i", String((i % 10) + Math.floor(i / 10))));
  grille.classList.add("vague");
}

export function apresRendu(racine) {
  reveler(racine);
  vagueGrille(racine);
  for (const c of racine.querySelectorAll(".chiffre strong")) compter(c);
}

// Le score monte ; une validation ajoute une courte gerbe de cases aux couleurs de la grille.
export function animerResultat(zone, valide) {
  const note = zone.querySelector(".note-sur");
  if (!note || reduit()) return;
  compter(note, 800);
  note.parentElement.classList.add("resultat-entre");
  if (!valide) return;
  const gerbe = document.createElement("div");
  gerbe.className = "gerbe";
  gerbe.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 18; i += 1) {
    const angle = (i / 18) * Math.PI * 2;
    const distance = 90 + (i % 3) * 45;
    const c = document.createElement("i");
    c.style.setProperty("--x", `${Math.round(Math.cos(angle) * distance)}px`);
    c.style.setProperty("--y", `${Math.round(Math.sin(angle) * distance)}px`);
    c.style.setProperty("--d", `${(i % 4) * 30}ms`);
    if (i % 3 === 0) c.dataset.teinte = "ts";
    gerbe.append(c);
  }
  note.parentElement.append(gerbe);
  setTimeout(() => gerbe.remove(), 1200);
}
