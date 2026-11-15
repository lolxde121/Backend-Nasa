export const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const fmt = (v, d = 1) => Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });

export const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const MPP = 2.5;

export const pxToLL = (c, x, y) => ({ lat: c.lat - (y - 180) * MPP / 111320, lng: c.lng + (x - 300) * MPP / (111320 * Math.cos(c.lat * Math.PI / 180)) });

export const llToPx = (c, lat, lng) => ({ x: 300 + (lng - c.lng) * (111320 * Math.cos(c.lat * Math.PI / 180)) / MPP, y: 180 - (lat - c.lat) * 111320 / MPP });

export const areaHa = (pts) => {
  let s = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a.x * b.y - b.x * a.y; }
  return Math.abs(s / 2) * MPP * MPP / 10000;
};

export const statusOf = (p) => p.hum < 30 ? 'Requiere riego' : p.hum >= 33 && p.temp <= 28 ? 'Saludable' : 'Monitoreando';

export const STATUS = {
  'Saludable': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Requiere riego': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Monitoreando': { cls: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
};
