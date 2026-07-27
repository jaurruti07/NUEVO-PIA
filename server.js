import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Audit Log File Path
const AUDIT_FILE = path.join(__dirname, 'audit_logs.json');

// Helper to read audit log
function getAuditLogs() {
  try {
    if (!fs.existsSync(AUDIT_FILE)) return [];
    const content = fs.readFileSync(AUDIT_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading audit logs:', err);
    return [];
  }
}

// Helper to save audit log
function saveAuditLogs(logs) {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing audit logs:', err);
    return false;
  }
}

// Function to record an audit entry
function logAudit({
  user = 'admin',
  userId = '1',
  action = 'INSPECCIÓN',
  module = 'general',
  target = '',
  recordId = null,
  details = '',
  previousValue = null,
  newValue = null,
  ip = '127.0.0.1'
}) {
  const logs = getAuditLogs();
  const entry = {
    id: logs.length > 0 ? Math.max(...logs.map(l => Number(l.id) || 0)) + 1 : 1,
    userId,
    user,
    action,
    module,
    target: target || module,
    recordId,
    details,
    previousValue,
    newValue,
    timestamp: new Date().toISOString(),
    ip
  };

  logs.unshift(entry);
  // Keep up to 500 audit records
  if (logs.length > 500) logs.pop();

  saveAuditLogs(logs);
  return entry;
}

// Module to File Mapping
const MODULE_FILE_MAP = {
  canales: path.join(__dirname, 'canales-por-la-integridad', 'data_directorio.json'),
  'canales-por-la-integridad': path.join(__dirname, 'canales-por-la-integridad', 'data_directorio.json'),
  directorio: path.join(__dirname, 'directorio', 'data_acceso.json'),
  tableros: path.join(__dirname, 'gobierno_en_numeros', 'data_tableros.json'),
  gobierno_en_numeros: path.join(__dirname, 'gobierno_en_numeros', 'data_tableros.json'),
  riesgo: path.join(__dirname, 'riesgo', 'datos.json'),
  vehiculos: path.join(__dirname, 'vehiculos', 'vehiculos.json'),
  portal: path.join(__dirname, 'data_portal.json')
};

// Helper to read JSON file
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return null;
  }
}

// Helper to write JSON file
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Helper to normalize data list for a module
function getModuleRecords(module) {
  const filePath = MODULE_FILE_MAP[module];
  if (!filePath) throw new Error(`Módulo '${module}' no reconocido`);

  const data = readJsonFile(filePath);
  if (!data) return [];

  if (module === 'riesgo') {
    if (data.years && data.years['2025'] && Array.isArray(data.years['2025'].instituciones)) {
      return data.years['2025'].instituciones.map((item, index) => ({
        id: item.id || (index + 1),
        ...item
      }));
    }
    return [];
  }

  if (module === 'vehiculos') {
    if (data && Array.isArray(data.vehicles)) {
      return data.vehicles.map((item, index) => ({
        id: item.id || (index + 1),
        ...item
      }));
    } else if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: item.id || (index + 1),
        ...item
      }));
    }
    return [];
  }

  if (module === 'portal') {
    return [{ id: 1, ...data }];
  }

  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      id: item.id || (index + 1),
      ...item
    }));
  }

  return [];
}

// Helper to save module records back to JSON file
function saveModuleRecords(module, records) {
  const filePath = MODULE_FILE_MAP[module];
  if (!filePath) throw new Error(`Módulo '${module}' no reconocido`);

  if (module === 'riesgo') {
    let fullData = readJsonFile(filePath) || { years: { "2025": { instituciones: [] } } };
    if (!fullData.years) fullData.years = {};
    if (!fullData.years['2025']) fullData.years['2025'] = { instituciones: [] };
    fullData.years['2025'].instituciones = records;
    return writeJsonFile(filePath, fullData);
  }

  if (module === 'vehiculos') {
    let fullData = readJsonFile(filePath);
    if (!fullData || typeof fullData !== 'object' || Array.isArray(fullData)) {
      fullData = { catalogInstituciones: [], vehicles: [] };
    }
    if (!fullData.catalogInstituciones) fullData.catalogInstituciones = [];
    fullData.vehicles = records;
    return writeJsonFile(filePath, fullData);
  }

  if (module === 'portal') {
    const singleRecord = records[0] || {};
    const { id, ...portalData } = singleRecord;
    return writeJsonFile(filePath, portalData);
  }

  return writeJsonFile(filePath, records);
}

// Disable caching for JSON data files
app.use((req, res, next) => {
  if (req.url.endsWith('.json')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Initialize initial audit log if empty
if (getAuditLogs().length === 0) {
  logAudit({
    user: 'admin',
    userId: '1',
    action: 'INICIO DE SISTEMA',
    module: 'sistema',
    target: 'server.js',
    details: 'Inicio inicial del servidor e integración del sistema de auditoría'
  });
}

// ==========================================
// AUTH ENDPOINTS
// ==========================================

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (username === 'admin' && password === 'Detector.25.') {
    logAudit({
      user: 'admin',
      userId: '1',
      action: 'INICIO DE SESIÓN',
      module: 'auth',
      target: 'autenticacion',
      details: 'Inicio de sesión exitoso en el panel administrativo',
      ip: clientIp
    });

    return res.json({
      token: 'pia-admin-valid-token-detector25',
      user: {
        id: 1,
        username: 'admin',
        role: 'Administrador',
        email: 'admin@pia.gob.gt'
      }
    });
  }

  logAudit({
    user: username || 'desconocido',
    userId: '0',
    action: 'INTENTO FALLIDO',
    module: 'auth',
    target: 'autenticacion',
    details: `Intento fallido de inicio de sesión para el usuario '${username}'`,
    ip: clientIp
  });

  return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.includes('pia-admin-valid-token-detector25')) {
    return res.json({
      user: {
        id: 1,
        username: 'admin',
        role: 'Administrador',
        email: 'admin@pia.gob.gt'
      }
    });
  }
  return res.status(401).json({ error: 'Token inválido o expirado' });
});

// ==========================================
// MODULES & CRUD ENDPOINTS
// ==========================================

app.get('/api/modules', (req, res) => {
  res.json(['canales', 'directorio', 'tableros', 'riesgo', 'vehiculos', 'portal']);
});

// Get all records of a module
app.get('/api/:module', (req, res, next) => {
  const { module } = req.params;
  if (module === 'auth' || module === 'dashboard' || module === 'raw-json' || module === 'files' || module === 'audit') {
    return next();
  }
  try {
    const records = getModuleRecords(module);
    res.json(records);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single record
app.get('/api/:module/:id', (req, res, next) => {
  const { module, id } = req.params;
  if (module === 'auth' || module === 'dashboard' || module === 'raw-json' || module === 'files' || module === 'audit') {
    return next();
  }
  try {
    const records = getModuleRecords(module);
    const item = records.find(r => String(r.id) === String(id));
    if (!item) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create new record
app.post('/api/:module', (req, res, next) => {
  const { module } = req.params;
  if (module === 'auth' || module === 'dashboard' || module === 'raw-json' || module === 'files' || module === 'audit') {
    return next();
  }
  try {
    const records = getModuleRecords(module);
    const newId = records.length > 0 ? Math.max(...records.map(r => Number(r.id) || 0)) + 1 : 1;
    const newRecord = { id: newId, ...req.body };
    records.push(newRecord);

    const success = saveModuleRecords(module, records);
    if (!success) throw new Error('Error al guardar datos en archivo JSON');

    const filePath = MODULE_FILE_MAP[module] ? path.basename(MODULE_FILE_MAP[module]) : module;

    logAudit({
      user: 'admin',
      userId: '1',
      action: 'CREACIÓN',
      module,
      target: filePath,
      recordId: newId,
      details: `Creación de nuevo registro con ID ${newId} en el módulo '${module}'`,
      previousValue: null,
      newValue: newRecord,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    });

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update record
app.put('/api/:module/:id', (req, res, next) => {
  const { module, id } = req.params;
  if (module === 'auth' || module === 'dashboard' || module === 'raw-json' || module === 'files' || module === 'audit') {
    return next();
  }
  try {
    const records = getModuleRecords(module);
    const index = records.findIndex(r => String(r.id) === String(id));
    if (index === -1) return res.status(404).json({ error: 'Registro no encontrado' });

    const previousValue = JSON.parse(JSON.stringify(records[index]));
    records[index] = { ...records[index], ...req.body, id: Number(id) || id };
    const newValue = records[index];

    const success = saveModuleRecords(module, records);
    if (!success) throw new Error('Error al guardar datos en archivo JSON');

    const filePath = MODULE_FILE_MAP[module] ? path.basename(MODULE_FILE_MAP[module]) : module;

    logAudit({
      user: 'admin',
      userId: '1',
      action: 'ACTUALIZACIÓN',
      module,
      target: filePath,
      recordId: id,
      details: `Actualización de registro ID ${id} en el módulo '${module}'`,
      previousValue,
      newValue,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json(records[index]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete record
app.delete('/api/:module/:id', (req, res, next) => {
  const { module, id } = req.params;
  if (module === 'auth' || module === 'dashboard' || module === 'raw-json' || module === 'files' || module === 'audit') {
    return next();
  }
  try {
    let records = getModuleRecords(module);
    const index = records.findIndex(r => String(r.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    const previousValue = records[index];
    records.splice(index, 1);

    const success = saveModuleRecords(module, records);
    if (!success) throw new Error('Error al guardar cambios en el archivo JSON');

    const filePath = MODULE_FILE_MAP[module] ? path.basename(MODULE_FILE_MAP[module]) : module;

    logAudit({
      user: 'admin',
      userId: '1',
      action: 'ELIMINACIÓN',
      module,
      target: filePath,
      recordId: id,
      details: `Eliminación de registro ID ${id} del módulo '${module}'`,
      previousValue,
      newValue: null,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({ message: 'Registro eliminado correctamente', success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// RAW JSON & AUDIT ENDPOINTS
// ==========================================

app.get('/api/raw-json', (req, res) => {
  const jsonPath = req.query.path;
  if (!jsonPath) return res.status(400).json({ error: 'Path es requerido' });

  const absolutePath = path.join(__dirname, jsonPath.startsWith('/') ? jsonPath.slice(1) : jsonPath);
  const data = readJsonFile(absolutePath);
  if (data === null) return res.status(404).json({ error: 'Archivo no encontrado' });
  res.json(data);
});

app.post('/api/raw-json', (req, res) => {
  const { path: jsonPath, data } = req.body;
  if (!jsonPath || !data) return res.status(400).json({ error: 'Path y data son requeridos' });

  const absolutePath = path.join(__dirname, jsonPath.startsWith('/') ? jsonPath.slice(1) : jsonPath);
  const previousValue = readJsonFile(absolutePath);
  const success = writeJsonFile(absolutePath, data);

  if (!success) return res.status(500).json({ error: 'Error al escribir archivo' });

  logAudit({
    user: 'admin',
    userId: '1',
    action: 'EDICIÓN DIRECTA JSON',
    module: 'json-editor',
    target: jsonPath,
    recordId: null,
    details: `Edición directa del archivo '${jsonPath}' desde el editor JSON`,
    previousValue,
    newValue: data,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  });

  res.json({ success: true, message: 'Archivo actualizado correctamente' });
});

// Get Audit Logs Endpoint
app.get('/api/audit', (req, res) => {
  const logs = getAuditLogs();
  res.json(logs);
});

// Get single Audit Log entry with full details
app.get('/api/audit/:id', (req, res) => {
  const logs = getAuditLogs();
  const entry = logs.find(l => String(l.id) === String(req.params.id));
  if (!entry) return res.status(404).json({ error: 'Registro de auditoría no encontrado' });
  res.json(entry);
});

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const canales = getModuleRecords('canales');
    const directorio = getModuleRecords('directorio');
    const tableros = getModuleRecords('tableros');
    const riesgo = getModuleRecords('riesgo');
    const vehiculos = getModuleRecords('vehiculos');
    const auditLog = getAuditLogs();

    const totalRegs = canales.length + directorio.length + tableros.length + riesgo.length + vehiculos.length;

    const instSet = new Set();
    canales.forEach(c => c.institucion && instSet.add(c.institucion));
    directorio.forEach(d => d.nombre_institucion && instSet.add(d.nombre_institucion));
    tableros.forEach(t => t.nombre_institucion && instSet.add(t.nombre_institucion));
    riesgo.forEach(r => r.nombre && instSet.add(r.nombre));

    res.json({
      modulos: 6,
      registros: totalRegs,
      usuarios: 1,
      instituciones: instSet.size || 68,
      tableros: tableros.length,
      vehiculos: vehiculos.length,
      creados: auditLog.filter(a => a.action === 'CREACIÓN').length,
      actualizados: auditLog.filter(a => a.action === 'ACTUALIZACIÓN' || a.action === 'EDICIÓN DIRECTA JSON').length,
      eliminados: auditLog.filter(a => a.action === 'ELIMINACIÓN').length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/audit', (req, res) => {
  res.json(getAuditLogs().slice(0, 20));
});

// File upload endpoint
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.post('/api/files/upload', (req, res) => {
  res.json({ url: '/uploads/sample.png', filename: 'sample.png' });
});

// Static file serving
app.use(express.static(__dirname));

// Route for root index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin panel route
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
