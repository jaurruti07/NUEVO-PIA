// data-service-register.js - Registro del Service Worker

// Verificar si el navegador soporta Service Workers
if ('serviceWorker' in navigator) {
  // Ruta del Service Worker (en la raíz para interceptar todos los paths)
  const swPath = '/data-service-worker.js';
  
  // Registrar el Service Worker
  navigator.serviceWorker.register(swPath)
    .then((registration) => {
      console.log('Data Service Worker registrado:', registration.scope);
      
      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'MOCK_DATA_UPDATED') {
          console.log('Datos mock actualizados:', event.data.payload);
        }
      });
    })
    .catch((error) => {
      console.error('Error registrando Service Worker:', error);
    });
  
  // Función para actualizar datos mock (usada desde el módulo administrativo)
  function updateMockData(path, data) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_MOCK_DATA',
        payload: { [path]: data }
      });
    } else {
      // Fallback: guardar en localStorage
      const mockData = JSON.parse(localStorage.getItem('pia_mock_data') || '{}');
      if (data !== undefined) {
        mockData[path] = data;
      } else {
        delete mockData[path];
      }
      localStorage.setItem('pia_mock_data', JSON.stringify(mockData));
    }
  }
  
  // Exponer función globalmente
  window.updateMockData = updateMockData;
