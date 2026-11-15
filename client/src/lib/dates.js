import { MES } from './utils';

export const TODAY = new Date(2026, 10, 14), TODAY_ISO = '2026-11-14';

export const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

export const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);

export const addDays = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() + n); return d; };

export const shiftISO = (n) => isoOf(addDays(n));

export const dLong = (s) => { const d = parseISO(s); return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`; };

export const dShort = (i) => { const d = addDays(i); return `${d.getDate()} ${MES[d.getMonth()]}`; };

export const dayName = (i) => addDays(i).toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '');

export const dayFull = (i) => addDays(i).toLocaleDateString('es-MX', { weekday: 'long' });

export const monthFull = (i) => addDays(i).toLocaleDateString('es-MX', { month: 'long' });

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const plural = (n) => `${n} ${n === 1 ? 'día' : 'días'}`;

export const agoLabel = (n) => n <= 0 ? 'Hoy' : n === 1 ? 'Hace 1 día' : `Hace ${n} días`;

export const nowLabel = () => 'hoy, ' + new Date().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' }).replace(/\s+/g, ' ');
