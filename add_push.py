import re

def add_push(file_path, header_title, header_desc, list_var):
    with open(file_path, 'r') as f:
        content = f.read()

    # CSS
    css = """
        /* Push notifications mobile */
        .push-notify-banner { background:var(--surface); border-radius:var(--radius-2xl); padding:1.4rem 1.8rem; margin-bottom:1.5rem; display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap; box-shadow:0 10px 30px rgba(5,17,31,0.2); color:#fff; }
        .push-notify-content { display:flex; align-items:center; gap:1.2rem; flex:1 1 300px; }
        .push-notify-icon { width:52px; height:52px; border-radius:16px; background:rgba(0,194,224,0.15); border:1px solid rgba(0,194,224,0.4); display:flex; align-items:center; justify-content:center; font-size:1.5rem; color:var(--cyan); flex-shrink:0; box-shadow:0 0 15px rgba(0,194,224,0.2); }
        .push-notify-info h4 { font-family:var(--font-head); font-size:1.08rem; font-weight:800; margin-bottom:0.25rem; color:#fff; display:flex; align-items:center; gap:0.6rem; }
        .push-notify-info p { font-size:0.85rem; color:rgba(255,255,255,0.8); line-height:1.45; margin:0; }
        .push-notify-actions { display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; }
        .btn-push-subscribe { background:var(--cyan); color:var(--navy); border:none; padding:0.65rem 1.3rem; border-radius:40px; font-weight:700; font-size:0.82rem; display:inline-flex; align-items:center; gap:8px; cursor:pointer; transition:all 0.25s; font-family:var(--font-head); box-shadow:0 4px 12px rgba(0,194,224,0.3); }
        .btn-push-subscribe:hover { background:#00ddf7; transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,194,224,0.45); }
        .btn-push-subscribe.active { background:#16a34a; color:#fff; box-shadow:0 4px 12px rgba(22,163,74,0.3); }
        
        .push-status-badge { font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
        .push-status-default { background:rgba(255,255,255,0.1); color:#fff; }
        .push-status-granted { background:rgba(22,163,74,0.2); color:#4ade80; border:1px solid rgba(74,222,128,0.3); }
        .push-status-denied { background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(248,113,113,0.3); }
        
        #directorio.theme-dark .push-notify-banner, #gobierno-numeros.theme-dark .push-notify-banner { background: #0F1E2E; border:1px solid rgba(255,255,255,0.05); }
        #directorio.theme-light .push-notify-banner, #gobierno-numeros.theme-light .push-notify-banner { background: #1a365d; }
    """
    if "push-notify-banner" not in content:
        content = content.replace("</style>", f"{css}\n</style>")

    html = f"""
            <div class="push-notify-banner" id="pushNotifyBanner">
                <div class="push-notify-content">
                    <div class="push-notify-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="push-notify-info">
                        <h4>
                            <span>{header_title}</span>
                            <span id="pushStatusBadgeBanner" class="push-status-badge push-status-default">Pendiente</span>
                        </h4>
                        <p>{header_desc}</p>
                    </div>
                </div>
                <div class="push-notify-actions">
                    <button id="btnSubscribePush" class="btn-push-subscribe"><i class="fas fa-bell"></i> Activar Notificaciones</button>
                    <button id="btnTestPush" class="btn-push-subscribe" style="background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.3);"><i class="fas fa-paper-plane"></i> Probar Alerta</button>
                </div>
            </div>
    """
    if "id=\"pushNotifyBanner\"" not in content:
        # Insert after <div class="filter-bar"> or similar
        content = content.replace('<div class="filter-bar">', f"{html}\n<div class=\"filter-bar\">")

    js = f"""
/* ============================================================
   SISTEMA DE NOTIFICACIONES PUSH
============================================================ */
function updatePushStatusUI() {{
    const bannerBadge = document.getElementById('pushStatusBadgeBanner');
    const subscribeBtn = document.getElementById('btnSubscribePush');
    
    if(!bannerBadge || !subscribeBtn) return;

    const perm = ("Notification" in window) ? Notification.permission : 'unsupported';
    let badgeClass = 'push-status-default';
    let badgeText = 'Pendiente';
    let btnHtml = '<i class="fas fa-bell"></i> Activar Notificaciones';
    let btnActiveClass = false;

    if (perm === 'granted') {{
        badgeClass = 'push-status-granted';
        badgeText = 'Activo';
        btnHtml = '<i class="fas fa-check-circle"></i> Notificaciones Activas';
        btnActiveClass = true;
    }} else if (perm === 'denied') {{
        badgeClass = 'push-status-denied';
        badgeText = 'Bloqueado';
        btnHtml = '<i class="fas fa-exclamation-circle"></i> Permiso Denegado';
    }} else if (perm === 'unsupported') {{
        badgeClass = 'push-status-default';
        badgeText = 'In-App';
        btnHtml = '<i class="fas fa-bell"></i> Alertas In-App';
    }}

    bannerBadge.className = `push-status-badge ${{badgeClass}}`;
    bannerBadge.innerText = badgeText;
    
    subscribeBtn.innerHTML = btnHtml;
    if (btnActiveClass) subscribeBtn.classList.add('active');
    else subscribeBtn.classList.remove('active');
}}

async function requestPushPermission() {{
    if (!("Notification" in window)) {{
        if (typeof showToast === 'function') showToast("🔔 Notificaciones In-App Activadas");
        updatePushStatusUI();
        return;
    }}

    if (Notification.permission === 'granted') {{
        sendPushNotification("🔔 Notificaciones Push Activas", "Las alertas push están habilitadas para esta sección.");
        return;
    }}

    try {{
        const permission = await Notification.requestPermission();
        updatePushStatusUI();
        if (permission === 'granted') {{
            sendPushNotification("🎉 ¡Notificaciones Activadas!", "Recibirás alertas en tiempo real sobre nuevas actualizaciones institucionales.");
        }} else {{
            if (typeof showToast === 'function') showToast("⚠️ Permiso de Notificaciones denegado");
        }}
    }} catch(e) {{
        console.error("Error al solicitar permiso", e);
    }}
}}

function sendPushNotification(title, body) {{
    if (typeof showToast === 'function') showToast(title);
    if ("Notification" in window && Notification.permission === 'granted') {{
        try {{
            const notif = new Notification(title, {{
                body: body,
                icon: '/img/logo-gobierno.png'
            }});
            notif.onclick = function() {{ window.focus(); notif.close(); }};
        }} catch(e) {{ console.error("Error Notification API", e); }}
    }}
}}

function simularCambioEstadoPush() {{
    if (!{list_var} || {list_var}.length === 0) return;
    const item = {list_var}[Math.floor(Math.random() * {list_var}.length)];
    sendPushNotification("✅ Actualización en Institución", `${{item.nombre_institucion}} ha reportado nueva información pública.`);
}}

document.addEventListener('DOMContentLoaded', () => {{
    setTimeout(() => {{
        updatePushStatusUI();
        const subBtn = document.getElementById('btnSubscribePush');
        const testBtn = document.getElementById('btnTestPush');
        if(subBtn) subBtn.addEventListener('click', requestPushPermission);
        if(testBtn) testBtn.addEventListener('click', simularCambioEstadoPush);
    }}, 1000);
}});
"""
    if "requestPushPermission" not in content:
        content = content.replace("</script>\n\n<script src=\"/js/pia-chatbot.js\"", f"{js}\n</script>\n\n<script src=\"/js/pia-chatbot.js\"")
        content = content.replace("</script>\n</body>", f"{js}\n</script>\n</body>")

    with open(file_path, 'w') as f:
        f.write(content)

add_push('directorio/index.html', "Notificaciones del Directorio Ejecutivo", "Recibe alertas en tu navegador cuando existan actualizaciones en la información pública o nuevos directorios institucionales.", "instituciones")
add_push('gobierno_en_numeros/index.html', "Alertas de Gobierno en Números", "Mantente informado en tiempo real cuando se actualicen los tableros de ejecución presupuestaria e indicadores.", "tableros")
