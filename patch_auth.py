import re

with open('server.js', 'r') as f:
    content = f.read()

# Add activeSessions and requireAuth
auth_logic = """
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
"""

content = content.replace("const loginFailedAttempts = new Map(); // key: username.toLowerCase(), val: { count, lockedUntil }", auth_logic)

# Replace token generation
token_target = "const token = `pia-token-${user.id}-${user.username}`;"
token_replacement = "const token = `pia-token-${user.id}-${user.username}-${Date.now()}`;\n    activeSessions.set(token, Date.now());"
content = content.replace(token_target, token_replacement)

# Update /api/auth/verify to use activeSessions logic
verify_target = """app.get('/api/auth/verify', (req, res) => {
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
});"""

verify_replacement = """app.get('/api/auth/verify', requireAuth, (req, res) => {
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
});"""

content = content.replace(verify_target, verify_replacement)

# Now apply requireAuth to other admin endpoints
content = content.replace("app.get('/api/users'", "app.get('/api/users', requireAuth")
content = content.replace("app.get('/api/users/:id'", "app.get('/api/users/:id', requireAuth")
content = content.replace("app.post('/api/users'", "app.post('/api/users', requireAuth")
content = content.replace("app.put('/api/users/:id'", "app.put('/api/users/:id', requireAuth")
content = content.replace("app.delete('/api/users/:id'", "app.delete('/api/users/:id', requireAuth")
content = content.replace("app.put('/api/users/:id/reset-password'", "app.put('/api/users/:id/reset-password', requireAuth")
content = content.replace("app.get('/api/audit'", "app.get('/api/audit', requireAuth")
content = content.replace("app.get('/api/security/policies'", "app.get('/api/security/policies', requireAuth")
content = content.replace("app.put('/api/security/policies'", "app.put('/api/security/policies', requireAuth")

# chatbot admin endpoints
content = content.replace("app.get('/api/admin/chatbot/stats'", "app.get('/api/admin/chatbot/stats', requireAuth")
content = content.replace("app.get('/api/admin/chatbot/knowledge'", "app.get('/api/admin/chatbot/knowledge', requireAuth")
content = content.replace("app.post('/api/admin/chatbot/knowledge'", "app.post('/api/admin/chatbot/knowledge', requireAuth")
content = content.replace("app.put('/api/admin/chatbot/knowledge/:id'", "app.put('/api/admin/chatbot/knowledge/:id', requireAuth")
content = content.replace("app.delete('/api/admin/chatbot/knowledge/:id'", "app.delete('/api/admin/chatbot/knowledge/:id', requireAuth")
content = content.replace("app.get('/api/admin/chatbot/conversations'", "app.get('/api/admin/chatbot/conversations', requireAuth")
content = content.replace("app.get('/api/admin/chatbot/settings'", "app.get('/api/admin/chatbot/settings', requireAuth")
content = content.replace("app.put('/api/admin/chatbot/settings'", "app.put('/api/admin/chatbot/settings', requireAuth")

with open('server.js', 'w') as f:
    f.write(content)
