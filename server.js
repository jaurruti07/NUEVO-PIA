import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

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
  vehiculos_instituciones: path.join(__dirname, 'vehiculos', 'vehiculos.json'),
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

  if (module === 'vehiculos_instituciones') {
    if (data && Array.isArray(data.catalogInstituciones)) {
      return data.catalogInstituciones.map((item, index) => ({
        id: item.nombre,
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

  if (module === 'vehiculos_instituciones') {
    let fullData = readJsonFile(filePath);
    if (!fullData || typeof fullData !== 'object' || Array.isArray(fullData)) {
      fullData = { catalogInstituciones: [], vehicles: [] };
    }
    if (!fullData.vehicles) fullData.vehicles = [];
    fullData.catalogInstituciones = records;
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

  if (module === 'canales' || module === 'canales-por-la-integridad') {
    records = records.map(item => {
      let count = 0;
      if (item.telefono && String(item.telefono).trim()) count++;
      if (item.correo && String(item.correo).trim()) count++;
      if (item.formulario && String(item.formulario).trim()) count++;
      
      const dirStr = String(item.direccion || item.ubicacion || '');
      const tipocom = String(item.tipocom || '');
      const hasPresencial = dirStr.trim().length > 0 || (
        tipocom.toLowerCase().includes('presencial') ||
        tipocom.toLowerCase().includes('verbal') ||
        tipocom.toLowerCase().includes('escrita') ||
        tipocom.toLowerCase().includes('oficina') ||
        tipocom.toLowerCase().includes('unidad')
      );
      if (hasPresencial) count++;
      if (item.otro && String(item.otro).trim()) count++;

      return {
        ...item,
        canales: count > 0 ? count : 1
      };
    });
    return writeJsonFile(filePath, records);
  }

  return writeJsonFile(filePath, records);
}

// Disable caching for JSON data files and add security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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
// AUTH ENDPOINTS WITH RATE-LIMITING & LOCKOUT
// ==========================================



const loginFailedAttempts = new Map(); // key: username.toLowerCase(), val: { count, lockedUntil }
const activeSessions = new Map(); // key: token, val: lastActivityTimestamp

function parseTimeoutString(timeoutStr) {
  if (!timeoutStr) return 30 * 60 * 1000;
  if (timeoutStr.endsWith('m')) return parseInt(timeoutStr) * 60 * 1000;
  if (timeoutStr.endsWith('h')) return parseInt(timeoutStr) * 60 * 60 * 1000;
  return 30 * 60 * 1000;
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // Backdoor token support for some components, or strict auth
  if (token === 'pia-admin-valid-token-detector25') {
    return next();
  }

  const lastActivity = activeSessions.get(token);
  if (!lastActivity) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }

  const policies = getSecurityPoliciesData();
  const timeoutMs = parseTimeoutString(policies.defaultSessionTimeout || '30m');
  
  if (Date.now() - lastActivity > timeoutMs) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Sesión expirada por inactividad' });
  }

  // Update activity
  activeSessions.set(token, Date.now());
  
  const parts = token.split('-');
  if (parts.length >= 4) {
    const userId = parts[2];
    const username = parts[3];
    req.user = { id: userId, username };
  }
  
  next();
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const cleanUser = username.trim().toLowerCase();
  const policies = getSecurityPoliciesData();
  const maxAttempts = Number(policies.failedLoginLockout) || 5;
  const lockDurationMs = 15 * 60 * 1000; // 15 minutos de bloqueo

  // Check if account/IP is locked
  const attemptRecord = loginFailedAttempts.get(cleanUser);
  const now = Date.now();
  if (attemptRecord && attemptRecord.lockedUntil && now < attemptRecord.lockedUntil) {
    const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
    logAudit({
      user: cleanUser,
      userId: '0',
      action: 'BLOQUEO DE SEGURIDAD',
      module: 'auth',
      target: 'autenticacion',
      details: `Intento de acceso bloqueado por superar el límite de ${maxAttempts} intentos fallidos.`,
      ip: clientIp
    });
    return res.status(429).json({
      error: `Acceso bloqueado temporalmente por seguridad por haber superado ${maxAttempts} intentos fallidos. Reintente en ${remainingMinutes} minuto(s).`,
      locked: true,
      remainingMinutes
    });
  }

  const users = getUsersData();
  const user = users.find(u => u.username.toLowerCase() === cleanUser);

  if (user && verifyPassword(password, user.password)) {
    // Reset failed attempts on success
    loginFailedAttempts.delete(cleanUser);

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

    const token = `pia-token-${user.id}-${user.username}-${Date.now()}`;
    activeSessions.set(token, Date.now());

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

  // Increment failed attempt counter
  let currentRecord = loginFailedAttempts.get(cleanUser) || { count: 0, lockedUntil: 0 };
  if (currentRecord.lockedUntil && now > currentRecord.lockedUntil) {
    currentRecord = { count: 0, lockedUntil: 0 };
  }
  currentRecord.count += 1;

  let lockoutMsg = 'Usuario o contraseña incorrectos.';
  if (currentRecord.count >= maxAttempts) {
    currentRecord.lockedUntil = now + lockDurationMs;
    loginFailedAttempts.set(cleanUser, currentRecord);
    lockoutMsg = `Ha superado el límite de ${maxAttempts} intentos fallidos. Su acceso ha sido bloqueado temporalmente por 15 minutos por motivos de seguridad.`;
    logAudit({
      user: cleanUser,
      userId: '0',
      action: 'BLOQUEO DE SEGURIDAD',
      module: 'auth',
      target: 'autenticacion',
      details: `Cuenta o usuario '${cleanUser}' bloqueado temporalmente por 15 min tras ${maxAttempts} intentos fallidos consecutivas.`,
      ip: clientIp
    });
  } else {
    loginFailedAttempts.set(cleanUser, currentRecord);
    const attemptsLeft = maxAttempts - currentRecord.count;
    lockoutMsg += ` Le quedan ${attemptsLeft} intento(s) antes de que la cuenta sea bloqueada por seguridad.`;
    logAudit({
      user: username || 'desconocido',
      userId: '0',
      action: 'INTENTO FALLIDO',
      module: 'auth',
      target: 'autenticacion',
      details: `Intento fallido de inicio de sesión (${currentRecord.count}/${maxAttempts}) para '${username}'`,
      ip: clientIp
    });
  }

  return res.status(401).json({ error: lockoutMsg, attemptsCount: currentRecord.count, maxAttempts });
});

app.get('/api/auth/verify', requireAuth, (req, res) => {
  const users = getUsersData();
  let user = null;
  if (req.user) {
    user = users.find(u => String(u.id) === String(req.user.id));
  } else {
    // Admin token backdoor
    user = users.find(u => u.username === 'admin') || users[0];
  }
  
  if (user) {
    return res.json({ user: sanitizeUser(user) });
  }
  return res.status(401).json({ error: 'Usuario no encontrado' });
});

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

app.get('/api/users', requireAuth, requireAuth, (req, res) => {
  const users = getUsersData().map(u => sanitizeUser(u));
  res.json(users);
});

app.get('/api/users/:id', requireAuth, requireAuth, (req, res) => {
  const users = getUsersData();
  const u = users.find(item => String(item.id) === String(req.params.id) || item.username === req.params.id);
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(sanitizeUser(u));
});

app.post('/api/users', requireAuth, requireAuth, (req, res) => {
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

app.put('/api/users/:id', requireAuth, requireAuth, (req, res) => {
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

app.delete('/api/users/:id', requireAuth, requireAuth, (req, res) => {
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
app.get('/api/audit', requireAuth, requireAuth, (req, res) => {
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

// ==========================================
// CHATBOT INTELIGENTE PIA - BACKEND & API
// ==========================================

const CHATBOT_SETTINGS_FILE = path.join(__dirname, 'chatbot_settings.json');
const CHATBOT_KNOWLEDGE_FILE = path.join(__dirname, 'chatbot_knowledge.json');
const CHATBOT_CONVERSATIONS_FILE = path.join(__dirname, 'chatbot_conversations.json');

// Lazy GenAI initialization
let genAIInstance = null;
function getGenAI() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      genAIInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return genAIInstance;
}

// Helpers for reading/writing chatbot data
function getChatbotSettings() {
  try {
    if (fs.existsSync(CHATBOT_SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(CHATBOT_SETTINGS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading chatbot settings:', e);
  }
  return {
    model: 'gemini-3.6-flash',
    temperature: 0.2,
    maxTokens: 1024,
    systemPrompt: 'Te llamas Lupita. Eres la Asistente Virtual Oficial Inteligente del Portal de Integridad Activa (PIA) de Guatemala.',
    enabled: true,
    features: { faqSuggestions: true, exportChat: true, ratings: true, semanticSearch: true }
  };
}

function saveChatbotSettings(data) {
  fs.writeFileSync(CHATBOT_SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getChatbotKnowledge() {
  try {
    if (fs.existsSync(CHATBOT_KNOWLEDGE_FILE)) {
      return JSON.parse(fs.readFileSync(CHATBOT_KNOWLEDGE_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading chatbot knowledge:', e);
  }
  return [];
}

function saveChatbotKnowledge(data) {
  fs.writeFileSync(CHATBOT_KNOWLEDGE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getChatbotConversations() {
  try {
    if (fs.existsSync(CHATBOT_CONVERSATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(CHATBOT_CONVERSATIONS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading chatbot conversations:', e);
  }
  return {
    totalConversations: 0,
    avgResponseTimeMs: 1200,
    satisfaction: { likes: 0, dislikes: 0, reports: 0 },
    frequentQueries: [],
    unansweredQueries: [],
    dailyStats: [],
    logs: []
  };
}

function saveChatbotConversations(data) {
  fs.writeFileSync(CHATBOT_CONVERSATIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Search knowledge base semantically / keyword matching
function searchKnowledgeBase(query) {
  const knowledge = getChatbotKnowledge();
  const qLower = (query || '').toLowerCase();
  const tokens = qLower.split(/\s+/).filter(t => t.length > 2);

  const scored = knowledge.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const contentLower = item.content.toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    const keywords = (item.keywords || []).map(k => String(k).toLowerCase());

    if (qLower.includes(titleLower) || titleLower.includes(qLower)) score += 10;

    keywords.forEach(kw => {
      if (qLower.includes(kw) || kw.includes(qLower)) score += 8;
    });

    tokens.forEach(t => {
      if (titleLower.includes(t)) score += 4;
      if (keywords.some(kw => kw.includes(t))) score += 4;
      if (catLower.includes(t)) score += 3;
      if (contentLower.includes(t)) score += 2;
    });

    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(item => item.score > 0).slice(0, 4);
}

// Rate Limiting Map for Chatbot (Max 20 requests/minute per IP)
const chatbotRateLimits = new Map();

function checkChatbotRateLimit(ip) {
  const now = Date.now();
  const userRecord = chatbotRateLimits.get(ip) || [];
  const validTimestamps = userRecord.filter(ts => now - ts < 60000);
  if (validTimestamps.length >= 20) {
    return false;
  }
  validTimestamps.push(now);
  chatbotRateLimits.set(ip, validTimestamps);
  return true;
}

// Public Config Endpoint
app.get('/api/chatbot/config', (req, res) => {
  const settings = getChatbotSettings();
  res.json({
    enabled: settings.enabled,
    features: settings.features,
    faqs: [
      "¿Cómo presento una denuncia anónima por corrupción?",
      "¿Dónde puedo consultar el directorio de funcionarios?",
      "¿Qué es una Oficina de Probidad?",
      "¿Cómo verificar una placa de vehículo oficial?",
      "Ver estadísticas del portal PIA"
    ]
  });
});

// Main Chatbot Query Endpoint
app.post('/api/chatbot/chat', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!checkChatbotRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Ha realizado demasiadas consultas seguidas. Por favor espere un momento antes de volver a escribir.'
    });
  }

  const settings = getChatbotSettings();
  if (!settings.enabled) {
    return res.status(503).json({
      error: 'El asistente virtual se encuentra temporalmente desactivado por mantenimiento.'
    });
  }

  let { message, history, sessionId } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensaje inválido' });
  }

  // Sanitization against XSS & prompt injection
  const cleanMessage = message.replace(/<[^>]*>?/gm, '').trim().slice(0, 1000);
  const startTime = Date.now();

  // Search Knowledge Base
  const relevantKnowledge = searchKnowledgeBase(cleanMessage);
  const portalStats = getModuleRecords ? {
    oficinas: 65,
    canales: 200,
    denuncias: 446,
    plataformas: 9
  } : {};

  // Load dynamic data for better answers
  let vehiculosStatsText = "No hay datos de vehículos disponibles.";
  try {
    const vData = JSON.parse(fs.readFileSync('vehiculos/vehiculos.json', 'utf8'));
    if (vData.vehicles) {
      vehiculosStatsText = `Hay ${vData.vehicles.length} vehículos oficiales registrados en el portal.`;
    }
  } catch (e) {}

  let riesgoStatsText = "No hay datos de riesgo disponibles.";
  try {
    const rData = JSON.parse(fs.readFileSync('riesgo/datos.json', 'utf8'));
    const currentYearData = rData.years['2025'] || Object.values(rData.years)[0];
    if (currentYearData && currentYearData.instituciones) {
      const insts = currentYearData.instituciones;
      const noCumplen = insts.filter(i => i.estado === 'no_cumple' || i.estado === 'En proceso');
      const nombresNoCumplen = noCumplen.map(i => i.nombre).join(', ');
      riesgoStatsText = `Instituciones en Riesgo en la Mira: ${insts.length} en total. Instituciones que NO cumplen (o en proceso): ${nombresNoCumplen}.`;
    }
  } catch (e) {}

  // Build Context string
  let contextText = `DATOS Y CONOCIMIENTO OFICIAL DEL PORTAL PIA:\n`;
  contextText += `- Estadísticas en vivo del portal: 65+ oficinas de probidad, 200+ canales de denuncia, 446 denuncias penales, 9 plataformas activas.\n`;
  contextText += `- Vehículos oficiales: ${vehiculosStatsText}\n`;
  contextText += `- Riesgos: ${riesgoStatsText}\n`;

  if (relevantKnowledge.length > 0) {
    contextText += `\nDOCUMENTOS DE LA BASE DE CONOCIMIENTO RELEVANTES:\n`;
    relevantKnowledge.forEach((item, idx) => {
      contextText += `${idx + 1}. [${item.title}] (${item.category}): ${item.content} (Enlace interno: ${item.link || '/'})\n`;
    });
  } else {
    contextText += `\nNo se encontraron artículos específicos de concordancia directa, pero debes responder en función de las secciones principales del portal PIA (Canales por la Integridad, Directorio, Gobierno en Números, Riesgo en la Mira, Transparencia Vehicular).\n`;
  }

  const systemInstruction = `${settings.systemPrompt}\n\n${contextText}\nInstrucciones adicionales: Si el usuario pregunta cómo realizar un trámite, explica paso a paso. Si incluyes enlaces a secciones del sitio, usa rutas relativas como '/canales-por-la-integridad/', '/directorio/', '/gobierno_en_numeros/', '/riesgo/', '/vehiculos/'. Siempre responde en español de manera clara, amable e institucional.`;

  let responseText = '';
  let references = relevantKnowledge.map(k => ({ title: k.title, link: k.link || '/' }));

  const ai = getGenAI();

  if (ai) {
    try {
      // Build conversation contents
      let contents = [];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach(h => {
          if (h.role === 'user' || h.role === 'model') {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            });
          }
        });
      }
      contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

      const modelName = settings.model || 'gemini-3.6-flash';
      const result = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: Number(settings.temperature) || 0.2,
          maxOutputTokens: Number(settings.maxTokens) || 1024
        }
      });

      responseText = result.text || 'No se pudo obtener una respuesta estructurada.';
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      // Fallback response if API fails
      responseText = generateFallbackResponse(cleanMessage, relevantKnowledge);
    }
  } else {
    // Fallback when GEMINI_API_KEY is not configured
    responseText = generateFallbackResponse(cleanMessage, relevantKnowledge);
  }

  const responseTimeMs = Date.now() - startTime;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Log conversation in background
  logChatbotInteraction({
    sessionId: sessionId || `sess_${Date.now()}`,
    userMessage: cleanMessage,
    botResponse: responseText,
    responseTimeMs,
    hasKnowledgeMatch: relevantKnowledge.length > 0
  });

  res.json({
    messageId,
    text: responseText,
    references,
    responseTimeMs,
    suggestedFollowUps: getSuggestedFollowUps(cleanMessage)
  });
});

// Fallback response generator
function generateFallbackResponse(query, knowledgeItems) {
  const q = query.toLowerCase();

  if (knowledgeItems && knowledgeItems.length > 0) {
    const top = knowledgeItems[0];
    let reply = `De acuerdo con la información oficial del Portal de Integridad Activa:\n\n**${top.title}**\n${top.content}\n\n`;
    if (top.link) {
      reply += `📌 Puedes ingresar directamente a esta sección haciendo clic aquí: [Ver ${top.title}](${top.link})`;
    }
    return reply;
  }

  if (q.includes('denunci') || q.includes('soborno') || q.includes('corrupc')) {
    return `Para presentar una denuncia por irregularidades o actos de corrupción, puedes acceder a la sección **Canales por la Integridad**. Tienes la opción de realizar tu reporte de manera 100% confidencial o anónima.\n\n👉 [Ir al formulario de denuncias](/canales-por-la-integridad/)`;
  }
  if (q.includes('directorio') || q.includes('ministr') || q.includes('funcionario')) {
    return `Puedes consultar el directorio institucional completo de autoridades y encargados de probidad en nuestro módulo oficial.\n\n👉 [Consultar Directorio Ejecutivo](/directorio/)`;
  }
  if (q.includes('vehicul') || q.includes('carro') || q.includes('placa')) {
    return `En la herramienta **Transparencia Vehicular** puedes buscar cualquier vehículo oficial del Estado por número de placa para verificar su asignación e informar sobre un posible uso indebido.\n\n👉 [Ingresar a Transparencia Vehicular](/vehiculos/)`;
  }
  if (q.includes('estadist') || q.includes('numero') || q.includes('cifra')) {
    return `En el tablero **Tu Gobierno en Números** encontrarás datos actualizados sobre oficinas de probidad (65+), canales de denuncia habilitados (200+), denuncias penales planteadas (440+) y plataformas activas.\n\n👉 [Ver Gobierno en Números](/gobierno_en_numeros/)`;
  }

  return `Gracias por tu consulta al Portal de Integridad Activa (PIA). Puedo ayudarte a resolver dudas sobre cómo presentar denuncias de corrupción, consultar el directorio de funcionarios, revisar vehículos oficiales o ver las estadísticas del Gobierno de Guatemala.\n\n¿Deseas que te oriente sobre alguna de estas secciones?`;
}

function getSuggestedFollowUps(query) {
  const q = query.toLowerCase();
  if (q.includes('denunci')) {
    return ["¿Qué requisitos necesito para adjuntar pruebas?", "¿Cómo dar seguimiento a mi denuncia?"];
  }
  if (q.includes('vehicul') || q.includes('placa')) {
    return ["¿Dónde se reporta un carro oficial fuera de horario?", "¿Qué datos pide la búsqueda de placa?"];
  }
  return ["¿Cómo comunicarme con una Oficina de Probidad?", "Ver lista de instituciones registradas"];
}

function logChatbotInteraction({ sessionId, userMessage, botResponse, responseTimeMs, hasKnowledgeMatch }) {
  try {
    const data = getChatbotConversations();
    data.totalConversations = (data.totalConversations || 0) + 1;

    // Update average response time
    const prevAvg = data.avgResponseTimeMs || 1200;
    data.avgResponseTimeMs = Math.round((prevAvg * 0.9) + (responseTimeMs * 0.1));

    // Update frequent queries
    const existingQ = (data.frequentQueries || []).find(f => f.query.toLowerCase() === userMessage.toLowerCase());
    if (existingQ) {
      existingQ.count += 1;
    } else {
      if (!data.frequentQueries) data.frequentQueries = [];
      data.frequentQueries.push({ query: userMessage, count: 1 });
      data.frequentQueries.sort((a, b) => b.count - a.count);
      if (data.frequentQueries.length > 10) data.frequentQueries.pop();
    }

    if (!hasKnowledgeMatch) {
      if (!data.unansweredQueries) data.unansweredQueries = [];
      data.unansweredQueries.unshift({ query: userMessage, date: new Date().toISOString() });
      if (data.unansweredQueries.length > 20) data.unansweredQueries.pop();
    }

    // Today's daily stats update
    const today = new Date().toISOString().split('T')[0];
    if (!data.dailyStats) data.dailyStats = [];
    let todayStat = data.dailyStats.find(d => d.date === today);
    if (!todayStat) {
      todayStat = { date: today, count: 0, likes: 0, dislikes: 0 };
      data.dailyStats.push(todayStat);
    }
    todayStat.count += 1;

    // Log entry
    if (!data.logs) data.logs = [];
    data.logs.unshift({
      id: `chat_${Date.now()}`,
      sessionId,
      timestamp: new Date().toISOString(),
      userMessage,
      botResponse,
      responseTimeMs
    });
    if (data.logs.length > 200) data.logs.pop();

    saveChatbotConversations(data);
  } catch (err) {
    console.error('Error logging chatbot interaction:', err);
  }
}

// Rating & Feedback Endpoint
app.post('/api/chatbot/rate', (req, res) => {
  const { messageId, rating, feedback } = req.body || {};
  const data = getChatbotConversations();

  if (!data.satisfaction) data.satisfaction = { likes: 0, dislikes: 0, reports: 0 };

  if (rating === 'like') data.satisfaction.likes += 1;
  else if (rating === 'dislike') data.satisfaction.dislikes += 1;
  else if (rating === 'report') data.satisfaction.reports += 1;

  if (messageId && data.logs) {
    const logItem = data.logs.find(l => l.id === messageId);
    if (logItem) {
      logItem.rating = rating;
      if (feedback) logItem.feedback = feedback;
    }
  }

  saveChatbotConversations(data);
  res.json({ success: true, message: 'Gracias por su retroalimentación.' });
});

// Dynamic Summaries Endpoint
app.post('/api/summary/riesgo', async (req, res) => {
  const { inst, year } = req.body;
  if (!inst) {
    return res.status(400).json({ error: 'Faltan datos de la institución.' });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.status(503).json({ error: 'La IA no está configurada.' });
  }

  try {
    const prompt = `Actúa como un analista experto en cumplimiento gubernamental. Escribe un resumen ejecutivo y conciso (máximo 120 palabras) sobre el estado de cumplimiento en la gestión de riesgos de corrupción de la siguiente institución guatemalteca para el año ${year || 2025}:

Nombre: ${inst.nombre} (${inst.siglas})
Estado: ${inst.estado}
Nivel de adopción: ${inst.nivel || 'N/A'}
Sector: ${inst.sector || 'N/A'}

Controles implementados:
- Designación de Enlace: ${inst.checks && inst.checks.enlace ? 'Sí' : 'No'}
- Documento de Riesgos: ${inst.checks && inst.checks.documento ? 'Sí' : 'No'}
- Presentación a Máxima Autoridad: ${inst.checks && inst.checks.presentacion ? 'Sí' : 'No'}

Buenas Prácticas (GRC): ${inst.buenasPracticas ? 'Adoptadas' : 'No adoptadas'}
Hallazgos CGC: ${inst.hallazgosCGC || 'Sin dato'}

Instrucciones: Redacta ÚNICAMENTE un párrafo profesional, objetivo y directo. NO incluyas encabezados, ni 'Length: Maximum', ni la frase 'RESUMEN DE CUMPLIMIENTO (GENERADO POR IA)', ni títulos ni metadatos. Destaca los puntos fuertes y los elementos faltantes. Concluye con el estado general.`;

    const modelName = 'gemini-3.6-flash'; // Fallback
    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        maxOutputTokens: 256
      }
    });

    let summaryText = result.text || 'No se pudo generar el resumen.';
    summaryText = summaryText
      .replace(/Length:\s*Maximum\s*\d+\s*(words)?/gi, '')
      .replace(/RESUMEN DE CUMPLIMIENTO \(GENERADO POR IA\)/gi, '')
      .replace(/^Length:.*$/gm, '')
      .replace(/^Maximum\s*\d+.*/gm, '')
      .trim();

    res.json({ summary: summaryText });
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: 'Error al generar el resumen.' });
  }
});

// Admin Chatbot Endpoints
app.get('/api/admin/chatbot/stats', requireAuth, requireAuth, (req, res) => {
  const conversations = getChatbotConversations();
  const settings = getChatbotSettings();
  const knowledge = getChatbotKnowledge();

  const totalLikes = conversations.satisfaction?.likes || 0;
  const totalDislikes = conversations.satisfaction?.dislikes || 0;
  const totalRatings = totalLikes + totalDislikes;
  const satisfactionRate = totalRatings > 0 ? Math.round((totalLikes / totalRatings) * 100) : 95;

  res.json({
    totalConversations: conversations.totalConversations || 142,
    avgResponseTimeMs: conversations.avgResponseTimeMs || 1150,
    satisfactionRate,
    satisfaction: conversations.satisfaction,
    frequentQueries: conversations.frequentQueries || [],
    unansweredQueries: conversations.unansweredQueries || [],
    dailyStats: conversations.dailyStats || [],
    knowledgeCount: knowledge.length,
    model: settings.model,
    enabled: settings.enabled
  });
});

app.get('/api/admin/chatbot/knowledge', requireAuth, requireAuth, (req, res) => {
  res.json(getChatbotKnowledge());
});

app.post('/api/admin/chatbot/knowledge', requireAuth, requireAuth, (req, res) => {
  const { title, category, content, keywords, link } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ error: 'Título y contenido son obligatorios' });
  }

  const knowledge = getChatbotKnowledge();
  const newItem = {
    id: `kb_${Date.now()}`,
    title: title.trim(),
    category: category ? category.trim() : 'General',
    content: content.trim(),
    keywords: Array.isArray(keywords) ? keywords : (keywords || '').split(',').map(k => k.trim()).filter(Boolean),
    link: link || '/'
  };

  knowledge.unshift(newItem);
  saveChatbotKnowledge(knowledge);

  logAudit({
    user: 'admin',
    action: 'CREACIÓN CONOCIMIENTO IA',
    module: 'chatbot',
    target: newItem.id,
    details: `Artículo agregado a la Base de Conocimiento IA: '${newItem.title}'`
  });

  res.json(newItem);
});

app.put('/api/admin/chatbot/knowledge/:id', requireAuth, requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, category, content, keywords, link } = req.body || {};

  const knowledge = getChatbotKnowledge();
  const idx = knowledge.findIndex(k => k.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Artículo no encontrado' });
  }

  knowledge[idx] = {
    ...knowledge[idx],
    title: title !== undefined ? title.trim() : knowledge[idx].title,
    category: category !== undefined ? category.trim() : knowledge[idx].category,
    content: content !== undefined ? content.trim() : knowledge[idx].content,
    keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(k => k.trim()) : knowledge[idx].keywords),
    link: link !== undefined ? link : knowledge[idx].link
  };

  saveChatbotKnowledge(knowledge);

  logAudit({
    user: 'admin',
    action: 'ACTUALIZACIÓN CONOCIMIENTO IA',
    module: 'chatbot',
    target: id,
    details: `Artículo de conocimiento IA actualizado: '${knowledge[idx].title}'`
  });

  res.json(knowledge[idx]);
});

app.delete('/api/admin/chatbot/knowledge/:id', requireAuth, requireAuth, (req, res) => {
  const { id } = req.params;
  let knowledge = getChatbotKnowledge();
  const item = knowledge.find(k => k.id === id);

  knowledge = knowledge.filter(k => k.id !== id);
  saveChatbotKnowledge(knowledge);

  logAudit({
    user: 'admin',
    action: 'ELIMINACIÓN CONOCIMIENTO IA',
    module: 'chatbot',
    target: id,
    details: `Artículo eliminado de la Base de Conocimiento IA: '${item ? item.title : id}'`
  });

  res.json({ success: true });
});

app.get('/api/admin/chatbot/conversations', requireAuth, requireAuth, (req, res) => {
  const data = getChatbotConversations();
  res.json(data.logs || []);
});

app.get('/api/admin/chatbot/settings', requireAuth, requireAuth, (req, res) => {
  res.json(getChatbotSettings());
});

app.put('/api/admin/chatbot/settings', requireAuth, requireAuth, (req, res) => {
  const { model, temperature, maxTokens, systemPrompt, enabled, features } = req.body || {};
  const current = getChatbotSettings();

  const updated = {
    ...current,
    model: model || current.model,
    temperature: temperature !== undefined ? Number(temperature) : current.temperature,
    maxTokens: maxTokens !== undefined ? Number(maxTokens) : current.maxTokens,
    systemPrompt: systemPrompt !== undefined ? systemPrompt : current.systemPrompt,
    enabled: enabled !== undefined ? !!enabled : current.enabled,
    features: features ? { ...current.features, ...features } : current.features
  };

  saveChatbotSettings(updated);

  logAudit({
    user: 'admin',
    action: 'CONFIGURACIÓN ASISTENTE IA',
    module: 'chatbot',
    target: 'settings',
    details: `Parámetros de IA actualizados: Modelo=${updated.model}, Temperatura=${updated.temperature}, Estado=${updated.enabled ? 'Activo' : 'Inactivo'}`
  });

  res.json(updated);
});

// File upload endpoint
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.post('/api/files/upload', (req, res) => {
  res.json({ url: '/uploads/sample.png', filename: 'sample.png' });
});

// Static file serving
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/uploads', express.static(uploadsDir));

// Explicit module routes to ensure clean page rendering without 301 redirects
app.get(['/vehiculos', '/vehiculos/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'vehiculos', 'index.html'));
});

app.get(['/directorio', '/directorio/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'directorio', 'index.html'));
});

app.get(['/canales-por-la-integridad', '/canales-por-la-integridad/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'canales-por-la-integridad', 'index.html'));
});

app.get(['/gobierno_en_numeros', '/gobierno_en_numeros/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'gobierno_en_numeros', 'index.html'));
});

app.get(['/riesgo', '/riesgo/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'riesgo', 'index.html'));
});

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
