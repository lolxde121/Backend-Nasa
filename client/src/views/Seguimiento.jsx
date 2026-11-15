import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Btn, PageTitle } from '../components/ui';
import { REC_STYLE } from '../data/seguimiento';
import { agoLabel, dLong } from '../lib/dates';

export function SegCard({ s, parcel, rec, onOpen, onWater, i }) {
  const st = REC_STYLE[rec.state];
  return (
    <div
      style={{ animationDelay: `${i * 50}ms` }}
      className="card group fade-in flex flex-col justify-between p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky/40"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="grid h-13 w-13 place-items-center rounded-2xl bg-sky/10 text-primary transition-transform duration-300 group-hover:scale-105">
              <Icon n="sprout" s={24} />
            </span>
            <div>
              <div className="font-display text-lg font-bold text-ink">{s.crop}</div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                <Icon n="pin" s={14} cls="text-rose-600" />
                <span>{parcel?.name || 'Parcela'}</span>
                {parcel?.place && <span className="text-slate-400">· {parcel.place.split(',')[0]}</span>}
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${st.badge}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>

        {/* Resumen de decisión agronómica */}
        <div className="mt-4 rounded-xl bg-gradient-to-r from-sky/10 via-mint/10 to-transparent p-3.5 text-sm leading-relaxed font-medium text-slate-700 border border-sky/15">
          <div className="flex items-start gap-2.5">
            <Icon n="sparkles" s={18} cls="mt-0.5 text-primary shrink-0" />
            <div>
              <span className="font-bold text-primary block mb-0.5 text-base">{rec.title}</span>
              {rec.summary}
            </div>
          </div>
        </div>

        {/* Datos clave de telemetría y riego */}
        <dl className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-3.5 text-sm font-medium">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500">
              <Icon n="calendar" s={16} /> Fecha de siembra
            </dt>
            <dd className="font-bold text-slate-800">{dLong(s.sow)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500">
              <Icon n="drop" s={16} /> Último riego registrado
            </dt>
            <dd className="font-bold text-slate-800">{agoLabel(rec.ds)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500">
              <Icon n="cloud" s={16} /> Lluvia satelital prevista
            </dt>
            <dd className="font-extrabold text-primary">{rec.rainMeta}</dd>
          </div>
        </dl>
      </div>

      {/* Acciones directas */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-1.5 text-sm font-bold text-primary transition-all hover:translate-x-0.5"
        >
          Ver balance completo
          <Icon n="right" s={16} />
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-primary hover:text-white"
        >
          Gestionar riego
        </button>
      </div>
    </div>
  );
}

export function Seguimiento({ segs, parcels, recOf, go }) {
  const [f, setF] = useState('all');
  const [q, setQ] = useState('');

  const rows = segs.map(s => ({
    s,
    p: parcels.find(x => String(x.id) === String(s.pid)) || parcels[0],
    rec: recOf(s)
  }));

  const count = (k) => rows.filter(r => r.rec.state === k).length;

  // Las 4 Selecciones descriptivas, útiles y directas al grano para Seguimiento
  const SELECTIONS = [
    {
      id: 'all',
      title: 'Todos los cultivos',
      subtitle: 'Panorama General',
      desc: 'Visión integral de todos los cultivos sembrados, etapa fenológica y estado del balance hídrico.',
      count: rows.length,
      icon: 'sprout',
      activeColor: 'border-primary ring-2 ring-primary/20 bg-primary/5',
      badgeClass: 'bg-slate-100 text-slate-700',
      iconClass: 'bg-primary/10 text-primary'
    },
    {
      id: 'water',
      title: 'Regar hoy',
      subtitle: 'Atención Inmediata',
      desc: 'Humedad baja en suelo (< 30 %) y sin lluvia prevista. Requiere aplicación de riego para evitar estrés.',
      count: count('water'),
      icon: 'drop',
      activeColor: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5',
      badgeClass: 'bg-amber-100 text-amber-700',
      iconClass: 'bg-amber-100 text-amber-600'
    },
    {
      id: 'wait',
      title: 'Esperar lluvia',
      subtitle: 'Ahorro de Agua',
      desc: 'La telemetría NASA prevé lluvias en 48-72h. Pausa el riego para ahorrar agua y no lavar nutrientes.',
      count: count('wait'),
      icon: 'rain',
      activeColor: 'border-sky ring-2 ring-sky/20 bg-sky/5',
      badgeClass: 'bg-sky-100 text-sky-700',
      iconClass: 'bg-sky/15 text-primary'
    },
    {
      id: 'dry',
      title: 'Suelo húmedo (No regar)',
      subtitle: 'Nivel Óptimo',
      desc: 'La humedad del suelo se mantiene en rango ideal por riego reciente o lluvias pasadas. No gastes agua.',
      count: count('dry'),
      icon: 'check',
      activeColor: 'border-teal-600 ring-2 ring-teal-600/20 bg-teal-600/5',
      badgeClass: 'bg-teal-100 text-teal-800',
      iconClass: 'bg-mint/15 text-teal-700'
    }
  ];

  const list = rows.filter(r =>
    (f === 'all' || r.rec.state === f) &&
    (!q.trim() || `${r.s.crop} ${r.p?.name || ''}`.toLowerCase().includes(q.trim().toLowerCase()))
  );

  return (
    <div className="fade-in">
      <PageTitle
        title="Seguimiento de Riego"
        sub="Semáforo diario con balance hídrico FAO-56 y satélites NASA para decidir cuándo regar y cuándo esperar."
        right={<Btn icon="plus" onClick={() => go('segform')}>Nuevo seguimiento</Btn>}
      />

      {/* 4 SELECCIONES CLARAS, DESCRIPTIVAS Y AL GRANO */}
      <div className="mb-3">
        <h2 className="font-display text-base font-bold text-slate-700">
          Estado hídrico de tus parcelas:
        </h2>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SELECTIONS.map((sel) => {
          const isSelected = f === sel.id;
          return (
            <button
              key={sel.id}
              onClick={() => setF(sel.id)}
              className={`card flex flex-col justify-between p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                isSelected ? sel.activeColor : 'hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${sel.iconClass}`}>
                    <Icon n={sel.icon} s={22} />
                  </span>
                  <span className={`font-display text-2xl font-black ${sel.badgeClass} rounded-full px-3.5 py-0.5`}>
                    {sel.count}
                  </span>
                </div>
                <div className="mt-3.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {sel.subtitle}
                  </div>
                  <div className="font-display text-lg font-bold text-ink">
                    {sel.title}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">
                  {sel.desc}
                </p>
              </div>

              <div className="mt-3.5 border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{isSelected ? '✓ Filtro activo' : 'Toca para filtrar'}</span>
                {isSelected && <span className="text-primary font-bold">Activo</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Barra de búsqueda y contador */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[260px] flex-1 sm:max-w-md">
          <Icon n="search" s={18} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Buscar seguimiento"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por cultivo o nombre de parcela..."
            className="field !pl-10 !py-3 text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          {f !== 'all' && (
            <button
              onClick={() => setF('all')}
              className="text-sm font-bold text-primary underline hover:text-ink"
            >
              Quitar filtro ({SELECTIONS.find(x => x.id === f)?.title})
            </button>
          )}
          <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
            {list.length} {list.length === 1 ? 'cultivo mostrado' : 'cultivos mostrados'}
          </span>
        </div>
      </div>

      {/* Lista de parcelas con seguimiento */}
      {list.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r, i) => (
            <SegCard
              key={r.s.id}
              i={i}
              {...r}
              parcel={r.p}
              onOpen={() => go('segdetail', r.s.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card grid place-items-center gap-3 p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Icon n="sprout" s={28} />
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-ink">No hay seguimientos con este filtro</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Ninguno de tus cultivos coincide con el estado seleccionado o el término de búsqueda actual.
            </p>
          </div>
          <Btn variant="soft" onClick={() => { setF('all'); setQ(''); }}>
            Ver todos los cultivos
          </Btn>
        </div>
      )}
    </div>
  );
}
