import { Icon } from './Icon';
import { STATUS } from '../lib/utils';

export function StatusBadge({ status, small }) {
  const s = STATUS[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${s.cls} ${small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{status}</span>;
}

export function Chip({ children, tone = 'sky', icon }) {
  const tones = { sky: 'bg-sky/10 text-primary', mint: 'bg-mint/10 text-teal-700', slate: 'bg-slate-100 text-slate-600' };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>{icon && <Icon n={icon} s={12} />}{children}</span>;
}

export function Btn({ children, icon, variant = 'primary', onClick, className = '', type = 'button' }) {
  const v = {
    primary: 'bg-gradient-to-r from-primary to-[#1B5BC4] text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5',
    ghost: 'bg-white/90 text-ink border border-slate-200 hover:bg-white hover:border-sky hover:-translate-y-0.5 shadow-sm',
    soft: 'bg-sky/10 text-primary hover:bg-sky/20',
  }[variant];
  return <button type={type} onClick={onClick} className={`group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-95 ${v} ${className}`}>{icon && <Icon n={icon} s={16} cls="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />}{children}</button>;
}

export function PageTitle({ crumbs, title, sub, right }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      {crumbs && <div className="mb-1 text-xs font-medium text-slate-500">{crumbs}</div>}
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl" style={{ textWrap: 'balance' }}>{title}</h1>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>{right}
  </div>;
}

export function ChipGroup({ options, value, onChange }) {
  return <div className="flex flex-wrap gap-2">{options.map(o => <button type="button" key={o} onClick={() => onChange(o)}
    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${value === o ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-slate-200 bg-white text-slate-600 hover:border-sky hover:text-primary'}`}>{o === 'Otro' ? 'Otro (escribe)' : o}</button>)}</div>;
}

export function L({ t, children, err: e, id }) { return <div><label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{t}</label>{children}{e && <p className="mt-1 text-xs font-medium text-rose-600">{e}</p>}</div>; }

export function ParcelSelect({ parcels, value, onChange }) {
  return <label className="flex items-center gap-2 rounded-xl border border-white bg-white/85 px-3.5 py-2 text-sm shadow-sm"><span className="text-slate-500">Terreno:</span>
    <select aria-label="Terreno" value={value} onChange={e => onChange(e.target.value)} className="cursor-pointer bg-transparent font-bold focus:outline-none">{parcels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>;
}
