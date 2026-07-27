// crud.js - Operaciones CRUD genéricas

const API_BASE = getApiBase();

async function getModules() {
    const res = await fetch(`${API_BASE}/modules`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al obtener módulos');
    return res.json();
}

async function getModuleData(module) {
    const res = await fetch(`${API_BASE}/${module}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Error al obtener datos de ${module}`);
    return res.json();
}

async function getRecord(module, id) {
    const res = await fetch(`${API_BASE}/${module}/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Registro no encontrado');
    return res.json();
}

async function createRecord(module, data) {
    const res = await fetch(`${API_BASE}/${module}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al crear');
    }
    return res.json();
}

async function updateRecord(module, id, data) {
    const res = await fetch(`${API_BASE}/${module}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar');
    }
    return res.json();
}

async function deleteRecord(module, id) {
    const res = await fetch(`${API_BASE}/${module}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar');
    }
    return res.json();
}