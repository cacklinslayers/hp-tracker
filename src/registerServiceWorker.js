export function registerServiceWorker(onUpdate) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          reg.onupdatefound = () => {
            const newWorker = reg.installing;
            newWorker.onstatechange = () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                onUpdate(newWorker);
              }
            };
          };
        })
        .catch((err) => console.log("SW registration failed:", err));
    });
  }
}
