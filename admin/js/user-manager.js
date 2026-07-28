// user-manager.js - Módulo de Gestión de Usuarios Administradores, Roles, Permisos y Seguridad

const STORAGE_USERS_KEY = 'pia_admin_users_list_v1';
const STORAGE_SECURITY_KEY = 'pia_security_policies_v1';

// Módulos del portal disponibles para asignación
export const PORTAL_MODULES = [
  { id: 'canales', name: 'Canales por la Integridad', route: '/canales-por-la-integridad', icon: 'fa-comments' },
  { id: 'directorio', name: 'Directorio Ejecutivo de Acceso', route: '/directorio', icon: 'fa-address-book' },
  { id: 'tableros', name: 'Tu Gobierno en Números', route: '/gobierno_en_numeros', icon: 'fa-chart-bar' },
  { id: 'riesgo', name: 'Riesgo en la Mira', route: '/riesgo', icon: 'fa-bullseye' },
  { id: 'vehiculos', name: 'Placa Transparente', route: '/vehiculos', icon: 'fa-car' },
  { id: 'portal', name: 'Portal Principal & Métricas', route: '/', icon: 'fa-globe' }
];

// Roles prediseñados y sus permisos
export const ADMIN_ROLES = {
  superadmin: {
    name: 'Super Administrador',
    badge: 'badge-danger',
    description: 'Acceso total a todos los módulos, gestión de bases de datos, auditoría y usuarios.'
  },
  module_admin: {
    name: 'Administrador de Módulo',
    badge: 'badge-info',
    description: 'Gestión completa de los módulos asignados y edición de datos JSON.'
  },
  editor: {
    name: 'Editor de Contenido',
    badge: 'badge-success',
    description: 'Edición y actualización de registros en módulos asignados sin acceso a seguridad.'
  },
  auditor: {
    name: 'Auditor de Seguridad',
    badge: 'badge-warning',
    description: 'Acceso de solo lectura a registros, bitácora de auditoría y reportes.'
  }
};

// Usuarios iniciales preconfigurados
function getInitialUsers() {
  return [
    {
      id: 'usr_1',
      username: 'admin',
      fullName: 'Administrador General PIA',
      email: 'admin@pia.gob.gt',
      role: 'superadmin',
      modules: ['canales', 'directorio', 'tableros', 'riesgo', 'vehiculos', 'portal'],
      status: 'active',
      mfaEnabled: true,
      sessionTimeout: '30m',
      allowedIp: '*',
      forcePasswordChange: false,
      lastLogin: new Date().toISOString()
    },
    {
      id: 'usr_2',
      username: 'editor_integridad',
      fullName: 'Licda. María Fernanda López',
      email: 'mlopez@pia.gob.gt',
      role: 'module_admin',
      modules: ['canales', 'directorio'],
      status: 'active',
      mfaEnabled: false,
      sessionTimeout: '30m',
      allowedIp: '*',
      forcePasswordChange: false,
      lastLogin: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'usr_3',
      username: 'gestor_transparencia',
      fullName: 'Ing. Carlos Mendoza',
      email: 'cmendoza@pia.gob.gt',
      role: 'editor',
      modules: ['tableros', 'vehiculos'],
      status: 'active',
      mfaEnabled: false,
      sessionTimeout: '60m',
      allowedIp: '*',
      forcePasswordChange: false,
      lastLogin: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'usr_4',
      username: 'auditor_riesgos',
      fullName: 'Dr. Roberto Juárez',
      email: 'rjuarez@pia.gob.gt',
      role: 'auditor',
      modules: ['riesgo', 'canales'],
      status: 'active',
      mfaEnabled: true,
      sessionTimeout: '15m',
      allowedIp: '192.168.1.0/24',
      forcePasswordChange: false,
      lastLogin: new Date(Date.now() - 432000000).toISOString()
    }
  ];
}

// Políticas de seguridad por defecto
function getInitialSecurityPolicies() {
  return {
    minPasswordLength: 8,
    requireNumbers: true,
    requireUppercase: true,
    requireSpecialChars: true,
    failedLoginLockout: 5,
    enforceGlobal2FA: false,
    defaultSessionTimeout: '30m',
    auditLogging: true
  };
}

let cachedUsers = [];
let cachedPolicies = getInitialSecurityPolicies();

export async function fetchUsersApi() {
  try {
    const res = await fetch('/api/users', { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener usuarios del servidor');
    cachedUsers = await res.json();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsers));
    return cachedUsers;
  } catch (err) {
    console.warn('Fallo al conectar con API de usuarios, usando cache local:', err);
    return getUsersLocal();
  }
}

export function getUsersLocal() {
  const stored = localStorage.getItem(STORAGE_USERS_KEY);
  if (!stored) {
    const initial = getInitialUsers();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getInitialUsers();
  }
}

export function getUsers() {
  return cachedUsers.length > 0 ? cachedUsers : getUsersLocal();
}

export async function fetchSecurityPoliciesApi() {
  try {
    const res = await fetch('/api/security-policies', { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener políticas');
    cachedPolicies = await res.json();
    localStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(cachedPolicies));
    return cachedPolicies;
  } catch (err) {
    return getSecurityPoliciesLocal();
  }
}

export function getSecurityPoliciesLocal() {
  const stored = localStorage.getItem(STORAGE_SECURITY_KEY);
  if (!stored) {
    const initial = getInitialSecurityPolicies();
    localStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getInitialSecurityPolicies();
  }
}

export function getSecurityPolicies() {
  return cachedPolicies && Object.keys(cachedPolicies).length > 0 ? cachedPolicies : getSecurityPoliciesLocal();
}

let activeTab = 'users_list';
let currentEditingUserId = null;

export async function initUserManager() {
  await Promise.all([fetchUsersApi(), fetchSecurityPoliciesApi()]);
  renderUserManagerView();
}

function renderUserManagerView() {
  const contentArea = document.getElementById('contentArea');
  if (!contentArea) return;

  const users = getUsers();
  const policies = getSecurityPolicies();

  contentArea.innerHTML = `
    <div class="user-manager-container" style="padding: 1.5rem; max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="color: var(--navy); font-family: var(--font-head); font-weight: 800; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-users-cog" style="color: var(--cyan);"></i> Asignación de Usuarios Administradores y Seguridad
          </h2>
          <p class="text-muted" style="font-size: 0.92rem; margin-top: 0.25rem;">
            Administra credenciales, asigna roles de acceso y restringe módulos específicos del Portal PIA a los usuarios correspondientes.
          </p>
        </div>
        <button class="btn btn-primary" id="btnAddNewUser" style="padding: 0.75rem 1.25rem; font-weight: 700;">
          <i class="fas fa-user-plus"></i> Registrar Nuevo Usuario
        </button>
      </div>

      <!-- TABS DE NAVEGACIÓN -->
      <div class="db-tabs" style="display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem;">
        <button class="tab-btn ${activeTab === 'users_list' ? 'active' : ''}" data-usertab="users_list">
          <i class="fas fa-user-shield"></i> Usuarios Administradores (${users.length})
        </button>
        <button class="tab-btn ${activeTab === 'roles_matrix' ? 'active' : ''}" data-usertab="roles_matrix">
          <i class="fas fa-layer-group"></i> Matriz de Roles y Opciones
        </button>
        <button class="tab-btn ${activeTab === 'security_policies' ? 'active' : ''}" data-usertab="security_policies">
          <i class="fas fa-lock"></i> Políticas de Seguridad y Accesos
        </button>
      </div>

      <!-- TAB 1: LISTA DE USUARIOS -->
      <div id="tabUsersList" class="${activeTab === 'users_list' ? '' : 'hidden'}">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.25rem;">
          ${renderUsersCards(users)}
        </div>
      </div>

      <!-- TAB 2: MATRIZ DE ROLES -->
      <div id="tabRolesMatrix" class="${activeTab === 'roles_matrix' ? '' : 'hidden'}">
        <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04);">
          <h3 style="color: var(--navy); margin-bottom: 1rem;"><i class="fas fa-id-badge" style="color: var(--cyan);"></i> Descripción y Permisos por Rol</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            ${Object.entries(ADMIN_ROLES).map(([key, r]) => `
              <div style="background: var(--surface); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <strong style="font-size: 1.05rem; color: var(--navy);">${r.name}</strong>
                  <span class="badge ${r.badge}">${key}</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${r.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- TAB 3: POLÍTICAS DE SEGURIDAD -->
      <div id="tabSecurityPolicies" class="${activeTab === 'security_policies' ? '' : 'hidden'}">
        <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04); max-width: 800px;">
          <h3 style="color: var(--navy); margin-bottom: 1rem;"><i class="fas fa-shield-alt" style="color: var(--cyan);"></i> Opciones de Seguridad y Auditoría de Acceso</h3>
          <form id="securityPoliciesForm">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Longitud Mínima de Contraseña</label>
                <input type="number" class="form-control" id="policyMinLength" value="${policies.minPasswordLength}" min="6" max="32" style="padding: 0.6rem 0.9rem;" />
              </div>
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Límite de Intentos Fallidos antes de Bloqueo</label>
                <input type="number" class="form-control" id="policyFailedAttempts" value="${policies.failedLoginLockout}" min="3" max="10" style="padding: 0.6rem 0.9rem;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Expiración de Sesión por Defecto</label>
                <select class="form-control" id="policyDefaultTimeout" style="padding: 0.6rem 0.9rem;">
                  <option value="15m" ${policies.defaultSessionTimeout === '15m' ? 'selected' : ''}>15 Minutos</option>
                  <option value="30m" ${policies.defaultSessionTimeout === '30m' ? 'selected' : ''}>30 Minutos</option>
                  <option value="60m" ${policies.defaultSessionTimeout === '60m' ? 'selected' : ''}>1 Hora</option>
                  <option value="8h" ${policies.defaultSessionTimeout === '8h' ? 'selected' : ''}>8 Horas</option>
                </select>
              </div>
              <div class="form-group" style="display: flex; flex-direction: column; justify-content: center;">
                <label class="form-check-label" style="font-weight: 700; color: var(--navy); display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="policyEnforce2FA" ${policies.enforceGlobal2FA ? 'checked' : ''} style="width: 18px; height: 18px;" />
                  Exigir Autenticación de Doble Factor (2FA) Global
                </label>
              </div>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-weight: 700;">
                <i class="fas fa-save"></i> Guardar Políticas de Seguridad
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL DE CREACIÓN / EDICIÓN DE USUARIO -->
    <div class="modal" id="userModal" style="display: none; position: fixed; inset: 0; background: rgba(5,17,31,0.75); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center;">
      <div class="modal-content" style="background: var(--card-bg); width: 100%; max-width: 650px; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(0,0,0,0.4); overflow: hidden;">
        <div class="modal-header" style="background: var(--navy); color: #fff; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <h3 id="userModalTitle" style="font-family: var(--font-head); font-size: 1.2rem; margin: 0;"><i class="fas fa-user-cog" style="color: var(--cyan);"></i> Asignar Usuario Administrador</h3>
          <button class="modal-close" id="btnCloseUserModal" style="background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem; max-height: 80vh; overflow-y: auto;">
          <form id="userForm">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Nombre Completo *</label>
                <input type="text" class="form-control" id="formFullName" required placeholder="Ej. Licda. María López" style="padding: 0.65rem 0.9rem;" />
              </div>
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Nombre de Usuario *</label>
                <input type="text" class="form-control" id="formUsername" required placeholder="Ej. mlopez" style="padding: 0.65rem 0.9rem;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Correo Electrónico Institucional *</label>
                <input type="email" class="form-control" id="formEmail" required placeholder="mlopez@pia.gob.gt" style="padding: 0.65rem 0.9rem;" />
              </div>
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Rol del Sistema *</label>
                <select class="form-control" id="formRole" required style="padding: 0.65rem 0.9rem;">
                  ${Object.entries(ADMIN_ROLES).map(([key, r]) => `<option value="${key}">${r.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Contraseña Acceso *</label>
                <input type="password" class="form-control" id="formPassword" placeholder="••••••••" style="padding: 0.65rem 0.9rem;" />
                <small class="text-muted" style="font-size: 0.75rem;">Dejar en blanco para mantener contraseña actual al editar</small>
              </div>
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Estado de la Cuenta</label>
                <select class="form-control" id="formStatus" style="padding: 0.65rem 0.9rem;">
                  <option value="active">Activo y Habilitado</option>
                  <option value="inactive">Inactivo / Suspendido</option>
                </select>
              </div>
            </div>

            <div style="background: rgba(0,194,224,0.06); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(0,194,224,0.2); margin-bottom: 1.25rem;">
              <label style="font-weight: 800; font-size: 0.9rem; color: var(--navy); display: block; margin-bottom: 0.5rem;">
                <i class="fas fa-sitemap" style="color: var(--cyan);"></i> Asignación de Módulos del Portal
              </label>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                Selecciona las secciones del Portal PIA a las que este usuario tendrá credenciales y autorización para administrar datos:
              </p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                ${PORTAL_MODULES.map(m => `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--navy); cursor: pointer; background: #fff; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--border);">
                    <input type="checkbox" class="module-check" value="${m.id}" style="width: 16px; height: 16px;" />
                    <span><i class="fas ${m.icon}" style="color: var(--blue-bright); margin-right: 4px;"></i> ${m.name}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Opciones de Seguridad Adicionales</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--navy);">
                  <input type="checkbox" id="formMfa" style="width: 16px; height: 16px;" />
                  Activar 2FA / Autenticación de Doble Factor
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--navy);">
                  <input type="checkbox" id="formForcePass" style="width: 16px; height: 16px;" />
                  Forzar cambio de contraseña en próximo login
                </label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; background: var(--surface); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button class="btn btn-secondary" id="btnCancelUserModal">Cancelar</button>
          <button class="btn btn-primary" id="btnSaveUser">Guardar Usuario y Asignaciones</button>
        </div>
      </div>
    </div>
  `;

  setupUserEventListeners();
}

function renderUsersCards(users) {
  if (!users || users.length === 0) {
    return '<p class="text-muted" style="padding: 1.5rem; text-align: center;">No hay usuarios administradores registrados.</p>';
  }

  return users.map(u => {
    const roleObj = ADMIN_ROLES[u.role] || { name: u.role, badge: 'badge-info' };
    const userModules = (u.modules || []).map(mid => PORTAL_MODULES.find(m => m.id === mid)).filter(Boolean);

    return `
      <div class="user-card" style="background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.05); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--navy), var(--navy-light)); color: var(--cyan); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; font-family: var(--font-head);">
                ${u.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style="font-size: 1rem; color: var(--navy); display: block; line-height: 1.2;">${u.fullName}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace;">@${u.username}</span>
              </div>
            </div>
            <span class="badge ${roleObj.badge}">${roleObj.name}</span>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            <div><i class="fas fa-envelope" style="width: 16px;"></i> ${u.email}</div>
            <div style="margin-top: 2px;"><i class="fas fa-shield-alt" style="width: 16px;"></i> 2FA: ${u.mfaEnabled ? '<strong style="color: var(--green);">Habilitado</strong>' : '<span style="color: var(--text-muted);">Desactivado</span>'}</div>
            <div style="margin-top: 2px;"><i class="fas fa-signal" style="width: 16px;"></i> Estado: ${u.status === 'active' ? '<span style="color: var(--green); font-weight: 700;">● Activo</span>' : '<span style="color: var(--red); font-weight: 700;">● Suspendido</span>'}</div>
          </div>

          <div style="background: var(--surface); padding: 0.75rem; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--navy); text-transform: uppercase; margin-bottom: 0.35rem;">
              <i class="fas fa-sitemap" style="color: var(--cyan);"></i> Módulos Asignados (${userModules.length})
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${userModules.length > 0 ? userModules.map(m => `
                <span style="font-size: 0.72rem; padding: 2px 8px; background: rgba(0,194,224,0.12); color: var(--navy); font-weight: 600; border-radius: 6px; border: 1px solid rgba(0,194,224,0.25);">
                  <i class="fas ${m.icon}"></i> ${m.name}
                </span>
              `).join('') : '<span style="font-size: 0.75rem; color: var(--red);">Sin módulos asignados</span>'}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.5rem;">
          <button class="btn btn-secondary edit-user-btn" data-id="${u.id}" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;">
            <i class="fas fa-edit"></i> Editar
          </button>
          ${u.username !== 'admin' ? `
            <button class="btn btn-secondary delete-user-btn" data-id="${u.id}" style="padding: 0.4rem 0.8rem; font-size: 0.82rem; color: var(--red);">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function setupUserEventListeners() {
  // Tab switching
  document.querySelectorAll('[data-usertab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.usertab;
      renderUserManagerView();
    });
  });

  // Open modal for new user
  const btnNew = document.getElementById('btnAddNewUser');
  if (btnNew) {
    btnNew.addEventListener('click', () => openUserModal());
  }

  // Edit user buttons
  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', () => openUserModal(btn.dataset.id));
  });

  // Delete user buttons
  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteUserHandler(btn.dataset.id));
  });

  // Close modal buttons
  const btnClose = document.getElementById('btnCloseUserModal');
  if (btnClose) btnClose.addEventListener('click', closeUserModal);

  const btnCancel = document.getElementById('btnCancelUserModal');
  if (btnCancel) btnCancel.addEventListener('click', closeUserModal);

  // Save user form
  const btnSave = document.getElementById('btnSaveUser');
  if (btnSave) btnSave.addEventListener('click', saveUserHandler);

  // Security Policies form
  const polForm = document.getElementById('securityPoliciesForm');
  if (polForm) {
    polForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const updated = {
        minPasswordLength: parseInt(document.getElementById('policyMinLength').value, 10),
        failedLoginLockout: parseInt(document.getElementById('policyFailedAttempts').value, 10),
        defaultSessionTimeout: document.getElementById('policyDefaultTimeout').value,
        enforceGlobal2FA: document.getElementById('policyEnforce2FA').checked,
        auditLogging: true
      };
      try {
        await fetch('/api/security-policies', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(updated)
        });
        cachedPolicies = updated;
        localStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(updated));
        showToast('Políticas de seguridad actualizadas correctamente', 'success');
      } catch (err) {
        showToast('Error al actualizar políticas: ' + err.message, 'error');
      }
    });
  }
}

function openUserModal(userId = null) {
  currentEditingUserId = userId;
  const users = getUsers();
  const user = userId ? users.find(u => u.id === userId) : null;

  document.getElementById('userModalTitle').textContent = user ? `Editar Usuario: ${user.fullName}` : 'Registrar Nuevo Usuario Administrador';
  
  document.getElementById('formFullName').value = user ? user.fullName : '';
  document.getElementById('formUsername').value = user ? user.username : '';
  document.getElementById('formEmail').value = user ? user.email : '';
  document.getElementById('formRole').value = user ? user.role : 'module_admin';
  document.getElementById('formPassword').value = '';
  document.getElementById('formStatus').value = user ? user.status : 'active';
  document.getElementById('formMfa').checked = user ? !!user.mfaEnabled : false;
  document.getElementById('formForcePass').checked = user ? !!user.forcePasswordChange : false;

  // Set checkboxes for modules
  const selectedMods = user ? (user.modules || []) : ['canales', 'directorio'];
  document.querySelectorAll('.module-check').forEach(chk => {
    chk.checked = selectedMods.includes(chk.value);
  });

  document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
  const modal = document.getElementById('userModal');
  if (modal) modal.style.display = 'none';
  currentEditingUserId = null;
}

async function saveUserHandler() {
  const fullName = document.getElementById('formFullName').value.trim();
  const username = document.getElementById('formUsername').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const role = document.getElementById('formRole').value;
  const password = document.getElementById('formPassword').value;
  const status = document.getElementById('formStatus').value;
  const mfaEnabled = document.getElementById('formMfa').checked;
  const forcePasswordChange = document.getElementById('formForcePass').checked;

  if (!fullName || !username || !email) {
    showToast('Por favor completa todos los campos requeridos', 'error');
    return;
  }

  const selectedModules = Array.from(document.querySelectorAll('.module-check:checked')).map(c => c.value);

  const payload = {
    fullName,
    username,
    email,
    role,
    status,
    mfaEnabled,
    forcePasswordChange,
    modules: selectedModules
  };

  if (password && password.trim()) {
    payload.password = password.trim();
  }

  try {
    let res;
    if (currentEditingUserId) {
      res = await fetch(`/api/users/${currentEditingUserId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar usuario');
    }

    showToast(currentEditingUserId ? 'Usuario y asignaciones actualizados' : 'Usuario registrado con éxito', 'success');
    closeUserModal();
    await fetchUsersApi();
    renderUserManagerView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUserHandler(userId) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;
  if (user.username === 'admin') {
    showToast('No se puede eliminar el usuario administrador principal', 'error');
    return;
  }
  if (!confirm(`¿Eliminar al usuario '${user.fullName}' (@${user.username})?`)) return;

  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al eliminar usuario');
    }

    showToast('Usuario eliminado', 'success');
    await fetchUsersApi();
    renderUserManagerView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
