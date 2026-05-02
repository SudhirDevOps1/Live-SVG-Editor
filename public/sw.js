/* Service Worker for Live SVG Editor — PrivMITLab */
/* Enables offline-first functionality with SPA support */

const CACHE_NAME = 'svg-editor-v3';
const ICON_CACHE = 'svg-editor-icons-v1';
const STATIC_ASSETS = ['/'];

// Install event — cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => Promise.resolve());
    })
  );
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== ICON_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Check if a request is for an icon API
function isIconRequest(url) {
  return (
    url.hostname === 'api.iconify.design' ||
    url.hostname === 'thesvg.org' ||
    url.hostname === 'cdn.simpleicons.org' ||
    url.hostname === 'yesicon.app'
  );
}

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For icon API requests — cache-first (icons don't change)
  if (isIconRequest(url)) {
    event.respondWith(
      caches.open(ICON_CACHE).then((cache) => {
        return cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              cache.put(event.request, clone);
            }
            return response;
          }).catch(() => {
            return new Response('<!-- offline -->', { status: 503, headers: { 'Content-Type': 'text/plain' } });
          });
        });
      })
    );
    return;
  }

  // For navigation requests — network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // For all other requests — cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      return new Response('', { status: 408, statusText: 'Request Timeout' });
    })
  );
});
