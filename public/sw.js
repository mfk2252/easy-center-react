// Service Worker بسيط - لا يخزن أي شيء
// يتأكد من حذف الكاش القديم

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// لا يخزن أي شيء - كل شيء من الشبكة
self.addEventListener('fetch', e => {
  // لا تفعل شيئاً - اتركه يمر للشبكة مباشرة
  return;
});
