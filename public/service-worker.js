// Leerer Service Worker, der sich sofort selbst deregistriert
self.addEventListener('install', function(event) {
  console.log('Leerer Service Worker wird installiert');
  self.skipWaiting();
  
  // Sofort selbst deregistrieren
  self.registration.unregister()
    .then(function() {
      console.log('Service Worker hat sich selbst deregistriert');
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach(function(client) {
        if (client.navigate && client.url) {
          client.navigate(client.url);
        }
      });
    });
});

// Keine weiteren Event-Handler, tut absolut nichts 