const CACHE_NAME = 'atoz-cache-v3';
const URLS_TO_CACHE = [
  '/public/assets/css/base/variables.css',
  '/public/assets/js/api/api.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Suppress errors during caching to prevent infinite retries
      return Promise.allSettled(URLS_TO_CACHE.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  // Ignore API requests
  if (event.request.url.includes('/api/')) return;
  // Ignore browser extensions and non-http schemes
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cache successful responses for assets
          if (fetchRes.ok && event.request.url.includes('/public/assets/')) {
            cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(err => {
      console.error('SW fetch failed:', err);
    })
  );
});
