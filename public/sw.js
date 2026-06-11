/**
 * @file sw.js
 * @description Service worker cache'ujący zbudowaną aplikację i obrazy do działania offline.
 * @dependencies Cache API, Service Worker API
 */

const CACHE_NAME = 'obrazownik-egzaminacyjny-v2';
const IMAGE_URLS = Array.from({ length: 129 }, (_, index) => {
  const number = String(index + 2).padStart(3, '0');
  return `images/art_${number}.jpg`;
});

async function appShellUrls() {
  const response = await fetch('index.html', { cache: 'reload' });
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
  return ['.', 'index.html', ...assets];
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      const shell = await appShellUrls();
      await cache.addAll(shell);
      await Promise.all(
        IMAGE_URLS.map(url =>
          cache.add(url).catch(() => {
            // Brak jednego pliku obrazu nie powinien blokować instalacji cache.
          }),
        ),
      );
      await self.skipWaiting();
    }),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
