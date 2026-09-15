// StreamNL – Service Worker v2026
const CACHE = "streamnl-v2";
const ASSETS = ["./index.html","./manifest.json","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: probeer altijd de laatste versie op te halen zolang er
// internet is. De cache is puur een terugval voor als je offline bent.
// Zo hoeft CACHE hierboven nooit meer handmatig verhoogd te worden om
// een update te zien doorkomen.
self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (url.includes("anthropic.com") || url.includes("googleapis.com") ||
      url.includes("fonts.gstatic.com")) return;
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
