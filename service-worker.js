const CACHE = 'math-coach-v4';
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
    // 페이지 탐색은 네트워크 우선, 실패 시 캐시된 index.html
    if (request.mode === 'navigate') {
      event.respondWith(fetch(request).catch(() => caches.match('/math-coach/index.html')));
      return;
    }
    // 정적 자산은 캐시 우선, 없으면 네트워크 후 캐시에 저장
    event.respondWith(
      caches.match(request).then(res => res || fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
        return r;
      }))
    );
  }
});
