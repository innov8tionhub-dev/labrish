/**
 * Offline support and service worker management
 */
import React from 'react';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retries: number;
}

class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private requestQueue: QueuedRequest[] = [];
  private maxQueueSize: number = 50;
  private maxRetries: number = 3;

  constructor() {
    this.setupEventListeners();
    this.loadQueueFromStorage();
    this.processQueue();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem('offline_request_queue');
      if (stored) {
        this.requestQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('offline_request_queue', JSON.stringify(this.requestQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  queueRequest(
    url: string,
    method: string = 'GET',
    headers: Record<string, string> = {},
    body?: string
  ): string {
    const request: QueuedRequest = {
      id: crypto.randomUUID(),
      url,
      method,
      headers,
      body,
      timestamp: Date.now(),
      retries: 0,
    };

    this.requestQueue.push(request);

    // Limit queue size
    if (this.requestQueue.length > this.maxQueueSize) {
      this.requestQueue.shift();
    }

    this.saveQueueToStorage();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return request.id;
  }

  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.requestQueue.length === 0) return;

    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of requests) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });

        // Request succeeded, remove from queue
        console.log(`Offline request processed: ${request.id}`);
      } catch (error) {
        request.retries++;

        if (request.retries < this.maxRetries) {
          // Re-queue for retry
          this.requestQueue.push(request);
        } else {
          console.error(`Failed to process offline request after ${this.maxRetries} retries:`, error);
        }
      }
    }

    this.saveQueueToStorage();
  }

  getQueueSize(): number {
    return this.requestQueue.length;
  }

  clearQueue(): void {
    this.requestQueue = [];
    this.saveQueueToStorage();
  }

  isOffline(): boolean {
    return !this.isOnline;
  }
}

// Cache management for offline content
class CacheManager {
  private cacheName: string = 'labrish-cache-v1';
  private maxCacheSize: number = 50 * 1024 * 1024; // 50MB

  async cacheResource(url: string, response: Response): Promise<void> {
    try {
      const cache = await caches.open(this.cacheName);
      await cache.put(url, response.clone());
      await this.enforceMaxCacheSize();
    } catch (error) {
      console.error('Failed to cache resource:', error);
    }
  }

  async getCachedResource(url: string): Promise<Response | undefined> {
    try {
      const cache = await caches.open(this.cacheName);
      return await cache.match(url);
    } catch (error) {
      console.error('Failed to get cached resource:', error);
      return undefined;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await caches.delete(this.cacheName);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  private async enforceMaxCacheSize(): Promise<void> {
    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      
      let totalSize = 0;
      const sizePromises = keys.map(async (request) => {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          return { request, size: blob.size };
        }
        return { request, size: 0 };
      });

      const sizes = await Promise.all(sizePromises);
      totalSize = sizes.reduce((sum, item) => sum + item.size, 0);

      if (totalSize > this.maxCacheSize) {
        // Sort by size and remove largest items first
        sizes.sort((a, b) => b.size - a.size);
        
        for (const item of sizes) {
          if (totalSize <= this.maxCacheSize) break;
          
          await cache.delete(item.request);
          totalSize -= item.size;
        }
      }
    } catch (error) {
      console.error('Failed to enforce cache size limit:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const cache = await caches.open(this.cacheName);
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
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }
}

// Check if we're in a supported environment
const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator && !window.location.hostname.includes('stackblitz');
};

// Service worker registration with environment detection
export const registerServiceWorker = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    console.log('Service Worker not supported in this environment');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('New version available');
            // You could show a notification to the user here
          }
        });
      }
    });
  } catch (error) {
    console.warn('Service Worker registration failed:', error);
  }
};

// Export instances
export const offlineManager = new OfflineManager();
export const cacheManager = new CacheManager();

// React hook for offline status
export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [queueSize, setQueueSize] = React.useState(offlineManager.getQueueSize());

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update queue size periodically
    const interval = setInterval(() => {
      setQueueSize(offlineManager.getQueueSize());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    queueSize,
    queueRequest: offlineManager.queueRequest.bind(offlineManager),
    clearQueue: offlineManager.clearQueue.bind(offlineManager),
  };
};