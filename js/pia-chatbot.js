/* ============================================================
   PIA CHATBOT INTELIGENTE - FRONTEND CLIENT
   ============================================================ */

(function () {
    'use strict';

    // State Variables
    let isOpen = false;
    let isDark = false;
    let sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    let conversationHistory = [];
    let isWaitingResponse = false;

    // DOM Elements
    let triggerBtn, chatWindow, messagesContainer, textareaInput, sendBtn;

    // Initialize Chatbot Widget on DOM Ready
    function initChatbot() {
        if (document.getElementById('piaChatbotWindow')) return; // Avoid duplicate

        // Append CSS link
        if (!document.querySelector('link[href*="pia-chatbot.css"]')) {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = '/css/pia-chatbot.css';
            document.head.appendChild(css);
        }

        // Render HTML markup
        renderChatbotHTML();

        // Query DOM elements
        triggerBtn = document.getElementById('piaChatbotTrigger');
        chatWindow = document.getElementById('piaChatbotWindow');
        messagesContainer = document.getElementById('piaCbMessages');
        textareaInput = document.getElementById('piaCbTextarea');
        sendBtn = document.getElementById('piaCbSendBtn');

        // Check stored theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            isDark = true;
            chatWindow.classList.add('dark');
        }

        // Load Stored Session History
        loadLocalHistory();

        // Attach Event Listeners
        attachEventListeners();

        // Fetch Initial Config
        fetchConfig();
    }

    function renderChatbotHTML() {
        const triggerMarkup = `
            <button id="piaChatbotTrigger" class="pia-chatbot-trigger" aria-label="Abrir Asistente Virtual Lupita" title="Lupita - Asistente Virtual IA">
                <div class="pia-chatbot-trigger-icon">
                    <img src="/img/asistenteVirtual2.png" alt="Asistente Virtual Lupita" class="pia-assistant-icon" />
                    <span class="pia-chatbot-pulse"></span>
                </div>
                <div class="pia-chatbot-trigger-text">
                    <span class="pia-chatbot-trigger-title">Lupita</span>
                    <span class="pia-chatbot-trigger-sub">Asistente Virtual IA</span>
                </div>
            </button>
        `;

        const windowMarkup = `
            <div id="piaChatbotWindow" class="pia-chatbot-window" role="dialog" aria-labelledby="piaCbHeaderTitle" aria-hidden="true">
                <!-- Header -->
                <div class="pia-cb-header">
                    <div class="pia-cb-header-brand">
                        <div class="pia-cb-avatar">
                            <img src="/img/asistenteVirtual2.png" alt="Asistente Virtual Lupita" class="pia-assistant-icon" />
                        </div>
                        <div class="pia-cb-title-box">
                            <h2 id="piaCbHeaderTitle" class="pia-cb-title">Lupita · Asistente Virtual</h2>
                            <span class="pia-cb-status">
                                <span class="pia-cb-status-dot"></span> En línea · Transparencia e Integridad
                            </span>
                        </div>
                    </div>
                    <div class="pia-cb-header-actions">
                        <button class="pia-cb-action-btn" id="piaCbKbBtn" title="Base de Conocimiento y Entrenamiento IA">
                            <i class="fas fa-book-open"></i>
                        </button>
                        <button class="pia-cb-action-btn" id="piaCbSettingsBtn" title="Configuración de Parámetros de la IA">
                            <i class="fas fa-sliders-h"></i>
                        </button>
                        <button class="pia-cb-action-btn" id="piaCbThemeBtn" title="Cambiar tema claro/oscuro">
                            <i class="fas fa-moon"></i>
                        </button>
                        <button class="pia-cb-action-btn" id="piaCbExportBtn" title="Descargar conversación (TXT)">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="pia-cb-action-btn" id="piaCbResetBtn" title="Reiniciar conversación">
                            <i class="fas fa-rotate-right"></i>
                        </button>
                        <button class="pia-cb-action-btn" id="piaCbCloseBtn" title="Cerrar chat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- OVERLAY PANEL 1: BASE DE CONOCIMIENTO IA -->
                <div id="piaCbKbOverlay" class="pia-cb-overlay-panel">
                    <div class="pia-cb-overlay-header">
                        <h3 class="pia-cb-overlay-title"><i class="fas fa-book-open" style="color:#00C2E0;"></i> Base de Conocimiento IA</h3>
                        <button type="button" id="piaCbKbCloseBtn" style="background:none; border:none; color:#fff; font-size:1.1rem; cursor:pointer;" aria-label="Cerrar">&times;</button>
                    </div>
                    <div class="pia-cb-overlay-body">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <input type="text" id="piaCbKbSearch" class="pia-cb-form-input" placeholder="Buscar artículos..." style="flex:1;">
                            <button type="button" id="piaCbKbAddToggleBtn" class="pia-cb-btn-primary" style="white-space:nowrap; padding:6px 10px;">
                                <i class="fas fa-plus"></i> Nuevo
                            </button>
                        </div>

                        <!-- Formulario para Agregar Nuevo Conocimiento -->
                        <form id="piaCbKbAddForm" style="display:none; background:rgba(0,194,224,0.06); padding:12px; border-radius:10px; border:1px solid rgba(0,194,224,0.25); margin-top:6px;">
                            <h4 style="margin:0 0 8px 0; font-size:0.82rem; color:#00C2E0; font-weight:700;"><i class="fas fa-plus-circle"></i> Agregar Conocimiento a Lupita</h4>
                            <div class="pia-cb-form-group" style="margin-bottom:6px;">
                                <label class="pia-cb-form-label">Título / Pregunta Frecuente</label>
                                <input type="text" id="piaCbKbTitle" class="pia-cb-form-input" required placeholder="Ej: ¿Cómo consultar viáticos de ministros?">
                            </div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:6px;">
                                <div class="pia-cb-form-group">
                                    <label class="pia-cb-form-label">Categoría</label>
                                    <select id="piaCbKbCategory" class="pia-cb-form-select">
                                        <option value="General">General</option>
                                        <option value="Denuncias">Denuncias</option>
                                        <option value="Probidad">Probidad</option>
                                        <option value="Directorio">Directorio</option>
                                        <option value="Vehículos">Vehículos</option>
                                        <option value="Estadísticas">Estadísticas</option>
                                        <option value="Riesgos">Riesgos</option>
                                    </select>
                                </div>
                                <div class="pia-cb-form-group">
                                    <label class="pia-cb-form-label">Ruta / Enlace</label>
                                    <input type="text" id="piaCbKbLink" class="pia-cb-form-input" value="/" placeholder="/directorio/">
                                </div>
                            </div>
                            <div class="pia-cb-form-group" style="margin-bottom:6px;">
                                <label class="pia-cb-form-label">Respuesta Explicativa Oficial</label>
                                <textarea id="piaCbKbContent" class="pia-cb-form-textarea" rows="3" required placeholder="Redacte la explicación oficial para los ciudadanos..."></textarea>
                            </div>
                            <div class="pia-cb-form-group" style="margin-bottom:8px;">
                                <label class="pia-cb-form-label">Palabras Clave (Separadas por comas)</label>
                                <input type="text" id="piaCbKbKeywords" class="pia-cb-form-input" placeholder="viaticos, gastos, viajes, ministros">
                            </div>
                            <div style="display:flex; justify-content:flex-end; gap:6px;">
                                <button type="button" id="piaCbKbCancelBtn" style="background:none; border:none; color:var(--pia-cb-subtext-light); font-size:0.78rem; cursor:pointer;">Cancelar</button>
                                <button type="submit" class="pia-cb-btn-primary" style="padding:5px 12px; font-size:0.78rem;"><i class="fas fa-save"></i> Guardar Artículo</button>
                            </div>
                        </form>

                        <div id="piaCbKbList" style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
                            <!-- Cargando lista de conocimiento... -->
                        </div>
                    </div>
                </div>

                <!-- OVERLAY PANEL 2: CONFIGURACIÓN DE IA -->
                <div id="piaCbSettingsOverlay" class="pia-cb-overlay-panel">
                    <div class="pia-cb-overlay-header">
                        <h3 class="pia-cb-overlay-title"><i class="fas fa-sliders-h" style="color:#00C2E0;"></i> Configuración de la IA</h3>
                        <button type="button" id="piaCbSettingsCloseBtn" style="background:none; border:none; color:#fff; font-size:1.1rem; cursor:pointer;" aria-label="Cerrar">&times;</button>
                    </div>
                    <div class="pia-cb-overlay-body">
                        <form id="piaCbSettingsForm" style="display:flex; flex-direction:column; gap:10px;">
                            <div class="pia-cb-form-group">
                                <label class="pia-cb-form-label">Modelo LLM</label>
                                <select id="piaCbModelSelect" class="pia-cb-form-select">
                                    <option value="gemini-3.6-flash">gemini-3.6-flash (Recomendado - Ultra Rápido)</option>
                                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Razonamiento Complejo)</option>
                                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Respuesta Ligera)</option>
                                </select>
                            </div>

                            <div class="pia-cb-form-group">
                                <label class="pia-cb-form-label">Temperatura (<span id="piaCbTempLabel">0.2</span>)</label>
                                <input type="range" id="piaCbTempSlider" min="0" max="1" step="0.1" value="0.2" class="pia-cb-form-input" oninput="document.getElementById('piaCbTempLabel').textContent=this.value">
                                <span style="font-size:0.7rem; color:var(--pia-cb-subtext-light);">Valores bajos garantizan respuestas institucionales y precisas.</span>
                            </div>

                            <div class="pia-cb-form-group">
                                <label class="pia-cb-form-label">Instrucción del Sistema (System Prompt)</label>
                                <textarea id="piaCbPromptArea" class="pia-cb-form-textarea" rows="4" style="font-size:0.78rem; font-family:monospace;"></textarea>
                            </div>

                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                                <div class="pia-cb-form-group">
                                    <label class="pia-cb-form-label">Tokens Máx.</label>
                                    <input type="number" id="piaCbMaxTokensInput" class="pia-cb-form-input" value="1024" min="256" max="2048">
                                </div>
                                <div class="pia-cb-form-group">
                                    <label class="pia-cb-form-label">Estado del Asistente</label>
                                    <select id="piaCbEnabledSelect" class="pia-cb-form-select">
                                        <option value="true">🟢 Activo en el Portal</option>
                                        <option value="false">🔴 Inactivo / Mantenimiento</option>
                                    </select>
                                </div>
                            </div>

                            <div style="margin-top:10px; text-align:right;">
                                <button type="submit" class="pia-cb-btn-primary" style="width:100%; justify-content:center;">
                                    <i class="fas fa-save"></i> Guardar Parámetros de la IA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Suggestions Bar -->
                <div class="pia-cb-suggestions-bar" id="piaCbSuggestions">
                    <!-- Dynamic Suggestion Chips -->
                </div>

                <!-- Messages Body -->
                <div class="pia-cb-messages" id="piaCbMessages" role="log" aria-live="polite">
                    <!-- Welcome Message -->
                    <div class="pia-cb-msg bot">
                        <div class="pia-cb-bubble">
                            👋 ¡Hola! Soy <strong>Lupita</strong>, la asistente virtual oficial del <strong>Portal de Integridad Activa (PIA)</strong> de Guatemala.<br><br>
                            Puedo guiarte para presentar denuncias por corrupción, consultar el directorio de funcionarios públicos, revisar la asignación de vehículos oficiales con Transparencia Vehicular y entender los tableros estadísticos.<br><br>
                            ¿En qué puedo ayudarte hoy?
                        </div>
                        <span class="pia-cb-timestamp">${getCurrentTimeString()}</span>
                    </div>
                </div>

                <!-- Footer Input Area -->
                <div class="pia-cb-footer">
                    <div class="pia-cb-input-wrapper">
                        <textarea id="piaCbTextarea" class="pia-cb-textarea" rows="1" placeholder="Escribe tu consulta aquí..." aria-label="Escribe tu consulta para la asistente virtual Lupita"></textarea>
                        <button id="piaCbSendBtn" class="pia-cb-send-btn" aria-label="Enviar mensaje">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="pia-cb-disclaimer">
                        <i class="fas fa-lock" style="color: #00C2E0; margin-right: 3px;"></i> Información oficial verificada del Gobierno de Guatemala.
                    </div>
                </div>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.id = 'piaChatbotWrapper';
        wrapper.innerHTML = triggerMarkup + windowMarkup;
        document.body.appendChild(wrapper);
    }

    function attachEventListeners() {
        triggerBtn.addEventListener('click', toggleChatbot);
        document.getElementById('piaCbCloseBtn').addEventListener('click', closeChatbot);

        document.getElementById('piaCbThemeBtn').addEventListener('click', () => {
            isDark = !isDark;
            chatWindow.classList.toggle('dark', isDark);
            const icon = document.querySelector('#piaCbThemeBtn i');
            if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });

        document.getElementById('piaCbResetBtn').addEventListener('click', resetConversation);
        document.getElementById('piaCbExportBtn').addEventListener('click', exportConversationTXT);

        // KB & Settings Overlay Listeners
        const kbBtn = document.getElementById('piaCbKbBtn');
        if (kbBtn) kbBtn.addEventListener('click', openKbOverlay);

        const kbCloseBtn = document.getElementById('piaCbKbCloseBtn');
        if (kbCloseBtn) kbCloseBtn.addEventListener('click', closeKbOverlay);

        const kbAddToggleBtn = document.getElementById('piaCbKbAddToggleBtn');
        if (kbAddToggleBtn) {
            kbAddToggleBtn.addEventListener('click', () => {
                const form = document.getElementById('piaCbKbAddForm');
                if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
            });
        }

        const kbCancelBtn = document.getElementById('piaCbKbCancelBtn');
        if (kbCancelBtn) {
            kbCancelBtn.addEventListener('click', () => {
                const form = document.getElementById('piaCbKbAddForm');
                if (form) form.style.display = 'none';
            });
        }

        const kbSearchInput = document.getElementById('piaCbKbSearch');
        if (kbSearchInput) {
            kbSearchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase();
                const filtered = cachedWidgetKb.filter(item =>
                    item.title.toLowerCase().includes(q) ||
                    item.content.toLowerCase().includes(q) ||
                    (item.category || '').toLowerCase().includes(q)
                );
                renderWidgetKbList(filtered);
            });
        }

        const kbAddForm = document.getElementById('piaCbKbAddForm');
        if (kbAddForm) {
            kbAddForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = document.getElementById('piaCbKbTitle').value;
                const category = document.getElementById('piaCbKbCategory').value;
                const link = document.getElementById('piaCbKbLink').value;
                const content = document.getElementById('piaCbKbContent').value;
                const keywords = document.getElementById('piaCbKbKeywords').value;

                try {
                    const saveRes = await fetch('/api/chatbot/knowledge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, category, link, content, keywords })
                    });

                    if (saveRes.ok) {
                        const newItem = await saveRes.json();
                        kbAddForm.reset();
                        kbAddForm.style.display = 'none';
                        await fetchWidgetKb();

                        // Notify chat
                        appendMessage('bot', `✅ **Nuevo conocimiento registrado:**\n*${newItem.title}*\nLa asistente Lupita ha sido entrenada con este nuevo artículo.`);
                        closeKbOverlay();
                    } else {
                        alert('Error al guardar artículo en la base de conocimiento');
                    }
                } catch (err) {
                    console.error('Error saving KB item:', err);
                    alert('Error de conexión al guardar el conocimiento');
                }
            });
        }

        const settingsBtn = document.getElementById('piaCbSettingsBtn');
        if (settingsBtn) settingsBtn.addEventListener('click', openSettingsOverlay);

        const settingsCloseBtn = document.getElementById('piaCbSettingsCloseBtn');
        if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettingsOverlay);

        const settingsForm = document.getElementById('piaCbSettingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const model = document.getElementById('piaCbModelSelect').value;
                const temperature = parseFloat(document.getElementById('piaCbTempSlider').value);
                const systemPrompt = document.getElementById('piaCbPromptArea').value.trim();
                const maxTokens = parseInt(document.getElementById('piaCbMaxTokensInput').value, 10);
                const enabled = document.getElementById('piaCbEnabledSelect').value === 'true';

                try {
                    const updateRes = await fetch('/api/chatbot/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ model, temperature, systemPrompt, maxTokens, enabled })
                    });

                    if (updateRes.ok) {
                        closeSettingsOverlay();
                        appendMessage('bot', `⚙️ **Configuración de IA actualizada con éxito.**\nModelo: \`${model}\` | Temp: \`${temperature}\` | Estado: \`${enabled ? '🟢 Activo' : '🔴 Inactivo'}\``);
                    } else {
                        alert('Error al guardar parámetros de la IA');
                    }
                } catch (err) {
                    console.error('Error updating chatbot settings:', err);
                    alert('Error de conexión al actualizar configuración');
                }
            });
        }

        sendBtn.addEventListener('click', handleUserSendMessage);

        textareaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserSendMessage();
            }
        });

        // Auto height for textarea
        textareaInput.addEventListener('input', () => {
            textareaInput.style.height = 'auto';
            textareaInput.style.height = Math.min(textareaInput.scrollHeight, 80) + 'px';
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeChatbot();
            }
        });
    }

    let cachedWidgetKb = [];

    // KB Overlay Methods
    async function openKbOverlay() {
        const overlay = document.getElementById('piaCbKbOverlay');
        if (!overlay) return;
        overlay.classList.add('open');
        await fetchWidgetKb();
    }

    function closeKbOverlay() {
        const overlay = document.getElementById('piaCbKbOverlay');
        if (overlay) overlay.classList.remove('open');
        const form = document.getElementById('piaCbKbAddForm');
        if (form) form.style.display = 'none';
    }

    async function fetchWidgetKb() {
        try {
            const res = await fetch('/api/chatbot/knowledge');
            if (res.ok) {
                cachedWidgetKb = await res.json();
                renderWidgetKbList(cachedWidgetKb);
            }
        } catch (e) {
            console.error('Error fetching chatbot knowledge:', e);
        }
    }

    function renderWidgetKbList(items) {
        const container = document.getElementById('piaCbKbList');
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = '<div style="font-size:0.8rem; color:var(--pia-cb-subtext-light); text-align:center; padding:10px;">No hay artículos registrados.</div>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="pia-cb-kb-item-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                    <strong style="font-size:0.82rem; color:#00C2E0;">${escapeHTML(item.title)}</strong>
                    <span style="font-size:0.68rem; padding:2px 6px; background:rgba(0,194,224,0.15); color:#00C2E0; border-radius:10px; font-weight:700;">${escapeHTML(item.category || 'General')}</span>
                </div>
                <p style="font-size:0.75rem; margin:2px 0; color:var(--pia-cb-subtext-light); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHTML(item.content)}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <span style="font-size:0.68rem; color:var(--pia-cb-subtext-light);"><i class="fas fa-link"></i> ${escapeHTML(item.link || '/')}</span>
                    <button type="button" onclick="window.PIA_CHATBOT.deleteKbItem('${item.id}')" style="background:none; border:none; color:#EF4444; font-size:0.75rem; cursor:pointer;" title="Eliminar artículo"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    async function deleteWidgetKbItem(id) {
        if (!confirm('¿Desea eliminar este artículo de la base de conocimiento?')) return;
        try {
            const res = await fetch(`/api/chatbot/knowledge/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchWidgetKb();
            }
        } catch (e) {
            console.error('Error deleting KB item:', e);
        }
    }

    // Settings Overlay Methods
    async function openSettingsOverlay() {
        const overlay = document.getElementById('piaCbSettingsOverlay');
        if (!overlay) return;
        overlay.classList.add('open');

        try {
            const res = await fetch('/api/chatbot/settings');
            if (res.ok) {
                const settings = await res.json();
                if (document.getElementById('piaCbModelSelect')) document.getElementById('piaCbModelSelect').value = settings.model || 'gemini-3.6-flash';
                if (document.getElementById('piaCbTempSlider')) {
                    document.getElementById('piaCbTempSlider').value = settings.temperature !== undefined ? settings.temperature : 0.2;
                    if (document.getElementById('piaCbTempLabel')) document.getElementById('piaCbTempLabel').textContent = settings.temperature;
                }
                if (document.getElementById('piaCbPromptArea')) document.getElementById('piaCbPromptArea').value = settings.systemPrompt || '';
                if (document.getElementById('piaCbMaxTokensInput')) document.getElementById('piaCbMaxTokensInput').value = settings.maxTokens || 1024;
                if (document.getElementById('piaCbEnabledSelect')) document.getElementById('piaCbEnabledSelect').value = settings.enabled !== false ? 'true' : 'false';
            }
        } catch (e) {
            console.error('Error fetching settings:', e);
        }
    }

    function closeSettingsOverlay() {
        const overlay = document.getElementById('piaCbSettingsOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    function toggleChatbot() {
        if (isOpen) closeChatbot();
        else openChatbot();
    }

    function openChatbot() {
        isOpen = true;
        chatWindow.classList.add('open');
        chatWindow.setAttribute('aria-hidden', 'false');
        textareaInput.focus();
    }

    function closeChatbot() {
        isOpen = false;
        chatWindow.classList.remove('open');
        chatWindow.setAttribute('aria-hidden', 'true');
    }

    async function fetchConfig() {
        try {
            const res = await fetch('/api/chatbot/config');
            if (res.ok) {
                const data = await res.json();
                if (data.faqs && Array.isArray(data.faqs)) {
                    renderSuggestionChips(data.faqs);
                }
            }
        } catch (e) {
            console.error('Error fetching chatbot config:', e);
            renderSuggestionChips([
                "¿Cómo presento una denuncia anónima?",
                "¿Dónde veo el directorio de ministros?",
                "Verificar placa de vehículo oficial",
                "Estadísticas del Gobierno en Números"
            ]);
        }
    }

    function renderSuggestionChips(faqs) {
        const chipsContainer = document.getElementById('piaCbSuggestions');
        if (!chipsContainer) return;
        chipsContainer.innerHTML = '';

        faqs.forEach(faq => {
            const chip = document.createElement('button');
            chip.className = 'pia-cb-chip';
            chip.innerHTML = `<i class="fas fa-lightbulb" style="color: #F5A623;"></i> ${escapeHTML(faq)}`;
            chip.addEventListener('click', () => {
                textareaInput.value = faq;
                handleUserSendMessage();
            });
            chipsContainer.appendChild(chip);
        });
    }

    async function handleUserSendMessage() {
        if (isWaitingResponse) return;
        const text = textareaInput.value.trim();
        if (!text) return;

        // Clear input
        textareaInput.value = '';
        textareaInput.style.height = 'auto';

        // Add User Message to UI & History
        appendMessage('user', text);
        conversationHistory.push({ role: 'user', text });
        saveLocalHistory();

        // Show Typing Indicator
        showTypingIndicator();
        isWaitingResponse = true;

        try {
            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: conversationHistory,
                    sessionId
                })
            });

            removeTypingIndicator();
            isWaitingResponse = false;

            if (response.ok) {
                const data = await response.json();
                appendMessage('bot', data.text, data.messageId, data.references);
                conversationHistory.push({ role: 'model', text: data.text });
                saveLocalHistory();

                if (data.suggestedFollowUps && data.suggestedFollowUps.length > 0) {
                    renderSuggestionChips(data.suggestedFollowUps);
                }
            } else {
                const errData = await response.json().catch(() => ({}));
                appendMessage('bot', `⚠️ ${errData.error || 'Ocurrió un inconveniente al procesar su consulta. Por favor intente de nuevo.'}`);
            }
        } catch (err) {
            removeTypingIndicator();
            isWaitingResponse = false;
            console.error('Error in chatbot fetch:', err);
            appendMessage('bot', '⚠️ No se pudo conectar con el servidor del Asistente Virtual. Verifique su conexión de red.');
        }
    }

    function appendMessage(sender, text, messageId = null, references = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `pia-cb-msg ${sender}`;

        const formattedText = formatMarkdown(text);
        let html = `<div class="pia-cb-bubble">${formattedText}`;

        if (references && references.length > 0) {
            html += `<div style="margin-top: 10px; border-top: 1px dashed rgba(0,194,224,0.3); padding-top: 6px; font-size: 0.78rem; opacity: 0.9;"><strong>Referencias Oficiales:</strong><br>`;
            references.forEach(ref => {
                html += `<a href="${ref.link}" class="pia-cb-link-btn" style="margin-right: 6px;"><i class="fas fa-external-link-alt"></i> ${escapeHTML(ref.title)}</a>`;
            });
            html += `</div>`;
        }

        html += `</div>`;
        html += `<span class="pia-cb-timestamp">${getCurrentTimeString()}</span>`;

        if (sender === 'bot' && messageId) {
            html += `
                <div class="pia-cb-msg-actions">
                    <button class="pia-cb-msg-btn" onclick="window.PIA_CHATBOT.copyMessageText(this)" title="Copiar respuesta">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <button class="pia-cb-msg-btn" onclick="window.PIA_CHATBOT.rateMessage('${messageId}', 'like', this)" title="Útil 👍">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                    <button class="pia-cb-msg-btn" onclick="window.PIA_CHATBOT.rateMessage('${messageId}', 'dislike', this)" title="No útil 👎">
                        <i class="fas fa-thumbs-down"></i>
                    </button>
                </div>
            `;
        }

        msgDiv.innerHTML = html;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'piaCbTyping';
        typingDiv.className = 'pia-cb-msg bot';
        typingDiv.innerHTML = `
            <div class="pia-cb-typing">
                <span class="pia-cb-dot"></span>
                <span class="pia-cb-dot"></span>
                <span class="pia-cb-dot"></span>
                <span style="font-size: 0.75rem; color: #00C2E0; font-weight: 600; margin-left: 6px;">Lupita está escribiendo...</span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('piaCbTyping');
        if (typingDiv) typingDiv.remove();
    }

    function resetConversation() {
        if (confirm('¿Desea reiniciar la conversación y borrar el historial actual?')) {
            conversationHistory = [];
            localStorage.removeItem('pia_chatbot_history');
            messagesContainer.innerHTML = `
                <div class="pia-cb-msg bot">
                    <div class="pia-cb-bubble">
                        🔄 Conversación reiniciada.<br>
                        ¡Hola! Soy <strong>Lupita</strong>, ¿en qué puedo ayudarte sobre el Portal de Integridad Activa?
                    </div>
                    <span class="pia-cb-timestamp">${getCurrentTimeString()}</span>
                </div>
            `;
            fetchConfig();
        }
    }

    function exportConversationTXT() {
        if (conversationHistory.length === 0) {
            alert('No hay mensajes en el historial para exportar.');
            return;
        }

        let content = `====================================================\n`;
        content += `TRANSCRIPCIÓN DE CHAT - ASISTENTE VIRTUAL LUPITA\n`;
        content += `Gobierno de Guatemala - Portal de Integridad Activa\n`;
        content += `Fecha: ${new Date().toLocaleString('es-GT')}\n`;
        content += `ID de Sesión: ${sessionId}\n`;
        content += `====================================================\n\n`;

        conversationHistory.forEach((msg, idx) => {
            const role = msg.role === 'user' ? 'CIUDADANO' : 'ASISTENTE PIA';
            content += `[${role}]:\n${msg.text}\n\n----------------------------------------------------\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Conversacion_PIA_IA_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function rateMessage(messageId, rating, btnEl) {
        fetch('/api/chatbot/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, rating })
        }).catch(err => console.error('Error rating message:', err));

        if (btnEl) {
            const parent = btnEl.parentElement;
            if (parent) {
                parent.querySelectorAll('.pia-cb-msg-btn').forEach(b => {
                    b.classList.remove('active-like', 'active-dislike');
                });
            }
            if (rating === 'like') btnEl.classList.add('active-like');
            if (rating === 'dislike') btnEl.classList.add('active-dislike');
        }
    }

    function copyMessageText(btnEl) {
        const bubble = btnEl.closest('.pia-cb-msg')?.querySelector('.pia-cb-bubble');
        if (bubble) {
            const textToCopy = bubble.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                btnEl.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
                setTimeout(() => {
                    btnEl.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                }, 2000);
            });
        }
    }

    function loadLocalHistory() {
        try {
            const stored = localStorage.getItem('pia_chatbot_history');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    conversationHistory = parsed;
                    parsed.forEach(msg => {
                        appendMessage(msg.role === 'user' ? 'user' : 'bot', msg.text);
                    });
                }
            }
        } catch (e) {
            console.error('Error loading chatbot history:', e);
        }
    }

    function saveLocalHistory() {
        try {
            localStorage.setItem('pia_chatbot_history', JSON.stringify(conversationHistory.slice(-20)));
        } catch (e) {
            console.error('Error saving chatbot history:', e);
        }
    }

    function formatMarkdown(text) {
        if (!text) return '';
        let str = escapeHTML(text);

        // Bold **text**
        str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic *text*
        str = str.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Bullet points
        str = str.replace(/^\s*[-•]\s+(.*)$/g, '• $1<br>');
        // Links [Label](url)
        str = str.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_self">$1</a>');
        // New lines
        str = str.replace(/\n/g, '<br>');

        return str;
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getCurrentTimeString() {
        const d = new Date();
        return d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Expose global methods for onclick handlers
    window.PIA_CHATBOT = {
        rateMessage,
        copyMessageText,
        deleteKbItem: deleteWidgetKbItem
    };

    // Auto init on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
