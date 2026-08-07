import re

with open('server.js', 'r') as f:
    content = f.read()

target = """  // Build Context string
  let contextText = `DATOS Y CONOCIMIENTO OFICIAL DEL PORTAL PIA:\\n`;
  contextText += `- Estadísticas en vivo del portal: 65+ oficinas de probidad, 200+ canales de denuncia, 446 denuncias penales, 9 plataformas activas.\\n`;
"""
replacement = """  // Load dynamic data for better answers
  let vehiculosStatsText = "No hay datos de vehículos disponibles.";
  try {
    const vData = JSON.parse(fs.readFileSync('vehiculos/vehiculos.json', 'utf8'));
    if (vData.vehicles) {
      vehiculosStatsText = `Hay ${vData.vehicles.length} vehículos oficiales registrados en el portal.`;
    }
  } catch (e) {}

  let riesgoStatsText = "No hay datos de riesgo disponibles.";
  try {
    const rData = JSON.parse(fs.readFileSync('riesgo/datos.json', 'utf8'));
    const currentYearData = rData.years['2025'] || Object.values(rData.years)[0];
    if (currentYearData && currentYearData.instituciones) {
      const insts = currentYearData.instituciones;
      const noCumplen = insts.filter(i => i.estado === 'no_cumple' || i.estado === 'En proceso');
      const nombresNoCumplen = noCumplen.map(i => i.nombre).join(', ');
      riesgoStatsText = `Instituciones en Riesgo en la Mira: ${insts.length} en total. Instituciones que NO cumplen (o en proceso): ${nombresNoCumplen}.`;
    }
  } catch (e) {}

  // Build Context string
  let contextText = `DATOS Y CONOCIMIENTO OFICIAL DEL PORTAL PIA:\\n`;
  contextText += `- Estadísticas en vivo del portal: 65+ oficinas de probidad, 200+ canales de denuncia, 446 denuncias penales, 9 plataformas activas.\\n`;
  contextText += `- Vehículos oficiales: ${vehiculosStatsText}\\n`;
  contextText += `- Riesgos: ${riesgoStatsText}\\n`;
"""

content = content.replace(target, replacement)

with open('server.js', 'w') as f:
    f.write(content)
