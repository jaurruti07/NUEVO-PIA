import fs from 'fs';
let vehiculosStatsText = "";
try {
  const vehiculosData = JSON.parse(fs.readFileSync('vehiculos/vehiculos.json', 'utf8'));
  vehiculosStatsText = `Hay ${vehiculosData.length} vehículos oficiales registrados en el portal.`;
} catch(e) {}

let riesgoStatsText = "";
try {
  const riesgoData = JSON.parse(fs.readFileSync('riesgo/datos.json', 'utf8'));
  const currentYearData = riesgoData.years['2025'] || Object.values(riesgoData.years)[0];
  if (currentYearData && currentYearData.instituciones) {
    const insts = currentYearData.instituciones;
    const noCumplen = insts.filter(i => i.estado === 'no_cumple' || i.estado === 'En proceso');
    const nombresNoCumplen = noCumplen.map(i => i.nombre).join(', ');
    riesgoStatsText = `Instituciones en Riesgo en la Mira: ${insts.length} en total. Instituciones que NO cumplen (o en proceso): ${nombresNoCumplen}.`;
  }
} catch(e) {}

console.log(vehiculosStatsText);
console.log(riesgoStatsText);
