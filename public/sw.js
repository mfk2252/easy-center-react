// Offline-first service worker: caches the app shell so the SPA itself can
// open with zero connectivity, using stale-while-revalidate for assets and
// network-first-with-cache-fallback for navigation. Firebase/Firestore
// traffic is deliberately left untouched — the Firestore SDK manages its
// own offline queue/retry via its persistent IndexedDB cache.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `easycenter-shell-${CACHE_VERSION}`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isRemoteApiRequest(url) {
  return /firestore\.googleapis\.com|googleapis\.com|firebaseio\.com|accounts\.google\.com|gstatic\.com\/firebasejs|apis\.google\.com/.test(url);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept non-GET requests (Firestore writes, auth POSTs, etc.)
  if (request.method !== 'GET') return;

  const url = request.url;

  // Let all Firebase/Google network traffic go straight to the network —
  // the Firestore SDK's own persistent cache handles offline retry for this.
  if (isRemoteApiRequest(url)) return;

  // SPA navigation: network-first, falling back to the cached shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Same-origin static assets (built JS/CSS/images/fonts): stale-while-revalidate
  // so repeat visits work fully offline and stay reasonably fresh when online.
  if (url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((resp) => {
              if (resp && resp.ok) cache.put(request, resp.clone());
              return resp;
            })
            .catch(() => cached);
          return cached || network;
        })
      )
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
