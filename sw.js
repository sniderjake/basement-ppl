// Bump VERSION whenever any file changes so phones pick up the update.
const VERSION = "bppl-v2";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
  "./img/bpd-0.jpg",  "./img/bpd-1.jpg",  "./img/bss-0.jpg",  "./img/bss-1.jpg",  "./img/calf-0.jpg",  "./img/calf-1.jpg",  "./img/csr-0.jpg",  "./img/csr-1.jpg",  "./img/curl-0.jpg",  "./img/curl-1.jpg",  "./img/dbp-0.jpg",  "./img/dbp-1.jpg",  "./img/fly-0.jpg",  "./img/fly-1.jpg",  "./img/fp-0.jpg",  "./img/fp-1.jpg",  "./img/gob-0.jpg",  "./img/gob-1.jpg",  "./img/ham-0.jpg",  "./img/ham-1.jpg",  "./img/ht-0.jpg",  "./img/ht-1.jpg",  "./img/lat-0.jpg",  "./img/lat-1.jpg",  "./img/ohe-0.jpg",  "./img/ohe-1.jpg",  "./img/ohp-0.jpg",  "./img/ohp-1.jpg",  "./img/push-0.jpg",  "./img/push-1.jpg",  "./img/rdf-0.jpg",  "./img/rdf-1.jpg",  "./img/rdl-0.jpg",  "./img/rdl-1.jpg",  "./img/row-0.jpg",  "./img/row-1.jpg",  "./img/swing-0.jpg",  "./img/swing-1.jpg",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // The page itself: try the network first so updates arrive, fall back to the cached copy offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Everything else (photos, icons, fonts): cached copy first, network as a backup.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
