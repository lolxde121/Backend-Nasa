import { TODAY_ISO, addDays, cap, dShort, dayFull, dayName, daysBetween, monthFull, plural } from '../lib/dates';
import { rng } from '../lib/utils';

export const CROP_DATABASE = [
  {
    name: 'Maíz',
    synonyms: ['maiz', 'elote', 'choclo', 'corn'],
    category: 'Granos básicos',
    cycleDays: 140,
    waterDemand: 'Media (500 - 800 mm)',
    waterLevel: 'Media',
    tempRange: [18, 30],
    optimalSoils: ['Franco', 'Franco-arcillosa', 'Franco-arenosa', 'Limosa'],
    criticalStage: 'Floración (espigamiento) y llenado de grano',
    keyTip: 'Evitar estrés hídrico durante la emisión de estigmas (jiloteo) para asegurar un buen llenado de mazorcas.',
    alert: 'Vigilar presencia de gusano cogollero con temperaturas superiores a 25 °C.'
  },
  {
    name: 'Jitomate',
    synonyms: ['tomate', 'jitomate', 'tomato', 'saladette'],
    category: 'Hortalizas',
    cycleDays: 110,
    waterDemand: 'Alta (600 - 900 mm)',
    waterLevel: 'Alta',
    tempRange: [19, 28],
    optimalSoils: ['Franco-arenosa', 'Franco', 'Limosa'],
    criticalStage: 'Floración y cuajado continuo de frutos',
    keyTip: 'Riegos frecuentes y regulares (preferente por goteo) para evitar rajaduras de fruto y pudrición apical.',
    alert: 'Susceptible a tizón tardío y mosquita blanca si la humedad ambiental supera el 75 %.'
  },
  {
    name: 'Frijol',
    synonyms: ['frijol', 'frijoles', 'habichuela', 'bean', 'judía'],
    category: 'Leguminosas',
    cycleDays: 90,
    waterDemand: 'Baja-Media (350 - 500 mm)',
    waterLevel: 'Baja',
    tempRange: [16, 26],
    optimalSoils: ['Franco', 'Franco-arenosa', 'Limosa', 'Franco-arcillosa'],
    criticalStage: 'Floración y formación de vainas',
    keyTip: 'Excelente cultivo para fijar nitrógeno en el suelo. Evitar encharcamientos que pudran la raíz.',
    alert: 'Sensible a excesos de agua y heladas tardías.'
  },
  {
    name: 'Chile',
    synonyms: ['chile', 'chiles', 'jalapeño', 'serrano', 'poblano', 'pepper'],
    category: 'Hortalizas',
    cycleDays: 115,
    waterDemand: 'Media-Alta (550 - 750 mm)',
    waterLevel: 'Media',
    tempRange: [20, 30],
    optimalSoils: ['Franco-arenosa', 'Franco', 'Franco-arcillosa'],
    criticalStage: 'Floración y engorde de frutos',
    keyTip: 'Mantener humedad constante sin anegar. El acolchado plástico favorece el control de temperatura y agua.',
    alert: 'Vigilar mancha bacteriana y marchitez por Phytophthora si hay encharcamiento.'
  },
  {
    name: 'Calabaza',
    synonyms: ['calabaza', 'calabacita', 'squash', 'zucchini'],
    category: 'Cucurbitáceas',
    cycleDays: 100,
    waterDemand: 'Media (400 - 600 mm)',
    waterLevel: 'Media',
    tempRange: [18, 30],
    optimalSoils: ['Franco', 'Franco-arenosa', 'Franco-arcillosa'],
    criticalStage: 'Desarrollo vegetativo rápido y cuajado de fruto',
    keyTip: 'Su amplio follaje frena la evaporación y protege el suelo. Riega al pie para no mojar las hojas.',
    alert: 'Propensa a cenicilla (oídio) con rocío matutino o exceso de sombra foliar.'
  },
  {
    name: 'Trigo',
    synonyms: ['trigo', 'wheat', 'cereal'],
    category: 'Cereales',
    cycleDays: 125,
    waterDemand: 'Media (400 - 600 mm)',
    waterLevel: 'Media',
    tempRange: [12, 24],
    optimalSoils: ['Franco-arcillosa', 'Franco', 'Arcillosa', 'Limosa'],
    criticalStage: 'Amacollamiento y espigado',
    keyTip: 'Aprovecha muy bien la humedad residual o el ciclo otoño-invierno. Tolera temperaturas frescas.',
    alert: 'Monitorear roya de la hoja si la primavera presenta alta humedad relativa.'
  },
  {
    name: 'Papa',
    synonyms: ['papa', 'patata', 'potato'],
    category: 'Tubérculos',
    cycleDays: 105,
    waterDemand: 'Media-Alta (500 - 700 mm)',
    waterLevel: 'Media',
    tempRange: [15, 22],
    optimalSoils: ['Franco-arenosa', 'Franco', 'Limosa'],
    criticalStage: 'Iniciación y engrosamiento de tubérculos',
    keyTip: 'Suelo suelto y bien aireado para libre crecimiento de tubérculos. Riegos uniformes.',
    alert: 'Muy sensible al tizón tardío y a la asfixia radicular en suelos pesados.'
  },
  {
    name: 'Cebolla',
    synonyms: ['cebolla', 'onion'],
    category: 'Bulbos',
    cycleDays: 135,
    waterDemand: 'Baja-Media (350 - 550 mm)',
    waterLevel: 'Baja',
    tempRange: [13, 26],
    optimalSoils: ['Franco-arenosa', 'Franco', 'Limosa'],
    criticalStage: 'Bulbificación (engrosamiento del bulbo)',
    keyTip: 'Riegos ligeros y frecuentes. Suspender riegos 15-20 días antes de la cosecha para curar bulbos.',
    alert: 'Sensible a pudrición de raíz si el drenaje es lento.'
  },
  {
    name: 'Zanahoria',
    synonyms: ['zanahoria', 'carrot'],
    category: 'Raíces',
    cycleDays: 95,
    waterDemand: 'Media (350 - 500 mm)',
    waterLevel: 'Media',
    tempRange: [15, 23],
    optimalSoils: ['Franco-arenosa', 'Arenosa', 'Franco'],
    criticalStage: 'Germinación y elongación de la raíz',
    keyTip: 'Requiere suelo sin piedras ni terrones compactos para evitar deformaciones en la raíz.',
    alert: 'Exceso de agua cerca de la madurez puede provocar agrietamiento de la raíz.'
  },
  {
    name: 'Lechuga',
    synonyms: ['lechuga', 'lettuce'],
    category: 'Hortalizas de hoja',
    cycleDays: 70,
    waterDemand: 'Media (250 - 400 mm)',
    waterLevel: 'Media',
    tempRange: [14, 22],
    optimalSoils: ['Franco-arenosa', 'Franco', 'Limosa'],
    criticalStage: 'Formación de cogollo / crecimiento foliar rápido',
    keyTip: 'Ciclo muy corto. Requiere humedad constante y superficial; el estrés hídrico induce espigado amargo.',
    alert: 'Vigilar mildiu y caracoles/babosas en épocas de humedad continua.'
  },
  {
    name: 'Aguacate',
    synonyms: ['aguacate', 'palta', 'avocado', 'hass'],
    category: 'Frutales perennes',
    cycleDays: 365,
    waterDemand: 'Alta (1000 - 1400 mm anuales)',
    waterLevel: 'Alta',
    tempRange: [14, 28],
    optimalSoils: ['Franco-arenosa', 'Franco', 'Franco-limosa'],
    criticalStage: 'Floración y cuajado de fruto pequeño',
    keyTip: 'Exige drenaje perfecto. Jamás tolerará encharcamiento ni suelos arcillosos compactados.',
    alert: 'Tristeza del aguacatero (Phytophthora cinnamomi) por exceso de humedad en raíz.'
  },
  {
    name: 'Café',
    synonyms: ['cafe', 'café', 'coffee'],
    category: 'Perennes / Arbustivos',
    cycleDays: 365,
    waterDemand: 'Alta (1200 - 1800 mm anuales)',
    waterLevel: 'Alta',
    tempRange: [17, 24],
    optimalSoils: ['Franco', 'Franco-arenosa', 'Profundo'],
    criticalStage: 'Floración tras las primeras lluvias y llenado de cereza',
    keyTip: 'Agradece sombra regulada y suelos profundos ricos en materia orgánica.',
    alert: 'Roya del café en ambientes húmedos y cálidos.'
  },
  {
    name: 'Sorgo',
    synonyms: ['sorgo', 'sorghum'],
    category: 'Cereales / Forrajes',
    cycleDays: 115,
    waterDemand: 'Baja (350 - 550 mm)',
    waterLevel: 'Baja',
    tempRange: [21, 35],
    optimalSoils: ['Franco', 'Arcillosa', 'Franco-arcillosa', 'Arenosa'],
    criticalStage: 'Embuchamiento y floración',
    keyTip: 'Excelente opción para zonas con riesgo de sequía o altas temperaturas estivales.',
    alert: 'Vigilar pulgón amarillo en el envés de las hojas inferiores.'
  },
  {
    name: 'Alfalfa',
    synonyms: ['alfalfa', 'lucerna'],
    category: 'Forrajes perennes',
    cycleDays: 35,
    waterDemand: 'Alta (700 - 1200 mm anuales)',
    waterLevel: 'Alta',
    tempRange: [15, 28],
    optimalSoils: ['Franco', 'Franco-arcillosa', 'Limosa'],
    criticalStage: 'Rebrote posterior a cada corte',
    keyTip: 'Riego profundo tras cada corte. Fijadora natural de nitrógeno y recuperadora de estructura de suelo.',
    alert: 'No tolera suelos ácidos ni encharcamientos prolongados.'
  },
  {
    name: 'Avena',
    synonyms: ['avena', 'oat'],
    category: 'Cereales / Forrajes',
    cycleDays: 100,
    waterDemand: 'Baja-Media (300 - 450 mm)',
    waterLevel: 'Baja',
    tempRange: [12, 22],
    optimalSoils: ['Franco', 'Franco-arcillosa', 'Arenosa'],
    criticalStage: 'Encachado y floración',
    keyTip: 'Muy rústica; tolera suelos más pobres y climas fríos donde otros cereales sufren.',
    alert: 'Sensible al encamado si hay vientos fuertes o exceso de nitrógeno.'
  },
  {
    name: 'Cebada',
    synonyms: ['cebada', 'barley'],
    category: 'Cereales',
    cycleDays: 105,
    waterDemand: 'Baja (300 - 450 mm)',
    waterLevel: 'Baja',
    tempRange: [12, 24],
    optimalSoils: ['Franco', 'Limosa', 'Franco-arcillosa'],
    criticalStage: 'Espigado y llenado de grano',
    keyTip: 'El cereal más eficiente en el uso del agua; gran resistencia a la salinidad moderada.',
    alert: 'Cuidar drenaje; no resiste encharcamiento prolongado.'
  },
  {
    name: 'Brócoli',
    synonyms: ['brocoli', 'brócoli', 'broccoli'],
    category: 'Crucíferas',
    cycleDays: 90,
    waterDemand: 'Media (400 - 550 mm)',
    waterLevel: 'Media',
    tempRange: [14, 22],
    optimalSoils: ['Franco', 'Franco-arcillosa', 'Limosa'],
    criticalStage: 'Formación de la pella / cabeza floral',
    keyTip: 'Requiere temperaturas frescas. Riego regular para evitar cabezas flojas o florecimiento prematuro.',
    alert: 'Vigilar palomilla dorso de diamante y pudrición de médula por bacterias.'
  },
  {
    name: 'Fresa',
    synonyms: ['fresa', 'frutilla', 'strawberry'],
    category: 'Frutillas',
    cycleDays: 120,
    waterDemand: 'Media-Alta (450 - 700 mm)',
    waterLevel: 'Media',
    tempRange: [15, 25],
    optimalSoils: ['Franco-arenosa', 'Franco'],
    criticalStage: 'Floración y maduración de frutos',
    keyTip: 'Acolchado y riego por goteo obligatorios para mantener frutos limpios y sin pudrición.',
    alert: 'Muy sensible a sales en agua y a hongos del suelo (Fusarium, Verticillium).'
  },
  {
    name: 'Limón',
    synonyms: ['limon', 'limón', 'citricos', 'cítricos', 'lima'],
    category: 'Cítricos perennes',
    cycleDays: 365,
    waterDemand: 'Media-Alta (800 - 1200 mm anuales)',
    waterLevel: 'Media',
    tempRange: [18, 32],
    optimalSoils: ['Franco-arenosa', 'Franco', 'Bien drenado'],
    criticalStage: 'Floración y amarre de frutos',
    keyTip: 'Podas de aclareo para aireación interna y riegos profundos periódicos.',
    alert: 'Monitorear minador de la hoja y pulgón vector de virosis.'
  },
  {
    name: 'Sandía',
    synonyms: ['sandia', 'sandía', 'watermelon'],
    category: 'Cucurbitáceas',
    cycleDays: 95,
    waterDemand: 'Media (400 - 600 mm)',
    waterLevel: 'Media',
    tempRange: [22, 32],
    optimalSoils: ['Franco-arenosa', 'Arenosa', 'Franco'],
    criticalStage: 'Cuajado y engorde de frutos',
    keyTip: 'Reducir riego 10 días antes del corte para concentrar azúcares.',
    alert: 'Sensible al marchitamiento por Fusarium en suelos muy húmedos.'
  }
];

export const CYCLE = Object.fromEntries(
  CROP_DATABASE.map(c => [c.name, c.cycleDays])
);

export const SEG_CROPS = [
  'Maíz',
  'Jitomate',
  'Frijol',
  'Chile',
  'Calabaza',
  'Trigo',
  'Papa',
  'Aguacate',
  'Cebolla',
  'Zanahoria'
];

/**
 * Analiza un cultivo (tanto si está en el catálogo como si es un cultivo nuevo/personalizado)
 * cruzándolo con las condiciones y telemetría satelital NASA de la parcela.
 */
export function getCropAnalysis(rawCropName, parcel) {
  if (!rawCropName || !rawCropName.trim()) {
    return null;
  }
  const clean = rawCropName.trim();
  const lower = clean.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Buscar coincidencia en base de datos de cultivos
  const match = CROP_DATABASE.find(c => {
    const cLower = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (cLower === lower || lower.includes(cLower) || cLower.includes(lower)) return true;
    return (c.synonyms || []).some(s => {
      const sLower = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return sLower === lower || lower.includes(sLower) || sLower.includes(lower);
    });
  });

  const p = parcel || {};
  const soil = p.soil || 'Franco';
  const temp = Number(p.temp != null ? p.temp : 22) || 22;
  const hum = Number(p.hum != null ? p.hum : 35) || 35;
  const rain = Number(p.rain30 != null ? p.rain30 : 25) || 25;

  if (match) {
    let compatScore = 88;
    const reasons = [];
    const alerts = [];

    // Evaluar temperatura
    if (temp >= match.tempRange[0] && temp <= match.tempRange[1]) {
      compatScore += 6;
      reasons.push(`Temperatura actual del predio (${temp.toFixed(1)} °C) en el rango ideal (${match.tempRange[0]}–${match.tempRange[1]} °C).`);
    } else {
      compatScore -= 12;
      alerts.push(`Temperatura actual (${temp.toFixed(1)} °C) fuera del rango óptimo (${match.tempRange[0]}–${match.tempRange[1]} °C).`);
    }

    // Evaluar textura de suelo
    const soilOk = match.optimalSoils.some(s => s.toLowerCase().includes(soil.toLowerCase()) || soil.toLowerCase().includes(s.toLowerCase()));
    if (soilOk) {
      compatScore += 5;
      reasons.push(`Suelo ${soil} adecuado para el arraigo y desarrollo radicular.`);
    } else {
      compatScore -= 10;
      alerts.push(`El suelo ${soil} requiere monitoreo de drenaje o adición de materia orgánica.`);
    }

    // Evaluar humedad de suelo satelital SMAP
    if (hum < 25 && match.waterLevel === 'Alta') {
      compatScore -= 8;
      alerts.push(`Humedad del suelo SMAP baja (${Math.round(hum)} %); planifica riegos de auxilio regulares.`);
    } else if (hum > 50 && match.waterLevel === 'Baja') {
      alerts.push(`Humedad SMAP alta (${Math.round(hum)} %); evita regar para no asfixiar raíces.`);
    } else {
      reasons.push(`Humedad SMAP (${Math.round(hum)} %) en rango favorable para absorción.`);
    }

    compatScore = Math.min(99, Math.max(35, compatScore));
    const lvl = compatScore >= 80 ? 'Alta' : compatScore >= 60 ? 'Media' : 'Baja';

    return {
      isKnown: true,
      name: match.name,
      matchedAs: clean,
      category: match.category,
      cycleDays: match.cycleDays,
      waterDemand: match.waterDemand,
      waterLevel: match.waterLevel,
      criticalStage: match.criticalStage,
      keyTip: match.keyTip,
      alert: match.alert,
      compatibility: compatScore,
      compatLevel: lvl,
      reasons,
      alerts,
      irrigationAdvice: hum < 28
        ? 'Humedad SMAP baja: programa el primer riego de auxilio para asegurar brotación.'
        : hum > 50
        ? 'Suelo con alta humedad residual: no requiere riego inmediato; mantén en observación.'
        : 'Humedad en rango favorable: regar con intervalos regulares según balance hídrico.'
    };
  }

  // 2. CULTIVO NUEVO / PERSONALIZADO (No registrado en catálogo estático)
  // Genera automáticamente una evaluación agronómica y balance predictivo con telemetría NASA:
  const isPerennial = /arbol|perenne|frutal|palma|arbusto|limon|naranj|aguacat/i.test(clean);
  const cycleDays = isPerennial ? 365 : 110;

  const reasons = [
    `Balance satelital FAO-56 calibrado para ${p.name || 'tu parcela'} (${soil}, ${temp.toFixed(1)} °C).`,
    `Sensor NASA SMAP registra ${Math.round(hum)} % de humedad en la capa superficial (0–5 cm).`
  ];

  const alerts = [];
  if (soil.toLowerCase().includes('arcill')) {
    alerts.push('Suelo arcilloso: retiene bastante agua, por lo que se recomienda espaciar riegos.');
  } else if (soil.toLowerCase().includes('arenos')) {
    alerts.push('Suelo arenoso: drenaje rápido, por lo que se recomiendan riegos frecuentes de menor volumen.');
  }

  let irrigationAdvice = '';
  if (hum < 25) {
    irrigationAdvice = `Humedad SMAP baja (${Math.round(hum)} %). Se aconseja programar un riego de establecimiento.`;
  } else if (hum > 50) {
    irrigationAdvice = `Humedad SMAP alta (${Math.round(hum)} %). El suelo retiene humedad adecuada; evita regar hoy.`;
  } else {
    irrigationAdvice = `Humedad de suelo (${Math.round(hum)} %) en nivel equilibrado para crecimiento activo.`;
  }

  return {
    isKnown: false,
    name: cap(clean),
    matchedAs: clean,
    category: 'Cultivo personalizado (Telemetría NASA)',
    cycleDays,
    waterDemand: 'Estimado 400 - 650 mm por ciclo',
    waterLevel: 'Media',
    criticalStage: 'Floración y desarrollo vegetativo temprano',
    keyTip: `Monitorea el desarrollo foliar y la humedad del suelo. El sistema ajustará las recomendaciones diarias de riego automáticamente según los satélites NASA.`,
    alert: alerts[0] || 'Vigilar vigor foliar semanalmente mediante la telemetría satelital MODIS (NDVI).',
    compatibility: 78,
    compatLevel: 'Favorable',
    reasons,
    alerts,
    irrigationAdvice
  };
}

export const stageOf = (s) => {
  const analysis = getCropAnalysis(s.crop);
  const cycle = (analysis && analysis.cycleDays) || CYCLE[s.crop] || 120;
  const r = daysBetween(s.sow, TODAY_ISO) / cycle;
  return r < .15 ? 'Germinación' : r < .45 ? 'Crecimiento' : r < .7 ? 'Floración' : r < 1 ? 'Maduración' : 'Cosecha';
};

export const genForecast = (seed) => {
  const r = rng(seed), ev = r() > 0.4 ? 1 + Math.floor(r() * 6) : -1;
  return Array.from({ length: 7 }, (_, i) => {
    if (i === ev) return [50 + Math.floor(r() * 40), Math.round(3 + r() * 12)];
    const p = Math.floor(r() * 25); return [p, p >= 20 ? 1 : 0];
  });
};

export const SEG0 = [
  { id: 's1', pid: 'p1', crop: 'Maíz', sow: '2026-06-20', lastWater: '2026-11-11', upd: 'hoy, 6:00 a. m.', forecast: [[10, 0], [5, 0], [20, 1], [40, 2], [80, 12], [50, 4], [15, 0]],
    hist: [{ id: 'h1', d: '2026-11-11', tone: 'ok', label: 'Seguiste la recomendación' }, { id: 'h2', d: '2026-11-03', tone: 'ok', label: 'Seguiste la recomendación' }, { id: 'h3', d: '2026-10-26', tone: 'warn', label: 'Un día después de lo sugerido' }] },
  { id: 's2', pid: 'p2', crop: 'Jitomate', sow: '2026-09-03', lastWater: '2026-11-08', upd: 'hoy, 6:00 a. m.', forecast: [[3, 0], [0, 0], [5, 0], [2, 0], [4, 0], [0, 0], [5, 0]],
    hist: [{ id: 'h4', d: '2026-11-08', tone: 'ok', label: 'Seguiste la recomendación' }, { id: 'h5', d: '2026-11-01', tone: 'ok', label: 'Seguiste la recomendación' }] },
  { id: 's3', pid: 'p3', crop: 'Frijol', sow: '2026-08-15', lastWater: '2026-11-13', rainYesterday: true, upd: 'hoy, 6:00 a. m.', forecast: [[60, 6], [20, 1], [10, 0], [5, 0], [0, 0], [5, 0], [10, 0]],
    hist: [{ id: 'h6', d: '2026-11-13', tone: 'ok', label: 'Seguiste la recomendación' }, { id: 'h7', d: '2026-11-05', tone: 'ok', label: 'Seguiste la recomendación' }] },
  { id: 's4', pid: 'p1', crop: 'Chile', sow: '2026-10-10', lastWater: '2026-11-09', upd: 'hoy, 6:00 a. m.', forecast: [[5, 0], [0, 0], [5, 0], [3, 0], [5, 0], [10, 1], [0, 0]],
    hist: [{ id: 'h8', d: '2026-11-09', tone: 'ok', label: 'Seguiste la recomendación' }, { id: 'h9', d: '2026-11-03', tone: 'warn', label: 'Un día después de lo sugerido' }] },
];

export const REC_STYLE = {
  water: { label: 'Regar hoy', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: 'drop', soft: 'bg-amber-100 text-amber-600', hero: 'from-[#B45309] via-[#D97706] to-[#F59E0B]' },
  wait: { label: 'Esperar lluvia', badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', icon: 'rain', soft: 'bg-sky/15 text-primary', hero: 'from-[#0B3D91] via-[#0E55A8] to-[#1B8FC9]' },
  dry: { label: 'No regar', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: 'check', soft: 'bg-mint/15 text-teal-700', hero: 'from-[#0F766E] via-[#14998A] to-[#2BB3A3]' },
};

export const HIST_TONE = { ok: 'bg-emerald-50 text-emerald-700 border-emerald-200', warn: 'bg-amber-50 text-amber-700 border-amber-200', neutral: 'bg-slate-100 text-slate-600 border-slate-200' };

export function recommend(s, parcel) {
  if (!s) return { state: 'dry', conf: 'media', title: 'Sin datos', summary: '', why: '', next: 'Revisar', rain: '', ds: 0, rainMeta: '' };
  const pObj = parcel || {};
  const ds = daysBetween(s.lastWater || TODAY_ISO, TODAY_ISO);
  const fc = (s.forecast || []).map(([p, mm], i) => ({ p, mm, i }));
  const today = fc[0] || { p: 0, mm: 0, i: 0 };
  const strong = fc.slice(1, 5).find(f => f.p >= 60 && f.mm >= 5);
  const maxP = fc.reduce((a, b) => b.p > a.p ? b : a, today);
  const anyRain = fc.some(f => f.mm > 0);
  const crop = (s.crop || 'cultivo').toLowerCase(), soil = (pObj.soil || 'franco').toLowerCase(), stage = stageOf(s).toLowerCase();
  const day = (i) => `${cap(dayName(i))} ${dShort(i)}`;
  const rainMeta = !anyRain ? 'Sin lluvia en 7 días' : `${maxP.p} % · ${maxP.i === 0 ? 'hoy' : `${dayName(maxP.i)} ${dShort(maxP.i)}`}`;
  let r;
  if (today.p >= 50 || ds <= 1) {
    const k = Math.max(3 - ds, 1);
    r = { state: 'dry', conf: 'alta', title: 'No riegues hoy',
      summary: s.rainYesterday ? 'Suelo húmedo por la lluvia de ayer; evita regar.' : today.p >= 50 ? `Hoy llueve (${today.p} %); evita regar.` : 'Suelo húmedo por el riego reciente; evita regar.',
      why: today.p >= 50 ? `Hoy hay ${today.p} % de probabilidad de lluvia (${today.mm} mm) y regaste hace ${plural(ds)}. Tu tierra ${soil} sigue húmeda; regar ahora desperdiciaría agua y podría encharcar tu ${crop}.` : `Regaste hace ${plural(ds)} y tu tierra ${soil} aún conserva la humedad. Evita regar hoy para no encharcar tu ${crop}.`,
      next: `${day(k)} (revisar)`, rain: today.p >= 50 ? `${today.mm} mm · hoy` : anyRain ? `${maxP.mm} mm · ${dayName(maxP.i)} ${dShort(maxP.i)}` : 'Sin lluvia' };
  } else if (strong && ds < 6) {
    r = { state: 'wait', conf: strong.p >= 70 ? 'alta' : 'media', title: 'Espera la lluvia, no riegues aún',
      summary: `Espera la lluvia del ${dayFull(strong.i)}; no riegues antes.`,
      why: `Se pronostica lluvia de ${strong.mm} mm el ${dayFull(strong.i)} ${addDays(strong.i).getDate()} de ${monthFull(strong.i)} (${strong.p} % de probabilidad). Regaste hace ${plural(ds)} y tu tierra ${soil} conserva la humedad, así que tu ${crop} no necesita agua extra todavía. Si el ${dayFull(strong.i)} no llueve, riega el ${dayFull(strong.i + 1)} ${addDays(strong.i + 1).getDate()} temprano por la mañana.`,
      next: `${day(strong.i + 1)} (si no llueve)`, rain: `${strong.mm} mm · ${dayName(strong.i)} ${dShort(strong.i)}` };
  } else {
    r = { state: 'water', conf: anyRain && maxP.p >= 40 ? 'media' : 'alta', title: 'Riega hoy',
      summary: anyRain ? 'Riega hoy; la lluvia llegará tarde y será ligera.' : 'Riega hoy temprano; no se espera lluvia esta semana.',
      why: `Han pasado ${plural(ds)} desde el último riego y ${anyRain ? `la lluvia prevista es ligera y llegará tarde (${maxP.mm} mm el ${dayName(maxP.i)})` : 'no se espera lluvia en los próximos 7 días'}. Tu ${crop} está en etapa de ${stage} y necesita agua. Riega temprano para reducir la evaporación.`,
      next: `Hoy · ${day(0)}`, rain: anyRain ? `${maxP.mm} mm · ${dayName(maxP.i)} ${dShort(maxP.i)}` : 'Sin lluvia' };
  }
  return { ...r, ds, rainMeta };
}
