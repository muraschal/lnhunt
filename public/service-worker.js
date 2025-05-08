// Deaktivierter Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Alles löschen
  event.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.map(key => caches.delete(key)));
  }));
});

// Keine Fetch-Handler - lässt den Browser alles normal laden 