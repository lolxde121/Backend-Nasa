import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Btn, PageTitle } from '../components/ui';
import { REC_STYLE } from '../data/seguimiento';
import { agoLabel, dLong } from '../lib/dates';

export function SegCard({ s, parcel, rec, onOpen, i }) {
  const st = REC_STYLE[rec.state];
  return (
    <button onClick={onOpen} style={{ animationDelay: `${i * 50}ms` }} className="card group fade-in flex flex-col p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(11,61,145,.4)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky/10 text-primary transition-transform duration-300 group-hover:scale-110"><Icon n="sprout" s={20} /></span>
          <div><div className="font-display text-base font-semibold">{s.crop}</div><div className="flex items-center gap-1 text-xs text-slate-500"><Icon n="pin" s={12} />{parcel.name}</div></div>
        </div>
        <Icon n="right" s={18} cls="text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <span className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${st.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />{st.label}</span>
      <dl className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-4 text-xs">
        {[['calendar', 'Sembrado', dLong(s.sow)], ['drop', 'Último riego', agoLabel(rec.ds)], ['cloud', 'Lluvia próxima', rec.rainMeta]].map(([i2, l, v]) => <div key={l} className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-slate-500"><Icon n={i2} s={14} />{l}</dt><dd className="font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</dd></div>)}
      </dl>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-gradient-to-r from-sky/10 to-mint/10 p-3 text-xs font-medium text-slate-700"><Icon n="sparkles" s={14} cls="mt-0.5 text-primary" />{rec.summary}</div>
    </button>
  );
}

export function Seguimiento({ segs, parcels, recOf, go }) {
  const [f, setF] = useState('all');
  const [q, setQ] = useState('');
  const rows = segs.map(s => ({ s, p: parcels.find(x => x.id === s.pid) || parcels[0], rec: recOf(s) }));
  const count = (k) => rows.filter(r => r.rec.state === k).length;
  const list = rows.filter(r => (f === 'all' || r.rec.state === f) && (!q.trim() || `${r.s.crop} ${r.p.name}`.toLowerCase().includes(q.trim().toLowerCase())));
  const kp = [['water', 'Regar hoy', 'bg-amber-100 text-amber-600'], ['wait', 'Esperar lluvia', 'bg-sky/15 text-primary'], ['dry', 'No regar', 'bg-mint/15 text-teal-700']];
  return (
    <div className="fade-in">
      <PageTitle title="Seguimiento" sub="Registra lo que sembraste y recibe recomendaciones de riego según el clima." right={<Btn icon="plus" onClick={() => go('segform')}>Nuevo seguimiento</Btn>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {kp.map(([k, l, c]) => <button key={k} onClick={() => setF(f === k ? 'all' : k)} className={`card flex items-center gap-4 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${f === k ? 'ring-2 ring-sky' : ''}`}>
          <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c}`}><Icon n={REC_STYLE[k].icon} s={22} /></span>
          <span><span className="block font-display text-3xl font-bold leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>{count(k)}</span><span className="text-sm text-slate-500">{l}</span></span>
        </button>)}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Icon n="search" s={15} cls="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input aria-label="Buscar seguimiento" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por cultivo o terreno" className="field !pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">{[['all', 'Todos'], ['water', 'Regar hoy'], ['wait', 'Esperar lluvia'], ['dry', 'No regar']].map(([k, l]) => <button key={k} onClick={() => setF(k)}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${f === k ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-white bg-white/80 text-slate-600 hover:border-sky hover:text-primary'}`}>{l}</button>)}</div>
        <span className="ml-auto text-xs font-semibold text-slate-500">{list.length} {list.length === 1 ? 'seguimiento' : 'seguimientos'}</span>
      </div>
      {list.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{list.map((r, i) => <SegCard key={r.s.id} i={i} {...r} parcel={r.p} onOpen={() => go('segdetail', r.s.id)} />)}</div>
        : <div className="card grid place-items-center gap-2 p-14 text-center"><Icon n="sprout" s={28} cls="text-slate-400" /><b>No hay seguimientos con ese filtro</b><p className="text-sm text-slate-500">Cambia el filtro o crea un seguimiento nuevo.</p><Btn variant="soft" onClick={() => { setF('all'); setQ(''); }}>Ver todos</Btn></div>}
    </div>
  );
}
