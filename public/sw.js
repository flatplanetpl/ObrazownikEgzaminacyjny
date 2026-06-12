/**
 * @file sw.js
 * @description Service worker cache'ujący zbudowaną aplikację i obrazy do działania offline.
 * @dependencies Cache API, Service Worker API
 */

const CACHE_NAME = 'obrazownik-egzaminacyjny-v4';
const STATIC_URLS = [
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-192.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
];
const IMAGE_URLS = Array.from({ length: 129 }, (_, index) => {
  const number = String(index + 2).padStart(3, '0');
  return `images/art_${number}.jpg`;
});

async function appShellUrls() {
  const response = await fetch('index.html', { cache: 'reload' });
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
  return ['.', 'index.html', ...STATIC_URLS, ...assets];
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

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

async function putSuccessfulResponse(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await putSuccessfulResponse(request, response);
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match('index.html')) || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await putSuccessfulResponse(request, response);
  return response;
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
