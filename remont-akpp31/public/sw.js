const CACHE_NAME = 'akpp-admin-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through to network for live data
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
