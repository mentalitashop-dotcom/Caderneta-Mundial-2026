const CACHE_NAME = "caderneta-mundial-2026-v27";
const APP_SHELL = ["/", "/caderneta_mundial_2026.html", "/manifest.webmanifest", "/app-icon.png", "/app-icon-192.png", "/app-icon-512.png", "/icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  event.respondWith(fetch(request).then(response => {
    const clone = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match("/"))));
});



