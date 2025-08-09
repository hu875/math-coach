const CACHE = 'math-coach-v6';
const ASSETS = [
  '/math-coach/',
  '/math-coach/index.html',
  '/math-coach/manifest.json',
  '/math-coach/icon-192.png',
  '/math-coach/icon-512.png'
];

// 누락된 파일이 있어도 설치가 실패하지 않도록 개별 캐싱 + 무시
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(ASSETS.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (res && res.ok) await cache.put(url, res.clone());
      } catch (_) { /* 파일 없으면 무시 */ }
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // 네비게이션: 네트워크 우선, 실패 시 캐시된 index.html
    if (req.mode === 'navigate') {
      event.respondWith(
        fetch(req).catch(() => caches.match('/math-coach/index.html'))
      );
      return;
    }
    // 정적 자산: 캐시 우선, 없으면 네트워크 후 캐시에 저장
    event.respondWith(
      caches.match(req).then(res => res || fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => res))
    );
  }
});
