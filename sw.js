const SC = 'sharecode=SBB6EUCR4K';
const CACHE_NAME = 'crossfit-wod-v31';
const ASSETS = ['./?'+SC, './index.html?'+SC, './crossfit-offline.html?'+SC, './manifest.json?'+SC, './icon-192.png?'+SC, './icon-512.png?'+SC, './icon-180.png?'+SC];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        }
        // 托管平台对不带 sharecode 的请求返回 403 页面：导航时回退到缓存的应用页
        if (response && !response.ok && event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
