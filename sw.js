const CACHE_NAME = 'harcama-takip-v5.9';
const urlsToCache = [
  './index.html',
  './harcama-ekle.html',
  './harcama-listesi.html',
  './hesaplar.html',
  './aylik-ozet.html',
  './veri-yonetimi.html',
  './manifest.json'
];

// Service Worker kurulumu
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting(); // Yeni SW'yi hemen aktif yap
      })
      .catch(function(error) {
        console.error('Service Worker: Cache error', error);
      })
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim(); // Yeni SW'yi hemen kontrol et
    })
  );
});

// Network isteklerini yakala
self.addEventListener('fetch', function(event) {
  // Sadece GET isteklerini cache'le
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache buster parametreli dosyalar için network-first stratejisi
  const url = new URL(event.request.url);
  const hasVersionParam = url.searchParams.has('v');
  
  if (hasVersionParam) {
    // CSS/JS dosyaları için network-first
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // Network'den başarıyla alındı, cache'e kaydet
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(function() {
          // Network başarısız, cache'den dön
          return caches.match(event.request);
        })
    );
  } else {
    // HTML sayfaları için cache-first
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache'de varsa cache'den döndür
          if (response) {
            console.log('Service Worker: Serving from cache', event.request.url);
            return response;
          }

          // Cache'de yoksa network'den getir
          console.log('Service Worker: Fetching from network', event.request.url);
          return fetch(event.request).then(function(response) {
            // Geçerli cevap kontrolü
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cevabı cache'e ekle
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }).catch(function(error) {
            console.error('Service Worker: Fetch failed', error);
            
            // Offline durumunda ana sayfayı döndür
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // Offline mesajı göster
            return new Response('Offline - İnternet bağlantınızı kontrol edin', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        })
    );
  }
});

// Background Sync - Offline durumunda yapılan değişiklikleri sync et
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Burada offline durumunda yapılan değişiklikleri sync edebiliriz
      console.log('Service Worker: Performing background sync')
    );
  }
});

// Push bildirimler
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'Yeni bir bildirim var!',
    icon: './manifest.json',
    badge: './manifest.json',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Uygulamayı Aç',
        icon: './manifest.json'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: './manifest.json'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Harcama Takip', options)
  );
});

// Bildirime tıklama
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./kredi_karti_takip.html')
    );
  }
});

// Hata yakalama
self.addEventListener('error', function(event) {
  console.error('Service Worker error:', event.error);
});

// Unhandled rejection yakalama
self.addEventListener('unhandledrejection', function(event) {
  console.error('Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});