import re

with open('canales-por-la-integridad/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Push Banner CSS to be ultra clear and high contrast
new_css = """
        /* Push notifications styling */
        .push-notify-banner { 
            background: #0F1E2E !important; 
            border: 1px solid rgba(0, 194, 224, 0.35) !important; 
            border-radius: var(--radius-2xl); 
            padding: 1.4rem 1.8rem; 
            margin-bottom: 1.5rem; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            gap: 1.5rem; 
            flex-wrap: wrap; 
            box-shadow: 0 10px 30px rgba(5, 17, 31, 0.3); 
            color: #ffffff !important; 
        }
        .push-notify-content { display: flex; align-items: center; gap: 1.2rem; flex: 1 1 300px; }
        .push-notify-icon { width: 52px; height: 52px; border-radius: 16px; background: rgba(0, 194, 224, 0.15); border: 1px solid rgba(0, 194, 224, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #00C2E0 !important; flex-shrink: 0; box-shadow: 0 0 15px rgba(0, 194, 224, 0.2); }
        .push-notify-info h4 { font-family: var(--font-head); font-size: 1.1rem; font-weight: 800; margin-bottom: 0.3rem; color: #ffffff !important; display: flex; align-items: center; gap: 0.6rem; }
        .push-notify-info h4 span { color: #ffffff !important; }
        .push-notify-info p { font-size: 0.88rem; color: #CBD5E1 !important; line-height: 1.45; margin: 0; }
        .push-notify-actions { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
        .btn-push-subscribe { background: #00C2E0 !important; color: #05111F !important; border: none; padding: 0.7rem 1.4rem; border-radius: 40px; font-weight: 800; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.25s; font-family: var(--font-head); box-shadow: 0 4px 12px rgba(0, 194, 224, 0.35); }
        .btn-push-subscribe:hover { background: #00DDF7 !important; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0, 194, 224, 0.5); }
        .btn-push-subscribe.active { background: #16A34A !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4); }
        
        .push-status-badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .push-status-default { background: rgba(255, 255, 255, 0.15); color: #ffffff !important; }
        .push-status-granted { background: rgba(22, 163, 74, 0.25); color: #4ADE80 !important; border: 1px solid rgba(74, 222, 128, 0.4); }
        .push-status-denied { background: rgba(239, 68, 68, 0.25); color: #F87171 !important; border: 1px solid rgba(248, 113, 113, 0.4); }
"""

# Replace old CSS between /* Push notifications mobile */ and </style>
css_pattern = re.compile(r'/\* Push notifications mobile \*/.*?(?=</style>)', re.DOTALL)
if css_pattern.search(content):
    content = css_pattern.sub(new_css, content)
else:
    content = content.replace('</style>', new_css + '\n</style>')

# 2. Add PDF Export button to modal action row
target_modal_actions = """<div class="modal-actions-row"><button class="modal-action-btn whatsapp" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir por WhatsApp</button></div>"""
replacement_modal_actions = """<div class="modal-actions-row">
            <button class="modal-action-btn whatsapp" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir por WhatsApp</button>
            <button class="modal-action-btn pdf" onclick="window._exportFichaPdf('${safe}')" style="background:var(--cyan); color:var(--navy); font-weight:700;"><i class="fas fa-file-pdf"></i> Exportar Ficha a PDF</button>
        </div>"""

if target_modal_actions in content:
    content = content.replace(target_modal_actions, replacement_modal_actions)

# 3. Add PDF Export button to flip card back foot
target_back_foot = """<button class="btn-share" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir</button>"""
replacement_back_foot = """<button class="btn-share" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir</button>
                    <button class="btn-share" style="background:var(--cyan); color:var(--navy);" onclick="window._exportFichaPdf('${safe}')"><i class="fas fa-file-pdf"></i> PDF</button>"""

if target_back_foot in content:
    content = content.replace(target_back_foot, replacement_back_foot)

# 4. Clean up scripts at bottom
# Find position of cargarDatosYIniciar();
pos_init = content.find('cargarDatosYIniciar();')
if pos_init != -1:
    before_init = content[:pos_init + len('cargarDatosYIniciar();')]
    
    js_bundle = """
</script>

<script src="/js/pia-chatbot.js" defer></script>
<script src="/js/sw-register.js"></script>

<script>
/* ============================================================
   EXPORTAR FICHA INDIVIDUAL EN PDF (1 PÁGINA)
============================================================ */
window._exportFichaPdf = async function(nombre) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        if (typeof showToast === 'function') showToast("Cargando generador PDF, reintente en un momento.");
        else alert("Cargando generador PDF, reintente en un momento.");
        return;
    }
    const { jsPDF } = window.jspdf;
    if (!nombre) { alert("No se especificó la institución."); return; }

    const inst = instituciones.find(i => i.institucion === nombre);
    if (!inst) { alert("No se encontraron datos para la institución."); return; }

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();   // 215.9 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 279.4 mm
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Header Box (Gobierno Navy)
    doc.setFillColor(15, 30, 46);
    doc.rect(margin, 12, contentWidth, 24, 'F');

    doc.setTextColor(0, 194, 224);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("GOBIERNO DE GUATEMALA", margin + 6, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Portal de Canales por la Integridad — Ficha Técnica Institucional", margin + 6, 27);

    let yPos = 42;

    // Título de la Institución
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(200, 210, 220);
    doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'FD');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 30, 46);
    const titleLines = doc.splitTextToSize(inst.institucion, contentWidth - 12);
    doc.text(titleLines, margin + 6, yPos + (titleLines.length > 1 ? 7 : 11));

    yPos += 25;

    // Ficha de Resumen / Protocolo
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 194, 224);
    doc.roundedRect(margin, yPos, contentWidth, 26, 2, 2, 'D');

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 30, 46);
    doc.text("RESUMEN DE INTEGRIDAD Y PROTOCOLO DE ACTUACIÓN", margin + 6, yPos + 7);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 70, 80);

    const tipoText = `Tipo de dependencia: ${inst.tipo || 'No especificada'}`;
    const protVal = inst['Protocolo de actuación'] ? 'Sí (Cuenta con protocolo)' : 'No registrado';
    const protText = `Protocolo de actuación: ${protVal}`;
    const canalesText = `Canales habilitados: ${inst.canales || 1}`;
    const horText = `Horario de atención: ${inst.horario || 'No especificado'}`;

    doc.text(doc.splitTextToSize(tipoText, 85), margin + 6, yPos + 14);
    doc.text(doc.splitTextToSize(canalesText, 85), margin + 6, yPos + 20);

    doc.text(doc.splitTextToSize(protText, 88), margin + 95, yPos + 14);
    doc.text(doc.splitTextToSize(horText, 88), margin + 95, yPos + 20);

    yPos += 32;

    // Sección: Canales Habilitados
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 30, 46);
    doc.text("CANALES DE DENUNCIA Y ATENCIÓN DIRECTA", margin, yPos);
    doc.setLineWidth(0.4);
    doc.setDrawColor(0, 194, 224);
    doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);

    yPos += 7;

    const items = [
        { label: "Teléfono de Denuncias", val: inst.telefono || "No disponible" },
        { label: "Correo Electrónico", val: inst.correo || "No disponible" },
        { label: "Formulario Web", val: inst.formulario || "No disponible" },
        { label: "Atención Presencial", val: inst.tipocom || "Unidad de Acceso a la Información Pública" },
        { label: "Otros Canales", val: inst.otro || "No especificado" }
    ];

    items.forEach(item => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);

        const valLines = doc.splitTextToSize(item.val, contentWidth - 60);
        const boxHeight = Math.max(9, (valLines.length * 4.2) + 5);

        doc.roundedRect(margin, yPos, contentWidth, boxHeight, 1.5, 1.5, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 30, 46);
        doc.text(item.label + ":", margin + 4, yPos + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 60, 70);
        doc.text(valLines, margin + 55, yPos + 5.5);

        yPos += boxHeight + 2.5;
    });

    yPos += 3;

    // Sección: Ubicación
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 30, 46);
    doc.text("UBICACIÓN Y DIRECCIÓN OFICIAL", margin, yPos);
    doc.line(margin, yPos + 2, margin + contentWidth, yPos + 2);

    yPos += 7;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const dirLines = doc.splitTextToSize(inst.direccion || "No especificada", contentWidth - 10);
    const dirBoxHeight = Math.max(10, (dirLines.length * 4.2) + 5);

    doc.roundedRect(margin, yPos, contentWidth, dirBoxHeight, 1.5, 1.5, 'FD');

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(50, 60, 70);
    doc.text(dirLines, margin + 5, yPos + 5.5);

    // Pie de página fijo
    doc.setDrawColor(200, 210, 220);
    doc.line(margin, pageHeight - 18, margin + contentWidth, pageHeight - 18);

    const todayStr = new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 130, 140);
    doc.text(`Comisión Nacional contra la Corrupción — Reporte generado el ${todayStr}`, margin, pageHeight - 12);
    doc.text("Página 1 de 1", pageWidth - margin - 20, pageHeight - 12);

    const cleanFilename = inst.institucion.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
    doc.save(`Ficha_Integridad_${cleanFilename}.pdf`);
};

/* ============================================================
   SISTEMA DE NOTIFICACIONES PUSH
============================================================ */
function updatePushStatusUI() {
    const bannerBadge = document.getElementById('pushStatusBadgeBanner');
    const subscribeBtn = document.getElementById('btnSubscribePush');
    
    if(!bannerBadge || !subscribeBtn) return;

    const perm = ("Notification" in window) ? Notification.permission : 'unsupported';
    let badgeClass = 'push-status-default';
    let badgeText = 'Pendiente';
    let btnHtml = '<i class="fas fa-bell"></i> Activar Notificaciones';
    let btnActiveClass = false;

    if (perm === 'granted') {
        badgeClass = 'push-status-granted';
        badgeText = 'Activo';
        btnHtml = '<i class="fas fa-check-circle"></i> Notificaciones Activas';
        btnActiveClass = true;
    } else if (perm === 'denied') {
        badgeClass = 'push-status-denied';
        badgeText = 'Bloqueado';
        btnHtml = '<i class="fas fa-exclamation-circle"></i> Permiso Denegado';
    } else if (perm === 'unsupported') {
        badgeClass = 'push-status-default';
        badgeText = 'In-App';
        btnHtml = '<i class="fas fa-bell"></i> Alertas In-App';
    }

    bannerBadge.className = `push-status-badge ${badgeClass}`;
    bannerBadge.innerText = badgeText;
    
    subscribeBtn.innerHTML = btnHtml;
    if (btnActiveClass) subscribeBtn.classList.add('active');
    else subscribeBtn.classList.remove('active');
}

async function requestPushPermission() {
    if (!("Notification" in window)) {
        if (typeof showToast === 'function') showToast("🔔 Notificaciones In-App Activadas");
        updatePushStatusUI();
        return;
    }

    if (Notification.permission === 'granted') {
        sendPushNotification("🔔 Notificaciones Push Activas", "Las alertas push están habilitadas para la sección de Canales por la Integridad.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        updatePushStatusUI();
        if (permission === 'granted') {
            sendPushNotification("🎉 ¡Notificaciones Activadas!", "Recibirás alertas en tiempo real sobre nuevas actualizaciones en Canales de Integridad.");
        } else {
            if (typeof showToast === 'function') showToast("⚠️ Permiso de Notificaciones denegado");
        }
    } catch(e) {
        console.error("Error al solicitar permiso", e);
    }
}

function sendPushNotification(title, body) {
    if (typeof showToast === 'function') showToast(title);
    if ("Notification" in window && Notification.permission === 'granted') {
        try {
            const notif = new Notification(title, {
                body: body,
                icon: '/img/L1.png'
            });
            notif.onclick = function() { window.focus(); notif.close(); };
        } catch(e) { console.error("Error Notification API", e); }
    }
}

function simularCambioEstadoPush() {
    if (!instituciones || instituciones.length === 0) return;
    const item = instituciones[Math.floor(Math.random() * instituciones.length)];
    sendPushNotification("✅ Actualización en Institución", `${item.institucion} ha actualizado sus canales de integridad.`);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updatePushStatusUI();
        const subBtn = document.getElementById('btnSubscribePush');
        const testBtn = document.getElementById('btnTestPush');
        if (subBtn) subBtn.addEventListener('click', requestPushPermission);
        if (testBtn) testBtn.addEventListener('click', simularCambioEstadoPush);
    }, 500);
});
</script>
</body>
</html>
"""
    content = before_init + js_bundle

with open('canales-por-la-integridad/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully patched canales-por-la-integridad/index.html")
