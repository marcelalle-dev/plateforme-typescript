// Garde le site sur l'appareil, et signale l'absence de connexion.
// Le mode local reste sans cache pour voir tout de suite les modifications du code.
const LOCAL = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

export function activerHorsLigne() {
  const bandeau = document.getElementById("hors-ligne");
  const actualiser = () => {
    bandeau.hidden = navigator.onLine;
  };
  window.addEventListener("online", actualiser);
  window.addEventListener("offline", actualiser);
  actualiser();

  let forcer = false;
  try {
    forcer = localStorage.getItem("ts50.hors-ligne-local") === "1";
  } catch {
    forcer = false;
  }
  if ("serviceWorker" in navigator && (!LOCAL || forcer)) {
    // Sans ce service, le site fonctionne normalement, mais demande une connexion.
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

export async function pretHorsLigne() {
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return false;
  return (await caches.keys()).some((nom) => nom.startsWith("ts50-site-"));
}
