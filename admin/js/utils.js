// utils.js - Utilidades comunes

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
}

function getApiBase() {
    return '/api';
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
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function getDatabaseConfigForPage(pageName) {
    const stored = localStorage.getItem('pia_db_configurations');
    if (stored) {
        try {
            const config = JSON.parse(stored);
            const dbId = config.pageDatabaseMap[pageName];
            if (dbId) {
                const db = config.databases.find(d => d.id === dbId);
                if (db) return db;
            }
            if (config.defaultDatabase) {
                const db = config.databases.find(d => d.id === config.defaultDatabase);
                if (db) return db;
            }
        } catch (e) {
            console.error('Error parsing DB config:', e);
        }
    }
    return null;
}

function getAllDatabaseConfigs() {
    const stored = localStorage.getItem('pia_db_configurations');
    if (!stored) return { databases: [], defaultDatabase: null, pageDatabaseMap: {} };
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Error parsing DB config:', e);
        return { databases: [], defaultDatabase: null, pageDatabaseMap: {} };
    }
}

const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #05111F;
        color: #fff;
        padding: 10px 24px;
        border-radius: 50px;
        font-weight: 600;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideUp 0.3s ease;
    }
    .toast-success { background: #22C55E; }
    .toast-error { background: #EF4444; }
    .toast-info { background: #2B82C9; }
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(toastStyles);
