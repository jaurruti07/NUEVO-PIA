// user-manager.js - Módulo de Gestión de Usuarios Administradores, Roles, Permisos y Seguridad
// Portal de Integridad Activa (PIA) - Gobierno de Guatemala

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

// Roles prediseñados y sus definiciones conceptuales
export const ADMIN_ROLES = {
  superadmin: {
    name: 'Super Administrador',
    badge: 'badge-danger',
    level: 1,
    icon: 'fa-user-shield',
    description: 'Acceso irrestricto y global a todos los módulos del portal, administración de motores de datos JSON, gestión de usuarios, auditoría e infraestructura.'
  },
  module_admin: {
    name: 'Administrador de Módulo',
    badge: 'badge-info',
    level: 2,
    icon: 'fa-user-cog',
    description: 'Gestión operativa completa (Creación, Edición, Publicación y Eliminación) exclusivamente sobre los módulos del portal autorizados.'
  },
  editor: {
    name: 'Editor de Contenido',
    badge: 'badge-success',
    level: 3,
    icon: 'fa-user-edit',
    description: 'Actualización y modificación de registros e información pública en módulos asignados, sin permisos de administración de seguridad o usuarios.'
  },
  auditor: {
    name: 'Auditor de Seguridad',
    badge: 'badge-warning',
    level: 4,
    icon: 'fa-user-check',
    description: 'Acceso de solo lectura (Read-Only) a la Bitácora de Auditoría, historial de accesos, usuarios y generación de dictámenes de integridad.'
  },
  consultant: {
    name: 'Consultor / Observador',
    badge: 'badge-secondary',
    level: 5,
    icon: 'fa-user-tag',
    description: 'Visualización analítica de tableros estadísticos e indicadores de transparencia institucional sin facultades de modificación.'
  }
};

// Matriz conceptual y funcional de permisos por opción/operación
export const PERMISSION_MATRIX_OPTIONS = [
  {
    category: '1. Usuarios, Credenciales y Seguridad del Sistema',
    icon: 'fa-users-cog',
    items: [
      { id: 'usr_create', name: 'Crear / Registrar Usuarios Administradores', desc: 'Permite dar de alta a nuevos usuarios en la plataforma de administración', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'no', consultant: 'no' },
      { id: 'usr_edit', name: 'Editar Perfil y Asignar Módulos a Usuarios', desc: 'Modifica roles, nombres, correos y módulos asignados a cada cuenta', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'no', consultant: 'no' },
      { id: 'usr_status', name: 'Inactivar / Activar Cuentas de Usuario', desc: 'Suspende temporalmente o reactiva el acceso sin eliminar historial', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'no', consultant: 'no' },
      { id: 'usr_delete', name: 'Eliminar Cuentas de Usuario Administrador', desc: 'Elimina permanentemente credenciales del sistema', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'no', consultant: 'no' },
      { id: 'sec_policies', name: 'Configurar Políticas de Seguridad y Accesos', desc: 'Ajusta parámetros de claves, expiraciones, 2FA, subredes e inactividad', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'no', consultant: 'no' }
    ]
  },
  {
    category: '2. Gestión de Contenido y Archivos JSON por Módulo',
    icon: 'fa-database',
    items: [
      { id: 'json_view', name: 'Consultar / Visualizar Registros en Módulos', desc: 'Acceso a la vista de datos estructurados de los módulos del portal', superadmin: 'yes', module_admin: 'yes', editor: 'yes', auditor: 'yes', consultant: 'yes' },
      { id: 'json_edit', name: 'Crear y Modificar Registros de Datos JSON', desc: 'Alta y edición de campos en Canales, Directorio, Tableros o Placa Transparente', superadmin: 'yes', module_admin: 'module', editor: 'module', auditor: 'no', consultant: 'no' },
      { id: 'json_delete', name: 'Eliminar Registros en Módulos Asignados', desc: 'Supresión de filas o entradas de datos en los archivos JSON autorizados', superadmin: 'yes', module_admin: 'module', editor: 'no', auditor: 'no', consultant: 'no' },
      { id: 'json_upload', name: 'Sobrescribir / Reemplazar Archivos JSON Completos', desc: 'Carga masiva directa de archivos .json sustituyendo la versión previa', superadmin: 'yes', module_admin: 'module', editor: 'no', auditor: 'no', consultant: 'no' }
    ]
  },
  {
    category: '3. Motores de Datos, Infraestructura y Respaldo',
    icon: 'fa-server',
    items: [
      { id: 'db_engines', name: 'Administrar Motores de Lectura/Escritura (Servidor / IndexedDB)', desc: 'Conmutación del modo de persistencia activa del panel de datos', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'no', consultant: 'no' },
      { id: 'db_backup', name: 'Crear y Restaurar Copias de Seguridad (Backups)', desc: 'Generación de respaldos instantáneos y reversión a estados previos', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'no', consultant: 'no' },
      { id: 'db_cache', name: 'Limpieza de Caché del Servidor y Memoria', desc: 'Purgado manual de caché para sincronización inmediata con el portal público', superadmin: 'yes', module_admin: 'module', editor: 'no', auditor: 'no', consultant: 'no' }
    ]
  },
  {
    category: '4. Auditoría, Trazabilidad e Informes',
    icon: 'fa-shield-alt',
    items: [
      { id: 'audit_view', name: 'Consultar Bitácora de Auditoría e Historial en Vivo', desc: 'Explorador detallado de eventos, usuarios, IPs y timestamps', superadmin: 'yes', module_admin: 'no', editor: 'no', auditor: 'yes', consultant: 'no' },
      { id: 'export_data', name: 'Exportar Reportes Consolidados (Excel, PDF, CSV)', desc: 'Descarga de matriz de datos e informes estadísticos de transparencia', superadmin: 'yes', module_admin: 'yes', editor: 'yes', auditor: 'yes', consultant: 'yes' }
    ]
  }
];

// Usuarios iniciales de ejemplo
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

// Políticas de seguridad iniciales
function getInitialSecurityPolicies() {
  return {
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passExpiryDays: '90',
    failedLoginLockout: 5,
    lockoutDurationMin: 15,
    defaultSessionTimeout: '30m',
    enforceGlobal2FA: false,
    forceFirstChange: true,
    allowedSubnets: '*',
    auditLogging: true,
    emailAlerts: true
  };
}

let cachedUsers = [];
let cachedPolicies = getInitialSecurityPolicies();
let activeTab = 'users_list';
let currentEditingUserId = null;
let matrixSearchQuery = '';
let simulatorSelectedRole = 'superadmin';

export async function fetchUsersApi() {
  try {
    const res = await fetch('/api/users', { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener usuarios');
    cachedUsers = await res.json();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsers));
    return cachedUsers;
  } catch (err) {
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

export async function initUserManager(initialTab = 'users_list') {
  activeTab = initialTab;
  await Promise.all([fetchUsersApi(), fetchSecurityPoliciesApi()]);
  renderUserManagerView();
}

function syncSidebarHighlight() {
  const targetModule = activeTab === 'users_list' ? 'users' : activeTab === 'roles_matrix' ? 'roles' : 'security';
  document.querySelectorAll('[data-module]').forEach(b => {
    if (b.dataset.module === targetModule) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
}

/* ============================================================
   RENDERIZADO PRINCIPAL DEL MÓDULO DE USUARIOS Y SEGURIDAD
============================================================ */
function renderUserManagerView() {
  const contentArea = document.getElementById('contentArea');
  if (!contentArea) return;

  const users = getUsers();
  const policies = getSecurityPolicies();

  syncSidebarHighlight();

  let headerTitle = '';
  let headerSubtitle = '';
  let headerIcon = '';
  let headerAction = '';
  let statsHtml = '';

  if (activeTab === 'users_list') {
    headerIcon = 'fa-users-cog';
    headerTitle = 'Usuarios Administradores';
    headerSubtitle = 'Módulo exclusivo para la creación, edición, asignación de permisos por módulo y control de estado (Activo/Inactivo) de usuarios administradores.';
    headerAction = `
      <button class="btn btn-primary" id="btnAddNewUser" style="padding: 0.75rem 1.25rem; font-weight: 700; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px;">
        <i class="fas fa-user-plus"></i> Registrar Nuevo Usuario
      </button>
    `;
    const activeCount = users.filter(u => u.status === 'active').length;
    const inactiveCount = users.filter(u => u.status !== 'active').length;
    const mfaCount = users.filter(u => u.mfaEnabled).length;
    statsHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Total Usuarios</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--navy); font-family: var(--font-head);">${users.length}</div>
          <div style="font-size: 0.75rem; color: var(--cyan); margin-top: 0.2rem;"><i class="fas fa-users"></i> Cuentas registradas</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Usuarios Activos</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #16A34A; font-family: var(--font-head);">${activeCount}</div>
          <div style="font-size: 0.75rem; color: #16A34A; margin-top: 0.2rem;"><i class="fas fa-check-circle"></i> Acceso Habilitado</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Inactivos / Suspendidos</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #DC2626; font-family: var(--font-head);">${inactiveCount}</div>
          <div style="font-size: 0.75rem; color: #DC2626; margin-top: 0.2rem;"><i class="fas fa-user-slash"></i> Acceso Restringido</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Doble Factor (2FA)</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--blue-bright); font-family: var(--font-head);">${mfaCount}</div>
          <div style="font-size: 0.75rem; color: var(--blue-bright); margin-top: 0.2rem;"><i class="fas fa-shield-alt"></i> Cuentas Verificadas</div>
        </div>
      </div>
    `;
  } else if (activeTab === 'roles_matrix') {
    headerIcon = 'fa-layer-group';
    headerTitle = 'Matriz de Roles y Opciones';
    headerSubtitle = 'Control de Acceso Basado en Roles (RBAC), catálogo jerárquico de roles y matriz interactiva de permisos por función y opción de menú.';
    headerAction = '';
    statsHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Roles Definidos</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--navy); font-family: var(--font-head);">5 Roles</div>
          <div style="font-size: 0.75rem; color: var(--cyan); margin-top: 0.2rem;"><i class="fas fa-user-shield"></i> Modelo RBAC PIA</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Opciones Controladas</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--blue-bright); font-family: var(--font-head);">15+ Opciones</div>
          <div style="font-size: 0.75rem; color: var(--blue-bright); margin-top: 0.2rem;"><i class="fas fa-list-check"></i> Operaciones Reguladas</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Principio de Acceso</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: #16A34A; font-family: var(--font-head); margin-top: 0.25rem;">Menor Privilegio</div>
          <div style="font-size: 0.75rem; color: #16A34A; margin-top: 0.2rem;"><i class="fas fa-lock"></i> Acceso Restringido</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Simulador RBAC</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--cyan); font-family: var(--font-head); margin-top: 0.25rem;">Activo en Vivo</div>
          <div style="font-size: 0.75rem; color: var(--cyan); margin-top: 0.2rem;"><i class="fas fa-vial"></i> Inspección de Roles</div>
        </div>
      </div>
    `;
  } else if (activeTab === 'security_policies') {
    headerIcon = 'fa-shield-alt';
    headerTitle = 'Políticas de Seguridad y Accesos';
    headerSubtitle = 'Configuración técnica y normativa de complejidad de contraseñas, caducidad de claves, bloqueos progresivos, inactividad de sesión y subredes autorizadas.';
    headerAction = '';
    statsHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Salud de Seguridad</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #16A34A; font-family: var(--font-head);">90%</div>
          <div style="font-size: 0.75rem; color: #16A34A; margin-top: 0.2rem;"><i class="fas fa-shield-check"></i> Protección Excelente</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Expiración de Claves</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--navy); font-family: var(--font-head);">${policies.passExpiryDays || 90} Días</div>
          <div style="font-size: 0.75rem; color: var(--cyan); margin-top: 0.2rem;"><i class="fas fa-clock"></i> Rotación Obligatoria</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Umbral de Bloqueo</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: #D97706; font-family: var(--font-head);">${policies.failedLoginLockout || 5} Intentos</div>
          <div style="font-size: 0.75rem; color: #D97706; margin-top: 0.2rem;"><i class="fas fa-user-lock"></i> Protección Anti Fuerza Bruta</div>
        </div>
        <div style="background: var(--card-bg); padding: 1.1rem; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem;">Timeout de Sesión</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--blue-bright); font-family: var(--font-head);">${policies.defaultSessionTimeout || '30 Min'}</div>
          <div style="font-size: 0.75rem; color: var(--blue-bright); margin-top: 0.2rem;"><i class="fas fa-stopwatch"></i> Cierre Automático</div>
        </div>
      </div>
    `;
  }

  contentArea.innerHTML = `
    <div class="user-manager-container" style="padding: 1.5rem; max-width: 1240px; margin: 0 auto;">
      
      <!-- ENCABEZADO Y TÍTULO DINÁMICO DE LA VISTA -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="color: var(--navy); font-family: var(--font-head); font-weight: 800; display: flex; align-items: center; gap: 10px; margin: 0; font-size: 1.5rem;">
            <i class="fas ${headerIcon}" style="color: var(--cyan);"></i> ${headerTitle}
          </h2>
          <p class="text-muted" style="font-size: 0.92rem; margin-top: 0.35rem; margin-bottom: 0;">
            ${headerSubtitle}
          </p>
        </div>
        ${headerAction}
      </div>

      <!-- BLOQUE DE MÉTRICAS / ESTADÍSTICAS DEL MÓDULO -->
      ${statsHtml}

      <!-- TABS NAVEGACIÓN SUB-MÓDULOS -->
      <div class="db-tabs" style="display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border); margin-bottom: 1.75rem; flex-wrap: wrap;">
        <button class="tab-btn ${activeTab === 'users_list' ? 'active' : ''}" data-usertab="users_list" style="padding: 0.75rem 1.25rem; font-weight: 700; border-radius: 12px 12px 0 0;">
          <i class="fas fa-user-shield"></i> Usuarios Administradores (${users.length})
        </button>
        <button class="tab-btn ${activeTab === 'roles_matrix' ? 'active' : ''}" data-usertab="roles_matrix" style="padding: 0.75rem 1.25rem; font-weight: 700; border-radius: 12px 12px 0 0;">
          <i class="fas fa-layer-group"></i> Matriz de Roles y Opciones
        </button>
        <button class="tab-btn ${activeTab === 'security_policies' ? 'active' : ''}" data-usertab="security_policies" style="padding: 0.75rem 1.25rem; font-weight: 700; border-radius: 12px 12px 0 0;">
          <i class="fas fa-lock"></i> Políticas de Seguridad y Accesos
        </button>
      </div>

      <!-- TAB 1: LISTA DE USUARIOS -->
      <div id="tabUsersList" class="${activeTab === 'users_list' ? '' : 'hidden'}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; max-width: 420px;">
            <i class="fas fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
            <input type="text" id="inputSearchUsers" class="form-control" placeholder="Buscar usuario por nombre, usuario, correo o rol..." style="padding: 0.65rem 0.9rem 0.65rem 2.4rem; border-radius: 10px; border: 1px solid var(--border); font-size: 0.9rem;" />
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">
            Mostrando <span id="usersMatchCount" style="color: var(--navy); font-weight: 700;">${users.length}</span> usuarios
          </div>
        </div>
        <div id="usersCardGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.25rem;">
          ${renderUsersCards(users)}
        </div>
      </div>

      <!-- TAB 2: MATRIZ DE ROLES Y OPCIONES (COMPLETA E INFORMATIVA) -->
      <div id="tabRolesMatrix" class="${activeTab === 'roles_matrix' ? '' : 'hidden'}">
        ${renderRolesMatrixTab(users)}
      </div>

      <!-- TAB 3: POLÍTICAS DE SEGURIDAD Y ACCESOS (COMPLETA E INFORMATIVA) -->
      <div id="tabSecurityPolicies" class="${activeTab === 'security_policies' ? '' : 'hidden'}">
        ${renderSecurityPoliciesTab(policies)}
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
                <small class="text-muted" style="font-size: 0.75rem;">Dejar en blanco para mantener la contraseña actual al editar</small>
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
                Selecciona las secciones del Portal PIA a las que este usuario tendrá autorización para administrar datos:
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
                  Activar 2FA / Doble Factor
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--navy);">
                  <input type="checkbox" id="formForcePass" style="width: 16px; height: 16px;" />
                  Forzar cambio de contraseña en próximo inicio
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

/* ============================================================
   RENDERIZADO DE TAB 1: TARJETAS DE USUARIOS
============================================================ */
function renderUsersCards(users, query = '') {
  if (!users || users.length === 0) {
    return '<p class="text-muted" style="padding: 1.5rem; text-align: center;">No hay usuarios administradores registrados.</p>';
  }

  let filtered = users;
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    filtered = users.filter(u => {
      const roleName = (ADMIN_ROLES[u.role]?.name || '').toLowerCase();
      return (u.fullName || '').toLowerCase().includes(q) ||
             (u.username || '').toLowerCase().includes(q) ||
             (u.email || '').toLowerCase().includes(q) ||
             roleName.includes(q);
    });
  }

  if (filtered.length === 0) {
    return `
      <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; background: var(--surface); border-radius: 12px; border: 1px dashed var(--border);">
        <i class="fas fa-user-slash" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 0.5rem; display: block;"></i>
        <strong style="color: var(--navy); font-size: 1rem;">No se encontraron usuarios</strong>
        <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.25rem;">No hay ningún usuario que coincida con la búsqueda "${query}".</p>
      </div>
    `;
  }

  return filtered.map(u => {
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
            <div style="margin-top: 2px;"><i class="fas fa-signal" style="width: 16px;"></i> Estado: ${u.status === 'active' ? '<span style="color: var(--green); font-weight: 700;">● Activo</span>' : '<span style="color: var(--red); font-weight: 700;">● Inactivo / Suspendido</span>'}</div>
          </div>

          <div style="background: var(--surface); padding: 0.75rem; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--navy); text-transform: uppercase; margin-bottom: 0.35rem;">
              <i class="fas fa-sitemap" style="color: var(--cyan);"></i> Módulos Asignados (${userModules.length})
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${userModules.length > 0 ? userModules.map(m => `
                <span style="font-size: 0.7rem; background: #fff; border: 1px solid var(--border); padding: 2px 8px; border-radius: 6px; color: var(--navy); font-weight: 600;">
                  <i class="fas ${m.icon}" style="color: var(--blue-bright);"></i> ${m.name}
                </span>
              `).join('') : '<span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Sin módulos asignados</span>'}
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-secondary edit-user-btn" data-id="${u.id}" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;">
            <i class="fas fa-edit"></i> Editar
          </button>
          ${u.username !== 'admin' ? `
            <button class="btn btn-secondary toggle-status-btn" data-id="${u.id}" data-status="${u.status || 'active'}" style="padding: 0.4rem 0.8rem; font-size: 0.82rem; color: ${u.status === 'active' ? '#D97706' : '#16A34A'}; background: ${u.status === 'active' ? 'rgba(217,119,6,0.1)' : 'rgba(22,163,74,0.1)'}; border: 1px solid ${u.status === 'active' ? 'rgba(217,119,6,0.3)' : 'rgba(22,163,74,0.3)'};">
              <i class="fas ${u.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}"></i> ${u.status === 'active' ? 'Inactivar' : 'Activar'}
            </button>
            <button class="btn btn-secondary delete-user-btn" data-id="${u.id}" style="padding: 0.4rem 0.8rem; font-size: 0.82rem; color: var(--red); border-color: rgba(239,68,68,0.3);">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/* ============================================================
   RENDERIZADO DE TAB 2: MATRIZ DE ROLES Y OPCIONES (EDUCATIVO + INTERACTIVO)
============================================================ */
function renderRolesMatrixTab(users) {
  // Conteo de usuarios por rol
  const roleCounts = {};
  Object.keys(ADMIN_ROLES).forEach(r => roleCounts[r] = 0);
  users.forEach(u => {
    if (roleCounts[u.role] !== undefined) roleCounts[u.role]++;
  });

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      
      <!-- BANNER CONCEPTUAL: MODELO RBAC EN PIA -->
      <div style="background: linear-gradient(135deg, var(--navy), var(--navy-mid)); color: #fff; padding: 1.5rem 1.75rem; border-radius: 16px; border: 1px solid rgba(0,194,224,0.3); box-shadow: 0 8px 24px rgba(5,17,31,0.15);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 0.75rem;">
          <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(0,194,224,0.2); color: var(--cyan); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
            <i class="fas fa-layer-group"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-family: var(--font-head); font-size: 1.25rem; font-weight: 800; color: #fff;">
              Modelo de Control de Acceso Basado en Roles (RBAC - Role-Based Access Control)
            </h3>
            <p style="margin: 0.2rem 0 0 0; font-size: 0.88rem; opacity: 0.85;">
              Estructura formal de gobierno digital que garantiza el Principio de Menor Privilegio y la Separación de Funciones en el Portal.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-top: 1.25rem;">
          <div style="background: rgba(255,255,255,0.06); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--cyan); margin-bottom: 0.3rem;">
              <i class="fas fa-shield-alt"></i> Menor Privilegio
            </div>
            <p style="font-size: 0.8rem; margin: 0; opacity: 0.85; line-height: 1.4;">
              Los usuarios reciben únicamente los permisos mínimos indispensables para sus funciones operativas sin comprometer la integridad.
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--cyan); margin-bottom: 0.3rem;">
              <i class="fas fa-balance-scale"></i> Separación de Funciones
            </div>
            <p style="font-size: 0.8rem; margin: 0; opacity: 0.85; line-height: 1.4;">
              Distinción rigurosa entre perfiles editores de contenido, perfiles auditores y la administración centralizada del sistema.
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--cyan); margin-bottom: 0.3rem;">
              <i class="fas fa-history"></i> Trazabilidad e Inmutabilidad
            </div>
            <p style="font-size: 0.8rem; margin: 0; opacity: 0.85; line-height: 1.4;">
              Cualquier modificación ejecutada por un rol asignado registra marca de tiempo, usuario e IP en la Bitácora de Auditoría.
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--cyan); margin-bottom: 0.3rem;">
              <i class="fas fa-sitemap"></i> Aislamiento por Módulo
            </div>
            <p style="font-size: 0.8rem; margin: 0; opacity: 0.85; line-height: 1.4;">
              Los permisos de edición sobre archivos JSON quedan encapsulados al ámbito de los módulos asignados a la cuenta.
            </p>
          </div>
        </div>
      </div>

      <!-- FICHAS EXPLICATIVAS DE LOS ROLES DISPONIBLES -->
      <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04);">
        <h3 style="color: var(--navy); font-family: var(--font-head); font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-id-badge" style="color: var(--cyan);"></i> Definición Conceptual y Usuarios por Rol
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1.1rem;">
          ${Object.entries(ADMIN_ROLES).map(([key, r]) => `
            <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                  <span style="font-weight: 800; font-size: 0.95rem; color: var(--navy); display: flex; align-items: center; gap: 6px;">
                    <i class="fas ${r.icon || 'fa-user-tag'}" style="color: var(--blue-bright);"></i> ${r.name}
                  </span>
                  <span class="badge ${r.badge}">${key}</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1rem;">
                  ${r.description}
                </p>
              </div>
              <div style="border-top: 1px dashed var(--border); padding-top: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.78rem; font-weight: 700; color: var(--navy);">Usuarios Activos:</span>
                <span style="font-size: 0.85rem; font-weight: 800; background: #fff; padding: 2px 10px; border-radius: 50px; border: 1px solid var(--border); color: var(--blue-bright);">
                  ${roleCounts[key] || 0} usuario(s)
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- BUSCADOR DE OPCIONES Y MATRIZ DE PERMISOS (TABLA COMPLETA) -->
      <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="color: var(--navy); font-family: var(--font-head); font-size: 1.15rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-th" style="color: var(--cyan);"></i> Matriz Comparativa de Funciones y Opciones por Rol
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">
              Cuadro detallado de facultades operativas del sistema según el rol asignado al usuario.
            </p>
          </div>

          <div style="position: relative; min-width: 280px;">
            <input type="text" id="inputSearchMatrix" class="form-control" placeholder="Buscar función u opción..." value="${matrixSearchQuery}" style="padding: 0.55rem 0.9rem 0.55rem 2.2rem; font-size: 0.85rem;" />
            <i class="fas fa-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem;"></i>
          </div>
        </div>

        <!-- TABLA COMPLETA DE PERMISOS -->
        <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: 12px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
            <thead>
              <tr style="background: var(--navy); color: #fff; font-family: var(--font-head); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.04em;">
                <th style="padding: 0.9rem 1.2rem; width: 38%;">Opción / Función del Sistema</th>
                <th style="padding: 0.9rem 0.75rem; text-align: center; width: 12%;">SuperAdmin</th>
                <th style="padding: 0.9rem 0.75rem; text-align: center; width: 13%;">Admin Módulo</th>
                <th style="padding: 0.9rem 0.75rem; text-align: center; width: 12%;">Editor</th>
                <th style="padding: 0.9rem 0.75rem; text-align: center; width: 12%;">Auditor</th>
                <th style="padding: 0.9rem 0.75rem; text-align: center; width: 13%;">Consultor</th>
              </tr>
            </thead>
            <tbody>
              ${renderMatrixTableRows(matrixSearchQuery)}
            </tbody>
          </table>
        </div>

        <!-- LEYENDA SIMBÓLICA -->
        <div style="display: flex; gap: 1.5rem; margin-top: 1rem; padding: 0.8rem 1rem; background: var(--surface); border-radius: 10px; border: 1px solid var(--border); flex-wrap: wrap; font-size: 0.82rem; color: var(--navy);">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #16A34A;"></span>
            <strong>Permitido (Total):</strong> Operación habilitada globalmente.
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #D97706;"></span>
            <strong>Condicional (Módulos):</strong> Requiere autorización explícita del módulo.
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #DC2626;"></span>
            <strong>Restringido (Denegado):</strong> Sin facultades de ejecución.
          </div>
        </div>

      </div>

      <!-- SIMULADOR INTERACTIVO DE CAPACIDADES POR ROL -->
      <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="color: var(--navy); font-family: var(--font-head); font-size: 1.15rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-desktop" style="color: var(--cyan);"></i> Inspector y Simulador de Vistas por Rol
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">
              Selecciona un perfil para evaluar la vista efectiva que experimentará en el Panel Administrador PIA.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-weight: 700; font-size: 0.85rem; color: var(--navy);">Simular Rol:</label>
            <select id="selectSimulatorRole" class="form-control" style="padding: 0.5rem 0.9rem; font-size: 0.85rem; font-weight: 700;">
              ${Object.entries(ADMIN_ROLES).map(([k, r]) => `
                <option value="${k}" ${simulatorSelectedRole === k ? 'selected' : ''}>${r.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        ${renderRoleSimulatorCard(simulatorSelectedRole)}
      </div>

    </div>
  `;
}

/* RENDERING DE FILAS DE LA TABLA MATRIZ */
function renderMatrixTableRows(search) {
  const query = (search || '').toLowerCase().trim();
  let rowsHtml = '';

  PERMISSION_MATRIX_OPTIONS.forEach((cat, catIdx) => {
    const filteredItems = cat.items.filter(item => 
      !query || item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)
    );

    if (filteredItems.length === 0) return;

    rowsHtml += `
      <tr style="background: rgba(0,194,224,0.08); font-weight: 800; color: var(--navy);">
        <td colspan="6" style="padding: 0.75rem 1.2rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
          <i class="fas ${cat.icon}" style="color: var(--cyan); margin-right: 8px;"></i> ${cat.category}
        </td>
      </tr>
    `;

    filteredItems.forEach((item, idx) => {
      rowsHtml += `
        <tr style="border-bottom: 1px solid var(--border); background: ${idx % 2 === 0 ? '#fff' : 'var(--surface)'};">
          <td style="padding: 0.85rem 1.2rem;">
            <strong style="color: var(--navy); display: block; font-size: 0.88rem;">${item.name}</strong>
            <span style="color: var(--text-muted); font-size: 0.78rem;">${item.desc}</span>
          </td>
          <td style="padding: 0.85rem 0.5rem; text-align: center;">${renderCellBadge(item.superadmin)}</td>
          <td style="padding: 0.85rem 0.5rem; text-align: center;">${renderCellBadge(item.module_admin)}</td>
          <td style="padding: 0.85rem 0.5rem; text-align: center;">${renderCellBadge(item.editor)}</td>
          <td style="padding: 0.85rem 0.5rem; text-align: center;">${renderCellBadge(item.auditor)}</td>
          <td style="padding: 0.85rem 0.5rem; text-align: center;">${renderCellBadge(item.consultant)}</td>
        </tr>
      `;
    });
  });

  if (!rowsHtml) {
    return `
      <tr>
        <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">
          No se encontraron opciones de permiso con el criterio '${search}'.
        </td>
      </tr>
    `;
  }

  return rowsHtml;
}

function renderCellBadge(val) {
  if (val === 'yes') {
    return `<span style="background: rgba(22,163,74,0.12); color: #16A34A; border: 1px solid rgba(22,163,74,0.3); padding: 3px 10px; border-radius: 50px; font-weight: 700; font-size: 0.75rem;"><i class="fas fa-check-circle"></i> Sí</span>`;
  }
  if (val === 'module') {
    return `<span style="background: rgba(217,119,6,0.12); color: #D97706; border: 1px solid rgba(217,119,6,0.3); padding: 3px 10px; border-radius: 50px; font-weight: 700; font-size: 0.75rem;" title="Restringido únicamente a los módulos autorizados"><i class="fas fa-filter"></i> Módulo</span>`;
  }
  return `<span style="background: rgba(220,38,38,0.08); color: #DC2626; border: 1px solid rgba(220,38,38,0.2); padding: 3px 10px; border-radius: 50px; font-weight: 600; font-size: 0.75rem; opacity: 0.7;"><i class="fas fa-times-circle"></i> No</span>`;
}

/* RENDERING DEL SIMULADOR DE CAPACIDADES POR ROL */
function renderRoleSimulatorCard(roleKey) {
  const role = ADMIN_ROLES[roleKey] || ADMIN_ROLES.superadmin;

  let modulesView = '';
  let allowedActions = [];
  let restrictedActions = [];

  if (roleKey === 'superadmin') {
    modulesView = 'Acceso Total e Incondicional a todos los 6 módulos del portal + Menús de Administración Avanzada (Usuarios, Auditoría, Motores JSON).';
    allowedActions = ['Crear / Editar / Eliminar Usuarios', 'Configurar Políticas de Seguridad', 'Editar JSON Directo', 'Restaurar Backups BD', 'Consultar Bitácora Auditoría', 'Exportar Todos los Reportes'];
  } else if (roleKey === 'module_admin') {
    modulesView = 'Acceso habilitado únicamente a los módulos asignados por la administración (ej. Canales, Directorio, Tableros).';
    allowedActions = ['Crear y Modificar Registros en Módulos', 'Eliminar Registros de sus Módulos', 'Cargar JSON Completo en sus Módulos', 'Exportar Reportes de sus Módulos'];
    restrictedActions = ['Crear o Modificar Usuarios', 'Alterar Políticas de Seguridad', 'Cambiar Motores de Persistencia BD', 'Consultar Bitácora de Auditoría Global'];
  } else if (roleKey === 'editor') {
    modulesView = 'Acceso de edición restringido a módulos específicos asignados.';
    allowedActions = ['Editar Registros de Datos en Módulos', 'Actualizar Información Pública', 'Exportar Listados Excel/PDF'];
    restrictedActions = ['Eliminar Registros Masivos', 'Cargar Archivos JSON Estructurales', 'Gestionar Usuarios', 'Acceso a Secciones de Infraestructura'];
  } else if (roleKey === 'auditor') {
    modulesView = 'Vista de Consulta General y sección dedicada de Bitácora de Auditoría e Integridad.';
    allowedActions = ['Consultar Bitácora de Auditoría en Tiempo Real', 'Inspeccionar Historial de Cambios e IPs', 'Exportar Dictámenes e Informes PDF/Excel'];
    restrictedActions = ['Modificar Datos JSON', 'Eliminar Cualquier Registro', 'Crear Cuentas de Usuario', 'Alterar Parámetros de Seguridad'];
  } else {
    modulesView = 'Vista Analítica de Solo Lectura para métricas institucionales.';
    allowedActions = ['Visualizar Tableros Estadísticos', 'Consultar Métricas del Portal', 'Exportar Tablas a Excel/CSV'];
    restrictedActions = ['Cualquier Acción de Escritura o Edición', 'Acceso a Bitácora Interna', 'Gestión de Credenciales o Infraestructura'];
  }

  return `
    <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border);">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
        <span class="badge ${role.badge}" style="font-size: 0.85rem; padding: 0.4rem 0.9rem;">${role.name}</span>
        <span style="font-size: 0.85rem; color: var(--text-muted);"><i class="fas fa-layer-group"></i> Nivel de Jerarquía: <strong>${role.level}</strong></span>
      </div>

      <div style="margin-bottom: 1rem; font-size: 0.88rem; color: var(--navy); line-height: 1.5;">
        <strong>Ámbito de Visibilidad:</strong> ${modulesView}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
        <div style="background: #fff; padding: 1rem; border-radius: 10px; border: 1px solid rgba(22,163,74,0.3);">
          <strong style="color: #16A34A; display: block; margin-bottom: 0.5rem; font-size: 0.85rem;">
            <i class="fas fa-check-circle"></i> Acciones Autorizadas:
          </strong>
          <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--navy);">
            ${allowedActions.map(a => `<li style="margin-bottom: 0.3rem;">${a}</li>`).join('')}
          </ul>
        </div>

        <div style="background: #fff; padding: 1rem; border-radius: 10px; border: 1px solid rgba(220,38,38,0.2);">
          <strong style="color: #DC2626; display: block; margin-bottom: 0.5rem; font-size: 0.85rem;">
            <i class="fas fa-ban"></i> Acciones Bloqueadas por Seguridad:
          </strong>
          <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--navy);">
            ${restrictedActions.length > 0 ? restrictedActions.map(a => `<li style="margin-bottom: 0.3rem;">${a}</li>`).join('') : '<li style="color: var(--text-muted);">Ninguna restricción (Perfil SuperAdmin).</li>'}
          </ul>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   RENDERIZADO DE TAB 3: POLÍTICAS DE SEGURIDAD Y ACCESOS (EDUCATIVO + INTERACTIVO)
============================================================ */
function renderSecurityPoliciesTab(policies) {
  // Cálculo dinámico de Score de Salud de Seguridad (0 - 100)
  let healthScore = 0;
  if (policies.minPasswordLength >= 8) healthScore += 15;
  if (policies.minPasswordLength >= 12) healthScore += 10;
  if (policies.requireUppercase) healthScore += 10;
  if (policies.requireNumbers) healthScore += 10;
  if (policies.requireSpecialChars) healthScore += 10;
  if (policies.failedLoginLockout <= 5) healthScore += 15;
  if (policies.enforceGlobal2FA) healthScore += 15;
  if (policies.auditLogging) healthScore += 15;

  let healthColor = '#16A34A';
  let healthLabel = 'Alto (Seguro)';
  if (healthScore < 50) { healthColor = '#DC2626'; healthLabel = 'Crítico (Vulnerable)'; }
  else if (healthScore < 80) { healthColor = '#D97706'; healthLabel = 'Aceptable (Mejorable)'; }

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">

      <!-- BANNER CONCEPTUAL DE ARQUITECTURA DE SEGURIDAD -->
      <div style="background: linear-gradient(135deg, var(--navy), #0A2540); color: #fff; padding: 1.5rem 1.75rem; border-radius: 16px; border: 1px solid rgba(0,194,224,0.3); box-shadow: 0 8px 24px rgba(5,17,31,0.15);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 0.75rem;">
          <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(0,194,224,0.2); color: var(--cyan); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-family: var(--font-head); font-size: 1.25rem; font-weight: 800; color: #fff;">
              Marco Gubernamental de Políticas de Seguridad y Control de Accesos
            </h3>
            <p style="margin: 0.2rem 0 0 0; font-size: 0.88rem; opacity: 0.85;">
              Normativa técnica de seguridad informática aplicada a las cuentas administrativas del Portal de Integridad Activa.
            </p>
          </div>
        </div>

        <!-- 5 PILARES DE SEGURIDAD -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.85rem; margin-top: 1.25rem;">
          <div style="background: rgba(255,255,255,0.06); padding: 0.9rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: var(--cyan); font-size: 0.82rem; display: block; margin-bottom: 0.2rem;">
              <i class="fas fa-key"></i> I. Credenciales Fuertes
            </strong>
            <span style="font-size: 0.78rem; opacity: 0.85;">Combinación exigida de caracteres para mitigar ataques de fuerza bruta.</span>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 0.9rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: var(--cyan); font-size: 0.82rem; display: block; margin-bottom: 0.2rem;">
              <i class="fas fa-user-clock"></i> II. Control de Sesión
            </strong>
            <span style="font-size: 0.78rem; opacity: 0.85;">Inactivación programada de token para mitigar el secuestro de sesiones.</span>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 0.9rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: var(--cyan); font-size: 0.82rem; display: block; margin-bottom: 0.2rem;">
              <i class="fas fa-lock"></i> III. Bloqueo Progresivo
            </strong>
            <span style="font-size: 0.78rem; opacity: 0.85;">Inhabilitación de la cuenta ante reiterados intentos fallidos de autenticación.</span>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 0.9rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: var(--cyan); font-size: 0.82rem; display: block; margin-bottom: 0.2rem;">
              <i class="fas fa-mobile-alt"></i> IV. Doble Factor 2FA
            </strong>
            <span style="font-size: 0.78rem; opacity: 0.85;">Verificación mediante clave única temporal en aplicación autenticadora (TOTP).</span>
          </div>

          <div style="background: rgba(255,255,255,0.06); padding: 0.9rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: var(--cyan); font-size: 0.82rem; display: block; margin-bottom: 0.2rem;">
              <i class="fas fa-network-wired"></i> V. Restricción de Red
            </strong>
            <span style="font-size: 0.78rem; opacity: 0.85;">Filtrado de acceso restringido a segmentos de IP o VPN institucional.</span>
          </div>
        </div>
      </div>

      <!-- EVALUACIÓN EN TIEMPO REAL DE SALUD DE SEGURIDAD -->
      <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: ${healthColor}; color: #fff; display: flex; align-items: center; justify-content: center; font-family: var(--font-head); font-weight: 800; font-size: 1.4rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            ${healthScore}
          </div>
          <div>
            <span style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">
              Indicador Global de Protección del Sistema
            </span>
            <h4 style="margin: 0.1rem 0; font-family: var(--font-head); font-size: 1.15rem; font-weight: 800; color: var(--navy);">
              Nivel de Seguridad: <span style="color: ${healthColor};">${healthLabel}</span>
            </h4>
            <span style="font-size: 0.82rem; color: var(--text-muted);">Calculado dinámicamente según las reglas activas de credenciales y bloqueo.</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <span style="font-size: 0.78rem; padding: 0.4rem 0.8rem; border-radius: 50px; background: ${policies.minPasswordLength >= 8 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)'}; color: ${policies.minPasswordLength >= 8 ? '#16A34A' : '#DC2626'}; font-weight: 700; border: 1px solid ${policies.minPasswordLength >= 8 ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'};">
            <i class="fas ${policies.minPasswordLength >= 8 ? 'fa-check' : 'fa-exclamation-triangle'}"></i> Clave ≥ ${policies.minPasswordLength} Caracteres
          </span>
          <span style="font-size: 0.78rem; padding: 0.4rem 0.8rem; border-radius: 50px; background: ${policies.failedLoginLockout <= 5 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)'}; color: ${policies.failedLoginLockout <= 5 ? '#16A34A' : '#DC2626'}; font-weight: 700; border: 1px solid ${policies.failedLoginLockout <= 5 ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'};">
            <i class="fas ${policies.failedLoginLockout <= 5 ? 'fa-check' : 'fa-exclamation-triangle'}"></i> Bloqueo (${policies.failedLoginLockout} reintentos)
          </span>
          <span style="font-size: 0.78rem; padding: 0.4rem 0.8rem; border-radius: 50px; background: ${policies.enforceGlobal2FA ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)'}; color: ${policies.enforceGlobal2FA ? '#16A34A' : '#D97706'}; font-weight: 700; border: 1px solid ${policies.enforceGlobal2FA ? 'rgba(22,163,74,0.3)' : 'rgba(217,119,6,0.3)'};">
            <i class="fas ${policies.enforceGlobal2FA ? 'fa-shield-alt' : 'fa-info-circle'}"></i> 2FA Global: ${policies.enforceGlobal2FA ? 'Exigido' : 'Opcional'}
          </span>
        </div>
      </div>

      <!-- FORMULARIO DE AJUSTE DE POLÍTICAS DE SEGURIDAD -->
      <div style="background: var(--card-bg); padding: 1.75rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04);">
        <h3 style="color: var(--navy); font-family: var(--font-head); font-size: 1.15rem; font-weight: 800; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-sliders-h" style="color: var(--cyan);"></i> Configuración Interactiva de Parámetros de Seguridad
        </h3>

        <form id="securityPoliciesForm">
          
          <!-- SECCIÓN 1: CONTRASEÑAS Y COMPLEJIDAD -->
          <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border); margin-bottom: 1.25rem;">
            <strong style="color: var(--navy); font-size: 0.95rem; display: block; margin-bottom: 0.75rem;">
              <i class="fas fa-key" style="color: var(--blue-bright);"></i> 1. Complejidad y Expiración de Contraseñas
            </strong>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.82rem; color: var(--navy);">Longitud Mínima de Contraseña</label>
                <input type="number" class="form-control" id="policyMinLength" value="${policies.minPasswordLength || 8}" min="6" max="32" required style="padding: 0.6rem 0.9rem;" />
                <small class="text-muted" style="font-size: 0.75rem;">Recomendado: 8 o más caracteres</small>
              </div>

              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.82rem; color: var(--navy);">Expiración Máxima de Credencial</label>
                <select class="form-control" id="policyPassExpiry" style="padding: 0.6rem 0.9rem;">
                  <option value="30" ${policies.passExpiryDays === '30' ? 'selected' : ''}>Cada 30 Días</option>
                  <option value="60" ${policies.passExpiryDays === '60' ? 'selected' : ''}>Cada 60 Días</option>
                  <option value="90" ${policies.passExpiryDays === '90' || !policies.passExpiryDays ? 'selected' : ''}>Cada 90 Días (Recomendado)</option>
                  <option value="never" ${policies.passExpiryDays === 'never' ? 'selected' : ''}>Sin Expiración</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; background: #fff; padding: 0.85rem; border-radius: 10px; border: 1px solid var(--border);">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--navy); cursor: pointer;">
                <input type="checkbox" id="policyRequireUpper" ${policies.requireUppercase !== false ? 'checked' : ''} style="width: 16px; height: 16px;" />
                Requerir Letras Mayúsculas (A-Z)
              </label>

              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--navy); cursor: pointer;">
                <input type="checkbox" id="policyRequireNumbers" ${policies.requireNumbers !== false ? 'checked' : ''} style="width: 16px; height: 16px;" />
                Requerir Números (0-9)
              </label>

              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--navy); cursor: pointer;">
                <input type="checkbox" id="policyRequireSpecial" ${policies.requireSpecialChars !== false ? 'checked' : ''} style="width: 16px; height: 16px;" />
                Requerir Caracteres Especiales (!@#$)
              </label>
            </div>
          </div>

          <!-- SECCIÓN 2: SESIONES Y BLOQUEOS POR REINTENTOS -->
          <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border); margin-bottom: 1.25rem;">
            <strong style="color: var(--navy); font-size: 0.95rem; display: block; margin-bottom: 0.75rem;">
              <i class="fas fa-user-clock" style="color: var(--blue-bright);"></i> 2. Control de Inactividad de Sesión y Bloqueo Anti-Fuerza Bruta
            </strong>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.82rem; color: var(--navy);">Expiración de Sesión por Inactividad</label>
                <select class="form-control" id="policyDefaultTimeout" style="padding: 0.6rem 0.9rem;">
                  <option value="15m" ${policies.defaultSessionTimeout === '15m' ? 'selected' : ''}>15 Minutos (Alta Seguridad)</option>
                  <option value="30m" ${policies.defaultSessionTimeout === '30m' || !policies.defaultSessionTimeout ? 'selected' : ''}>30 Minutos (Estándar)</option>
                  <option value="60m" ${policies.defaultSessionTimeout === '60m' ? 'selected' : ''}>1 Hora</option>
                  <option value="8h" ${policies.defaultSessionTimeout === '8h' ? 'selected' : ''}>8 Horas (Jornada)</option>
                </select>
              </div>

              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.82rem; color: var(--navy);">Intentos Fallidos antes de Bloqueo</label>
                <input type="number" class="form-control" id="policyFailedAttempts" value="${policies.failedLoginLockout || 5}" min="3" max="10" required style="padding: 0.6rem 0.9rem;" />
              </div>

              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.82rem; color: var(--navy);">Duración del Bloqueo Temporal (Minutos)</label>
                <input type="number" class="form-control" id="policyLockoutMin" value="${policies.lockoutDurationMin || 15}" min="5" max="1440" required style="padding: 0.6rem 0.9rem;" />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: AUTENTICACIÓN MULTIFACTOR Y RESTRICCIÓN DE RED -->
          <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border); margin-bottom: 1.25rem;">
            <strong style="color: var(--navy); font-size: 0.95rem; display: block; margin-bottom: 0.75rem;">
              <i class="fas fa-network-wired" style="color: var(--blue-bright);"></i> 3. Autenticación Multifactor (2FA) y Restricción de Origen (IPs)
            </strong>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label style="font-weight: 700; font-size: 0.82rem; color: var(--navy);">Subredes o Rangos IP Permitidos para Acceso Admin</label>
                <input type="text" class="form-control" id="policyAllowedSubnets" value="${policies.allowedSubnets || '*'}" placeholder="ej. 190.56.0.0/16, 10.0.0.0/8 o *" style="padding: 0.6rem 0.9rem;" />
                <small class="text-muted" style="font-size: 0.75rem;">Usa '*' para permitir cualquier red o especifica rangos CIDR separados por coma.</small>
              </div>

              <div style="display: flex; flex-direction: column; justify-content: center; gap: 0.6rem;">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.82rem; color: var(--navy); cursor: pointer;">
                  <input type="checkbox" id="policyEnforce2FA" ${policies.enforceGlobal2FA ? 'checked' : ''} style="width: 18px; height: 18px;" />
                  Exigir Autenticación Multifactor (2FA / TOTP) Obligatoria a Nivel Global
                </label>

                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.82rem; color: var(--navy); cursor: pointer;">
                  <input type="checkbox" id="policyForceFirstChange" ${policies.forceFirstChange !== false ? 'checked' : ''} style="width: 18px; height: 18px;" />
                  Forzar Cambio de Contraseña en el Primer Inicio de Sesión
                </label>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 4: AUDITORÍA Y ALERTAS -->
          <div style="background: var(--surface); padding: 1.25rem; border-radius: 14px; border: 1px solid var(--border); margin-bottom: 1.5rem;">
            <strong style="color: var(--navy); font-size: 0.95rem; display: block; margin-bottom: 0.75rem;">
              <i class="fas fa-bell" style="color: var(--blue-bright);"></i> 4. Registro de Auditoría Extendido y Alertas de Seguridad
            </strong>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.82rem; color: var(--navy); cursor: pointer; background: #fff; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border);">
                <input type="checkbox" id="policyAuditLogging" ${policies.auditLogging !== false ? 'checked' : ''} style="width: 18px; height: 18px;" />
                Activar Registro Extendido en Bitácora (IP, Headers, Payload)
              </label>

              <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.82rem; color: var(--navy); cursor: pointer; background: #fff; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border);">
                <input type="checkbox" id="policyEmailAlerts" ${policies.emailAlerts ? 'checked' : ''} style="width: 18px; height: 18px;" />
                Enviar Notificación por Correo al Detectar Bloqueo de Cuenta
              </label>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 1.25rem;">
            <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.75rem; font-weight: 700; border-radius: 10px; font-size: 0.95rem;">
              <i class="fas fa-save"></i> Guardar Políticas de Seguridad
            </button>
          </div>

        </form>
      </div>

      <!-- GUÍA CONCEPTUAL DE RESPUESTA ANTE INCIDENTES -->
      <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(5,17,31,0.04);">
        <h3 style="color: var(--navy); font-family: var(--font-head); font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-exclamation-triangle" style="color: #D97706;"></i> Guía Conceptual: Protocolo de Respuesta ante Incidentes de Seguridad
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div style="background: var(--surface); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--cyan);">
            <strong style="color: var(--navy); font-size: 0.88rem; display: block; margin-bottom: 0.3rem;">
              1. Identificación y Suspensión
            </strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              Ante sospecha de vulneración, usa el botón <strong>Inactivar</strong> en la pestaña de Usuarios para revocar inmediatamente el acceso sin perder historial.
            </p>
          </div>

          <div style="background: var(--surface); padding: 1rem; border-radius: 12px; border-left: 4px solid var(--blue-bright);">
            <strong style="color: var(--navy); font-size: 0.88rem; display: block; margin-bottom: 0.3rem;">
              2. Revocación de Sesiones
            </strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              Modifica la clave de la cuenta para expirar automáticamente los tokens JWT y sesiones activas en navegadores remotos.
            </p>
          </div>

          <div style="background: var(--surface); padding: 1rem; border-radius: 12px; border-left: 4px solid #D97706;">
            <strong style="color: var(--navy); font-size: 0.88rem; display: block; margin-bottom: 0.3rem;">
              3. Auditoría e Inspección
            </strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              Accede al módulo <strong>Bitácora de Auditoría</strong> para analizar las direcciones IP, marcas de tiempo y archivos JSON alterados.
            </p>
          </div>

          <div style="background: var(--surface); padding: 1rem; border-radius: 12px; border-left: 4px solid #16A34A;">
            <strong style="color: var(--navy); font-size: 0.88rem; display: block; margin-bottom: 0.3rem;">
              4. Restablecimiento Seguro
            </strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
              Restaura una copia de respaldo JSON previa en el módulo de Motores y exige 2FA obligatorio al reactivar la cuenta.
            </p>
          </div>
        </div>
      </div>

    </div>
  `;
}

function attachUserCardListeners() {
  document.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.onclick = () => openUserModal(btn.dataset.id);
  });
  document.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.onclick = () => toggleUserStatusHandler(btn.dataset.id, btn.dataset.status);
  });
  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.onclick = () => deleteUserHandler(btn.dataset.id);
  });
}

/* ============================================================
   EVENT LISTENERS Y MANEJADORES DE INTERACCIÓN
============================================================ */
function setupUserEventListeners() {
  // Cambio de pestaña principal (Tab 1, Tab 2, Tab 3)
  document.querySelectorAll('[data-usertab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.usertab;
      renderUserManagerView();
    });
  });

  // Buscador de usuarios (Tab 1)
  const searchUsers = document.getElementById('inputSearchUsers');
  if (searchUsers) {
    searchUsers.addEventListener('input', (e) => {
      const query = e.target.value;
      const allUsers = getUsers();
      const grid = document.getElementById('usersCardGrid');
      const countEl = document.getElementById('usersMatchCount');
      if (grid) {
        grid.innerHTML = renderUsersCards(allUsers, query);
        attachUserCardListeners();
      }
      if (countEl) {
        const q = query.toLowerCase().trim();
        const matches = q ? allUsers.filter(u => 
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          ((ADMIN_ROLES[u.role]?.name || '').toLowerCase().includes(q))
        ).length : allUsers.length;
        countEl.textContent = matches;
      }
    });
  }

  // Abrir modal de nuevo usuario
  const btnNew = document.getElementById('btnAddNewUser');
  if (btnNew) {
    btnNew.addEventListener('click', () => openUserModal());
  }

  // Botones de tarjetas de usuarios
  attachUserCardListeners();

  // Cerrar modal
  const btnClose = document.getElementById('btnCloseUserModal');
  if (btnClose) btnClose.addEventListener('click', closeUserModal);

  const btnCancel = document.getElementById('btnCancelUserModal');
  if (btnCancel) btnCancel.addEventListener('click', closeUserModal);

  // Guardar datos del modal
  const btnSave = document.getElementById('btnSaveUser');
  if (btnSave) btnSave.addEventListener('click', saveUserHandler);

  // Buscador de la Matriz de Permisos (Tab 2)
  const searchMatrix = document.getElementById('inputSearchMatrix');
  if (searchMatrix) {
    searchMatrix.addEventListener('input', (e) => {
      matrixSearchQuery = e.target.value;
      const tbody = document.querySelector('#tabRolesMatrix table tbody');
      if (tbody) tbody.innerHTML = renderMatrixTableRows(matrixSearchQuery);
    });
  }

  // Selector del Simulador de Roles (Tab 2)
  const selectSim = document.getElementById('selectSimulatorRole');
  if (selectSim) {
    selectSim.addEventListener('change', (e) => {
      simulatorSelectedRole = e.target.value;
      renderUserManagerView();
    });
  }

  // Formulario de Guardado de Políticas de Seguridad (Tab 3)
  const polForm = document.getElementById('securityPoliciesForm');
  if (polForm) {
    polForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const updated = {
        minPasswordLength: parseInt(document.getElementById('policyMinLength').value, 10) || 8,
        requireUppercase: document.getElementById('policyRequireUpper').checked,
        requireNumbers: document.getElementById('policyRequireNumbers').checked,
        requireSpecialChars: document.getElementById('policyRequireSpecial').checked,
        passExpiryDays: document.getElementById('policyPassExpiry').value,
        defaultSessionTimeout: document.getElementById('policyDefaultTimeout').value,
        failedLoginLockout: parseInt(document.getElementById('policyFailedAttempts').value, 10) || 5,
        lockoutDurationMin: parseInt(document.getElementById('policyLockoutMin').value, 10) || 15,
        allowedSubnets: document.getElementById('policyAllowedSubnets').value.trim() || '*',
        enforceGlobal2FA: document.getElementById('policyEnforce2FA').checked,
        forceFirstChange: document.getElementById('policyForceFirstChange').checked,
        auditLogging: document.getElementById('policyAuditLogging').checked,
        emailAlerts: document.getElementById('policyEmailAlerts').checked
      };

      try {
        await fetch('/api/security-policies', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(updated)
        });
        cachedPolicies = updated;
        localStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(updated));
        showToast('Políticas de seguridad y accesos actualizadas correctamente', 'success');
        renderUserManagerView();
      } catch (err) {
        console.warn('Fallo en API de políticas, guardando localmente:', err);
        cachedPolicies = updated;
        localStorage.setItem(STORAGE_SECURITY_KEY, JSON.stringify(updated));
        showToast('Políticas de seguridad guardadas en almacenamiento local', 'success');
        renderUserManagerView();
      }
    });
  }
}

/* ============================================================
   MANEJADORES DE MODAL Y CRUD
============================================================ */
function openUserModal(userId = null) {
  currentEditingUserId = userId;
  const users = getUsers();
  const user = userId ? users.find(u => u.id === userId || u.username === userId || String(u.id) === String(userId)) : null;

  document.getElementById('userModalTitle').textContent = user ? `Editar Usuario: ${user.fullName}` : 'Registrar Nuevo Usuario Administrador';
  
  document.getElementById('formFullName').value = user ? user.fullName : '';
  document.getElementById('formUsername').value = user ? user.username : '';
  document.getElementById('formEmail').value = user ? user.email : '';
  document.getElementById('formRole').value = user ? user.role : 'module_admin';
  document.getElementById('formPassword').value = '';
  document.getElementById('formStatus').value = user ? user.status : 'active';
  document.getElementById('formMfa').checked = user ? !!user.mfaEnabled : false;
  document.getElementById('formForcePass').checked = user ? !!user.forcePasswordChange : false;

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
    console.warn('API error during user save, applying local save fallback:', err);
    
    // Fallback local
    if (currentEditingUserId) {
      const idx = cachedUsers.findIndex(u => u.id === currentEditingUserId || u.username === currentEditingUserId || String(u.id) === String(currentEditingUserId));
      if (idx !== -1) {
        cachedUsers[idx] = { ...cachedUsers[idx], ...payload };
      }
    } else {
      const newUser = {
        id: `usr_${Date.now()}`,
        ...payload,
        sessionTimeout: '30m',
        allowedIp: '*',
        lastLogin: 'Nunca'
      };
      cachedUsers.push(newUser);
    }

    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsers));
    showToast(currentEditingUserId ? 'Usuario actualizado en almacenamiento local' : 'Usuario guardado en almacenamiento local', 'success');
    closeUserModal();
    renderUserManagerView();
  }
}

async function toggleUserStatusHandler(userId, currentStatus) {
  const users = getUsers();
  const user = users.find(u => u.id === userId || u.username === userId || String(u.id) === String(userId));
  if (!user) return;
  if (user.username === 'admin') {
    showToast('No se puede inactivar al usuario administrador principal', 'error');
    return;
  }

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const actionLabel = newStatus === 'inactive' ? 'inactivado' : 'activado';

  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Error al cambiar estado de usuario`);
    }

    const updated = await res.json();
    const idx = cachedUsers.findIndex(u => u.id === userId || u.username === userId || String(u.id) === String(userId));
    if (idx !== -1) {
      cachedUsers[idx].status = newStatus;
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsers));

    showToast(`Usuario @${user.username} ${actionLabel} correctamente`, 'success');
    await fetchUsersApi();
    renderUserManagerView();
  } catch (err) {
    console.warn('API error during toggle status, applying fallback:', err);
    const idx = cachedUsers.findIndex(u => u.id === userId || u.username === userId || String(u.id) === String(userId));
    if (idx !== -1) {
      cachedUsers[idx].status = newStatus;
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsers));
    }
    showToast(`Usuario @${user.username} ${actionLabel}`, 'success');
    renderUserManagerView();
  }
}

async function deleteUserHandler(userId) {
  const users = getUsers();
  const user = users.find(u => u.id === userId || u.username === userId || String(u.id) === String(userId));
  if (!user) return;
  if (user.username === 'admin') {
    showToast('No se puede eliminar el usuario administrador principal', 'error');
    return;
  }
  if (!confirm(`¿Estás seguro de eliminar permanentemente al usuario '${user.fullName}' (@${user.username})?`)) return;

  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al eliminar usuario');
    }

    cachedUsers = cachedUsers.filter(u => u.id !== userId && u.username !== userId && String(u.id) !== String(userId));
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsers));

    showToast(`Usuario @${user.username} eliminado correctamente`, 'success');
    await fetchUsersApi();
    renderUserManagerView();
  } catch (err) {
    console.warn('API error during user deletion, applying local deletion:', err);
    cachedUsers = cachedUsers.filter(u => u.id !== userId && u.username !== userId && String(u.id) !== String(userId));
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cachedUsers));

    showToast(`Usuario @${user.username} eliminado`, 'success');
    renderUserManagerView();
  }
}

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '0.75rem 1.25rem';
  toast.style.borderRadius = '10px';
  toast.style.background = type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#2563EB';
  toast.style.color = '#fff';
  toast.style.fontWeight = '700';
  toast.style.fontSize = '0.88rem';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  toast.style.zIndex = '9999';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}
