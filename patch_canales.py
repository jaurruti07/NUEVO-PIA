import re

with open('canales-por-la-integridad/index.html', 'r') as f:
    content = f.read()

# Add PDF export button next to Compartir
target = """<button class="modal-action-btn whatsapp" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir</button>"""
replacement = """<button class="modal-action-btn whatsapp" onclick="window._shareCard('${safe}')"><i class="fab fa-whatsapp"></i> Compartir</button>
            <button class="modal-action-btn" style="background:#0F1E2E; color:white;" onclick="window._exportFichaPdf('${safe}')"><i class="fas fa-file-pdf"></i> PDF</button>"""
content = content.replace(target, replacement)

js_code = """
window._exportFichaPdf = async function(nombre) {
    const { jsPDF } = window.jspdf;
    if (!nombre) { alert('No hay datos para exportar.'); return; }
    
    const inst = canalesIntegridad.find(i => i.nombre_institucion === nombre);
    if (!inst) return;
    
    const doc = new jsPDF({ orientation:'p', unit:'mm', format:'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('Ficha de Canal de Integridad', pageWidth/2, 20, { align:'center' });
    
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(inst.nombre_institucion + (inst.siglas ? ' ('+inst.siglas+')' : ''), 20, 35);
    
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text(`Sector: ${inst.sector || 'N/A'}`, 20, 45);
    doc.text(`Departamento: ${inst.departamento || 'N/A'}`, 20, 52);
    
    const canales = doc.splitTextToSize(`Canales de Denuncia: ${inst.canales_denuncia || 'N/A'}`, pageWidth - 40);
    doc.text(canales, 20, 65);
    
    doc.save(`Ficha_${inst.nombre_institucion}.pdf`);
};
"""
if 'window._exportFichaPdf' not in content:
    content = content.replace("function switchView(view)", js_code + "\nfunction switchView(view)")

with open('canales-por-la-integridad/index.html', 'w') as f:
    f.write(content)
