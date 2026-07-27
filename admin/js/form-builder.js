// form-builder.js - Generador de formularios dinámicos

function detectFieldType(value) {
    if (value === null || value === undefined) return 'text';
    if (typeof value === 'boolean') return 'checkbox';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
        if (value.match(/^https?:\/\//)) return 'url';
        if (value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || value.startsWith('data:image')) return 'image';
        if (value.includes('<') || value.includes('>')) return 'html';
        return 'text';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'text';
}

function renderField(key, type, value, schema) {
    const val = value !== undefined && value !== null ? value : '';
    const name = key;
    const id = `field-${key}`;
    let html = '';

    switch (type) {
        case 'text':
            html = `<input type="text" name="${name}" id="${id}" value="${escapeHtml(val)}" class="form-control" />`;
            break;
        case 'number':
            html = `<input type="number" name="${name}" id="${id}" value="${val}" class="form-control" step="any" />`;
            break;
        case 'checkbox':
            html = `<input type="checkbox" name="${name}" id="${id}" ${val ? 'checked' : ''} class="form-check" value="true" />`;
            break;
        case 'url':
            html = `<input type="url" name="${name}" id="${id}" value="${escapeHtml(val)}" class="form-control" />`;
            break;
        case 'image':
            html = `
                <div class="image-picker">
                    <input type="file" accept="image/*" data-target="${name}" class="image-upload" />
                    <input type="hidden" name="${name}" id="${id}" value="${escapeHtml(val)}" />
                    <div class="preview">${val ? `<img src="${escapeHtml(val)}" width="100" />` : ''}</div>
                </div>
            `;
            break;
        case 'html':
            html = `<textarea name="${name}" id="${id}" class="form-control ck-editor" rows="6">${escapeHtml(val)}</textarea>`;
            break;
        case 'array':
            const arrayVal = Array.isArray(val) ? val.join(', ') : val;
            html = `<textarea name="${name}" id="${id}" class="form-control" rows="2">${escapeHtml(arrayVal)}</textarea>
                    <small class="text-muted">Separa los elementos con comas</small>`;
            break;
        case 'object':
            html = `<textarea name="${name}" id="${id}" class="form-control" rows="3">${escapeHtml(JSON.stringify(val, null, 2))}</textarea>
                    <small class="text-muted">Objeto JSON</small>`;
            break;
        default:
            html = `<input type="text" name="${name}" id="${id}" value="${escapeHtml(val)}" class="form-control" />`;
    }
    return html;
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateForm(schema, data = {}) {
    let html = '';
    for (const [key, value] of Object.entries(schema)) {
        // Omitir campos internos como 'id'
        if (key === 'id') continue;
        const type = detectFieldType(value);
        const val = data[key] !== undefined ? data[key] : value;
        html += `
            <div class="form-group">
                <label for="field-${key}">${capitalize(key)}</label>
                ${renderField(key, type, val, schema)}
            </div>
        `;
    }
    return html;
}

function getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    for (const [key, value] of formData.entries()) {
        // Si es checkbox, solo se envía si está marcado
        const input = formElement.querySelector(`[name="${key}"]`);
        if (input && input.type === 'checkbox') {
            data[key] = input.checked;
        } else if (input && input.type === 'file') {
            // Los archivos se manejan por separado (file-manager)
            continue;
        } else {
            // Intentar parsear JSON si es objeto
            if (key === 'object' || key === 'array') {
                try {
                    data[key] = JSON.parse(value);
                } catch {
                    data[key] = value;
                }
            } else {
                data[key] = value;
            }
        }
    }
    return data;
}

// Inicializar editores CKEditor
function initEditors() {
    document.querySelectorAll('.ck-editor').forEach(el => {
        if (el.dataset.editor) return;
        ClassicEditor.create(el, {
            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'mediaEmbed', 'undo', 'redo']
        }).then(editor => {
            el.dataset.editor = 'true';
            editor.model.document.on('change:data', () => {
                const textarea = el;
                textarea.value = editor.getData();
            });
        }).catch(err => console.error(err));
    });
}