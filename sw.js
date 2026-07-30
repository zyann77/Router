const CACHE_NAME = 'tarik-perangkat-v1';
const urlsToCache = ['/', '/login.html', '/dashboard.html', '/admin.html', '/teknisi.html', '/detail.html', '/assets/css/style.css', '/assets/js/app.js', '/config.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
