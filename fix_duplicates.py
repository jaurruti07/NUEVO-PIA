import re

for filepath in ['directorio/index.html', 'gobierno_en_numeros/index.html']:
    with open(filepath, 'r') as f:
        content = f.read()
    
    parts = content.split("/* ============================================================\n   SISTEMA DE NOTIFICACIONES PUSH")
    if len(parts) > 2:
        # Keep only the first one
        content = parts[0] + "/* ============================================================\n   SISTEMA DE NOTIFICACIONES PUSH" + parts[1]
        
        # Remove trailing "</script>" injected by accident if any
        # well parts[1] might just have script. We must find where the second one ends.
        
    with open(filepath, 'w') as f:
        f.write(content)
