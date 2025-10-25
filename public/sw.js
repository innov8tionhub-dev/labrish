// Enhanced Service Worker for offline support, audio caching, and background sync
const CACHE_VERSION = 'v3';
const CACHE_NAME = `labrish-cache-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `labrish-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `labrish-runtime-${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `labrish-audio-${CACHE_VERSION}`;

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/og-image.svg',
  '/robots.txt',
  '/sitemap.xml',
];

const CACHE_MAX_AGE = 86400000; // 24 hours
const CACHE_MAX_ITEMS = 50;
const AUDIO_CACHE_MAX_ITEMS = 100;
const AUDIO_CACHE_MAX_SIZE = 100 * 1024 * 1024; // 100MB

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
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper to determine if request is for audio
function isAudioRequest(request) {
  const url = new URL(request.url);
  const contentType = request.headers.get('accept') || '';
  return contentType.includes('audio') ||
         url.pathname.endsWith('.mp3') ||
         url.pathname.endsWith('.wav') ||
         url.pathname.endsWith('.m4a') ||
         url.pathname.includes('/audio/');
}

// Helper to get cache size
async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  let totalSize = 0;

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }

  return totalSize;
}

// Helper to manage audio cache size
async function manageAudioCacheSize() {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const keys = await cache.keys();

  if (keys.length > AUDIO_CACHE_MAX_ITEMS) {
    // Remove oldest items
    const itemsToRemove = keys.length - AUDIO_CACHE_MAX_ITEMS;
    for (let i = 0; i < itemsToRemove; i++) {
      await cache.delete(keys[i]);
    }
  }

  // Check total size
  const totalSize = await getCacheSize(AUDIO_CACHE_NAME);
  if (totalSize > AUDIO_CACHE_MAX_SIZE) {
    // Remove items until under limit
    let currentSize = totalSize;
    let index = 0;

    while (currentSize > AUDIO_CACHE_MAX_SIZE && index < keys.length) {
      const response = await cache.match(keys[index]);
      if (response) {
        const blob = await response.blob();
        currentSize -= blob.size;
        await cache.delete(keys[index]);
      }
      index++;
    }
  }
}

// Fetch event - enhanced with audio caching
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle audio requests with dedicated caching strategy
  if (isAudioRequest(request)) {
    event.respondWith(
      caches.match(request, { cacheName: AUDIO_CACHE_NAME })
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Serving audio from cache:', request.url);
            return cachedResponse;
          }

          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200) {
                return response;
              }

              const responseToCache = response.clone();

              caches.open(AUDIO_CACHE_NAME)
                .then(async (cache) => {
                  await cache.put(request, responseToCache);
                  await manageAudioCacheSize();
                })
                .catch(err => console.error('Error caching audio:', err));

              return response;
            })
            .catch(() => {
              // Return cached version if available
              return cachedResponse || new Response('Audio unavailable offline', { status: 503 });
            });
        })
    );
    return;
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle other requests with network-first strategy
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
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(processOfflineQueue());
  }

  if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedback());
  }

  if (event.tag === 'sync-stories') {
    event.waitUntil(syncStories());
  }
});

async function processOfflineQueue() {
  console.log('Processing offline queue...');

  try {
    // Get queued items from IndexedDB
    const queueItems = await getQueuedItems();

    for (const item of queueItems) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });

        if (response.ok) {
          await removeFromQueue(item.id);
          console.log('Successfully synced:', item.url);
        }
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }
  } catch (error) {
    console.error('Error processing offline queue:', error);
  }
}

async function syncFeedback() {
  console.log('Syncing feedback...');
}

async function syncStories() {
  console.log('Syncing stories...');
}

// Helper functions for IndexedDB queue management
async function getQueuedItems() {
  // This would interface with IndexedDB
  return [];
}

async function removeFromQueue(id) {
  // This would remove from IndexedDB
  console.log('Removing from queue:', id);
}

// Message handler for manual cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    const { url } = event.data;
    caches.open(AUDIO_CACHE_NAME)
      .then(cache => fetch(url)
        .then(response => {
          if (response.ok) {
            cache.put(url, response.clone());
            event.ports[0].postMessage({ success: true });
          } else {
            event.ports[0].postMessage({ success: false, error: 'Failed to fetch audio' });
          }
        })
        .catch(error => {
          event.ports[0].postMessage({ success: false, error: error.message });
        })
      );
  }

  if (event.data && event.data.type === 'DELETE_CACHED_AUDIO') {
    const { url } = event.data;
    caches.open(AUDIO_CACHE_NAME)
      .then(cache => cache.delete(url)
        .then(() => event.ports[0].postMessage({ success: true }))
      )
      .catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }

  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    Promise.all([
      getCacheSize(AUDIO_CACHE_NAME),
      caches.open(AUDIO_CACHE_NAME).then(cache => cache.keys())
    ])
    .then(([size, keys]) => {
      event.ports[0].postMessage({
        success: true,
        data: {
          size,
          count: keys.length,
          maxSize: AUDIO_CACHE_MAX_SIZE,
          maxItems: AUDIO_CACHE_MAX_ITEMS
        }
      });
    })
    .catch(error => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    const { cacheName } = event.data;
    caches.delete(cacheName || AUDIO_CACHE_NAME)
      .then(() => event.ports[0].postMessage({ success: true }))
      .catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/og-image.svg',
      badge: '/og-image.svg',
      data: data.data,
      actions: data.actions || [],
      vibrate: [200, 100, 200],
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action button clicks
    console.log('Notification action clicked:', event.action);
  }

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
