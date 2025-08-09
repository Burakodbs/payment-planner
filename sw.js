// Modern Service Worker with Smart Caching v2.0

// Cache versioning
const CACHE_VERSION = '2024-01-06';
const CACHE_NAME = `harcama-takip-${CACHE_VERSION}`;

// Development mode detection
const isDevMode = () => {
  const hostname = self.location.hostname;
  return hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    self.location.port === '8000' ||
    self.location.port === '3000';
};

// Cache strategies
const STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

// Resource categorization with strategies
const getResourceStrategy = (url) => {
  const pathname = new URL(url).pathname;

  // Development mode - always network first for JS/CSS
  if (isDevMode()) {
    if (pathname.endsWith('.js') || pathname.endsWith('.css')) {
      return STRATEGIES.NETWORK_ONLY;
    }
    if (pathname.endsWith('.html') || pathname === '/') {
      return STRATEGIES.NETWORK_FIRST;
    }
  }

  // Production strategies
  if (pathname.endsWith('.html') || pathname === '/') {
    return STRATEGIES.NETWORK_FIRST;
  } else if (pathname.endsWith('.css') || pathname.endsWith('.js')) {
    return STRATEGIES.STALE_WHILE_REVALIDATE;
  } else if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
    return STRATEGIES.CACHE_FIRST;
  } else if (pathname.includes('api') || pathname.includes('data')) {
    return STRATEGIES.NETWORK_FIRST;
  }

  return STRATEGIES.NETWORK_FIRST; // Default
};

// Essential files to cache
const ESSENTIAL_FILES = [
  './',
  './index.html',
  './harcama-ekle.html',
  './harcama-listesi.html',
  './hesaplar.html',
  './aylik-ozet.html',
  './veri-yonetimi.html',
  './manifest.json',
  './assets/css/variables.css',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/utilities.css',
  './assets/css/auth.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'
];

// Install event
self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching essential files...');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('❌ Installation failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Cleanup old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
      .then(() => {
        console.log('✅ Service Worker activated successfully');
      })
  );
});

// Fetch event with smart strategies
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip non-same-origin requests except CDN
  if (url.origin !== location.origin && !url.href.includes('cdn.jsdelivr.net')) {
    return;
  }

  const strategy = getResourceStrategy(event.request.url);
  event.respondWith(handleRequest(event.request, strategy));
});

// Request handling based on strategy
async function handleRequest(request, strategy) {
  const url = new URL(request.url);

  // Check for cache-busting parameters
  const hasCacheBuster = url.searchParams.has('t') ||
    url.searchParams.has('v') ||
    url.searchParams.has('_t');

  if (hasCacheBuster || isDevMode()) {
    return handleNetworkFirst(request);
  }

  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request);
    case STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request);
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      return handleStaleWhileRevalidate(request);
    case STRATEGIES.NETWORK_ONLY:
      return handleNetworkOnly(request);
    default:
      return handleNetworkFirst(request);
  }
}

// Cache-first strategy
async function handleCacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache-first failed:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('./index.html') ||
        new Response('Offline - Please check your connection', { status: 503 });
    }

    return new Response('Offline', { status: 503 });
  }
}

// Network-only strategy (for development)
async function handleNetworkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('Network-only failed:', request.url);
    return new Response('Network Error', { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  // Start background fetch
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(error => {
    console.log('Background fetch failed:', request.url);
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Wait for network if no cached version
  try {
    return await fetchPromise;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Handle update notifications
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'expense-sync') {
    event.waitUntil(
      // Handle offline expense sync here
      Promise.resolve()
    );
  }
});

console.log('🎯 Modern Service Worker loaded successfully');
console.log('📊 Development mode:', isDevMode());
console.log('🏷️ Cache version:', CACHE_VERSION);