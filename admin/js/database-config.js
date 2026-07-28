// database-config.js - Esquema y funciones de configuración de bases de datos JSON homogénes

// Esquema de configuración de base de datos
const DB_CONFIG_SCHEMA = {
  id: '',
  name: '',
  type: 'json_file',
  filePath: '',
  description: '',
  syncMode: 'Realtime JSON Sync',
  pages: []
};

// Clave en localStorage
const STORAGE_KEY = 'pia_db_configurations_v2';

// Configuración inicial con catálogo homogéneo de almacenamiento JSON
function getInitialConfig() {
  const initialDatabases = [
    {
      id: 'db_json_canales',
      name: 'Fichero JSON Directo - Canales por la Integridad',
      type: 'json_file',
      filePath: '/canales-por-la-integridad/data_directorio.json',
      description: 'Base de datos JSON para directorio de denuncias, unidades de integridad y contactos.',
      syncMode: 'Sincronización Atómica JSON',
      pages: ['canales-por-la-integridad']
    },
    {
      id: 'db_json_directorio',
      name: 'Fichero JSON Directo - Directorio Ejecutivo de Acceso',
      type: 'json_file',
      filePath: '/directorio/data_acceso.json',
      description: 'Base de datos JSON con directorio de autoridades, teléfonos e información del Ejecutivo.',
      syncMode: 'Sincronización Atómica JSON',
      pages: ['directorio']
    },
    {
      id: 'db_json_tableros',
      name: 'Fichero JSON Directo - Tu Gobierno en Números',
      type: 'json_file',
      filePath: '/gobierno_en_numeros/data_tableros.json',
      description: 'Almacén estructurado de tableros de rendición de cuentas, proyectos e indicadores.',
      syncMode: 'Sincronización Atómica JSON',
      pages: ['gobierno_en_numeros']
    },
    {
      id: 'db_json_riesgo',
      name: 'Fichero JSON Directo - Riesgo en la Mira',
      type: 'json_file',
      filePath: '/riesgo/datos.json',
      description: 'Almacén de matriz de evaluación de riesgos de corrupción por institución y período.',
      syncMode: 'Sincronización Atómica JSON',
      pages: ['riesgo']
    },
    {
      id: 'db_json_vehiculos',
      name: 'Fichero JSON Directo - Placa Transparente',
      type: 'json_file',
      filePath: '/vehiculos/vehiculos.json',
      description: 'Catálogo e inventario de vehículos oficiales, placas, asignación y estado.',
      syncMode: 'Sincronización Atómica JSON',
      pages: ['vehiculos']
    },
    {
      id: 'db_json_portal',
      name: 'Fichero JSON Directo - Portal Central y Métricas',
      type: 'json_file',
      filePath: '/data_portal.json',
      description: 'Almacén de configuración general del portal, banners, estadísticas y accesos directos.',
      syncMode: 'Sincronización Atómica JSON',
      pages: ['index']
    },
    {
      id: 'db_json_api_engine',
      name: 'Motor de Sincronización REST API & Service Worker',
      type: 'json_api',
      filePath: '/api/raw-json',
      description: 'Servicio API unificado de backend para lectura y escritura JSON en tiempo real con auditoría.',
      syncMode: 'Service Worker Sync Proxy',
      pages: ['canales-por-la-integridad', 'directorio', 'gobierno_en_numeros', 'riesgo', 'vehiculos', 'index']
    }
  ];

  return {
    version: '2.0',
    databases: initialDatabases,
    defaultDatabase: 'db_json_portal',
    pageDatabaseMap: {
      'canales-por-la-integridad': 'db_json_canales',
      'directorio': 'db_json_directorio',
      'gobierno_en_numeros': 'db_json_tableros',
      'riesgo': 'db_json_riesgo',
      'vehiculos': 'db_json_vehiculos',
      'index': 'db_json_portal'
    }
  };
}

// Obtener configuración actual
export function getDbConfig() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = getInitialConfig();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const config = JSON.parse(stored);
    if (!config.databases || !Array.isArray(config.databases) || config.databases.length === 0) {
      const initial = getInitialConfig();
      config.databases = initial.databases;
      if (!config.defaultDatabase) config.defaultDatabase = initial.defaultDatabase;
      if (!config.pageDatabaseMap || Object.keys(config.pageDatabaseMap).length === 0) {
        config.pageDatabaseMap = initial.pageDatabaseMap;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
    return config;
  } catch (e) {
    console.error('Error parsing DB config:', e);
    return getInitialConfig();
  }
}

// Guardar configuración
export function saveDbConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Obtener base de datos para una página
export function getDatabaseForPage(pageName) {
  const config = getDbConfig();
  const dbId = config.pageDatabaseMap[pageName];
  if (!dbId) return null;
  return config.databases.find(db => db.id === dbId);
}

// Obtener todas las bases de datos
export function getAllDatabases() {
  return getDbConfig().databases;
}

// Agregar nueva base de datos
export function addDatabase(dbConfig) {
  const config = getDbConfig();
  const newDb = {
    ...DB_CONFIG_SCHEMA,
    ...dbConfig,
    id: `db_json_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  };
  config.databases.push(newDb);
  saveDbConfig(config);
  return newDb;
}

// Actualizar base de datos
export function updateDatabase(id, updates) {
  const config = getDbConfig();
  const index = config.databases.findIndex(db => db.id === id);
  if (index === -1) throw new Error('Base de datos no encontrada');
  config.databases[index] = { ...config.databases[index], ...updates };
  saveDbConfig(config);
  return config.databases[index];
}

// Eliminar base de datos
export function deleteDatabase(id) {
  const config = getDbConfig();
  const pagesUsingDb = Object.entries(config.pageDatabaseMap)
    .filter(([_, dbId]) => dbId === id)
    .map(([page]) => page);
  
  if (pagesUsingDb.length > 0) {
    throw new Error(`No se puede eliminar: asignada a ${pagesUsingDb.length} página(s): ${pagesUsingDb.join(', ')}`);
  }
  config.databases = config.databases.filter(db => db.id !== id);
  if (config.defaultDatabase === id) {
    config.defaultDatabase = null;
  }
  saveDbConfig(config);
}

// Asignar base de datos a una página
export function assignDatabaseToPage(pageName, dbId) {
  const config = getDbConfig();
  const dbExists = config.databases.some(db => db.id === dbId);
  if (!dbExists) throw new Error('Base de datos no encontrada');
  config.pageDatabaseMap[pageName] = dbId;
  saveDbConfig(config);
}

// Remover asignación
export function removePageAssignment(pageName) {
  const config = getDbConfig();
  delete config.pageDatabaseMap[pageName];
  saveDbConfig(config);
}

// Establecer base de datos por defecto
export function setDefaultDatabase(dbId) {
  const config = getDbConfig();
  const dbExists = config.databases.some(db => db.id === dbId);
  if (!dbExists) throw new Error('Base de datos no encontrada');
  config.defaultDatabase = dbId;
  saveDbConfig(config);
}

// Exportar configuración
export function exportDbConfig() {
  return JSON.stringify(getDbConfig(), null, 2);
}

// Importar configuración
export function importDbConfig(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    if (!imported.databases || !Array.isArray(imported.databases)) {
      throw new Error('Formato inválido: debe contener el arreglo "databases"');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    return true;
  } catch (e) {
    console.error('Error importing DB config:', e);
    return false;
  }
}

// Tipos homogéneos de almacenamiento de bases de datos JSON
export const DB_TYPES = {
  json_file: { 
    name: 'Almacén JSON Directo (Fichero)', 
    icon: 'fa-file-code', 
    fields: ['filePath', 'description'] 
  },
  json_api: { 
    name: 'Motor REST API & Service Worker JSON', 
    icon: 'fa-network-wired', 
    fields: ['filePath', 'description'] 
  },
  json_cluster: { 
    name: 'Cluster Central JSON PIA', 
    icon: 'fa-server', 
    fields: ['filePath', 'description'] 
  }
};

// Validar configuración
export function validateDbConfig(dbConfig) {
  const errors = [];
  if (!dbConfig.name) errors.push('El nombre es requerido');
  if (!dbConfig.filePath) errors.push('La ruta o endpoint de datos JSON es requerida');
  return errors;
}
