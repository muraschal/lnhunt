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

// Domains, die wir nicht cachen oder behandeln wollen
const SKIP_DOMAINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'vercel.live',
  'hwznode.rapold.io',
  'api.qrserver.com'
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
  
  // Bestimmte URLs überspringen
  const url = new URL(event.request.url);
  
  // Überprüfen, ob die Domain in der Skip-Liste ist
  if (SKIP_DOMAINS.some(domain => url.hostname.includes(domain))) {
    return;
  }
  
  // API-Calls und partielle Anfragen nicht cachen
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Range-Requests (für Audio/Video) nicht cachen
  if (event.request.headers.get('range')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Nur vollständige 200er Antworten cachen
        // Vermeide 206 Partial Content, die den Cache-Fehler verursachen
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Kopie des Responses erstellen
        const responseClone = response.clone();
        
        // Response im Cache speichern (in einem Try-Catch-Block für zusätzliche Sicherheit)
        caches.open(CACHE_NAME)
          .then((cache) => {
            try {
              cache.put(event.request, responseClone);
            } catch (error) {
              console.log('Cache-Fehler vermieden:', error);
            }
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
            if (event.request.headers.get('accept') && 
                event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
            
            return null;
          });
      })
  );
}); 