// file-manager.js - Administrador de archivos (subida, gestión)

async function uploadFile(file, module = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);

    const res = await fetch(`${getApiBase()}/files/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al subir archivo');
    }
    return res.json(); // { url, filename }
}

async function getFiles(module = 'general') {
    const res = await fetch(`${getApiBase()}/files?module=${module}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener archivos');
    return res.json();
}

async function deleteFile(filename) {
    const res = await fetch(`${getApiBase()}/files/${filename}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al eliminar archivo');
    }
    return res.json();
}

// Manejar la selección de imagen en formularios
document.addEventListener('change', function(e) {
    const input = e.target.closest('.image-upload');
    if (!input) return;
    const file = input.files[0];
    if (!file) return;
    const preview = input.closest('.image-picker').querySelector('.preview');
    const hidden = input.closest('.image-picker').querySelector('input[type="hidden"]');
    const reader = new FileReader();
    reader.onload = function(ev) {
        preview.innerHTML = `<img src="${ev.target.result}" width="100" />`;
        // Subir automáticamente
        uploadFile(file).then(result => {
            hidden.value = result.url;
            showToast('Imagen subida correctamente', 'success');
        }).catch(err => {
            showToast('Error al subir imagen: ' + err.message, 'error');
        });
    };
    reader.readAsDataURL(file);
});