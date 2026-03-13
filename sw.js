/**
 * Service Worker - SmartPath Cane
 * Strategy: HTML = Network First (never stale), Assets = Cache First
 */
const CACHE_NAME = 'smartpath-cane-v8';
const STATIC_ASSETS = [
  'assets/css/main.css',
  'assets/css/components.css',
  'assets/js/app.js',
  'assets/js/ui.js',
  'assets/js/maps.js',
  'assets/js/auth.js',
  'assets/js/dashboard.js',
  'js/api.js',
  'js/config.js',
  'assets/js/dashboard/overview.js',
  'assets/js/dashboard/devices.js',
  'assets/js/dashboard/locations.js',
  'assets/js/dashboard/alerts.js',
  'assets/js/dashboard/geofences.js',
  'assets/js/dashboard/settings.js',
  'assets/view/dashboard.html',
  'assets/view/overview.html',
  'assets/view/devices.html',
  'assets/view/locations.html',
  'assets/view/alerts.html',
  'assets/view/geofences.html',
  'assets/view/settings.html',
  'assets/images/icon-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

// Install - pre-cache only static assets (NOT index.html or config.js)
self.addEventListener('install', function (event) {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(function (err) {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    })
  );
});

// Activate - clean up old caches immediately
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (name) {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(function () {
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch - Network First for HTML, Cache First for static assets
self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // Only handle http/https
  if (url.indexOf('http') !== 0) return;

  // 1. API Requests: Always Network Only (Don't cache database data in SW)
  if (url.includes('/api/') || url.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. HTML and Navigation: Network First
  const isNav = event.request.mode === 'navigate';
  const isView = url.includes('/assets/view/');

  if (isNav || isView || url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        // Only cache successful standard responses
        if (response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function () {
        // Fallback to cache if offline
        return caches.match(event.request);
      })
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Images): Cache First
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (response) {
        if (!response || response.status !== 200) return response;

        // Cache persistent assets
        if (event.request.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
        }

        return response;
      });
    })
  );
});
