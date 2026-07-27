// database-config.js - Esquema y funciones de configuración de bases de datos

// Esquema de configuración de base de datos
const DB_CONFIG_SCHEMA = {
  id: '',
  name: '',
  type: 'postgresql',
  host: '',
  port: 5432,
  database: '',
  username: '',
  password: '',
  ssl: false,
  connectionString: '',
  pages: []
};

// Clave en localStorage
const STORAGE_KEY = 'pia_db_configurations';

// Configuración inicial
function getInitialConfig() {
  return {
    version: '1.0',
    databases: [],
    defaultDatabase: null,
    pageDatabaseMap: {}
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
    return JSON.parse(stored);
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
    id: `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  config.databases.push(newDb);
  saveDbConfig(config);
  return newDb;
}

// Actualizar base de datos
export function updateDatabase(id, updates) {
  const config = getDbConfig();
  const index = config.databases.findIndex(db => db.id === id);
  if (index === -1) throw new Error('Database not found');
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
    throw new Error(`No se puede eliminar: usada por ${pagesUsingDb.length} página(s): ${pagesUsingDb.join(', ')}`);
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
      throw new Error('Formato inválido: debe contener "databases" array');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    return true;
  } catch (e) {
    console.error('Error importing DB config:', e);
    return false;
  }
}

// Tipos de bases de datos
export const DB_TYPES = {
  postgres: { name: 'PostgreSQL', icon: 'fa-database', defaultPort: 5432, fields: ['host', 'port', 'database', 'username', 'password', 'ssl'] },
  mysql: { name: 'MySQL/MariaDB', icon: 'fa-database', defaultPort: 3306, fields: ['host', 'port', 'database', 'username', 'password', 'ssl'] },
  mongodb: { name: 'MongoDB', icon: 'fa-leaf', defaultPort: 27017, fields: ['host', 'port', 'database', 'username', 'password', 'collectionPrefix'] },
  sqlite: { name: 'SQLite', icon: 'fa-file', defaultPort: null, fields: ['filePath'] }
};

// Validar configuración
export function validateDbConfig(dbConfig) {
  const errors = [];
  const typeConfig = DB_TYPES[dbConfig.type];
  if (!typeConfig) {
    errors.push(`Tipo no soportado: ${dbConfig.type}`);
    return errors;
  }
  for (const field of typeConfig.fields) {
    if (field === 'port' && dbConfig.port === null) continue;
    if (!dbConfig[field] && field !== 'password' && field !== 'ssl' && field !== 'collectionPrefix') {
      errors.push(`Campo requerido: ${field}`);
    }
  }
  return errors;
}