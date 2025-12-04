const CACHE_NAME = "hp-tracker-v1";
const FILES_TO_CACHE = [
  "/", // Start document
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/styles.css",

  // Icons
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  // Nieuwe versie direct klaarzetten
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );

  // Claim direct controle over alle clients
  clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // Wanneer het een HTML-pagina is → toon offline fallback
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/offline.html");
          }

          // Voor alles anders → geef gecachte versie (indien aanwezig)
          return cached;
        })
      );
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
