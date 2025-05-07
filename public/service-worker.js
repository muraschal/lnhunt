// Minimaler Service Worker, der nichts tut
self.addEventListener('install', function(event) {
  console.log('Service Worker installiert, tut aber nichts');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker aktiviert, tut aber nichts');
  // Alte Caches löschen
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch-Listener, der nichts cached, sondern alles an das Netzwerk weiterleitet
self.addEventListener('fetch', function(event) {
  // Einfach das Netzwerk verwenden, nichts cachen
  event.respondWith(fetch(event.request));
}); 