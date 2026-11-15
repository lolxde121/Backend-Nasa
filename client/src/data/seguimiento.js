import { TODAY_ISO, addDays, cap, dShort, dayFull, dayName, daysBetween, monthFull, plural } from '../lib/dates';
import { rng } from '../lib/utils';

export const CYCLE = { 'Maíz': 150, 'Jitomate': 120, 'Frijol': 100, 'Chile': 140, 'Calabaza': 110 };

export const SEG_CROPS = ['Maíz', 'Jitomate', 'Frijol', 'Chile', 'Calabaza'];

export const stageOf = (s) => { const r = daysBetween(s.sow, TODAY_ISO) / (CYCLE[s.crop] || 120); return r < .15 ? 'Germinación' : r < .45 ? 'Crecimiento' : r < .7 ? 'Floración' : r < 1 ? 'Maduración' : 'Cosecha'; };

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
