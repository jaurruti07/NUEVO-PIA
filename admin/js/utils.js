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

// Enriched Toasts & Skeleton Loader utilities
function getToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    return container;
}

window.showToast = function(message, type = 'info', undoCallback = null, duration = 4000) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const iconClass = icons[type] || icons.info;

    let undoBtnHtml = '';
    if (typeof undoCallback === 'function') {
        undoBtnHtml = `<button class="toast-undo-btn"><i class="fas fa-undo-alt"></i> Deshacer</button>`;
    }

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${type.toUpperCase()}</div>
            <div>${message}</div>
        </div>
        ${undoBtnHtml}
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    if (undoCallback) {
        const btn = toast.querySelector('.toast-undo-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                undoCallback();
                toast.classList.add('toast-exiting');
                setTimeout(() => toast.remove(), 250);
            });
        }
    }

    container.appendChild(toast);

    const timer = setTimeout(() => {
        toast.classList.add('toast-exiting');
        setTimeout(() => toast.remove(), 250);
    }, duration);

    toast.addEventListener('mouseenter', () => {
        const progress = toast.querySelector('.toast-progress');
        if (progress) progress.style.animationPlayState = 'paused';
    });
    toast.addEventListener('mouseleave', () => {
        const progress = toast.querySelector('.toast-progress');
        if (progress) progress.style.animationPlayState = 'running';
    });
};

function showToast(message, type = 'info', undoCallback = null, duration = 4000) {
    window.showToast(message, type, undoCallback, duration);
}

// Generador universal de tablas esqueletizadas (Skeleton Table Loader)
window.renderSkeletonTable = function(target, cols = 5, rows = 5) {
    let el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;

    // Si el elemento recibido es un contenedor o la tabla misma
    let table = el.tagName === 'TABLE' ? el : el.querySelector('table');
    if (!table && el.tagName !== 'TABLE') {
        el.innerHTML = `<table style="width:100%; border-collapse:collapse;"><thead></thead><tbody></tbody></table>`;
        table = el.querySelector('table');
    }

    if (!table) return;

    let headersHtml = '<tr>';
    for (let c = 0; c < cols; c++) {
        headersHtml += `<th style="padding: 0.85rem 1rem;"><div class="skeleton-loader" style="width: ${60 + (c % 3) * 15}%;"></div></th>`;
    }
    headersHtml += '</tr>';

    let bodyHtml = '';
    const widths = [85, 65, 45, 90, 70, 50, 75, 60, 40];
    for (let r = 0; r < rows; r++) {
        bodyHtml += `<tr class="skeleton-row" style="border-bottom: 1px solid var(--border);">`;
        for (let c = 0; c < cols; c++) {
            const w = widths[(r + c) % widths.length];
            bodyHtml += `<td style="padding: 0.85rem 1rem;"><div class="skeleton-loader" style="width: ${w}%;"></div></td>`;
        }
        bodyHtml += `</tr>`;
    }

    table.innerHTML = `<thead>${headersHtml}</thead><tbody>${bodyHtml}</tbody>`;
};


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
