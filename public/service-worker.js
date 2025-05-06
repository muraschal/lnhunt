// Service Worker für LNHunt PWA
const CACHE_NAME = 'lnhunt-cache-v1';

// Assets, die beim installieren des Service Workers gecached werden sollen
const PRECACHE_ASSETS = [
  '/',
  '/index.js',
  '/manifest.json',
  '/logos/LNHunt_favicon.ico',
  '/logos/LNHunt_android-chrome-192x192.png',
  '/logos/LNHunt_android-chrome-512x512.png',
  '/audio/success.mp3',
  '/audio/success2.mp3',
  '/audio/fail.mp3',
  '/audio/qr.mp3'
];

// Installation Event - Cache wichtige Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geöffnet');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation Event - Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-first Strategie mit Fallback auf Cache
self.addEventListener('fetch', (event) => {
  // Nur GET Requests bearbeiten
  if (event.request.method !== 'GET') return;
  
  // API-Calls nicht cachen
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Kopie des Responses erstellen
        const responseClone = response.clone();
        
        // Response im Cache speichern
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
          
        return response;
      })
      .catch(() => {
        // Wenn Netzwerkanfrage fehlschlägt, aus dem Cache bedienen
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Wenn kein Cache für diese URL existiert, Offline-Seite zurückgeben
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
          });
      })
  );
}); 