// auth.js - Autenticación y manejo de sesión

const API_BASE = getApiBase();

async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error de autenticación');
    }
    const data = await res.json();
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data; // { token, user }
}

async function verifyToken(token) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Token inválido');
    const data = await res.json();
    if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data; // { user }
}

function logout(reason) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    if (reason) {
        sessionStorage.setItem('logout_reason', reason);
    }
    window.location.reload();
}

window.login = login;
window.verifyToken = verifyToken;
window.logout = logout;