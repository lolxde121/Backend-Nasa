import { useState, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Btn, Chip, PageTitle, StatusBadge } from '../components/ui';
import { fmt, statusOf } from '../lib/utils';

export function ParcelCard({ p, go, i }) {
  const st = statusOf(p);
  return (
    <button onClick={() => go('detail', p.id)} style={{ animationDelay: `${i * 50}ms` }}
      className="card group fade-in overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(11,61,145,.4)]">
      <div className="relative aspect-[16/9] overflow-hidden">
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-110"><MapView seed={p.seed} pin={p.pin} poly={p.poly} label={p.name} slice /></div>
        <div className="absolute left-3 top-3"><StatusBadge status={st} small /></div>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-primary shadow backdrop-blur">{fmt(p.area)} ha</div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-semibold">{p.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Icon n="pin" s={12} />{p.loc}</p>
        <div className="mt-3 flex flex-wrap gap-1.5"><Chip icon="layers">{p.soil}</Chip><Chip tone="mint">{p.crop}</Chip><Chip tone="slate">{p.clima}</Chip></div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span className="flex items-center gap-1"><Icon n="thermo" s={13} cls="text-orange-500" />{fmt(p.temp, 0)} °C</span>
          <span className="flex items-center gap-1"><Icon n="drop" s={13} cls="text-sky" />{fmt(p.hum, 0)} %</span>
          <span className="flex items-center gap-1"><Icon n="rain" s={13} cls="text-primary" />{fmt(p.rain7, 0)} mm</span>
          <span className="flex items-center gap-0.5 text-primary opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">Detalles<Icon n="right" s={15} /></span>
        </div>
      </div>
    </button>
  );
}

export function Terrenos({ parcels, go, query, setQuery }) {
  const [status, setStatus] = useState('Todos');
  const [crop, setCrop] = useState('Todos');
  const [sort, setSort] = useState('name');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let l = parcels.filter(p => (!q || `${p.name} ${p.loc} ${p.crop} ${p.soil}`.toLowerCase().includes(q)) && (status === 'Todos' || statusOf(p) === status) && (crop === 'Todos' || p.crop === crop));
    l = [...l].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'area' ? b.area - a.area : b.hum - a.hum);
    return l;
  }, [parcels, query, status, crop, sort]);
  const crops = ['Todos', ...Array.from(new Set(parcels.map(p => p.crop)))];
  return (
    <div className="fade-in">
      <PageTitle title="Mis terrenos" sub="Administra tus parcelas y consulta su información agroclimática"
        right={<Btn icon="plus" onClick={() => go('form')}>Crear terreno</Btn>} />
      <div className="card mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Icon n="search" s={15} cls="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input aria-label="Buscar terreno" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar terreno por nombre o ubicación" className="field !pl-9" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1">
          {['Todos', 'Saludable', 'Requiere riego', 'Monitoreando'].map(s => <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${status === s ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-ink'}`}>{s}</button>)}
        </div>
        <select aria-label="Filtrar por cultivo" value={crop} onChange={e => setCrop(e.target.value)} className="field !w-auto">{crops.map(c => <option key={c} value={c}>{c === 'Todos' ? 'Todos los cultivos' : c}</option>)}</select>
        <select aria-label="Ordenar" value={sort} onChange={e => setSort(e.target.value)} className="field !w-auto"><option value="name">Nombre</option><option value="area">Mayor superficie</option><option value="hum">Mayor humedad</option></select>
        <span className="ml-auto text-xs font-semibold text-slate-500">{list.length} {list.length === 1 ? 'terreno registrado' : 'terrenos registrados'}</span>
      </div>
      {list.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map((p, i) => <ParcelCard key={p.id} p={p} go={go} i={i} />)}</div>
        : <div className="card grid place-items-center gap-2 p-14 text-center"><Icon n="search" s={28} cls="text-slate-400" /><b>Ningún terreno coincide</b><p className="text-sm text-slate-500">Prueba con otro nombre o quita los filtros.</p><Btn variant="soft" onClick={() => { setQuery(''); setStatus('Todos'); setCrop('Todos'); }}>Limpiar filtros</Btn></div>}
    </div>
  );
}
