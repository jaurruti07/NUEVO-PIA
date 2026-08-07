filepath = 'canales-por-la-integridad/index.html'
with open(filepath, 'r') as f:
    content = f.read()

parts = content.split("/* ============================================================\n   SISTEMA DE NOTIFICACIONES PUSH")
if len(parts) > 2:
    content = parts[0] + "/* ============================================================\n   SISTEMA DE NOTIFICACIONES PUSH" + parts[1]
    
if '</body>' not in content:
    content += "</script>\n</body>\n</html>"
    
with open(filepath, 'w') as f:
    f.write(content)
