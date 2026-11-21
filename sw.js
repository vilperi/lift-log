// Bump CACHE (for example to 'lift-log-2.4') when you change any file, so phones pick up the update.
const CACHE = 'lift-log-2.3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'xlsx.full.min.js', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cached copy first (works offline), refreshed in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request)
          .then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
