import { MES, clamp, fmt, rng } from '../lib/utils';

export const PLACES = [
  { n: 'Texcoco, Estado de México', lat: 19.5124, lng: -98.8828, clima: 'Templado', t: 21 },
  { n: 'Zumpango, Estado de México', lat: 19.7969, lng: -99.0990, clima: 'Semiárido', t: 26 },
  { n: 'Atlixco, Puebla', lat: 18.9081, lng: -98.4325, clima: 'Templado', t: 22 },
  { n: 'Tulancingo, Hidalgo', lat: 20.0834, lng: -98.3633, clima: 'Semiárido', t: 25 },
  { n: 'Tlaxco, Tlaxcala', lat: 19.6200, lng: -98.1200, clima: 'Frío', t: 16 },
  { n: 'Cuautla, Morelos', lat: 18.8120, lng: -98.9540, clima: 'Cálido', t: 32 },
  { n: 'Celaya, Guanajuato', lat: 20.5235, lng: -100.8157, clima: 'Semiárido', t: 24 },
];

export const genPoly = (seed) => {
  const r = rng(seed * 7 + 3), n = 6;
  return Array.from({ length: n }, (_, k) => {
    const ang = (k / n) * 2 * Math.PI + (r() - .5) * .5, rad = .75 + r() * .5;
    return { x: Math.round(300 + Math.cos(ang) * 110 * rad * 1.25), y: Math.round(180 + Math.sin(ang) * 110 * rad * .8) };
  });
};

export function enrich(p) {
  const seedNum = typeof p.seed === 'number' ? p.seed : 17;
  const r = rng(seedNum);
  let h = p.hum + 8;
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 10, 14 - (29 - i));
    const rain = r() > 0.74 ? +(r() * 13 + 1).toFixed(1) : 0;
    h = clamp(h - 0.7 + rain * 0.85 + (r() - .5) * .8, 10, 60);
    return {
      label: `${d.getDate()} ${MES[d.getMonth()]}`, rain, hum: h,
      temp: +(p.temp + 2.8 * Math.sin(i / 4.3 + (seedNum % 7)) - (29 - i) * 0.015 + (r() - .5) * 1.6).toFixed(1),
    };
  });
  const off = p.hum - daily[29].hum;
  daily.forEach(d => { d.hum = +clamp(d.hum + off, 8, 70).toFixed(1); });
  daily[29].temp = p.temp;
  const s0 = Math.sin(9 / 24 * 2 * Math.PI);
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const hr = (18 - 23 + i + 24) % 24, s = Math.sin((hr - 9) / 24 * 2 * Math.PI);
    return {
      label: `${String(hr).padStart(2, '0')}:00`,
      temp: +(p.temp + 5 * (s - s0) + (r() - .5) * .4).toFixed(1),
      hum: +(p.hum - 3 * (s - s0) + (r() - .5) * .6).toFixed(1),
      rain: r() > 0.88 ? +(r() * 1.6).toFixed(1) : 0,
    };
  });
  hourly[23].temp = p.temp; hourly[23].hum = p.hum;
  const forecast = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(2026, 10, 15 + i);
    return { day: d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', ''), num: d.getDate(), hi: Math.round(p.temp + 2 + r() * 4), lo: Math.round(p.temp - 9 + r() * 3), rain: Math.round(r() * 80) };
  });
  return {
    ...p, daily, hourly, forecast,
    center: p.center || { lat: p.lat, lng: p.lng }, pin: p.pin || { x: 300, y: 180 },
    poly: p.poly || genPoly(seedNum),
    rain30: +daily.reduce((a, d) => a + d.rain, 0).toFixed(1),
    rain7: +daily.slice(-7).reduce((a, d) => a + d.rain, 0).toFixed(1),
    dTemp: +(p.temp - daily[28].temp).toFixed(1),
  };
}

export function formatTerrenoToParcel(t) {
  if (!t) return null;
  if (t.daily && t.hourly && t.forecast) return t;

  const lat = Number(t.latitud ?? t.lat ?? 19.5124);
  const lng = Number(t.longitud ?? t.lng ?? -98.8828);
  const temp = Number(t.resumen_satelital?.temperatura ?? t.temp ?? 24.3);
  const hum = Number(t.resumen_satelital?.humedad_smap ?? t.hum ?? 31.0);
  const idStr = t.id != null ? String(t.id) : ('p' + Date.now());
  const numId = typeof t.id === 'number' ? t.id : parseInt(String(t.id).replace(/\D/g, ''), 10) || 11;
  const seed = (numId * 17 + 13) % 97;

  const base = {
    id: idStr,
    dbId: t.id,
    seed,
    name: t.nombre || t.name || 'Terreno',
    propietario: t.propietario || 'Agricultor',
    loc: t.ubicacion || t.loc || 'México',
    place: t.ubicacion || t.place || t.loc || 'México',
    lat,
    lng,
    area: Number(t.area_hectareas ?? t.area ?? 5.0),
    crop: t.cultivo_actual || t.crop || 'Maíz',
    soil: t.tipo_suelo || t.soil || 'Franco-arcillosa',
    irrigation: t.fuente_agua || t.irrigation || 'Goteo',
    clima: t.clima_zona || t.clima || 'Templado',
    temp,
    hum,
    ndvi: t.resumen_satelital?.ndvi ?? 0.65,
    resumen_satelital: t.resumen_satelital || null,
    poligono: t.poligono || null,
  };

  return enrich(base);
}

export const RAW = [
  { id: '1', seed: 11, name: 'Parcela El Roble', loc: 'Texcoco, Edo. Méx.', place: 'Texcoco, Estado de México', lat: 19.5124, lng: -98.8828, area: 12.4, crop: 'Maíz', soil: 'Franco-arcillosa', irrigation: 'Goteo', clima: 'Templado', temp: 24.3, hum: 31 },
  { id: '2', seed: 23, name: 'Rancho Los Pinos', loc: 'Zumpango, Edo. Méx.', place: 'Zumpango, Estado de México', lat: 19.7969, lng: -99.0990, area: 8.7, crop: 'Frijol', soil: 'Arcillosa', irrigation: 'Aspersión', clima: 'Semiárido', temp: 26.1, hum: 27 },
  { id: '3', seed: 35, name: 'Huerta La Esperanza', loc: 'Atlixco, Puebla', place: 'Atlixco, Puebla', lat: 18.9081, lng: -98.4325, area: 5.2, crop: 'Aguacate', soil: 'Franco-arenosa', irrigation: 'Goteo', clima: 'Templado', temp: 22.4, hum: 35 },
  { id: '4', seed: 47, name: 'Terreno Norte', loc: 'Tulancingo, Hidalgo', place: 'Tulancingo, Hidalgo', lat: 20.0834, lng: -98.3633, area: 15.6, crop: 'Cebada', soil: 'Limosa', irrigation: 'Temporal', clima: 'Semiárido', temp: 25.2, hum: 24 },
  { id: '5', seed: 59, name: 'Valle Alto', loc: 'Tlaxco, Tlaxcala', place: 'Tlaxco, Tlaxcala', lat: 19.6200, lng: -98.1200, area: 21.0, crop: 'Trigo', soil: 'Franca', irrigation: 'Aspersión', clima: 'Frío', temp: 16.8, hum: 33 },
  { id: '6', seed: 71, name: 'Campo Sur', loc: 'Cuautla, Morelos', place: 'Cuautla, Morelos', lat: 18.8120, lng: -98.9540, area: 9.3, crop: 'Caña', soil: 'Arenosa', irrigation: 'Rodado', clima: 'Cálido', temp: 31.7, hum: 38 },
];

export const INITIAL = RAW.map(enrich);

export const CROPS = ['Maíz', 'Frijol', 'Aguacate', 'Cebada', 'Trigo', 'Caña', 'Jitomate', 'Agave'];

export const SOILS = ['Arcillosa', 'Arenosa', 'Limosa', 'Franca', 'Franco-arcillosa', 'Otro'];

export const RIEGOS = ['Goteo', 'Aspersión', 'Rodado', 'Temporal'];

export const DEFAULT_ALERT = { humMin: 30, tempMax: 30, push: true };

export const METRICS = {
  temp: { label: 'Temperatura', unit: '°C', color: '#E8833A', icon: 'thermo', d: 1 },
  hum: { label: 'Humedad del suelo', unit: '%', color: '#4FA3E0', icon: 'drop', d: 1 },
  rain: { label: 'Precipitación', unit: 'mm', color: '#0B3D91', icon: 'rain', d: 1, bars: true },
};

export function alertsFor(p, cfg = DEFAULT_ALERT) {
  if (!p) return [];
  const out = [];
  if (p.hum < cfg.humMin) out.push({ lvl: 'Alta', t: `Humedad del suelo en ${fmt(p.hum, 0)} %`, d: `Por debajo del umbral de ${cfg.humMin} %. Programa riego.` });
  if (p.temp > cfg.tempMax) out.push({ lvl: 'Media', t: `Temperatura de ${fmt(p.temp)} °C`, d: `Supera el máximo configurado de ${cfg.tempMax} °C.` });
  return out;
}

export function recsFor(p) {
  if (!p) return [];
  const out = [];
  const irrigationStr = p.irrigation ? p.irrigation.toLowerCase() : 'goteo';
  if (p.hum < 30) out.push({ pr: 'Alta', icon: 'drop', t: 'Programar riego en las próximas 24 h', d: `La humedad del suelo es de ${fmt(p.hum, 0)} %. Con ${irrigationStr} se recomienda un turno de ${p.irrigation === 'Goteo' ? '3 h' : '90 min'} al amanecer.` });
  const wet = p.forecast && p.forecast.find(f => f.rain >= 70);
  if (wet && p.hum >= 30) out.push({ pr: 'Baja', icon: 'rain', t: 'Lluvia probable en los próximos días', d: `${wet.rain} % de probabilidad el ${wet.day} ${wet.num}. Si la humedad lo permite, pospón el riego.` });
  if (p.temp > 26) out.push({ pr: 'Media', icon: 'thermo', t: 'Riesgo de estrés térmico', d: `Temperatura actual de ${fmt(p.temp)} °C. Evita labores entre las 12:00 y las 16:00.` });
  if (p.rain7 < 5 && p.hum >= 30) out.push({ pr: 'Baja', icon: 'rain', t: 'Semana seca', d: `Solo ${fmt(p.rain7)} mm en 7 días. Vigila la humedad a partir del jueves.` });
  if (!out.length) out.push({ pr: 'Baja', icon: 'check', t: 'Mantener el plan actual', d: 'Los indicadores están dentro de los rangos esperados para esta etapa.' });
  return out;
}

export const PRIO = { Alta: 'bg-rose-50 text-rose-700 border-rose-200', Media: 'bg-amber-50 text-amber-700 border-amber-200', Baja: 'bg-sky-50 text-sky-700 border-sky-200' };
