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
    return data; // { token, user: { id, username, role } }
}

async function verifyToken(token) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Token inválido');
    return res.json(); // { user }
}

function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}