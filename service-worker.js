const CACHE = 'math-coach-v3';
const ASSETS = [
  '/math-coach/',
  '/math-coach/index.html',
  '/math-coach/manifest.json',
  '/math-coach/icon-192.png',
  '/math-coach/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(fetch(request).catch(() => caches.match('/math-coach/index.html')));
      return;
    }
    event.respondWith(
      caches.match(request).then(res => res || fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
        return r;
      }))
    );
  }
});
