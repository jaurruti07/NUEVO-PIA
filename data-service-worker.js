// data-service-worker.js - Service Worker para offline-first y carga rapida

const STATIC_CACHE = 'pia-static-v6';
const DYNAMIC_CACHE = 'pia-dynamic-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/directorio/',
  '/directorio/index.html',
  '/vehiculos/',
  '/vehiculos/index.html',
  '/canales-por-la-integridad/',
  '/canales-por-la-integridad/index.html',
  '/gobierno_en_numeros/',
  '/gobierno_en_numeros/index.html',
  '/riesgo/',
  '/riesgo/index.html',
  '/css/pia-chatbot.css',
  '/js/pia-chatbot.js',
  '/js/sw-register.js',
  '/data_portal.json',
  '/canales-por-la-integridad/data_directorio.json',
  '/directorio/data_acceso.json',
  '/gobierno_en_numeros/data_tableros.json',
  '/vehiculos/vehiculos.json',
  '/riesgo/datos.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Cacheando assets estaticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== STATIC_CACHE && name !== DYNAMIC_CACHE) {
            console.log('[SW] Borrando cache antigua:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a APIs externas si no queremos cachearlas (ej: gemini) o admin
  if (event.request.url.includes('/api/') || event.request.url.includes('/admin/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retornamos del cache inmediatamente
        // y actualizamos el cache en background (Stale-While-Revalidate)
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && !networkResponse.redirected) {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' || networkResponse.redirected) {
            return networkResponse;
          }
          // Guardamos en cache dinamico para usos futuros
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Fallback en modo offline
        });
    })
  );
});
