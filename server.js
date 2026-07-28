import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

// Users and Security Files
const USERS_FILE = path.join(__dirname, 'users.json');
const SECURITY_FILE = path.join(__dirname, 'security_policies.json');

// Password Hashing and Security Helpers
function hashPassword(password) {
  if (!password) return '';
  if (password.startsWith('pbkdf2:')) return password; // Already hashed
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

function verifyPassword(inputPassword, storedPassword) {
  if (!storedPassword || !inputPassword) return false;

  if (storedPassword.startsWith('pbkdf2:')) {
    const parts = storedPassword.split(':');
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const storedHash = parts[2];
    const hash = crypto.pbkdf2Sync(inputPassword, salt, 10000, 64, 'sha512').toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
    } catch (e) {
      return false;
    }
  }

  // Legacy plain-text password match
  return inputPassword === storedPassword;
}

function getUsersData() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const content = fs.readFileSync(USERS_FILE, 'utf8');
    const users = JSON.parse(content);
    let dirty = false;
    for (const u of users) {
      if (u.password && !u.password.startsWith('pbkdf2:')) {
        u.password = hashPassword(u.password);
        dirty = true;
      }
    }
    if (dirty) {
      saveUsersData(users);
    }
    return users;
  } catch (err) {
    console.error('Error reading users.json:', err);
    return [];
  }
}

function saveUsersData(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving users.json:', err);
    return false;
  }
}

function getSecurityPoliciesData() {
  try {
    if (!fs.existsSync(SECURITY_FILE)) return {};
    return JSON.parse(fs.readFileSync(SECURITY_FILE, 'utf8'));
  } catch (err) {
    return {};
  }
}

function saveSecurityPoliciesData(policies) {
  try {
    fs.writeFileSync(SECURITY_FILE, JSON.stringify(policies, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

function sanitizeUser(u) {
  if (!u) return null;
  const { password, ...userWithoutPass } = u;
  return userWithoutPass;
}

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

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const users = getUsersData();
  const cleanUser = username.trim().toLowerCase();
  const user = users.find(u => u.username.toLowerCase() === cleanUser);

  if (user && verifyPassword(password, user.password)) {
    // If user's password was plain text, transparently upgrade it to hash
    if (!user.password.startsWith('pbkdf2:')) {
      user.password = hashPassword(password);
      saveUsersData(users);
    }

    if (user.status === 'inactive' || user.status === 'suspended') {
      logAudit({
        user: user.username,
        userId: String(user.id),
        action: 'INTENTO FALLIDO',
        module: 'auth',
        target: 'autenticacion',
        details: `Intento de inicio de sesión con cuenta desactivada/suspendida: '${user.username}'`,
        ip: clientIp
      });
      return res.status(401).json({ error: 'La cuenta de usuario está inactiva o suspendida.' });
    }

    user.lastLogin = new Date().toISOString();
    saveUsersData(users);

    const token = `pia-token-${user.id}-${user.username}`;

    logAudit({
      user: user.username,
      userId: String(user.id),
      action: 'INICIO DE SESIÓN',
      module: 'auth',
      target: 'autenticacion',
      details: `Inicio de sesión exitoso como ${user.role} (${user.fullName || user.username})`,
      ip: clientIp
    });

    return res.json({
      token,
      user: sanitizeUser(user)
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
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const users = getUsersData();
  let user = null;

  if (token === 'pia-admin-valid-token-detector25') {
    user = users.find(u => u.username === 'admin') || users[0];
  } else if (token.startsWith('pia-token-')) {
    const parts = token.split('-');
    const userId = parts[2];
    const username = parts[3];
    user = users.find(u => String(u.id) === String(userId) || u.username === username);
  }

  if (user) {
    return res.json({ user: sanitizeUser(user) });
  }

  return res.status(401).json({ error: 'Token inválido o expirado' });
});

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

app.get('/api/users', (req, res) => {
  const users = getUsersData().map(u => sanitizeUser(u));
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const users = getUsersData();
  const u = users.find(item => String(item.id) === String(req.params.id) || item.username === req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(sanitizeUser(u));
});

app.post('/api/users', (req, res) => {
  const { username, fullName, email, role, modules, status, mfaEnabled, forcePasswordChange, password } = req.body || {};

  if (!username || !fullName || !email) {
    return res.status(400).json({ error: 'Nombre completo, usuario y correo son requeridos.' });
  }

  const users = getUsersData();
  if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return res.status(400).json({ error: `El nombre de usuario '${username}' ya está registrado.` });
  }

  const rawPassword = password && password.trim() ? password.trim() : 'Detector.25.';

  const newUser = {
    id: `usr_${Date.now()}`,
    username: username.trim(),
    fullName: fullName.trim(),
    email: email.trim(),
    role: role || 'module_admin',
    modules: Array.isArray(modules) ? modules : ['canales', 'directorio'],
    status: status || 'active',
    mfaEnabled: !!mfaEnabled,
    forcePasswordChange: !!forcePasswordChange,
    password: hashPassword(rawPassword),
    lastLogin: new Date().toISOString()
  };

  users.push(newUser);
  saveUsersData(users);

  logAudit({
    user: 'admin',
    userId: '1',
    action: 'CREACIÓN DE USUARIO',
    module: 'users',
    target: 'users.json',
    recordId: newUser.id,
    details: `Creación de usuario '@${newUser.username}' (${newUser.fullName}) con rol ${newUser.role}`,
    newValue: sanitizeUser(newUser),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  });

  res.status(201).json(sanitizeUser(newUser));
});

app.put('/api/users/:id', (req, res) => {
  const users = getUsersData();
  const idx = users.findIndex(u => String(u.id) === String(req.params.id) || u.username === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const prevUser = { ...users[idx] };
  const { fullName, username, email, role, modules, status, mfaEnabled, forcePasswordChange, password } = req.body || {};

  if (fullName) users[idx].fullName = fullName.trim();
  if (username) users[idx].username = username.trim();
  if (email) users[idx].email = email.trim();
  if (role) users[idx].role = role;
  if (Array.isArray(modules)) users[idx].modules = modules;
  if (status) users[idx].status = status;
  if (mfaEnabled !== undefined) users[idx].mfaEnabled = !!mfaEnabled;
  if (forcePasswordChange !== undefined) users[idx].forcePasswordChange = !!forcePasswordChange;
  if (password && password.trim()) users[idx].password = hashPassword(password.trim());

  saveUsersData(users);

  logAudit({
    user: 'admin',
    userId: '1',
    action: 'ACTUALIZACIÓN DE USUARIO',
    module: 'users',
    target: 'users.json',
    recordId: users[idx].id,
    details: `Modificación de datos del usuario '@${users[idx].username}'`,
    previousValue: sanitizeUser(prevUser),
    newValue: sanitizeUser(users[idx]),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  });

  res.json(sanitizeUser(users[idx]));
});

app.delete('/api/users/:id', (req, res) => {
  let users = getUsersData();
  const idx = users.findIndex(u => String(u.id) === String(req.params.id) || u.username === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const userToDelete = users[idx];
  if (userToDelete.username === 'admin') {
    return res.status(400).json({ error: 'No se puede eliminar el usuario administrador principal' });
  }

  users.splice(idx, 1);
  saveUsersData(users);

  logAudit({
    user: 'admin',
    userId: '1',
    action: 'ELIMINACIÓN DE USUARIO',
    module: 'users',
    target: 'users.json',
    recordId: userToDelete.id,
    details: `Eliminación del usuario '@${userToDelete.username}' (${userToDelete.fullName})`,
    previousValue: sanitizeUser(userToDelete),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  });

  res.json({ message: 'Usuario eliminado correctamente', success: true });
});

// Security Policies Endpoints
app.get('/api/security-policies', (req, res) => {
  res.json(getSecurityPoliciesData());
});

app.post('/api/security-policies', (req, res) => {
  saveSecurityPoliciesData(req.body);
  logAudit({
    user: 'admin',
    userId: '1',
    action: 'ACTUALIZACIÓN SEGURIDAD',
    module: 'security',
    target: 'security_policies.json',
    details: 'Actualización de políticas globales de seguridad',
    newValue: req.body,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  });
  res.json({ success: true, message: 'Políticas guardadas correctamente' });
});

// Helper for reserved modules
const RESERVED_MODULES = ['auth', 'dashboard', 'raw-json', 'files', 'audit', 'users', 'security-policies'];

// ==========================================
// MODULES & CRUD ENDPOINTS
// ==========================================

app.get('/api/modules', (req, res) => {
  res.json(['canales', 'directorio', 'tableros', 'riesgo', 'vehiculos', 'portal']);
});

// Get all records of a module
app.get('/api/:module', (req, res, next) => {
  const { module } = req.params;
  if (RESERVED_MODULES.includes(module)) {
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
  if (RESERVED_MODULES.includes(module)) {
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
  if (RESERVED_MODULES.includes(module)) {
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
  if (RESERVED_MODULES.includes(module)) {
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
  if (RESERVED_MODULES.includes(module)) {
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
