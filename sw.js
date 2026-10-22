// Offline cache for the kiosk. VERSION is stamped with the commit SHA on every deploy
// (see .github/workflows/deploy.yml), which is what makes installed iPads pick up updates.
const VERSION = "dev";
const CACHE = `rc-kiosk-${VERSION}`;

const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "content.js",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "assets/fonts/dm-sans-latin-wght-normal.woff2",
  "assets/fonts/dm-sans-latin-wght-italic.woff2",
  "assets/img/mvp.jpg",
  "assets/img/ringcx.jpg",
  "assets/img/video.jpg",
  "assets/img/workspace.jpg",
  "assets/img/laptop-orange.jpg",
  "assets/img/laptop-steps.jpg",
  "assets/img/laptop-peach.jpg",
  "assets/img/arc-a.svg",
  "assets/img/arc-b.svg",
  "assets/img/arc-c.svg",
  "assets/img/arc-d.svg",
  "assets/img/curve.svg",
  "assets/img/card-swoosh.svg",
  "assets/icons/logo-white.svg",
  "assets/icons/logo-mint.svg",
  "assets/icons/close.svg",
  "assets/icons/caret-down.svg",
  "assets/icons/nav-dropdown.svg",
  "assets/icons/util-dropdown.svg",
  "assets/icons/search.svg",
  "assets/icons/chevron-left.svg",
  "assets/icons/chevron-right.svg",
  "assets/icons/edit.svg",
  "assets/icons/share.svg",
  "assets/icons/calendar.svg",
  "assets/icons/phone.svg",
  "assets/icons/back-arrow.svg",
  "assets/icons/view-all.svg",
  "assets/icons/world.svg",
  "assets/icons/f-mic.svg",
  "assets/icons/f-device.svg",
  "assets/icons/f-grid.svg",
  "assets/icons/f-wave.svg",
  "assets/icons/f-headset.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("rc-kiosk-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first: the kiosk runs entirely from the cache and never depends on booth Wi-Fi.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      if (req.mode === "navigate") return caches.match("index.html");
      return fetch(req);
    })
  );
});
