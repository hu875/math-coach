const CACHE = 'math-coach-v1';
const ASSETS = [
  '/math-coach/',
  '/math-coach/index.html',
  '/math-coach/manifest.json'
  // 아이콘을 추가하면 아래 두 줄도 함께 넣으세요:
  // '/math-coach/icon-192.png',
  // '/math-coach/icon-512.png'
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

  // 동일 출처만 처리
  if (url.origin === self.location.origin) {
    // 네비게이션 요청: 네트워크 우선, 실패 시 index.html
    if (request.mode === 'navigate') {
      event.respondWith(fetch(request).catch(() => caches.match('/math-coach/index.html')));
      return;
    }
    // 정적 자산: 캐시 우선, 없으면 가져와 캐시에 저장
    event.respondWith(
      caches.match(request).then(res => res || fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
        return r;
      }))
    );
  }
});
