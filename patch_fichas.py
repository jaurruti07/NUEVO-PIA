import re

with open('directorio/index.html', 'r') as f:
    content = f.read()

target = """<button class="modal-action-btn whatsapp" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir</button>"""
replacement = """<button class="modal-action-btn whatsapp" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir</button>
            <button class="modal-action-btn" style="background:#0F1E2E; color:white;" onclick="window._exportFichaPdf('${safe}')"><i class="fas fa-file-pdf"></i> PDF</button>"""
content = content.replace(target, replacement)

js_code = """
window._exportFichaPdf = async function(nombre) {
    const { jsPDF } = window.jspdf;
    if (!nombre) { alert('No hay datos para exportar.'); return; }
    
    // We can extract data from the DOM or find the inst again
    const inst = instituciones.find(i => i.nombre_institucion === nombre);
    if (!inst) return;
    
    const doc = new jsPDF({ orientation:'p', unit:'mm', format:'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('Ficha de Institución - Directorio Ejecutivo', pageWidth/2, 20, { align:'center' });
    
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(inst.nombre_institucion + (inst.siglas ? ' ('+inst.siglas+')' : ''), 20, 35);
    
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(`Sector: ${inst.sector || 'N/A'}`, 20, 45);
    doc.text(`Departamento: ${inst.departamento || 'N/A'}`, 20, 52);
    doc.text(`Correo: ${inst.correo || 'N/A'}`, 20, 59);
    doc.text(`Teléfono: ${inst.telefono || 'N/A'}`, 20, 66);
    doc.text(`Horario: ${inst.horario_atencion || 'N/A'}`, 20, 73);
    
    const addr = doc.splitTextToSize(`Dirección: ${inst.direccion || 'N/A'}`, pageWidth - 40);
    doc.text(addr, 20, 80);
    
    doc.save(`Ficha_${inst.nombre_institucion}.pdf`);
};
"""
if 'window._exportFichaPdf' not in content:
    content = content.replace("function switchView(view)", js_code + "\nfunction switchView(view)")

with open('directorio/index.html', 'w') as f:
    f.write(content)


with open('gobierno_en_numeros/index.html', 'r') as f:
    content = f.read()

target2 = """<button class="modal-action-btn whatsapp" onclick="window._shareCard('${inst.nombre_institucion.replace(/'/g, "\\'")}')"><i class="fab fa-whatsapp"></i> Compartir</button>"""
replacement2 = """<button class="modal-action-btn whatsapp" onclick="window._shareCard('${inst.nombre_institucion.replace(/'/g, "\\'")}')"><i class="fab fa-whatsapp"></i> Compartir</button>
            <button class="modal-action-btn" style="background:#0F1E2E; color:white;" onclick="window._exportFichaPdf('${inst.nombre_institucion.replace(/'/g, "\\'")}')"><i class="fas fa-file-pdf"></i> PDF</button>"""
content = content.replace(target2, replacement2)

js_code2 = """
window._exportFichaPdf = async function(nombre) {
    const { jsPDF } = window.jspdf;
    if (!nombre) { alert('No hay datos para exportar.'); return; }
    
    const inst = tableros.find(i => i.nombre_institucion === nombre);
    if (!inst) return;
    
    const doc = new jsPDF({ orientation:'p', unit:'mm', format:'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('Ficha de Tablero - Gobierno en Números', pageWidth/2, 20, { align:'center' });
    
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(inst.nombre_institucion + (inst.siglas ? ' ('+inst.siglas+')' : ''), 20, 35);
    
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(`Sector: ${inst.sector || 'N/A'}`, 20, 45);
    doc.text(`Eje: ${inst.eje || 'N/A'}`, 20, 52);
    
    const desc = doc.splitTextToSize(`Descripción: ${inst.descripcion || 'N/A'}`, pageWidth - 40);
    doc.text(desc, 20, 65);
    
    doc.save(`Ficha_${inst.nombre_institucion}.pdf`);
};
"""
if 'window._exportFichaPdf' not in content:
    content = content.replace("function applyFilters()", js_code2 + "\nfunction applyFilters()")

with open('gobierno_en_numeros/index.html', 'w') as f:
    f.write(content)
