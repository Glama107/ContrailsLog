self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Simple network-first strategy for now
  event.respondWith(fetch(event.request).catch(function() {
    return caches.match(event.request);
  }));
});
