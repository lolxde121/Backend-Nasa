import { useState, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Btn, Chip, PageTitle, StatusBadge } from '../components/ui';
import { fmt, statusOf } from '../lib/utils';

export function ParcelCard({ p, go, i }) {
  const st = statusOf(p);
  return (
    <button
      onClick={() => go('detail', p.id)}
      style={{ animationDelay: `${i * 50}ms` }}
      className="card group fade-in overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(11,61,145,.35)] hover:border-sky/40"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* Sin polígonos: mapa limpio con satélite y pin */}
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
          <MapView
            lat={p.lat}
            lng={p.lng}
            seed={p.seed}
            pin={p.pin}
            label={p.name}
            slice
            satellite
          />
        </div>
        <div className="absolute left-3 top-3">
          <StatusBadge status={st} />
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-bold text-white shadow backdrop-blur">
          {fmt(p.area)} ha
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-ink group-hover:text-primary transition-colors">
          {p.name}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-slate-500">
          <Icon n="pin" s={16} cls="text-rose-600 shrink-0" />
          <span>{p.loc}</span>
        </p>

        <div className="mt-3.5 flex flex-wrap gap-2">
          <Chip icon="layers">{p.soil}</Chip>
          <Chip tone="mint">{p.crop || 'Por definir'}</Chip>
          <Chip tone="slate">{p.clima}</Chip>
        </div>

        <div
          className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 text-base font-extrabold text-slate-800"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          <span className="flex items-center gap-1.5" title="Temperatura actual">
            <Icon n="thermo" s={18} cls="text-orange-500" />
            {fmt(p.temp, 0)} °C
          </span>
          <span className="flex items-center gap-1.5" title="Humedad del suelo SMAP">
            <Icon n="drop" s={18} cls="text-sky" />
            {fmt(p.hum, 0)} %
          </span>
          <span className="flex items-center gap-1.5" title="Lluvia acumulada 7 días">
            <Icon n="rain" s={18} cls="text-primary" />
            {fmt(p.rain7, 0)} mm
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
            Ver detalle
            <Icon n="right" s={15} />
          </span>
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
    let l = parcels.filter(p =>
      (!q || `${p.name} ${p.loc} ${p.crop} ${p.soil}`.toLowerCase().includes(q)) &&
      (status === 'Todos' || statusOf(p) === status) &&
      (crop === 'Todos' || p.crop === crop)
    );
    l = [...l].sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name) : sort === 'area' ? b.area - a.area : b.hum - a.hum
    );
    return l;
  }, [parcels, query, status, crop, sort]);

  const crops = ['Todos', ...Array.from(new Set(parcels.map(p => p.crop).filter(Boolean)))];

  return (
    <div className="fade-in">
      <PageTitle
        title="Mis Terrenos y Parcelas"
        sub="Catastro y monitoreo satelital en tiempo real con NASA POWER y SMAP"
        right={<Btn icon="plus" onClick={() => go('form')}>Crear terreno</Btn>}
      />

      {/* Barra de filtros con tipografía amplia y clara */}
      <div className="card mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Icon n="search" s={16} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Buscar terreno"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar terreno por nombre o municipio..."
            className="field !pl-10 text-sm font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100/90 p-1">
          {['Todos', 'Saludable', 'Requiere riego', 'Monitoreando'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3.5 py-1.5 text-xs md:text-sm font-bold transition-all duration-300 ${
                status === s ? 'bg-white text-primary shadow' : 'text-slate-600 hover:text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          aria-label="Filtrar por cultivo"
          value={crop}
          onChange={e => setCrop(e.target.value)}
          className="field !w-auto text-sm font-medium"
        >
          {crops.map(c => (
            <option key={c} value={c}>{c === 'Todos' ? 'Todos los cultivos' : c}</option>
          ))}
        </select>

        <select
          aria-label="Ordenar"
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="field !w-auto text-sm font-medium"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="area">Mayor superficie</option>
          <option value="hum">Mayor humedad</option>
        </select>

        <span className="ml-auto text-sm font-bold text-slate-500">
          {list.length} {list.length === 1 ? 'terreno' : 'terrenos'}
        </span>
      </div>

      {list.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p, i) => (
            <ParcelCard key={p.id} p={p} go={go} i={i} />
          ))}
        </div>
      ) : (
        <div className="card grid place-items-center gap-3 p-16 text-center">
          <Icon n="search" s={32} cls="text-slate-400" />
          <b className="text-lg font-bold text-ink">Ningún terreno coincide con tu búsqueda</b>
          <p className="text-sm text-slate-500 max-w-sm">Prueba con otro nombre o restablece los filtros activos.</p>
          <Btn variant="soft" onClick={() => { setQuery(''); setStatus('Todos'); setCrop('Todos'); }}>
            Limpiar filtros
          </Btn>
        </div>
      )}
    </div>
  );
}
