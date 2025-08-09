const CACHE = 'math-coach-v15';
const ASSETS = [
  '/math-coach/',
  '/math-coach/index.html',
  '/math-coach/manifest.json',
  '/math-coach/icon-192.png',
  '/math-coach/icon-512.png',
  '/math-coach/mascot.png',
  '/math-coach/bg.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache = await caches.open(CACHE);
    for (const url of ASSETS) {
      try { const res = await fetch(url, { cache:'no-cache' }); if(res.ok) await cache.put(url, res.clone()); } catch(_) {}
    }
  })());
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE && caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      event.respondWith(fetch(req).catch(()=>caches.match('/math-coach/index.html')));
      return;
    }
    event.respondWith(
      caches.match(req).then(res => res || fetch(req).then(r=>{
        const copy=r.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); return r;
      }).catch(()=>res))
    );
  }
});
