// Service Worker for offline support and caching
const CACHE_NAME = 'labrish-cache-v2';
const STATIC_CACHE_NAME = 'labrish-static-v2';
const RUNTIME_CACHE_NAME = 'labrish-runtime-v2';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/og-image.svg',
  '/robots.txt',
  '/sitemap.xml',
];

const CACHE_MAX_AGE = 86400000;
const CACHE_MAX_ITEMS = 50;

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== RUNTIME_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          const cacheAge = Date.now() - new Date(cachedResponse.headers.get('date') || 0).getTime();
          if (cacheAge < CACHE_MAX_AGE) {
            return cachedResponse;
          }
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(RUNTIME_CACHE_NAME)
              .then(async (cache) => {
                cache.put(request, responseToCache);

                const keys = await cache.keys();
                if (keys.length > CACHE_MAX_ITEMS) {
                  cache.delete(keys[0]);
                }
              });

            return response;
          })
          .catch(() => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processQueuedRequests());
  }
});

async function processQueuedRequests() {
  // This would process any queued requests when back online
  console.log('Processing queued requests...');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.data,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});