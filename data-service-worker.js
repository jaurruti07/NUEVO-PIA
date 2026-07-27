url: https://raw.githubusercontent.com/jaurruti07/PIA/main/admin/js/data-service-worker.js

// data-service-worker.js - Service Worker para interceptar solicitudes a JSON
// y redirigirlas al Data Service sin modificar el código frontend

const CACHE_NAME = 'pia-data-cache-v1';
const JSON_PATTERN = //(data_\w+|data\.json|\w+\/data_\w+)\.json$/i;

// Datos mock basados en los JSON actuales (se pueden actualizar desde el módulo admin)
const MOCK_DATA = {
  'data_portal.json': {
    oficinasProbidad: 65,
    canalesDenuncia: 200,
    denunciasPenales: 446,
    plataformasActivas: 8
  },
  'canales-por-la-integridad/data_directorio.json': null,
  'directorio/data_acceso.json': null,
  'gobierno_en_numeros/data_tableros.json': null
};

// Cargar datos mock desde localStorage si existen
function loadMockData() {
  const stored = localStorage.getItem('pia_mock_data');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      Object.assign(MOCK_DATA, data);
    } catch (e) {
      console.error('Error loading mock data:', e);
    }
  }
}

// Guardar datos mock
function saveMockData() {
  localStorage.setItem('pia_mock_data', JSON.stringify(MOCK_DATA));
}

// Obtener configuración de BD para una página
function getDbConfigForPath(path) {
  const stored = localStorage.getItem('pia_db_configurations');
  if (!stored) return null;
  
  try {
    const config = JSON.parse(stored);
    // Extraer el nombre de la página del path
    const pathParts = path.split('/');
    const pageName = pathParts[1] || 'portal';
    
    const dbId = config.pageDatabaseMap[pageName];
    if (!dbId) return null;
    
    return config.databases.find(db => db.id === dbId);
  } catch (e) {
    return null;
  }
}

// Obtener datos para un path
async function getDataForPath(path) {
  // 1. Verificar si hay configuración de BD
  const dbConfig = getDbConfigForPath(path);
  
  if (dbConfig) {
    // TODO: Cuando tengas backend, consultar la BD aquí
    // Por ahora, usamos mock data o el JSON original
    
    // 2. Verificar si hay datos mock configurados
    if (MOCK_DATA[path])
 {
      return MOCK_DATA[path];
    }
  }
  
  // 3. Fallback: cargar del JSON original (sin cambios para el usuario)
  try {
    const response = await fetch(path);
    if (response.ok) {
      const data = await response.json();
      MOCK_DATA[path] = data;
      saveMockData();
      return data;
    }
  } catch (e) {
    console.error('Error fetching original JSON:', e);
  }
  
  // 4. Si todo falla, devolver datos por defecto
  return MOCK_DATA[path] || {};
}

// Evento install
self.addEventListener('install', (event) => {
  console.log('Data Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/data_portal.json',
        '/canales-por-la-integridad/data_directorio.json',
        '/directorio/data_acceso.json',
        '/gobierno_en_numeros/data_tableros.json'
      ]).catch(err => {
        console.log('Cache fallback:', err);
      });
    })
  );
});

// Evento activate
self.addEventListener('activate', (event) => {
  console.log('Data Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Evento fetch - INTERCEPTAR SOLICITUDES A JSON
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;
  
  if (event.request.method === 'GET' && JSON_PATTERN.test(path)) {
    event.respondWith(
      (async () => {
        const data = await getDataForPath(path);
        const response = new Response(JSON.stringify(data), {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        return response;
      })()
    );
  }
});

// Mensajes desde el frontend para actualizar mock data
self.addEventListener('message', (event) => {
  if (event
.data && event.data.type === 'UPDATE_MOCK_DATA') {
    Object.assign(MOCK_DATA, event.data.payload);
    saveMockData();
    
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MOCK_DATA_UPDATED',
            payload: MOCK_DATA
          });
        });
      })
    );
  }
});

// Cargar datos mock al inicio
loadMockData();