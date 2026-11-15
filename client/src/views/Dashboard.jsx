import { useMemo } from 'react';
import { Icon } from '../components/Icon';
import { fmt, statusOf } from '../lib/utils';

export function Dashboard({ parcels = [], go, alerts = [], segs = [] }) {
  const avgT = parcels.length ? parcels.reduce((a, p) => a + p.temp, 0) / parcels.length : 21.5;
  const avgH = parcels.length ? parcels.reduce((a, p) => a + p.hum, 0) / parcels.length : 34;
  const riego = parcels.filter(p => statusOf(p) === 'Requiere riego');
  const rain7 = parcels.length ? parcels.reduce((a, p) => a + p.rain7, 0) / parcels.length : 8.5;
  const totalArea = parcels.reduce((a, p) => a + (p.area || 0), 0);

  // 4 Selecciones principales para el agricultor: descriptivas, directas al grano y útiles
  const SELECTIONS = [
    {
      id: 'terrenos',
      title: 'Mis Terrenos y Parcelas',
      category: 'Catastro y Ubicación Satelital',
      desc: 'Administra tus predios agrícolas, visualízalos en el mapa satelital interactivo, consulta la humedad del suelo SMAP y registra nuevos terrenos con su ubicación exacta.',
      metric: `${parcels.length} ${parcels.length === 1 ? 'terreno' : 'terrenos'} · ${fmt(totalArea, 1)} ha totales`,
      subMetric: `${fmt(avgH, 0)}% humedad media SMAP`,
      icon: 'map',
      gradient: 'from-[#0B3D91] to-[#1E60CC]',
      badge: `${parcels.length} registrados`,
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
      actionLabel: 'Ver mis terrenos'
    },
    {
      id: 'seg',
      title: 'Control de Riego con IA',
      category: 'Asistente Diario de Riego',
      desc: 'Semáforo inteligente diario con balance hídrico FAO-56. Te indica al grano si debes regar hoy, esperar lluvia satelital o no regar para ahorrar agua y costos.',
      metric: riego.length > 0 ? `${riego.length} necesitan riego urgente` : 'Humedad óptima en todas las parcelas',
      subMetric: `${segs.length} ${segs.length === 1 ? 'cultivo en monitoreo' : 'cultivos en monitoreo'}`,
      icon: 'sprout',
      gradient: 'from-[#D97706] to-[#F59E0B]',
      badge: riego.length > 0 ? `${riego.length} por regar` : 'Al día',
      badgeStyle: riego.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionLabel: 'Ver recomendaciones de riego'
    },
    {
      id: 'recs',
      title: 'Qué Sembrar (Recomendador con IA)',
      category: 'Inteligencia Agroclimática',
      desc: 'Descubre qué cultivos son más viables y rentables cruzando el tipo de suelo de tu parcela con el historial agroclimático de temperatura y precipitación de la NASA.',
      metric: 'Evaluación agroclimática de 8+ cultivos',
      subMetric: 'Calendario de siembra y rendimiento estimado',
      icon: 'sparkles',
      gradient: 'from-[#0F766E] to-[#2BB3A3]',
      badge: 'Recomendación IA',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionLabel: 'Consultar cultivos sugeridos'
    },
    {
      id: 'graf',
      title: 'Pronóstico y Clima Satelital',
      category: 'Telemetría Satelital NASA',
      desc: 'Consulta tendencias agroclimáticas en tiempo real: curvas de temperatura histórica, evolución de humedad SMAP y pronóstico acumulado de lluvia a 7 días.',
      metric: `${fmt(avgT)}°C temperatura media`,
      subMetric: `${fmt(rain7)} mm de lluvia acumulada a 7 días`,
      icon: 'sun',
      gradient: 'from-[#1E3A8A] to-[#38BDF8]',
      badge: 'NASA POWER',
      badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200',
      actionLabel: 'Ver telemetría y pronóstico'
    }
  ];

  const stats = [
    { i: 'thermo', l: 'Temperatura media', v: fmt(avgT), u: '°C en tus fincas', c: '#E8833A' },
    { i: 'drop', l: 'Humedad del suelo', v: fmt(avgH, 0), u: '% promedio SMAP', c: '#4FA3E0' },
    { i: 'warn', l: 'Requieren riego', v: riego.length, u: `de ${parcels.length} parcelas`, c: '#D97706' },
    { i: 'rain', l: 'Lluvia esperada', v: fmt(rain7), u: 'mm a 7 días (NASA)', c: '#0B3D91' },
  ];

  return (
    <div className="fade-in">
      {/* Saludo y estado general */}
      <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#1555B8] to-sky p-6 text-white shadow-xl shadow-primary/20 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-56 w-56 rounded-full bg-mint/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-100">
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
              Telemetría Satelital Activa · NASA POWER & SMAP
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">Bienvenido a Lum</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-sky-100">
              {riego.length > 0
                ? `Atención: ${riego.length} de tus parcelas necesitan riego prioritario para evitar estrés hídrico. El resto se mantiene en niveles óptimos.`
                : 'Todas tus parcelas se encuentran en rangos hídricos y térmicos favorables según los satélites.'}
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
            <Icon n="sun" s={38} cls="text-amber-200" />
            <div>
              <div className="font-display text-3xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {fmt(avgT)}°C
              </div>
              <div className="text-xs text-sky-100">Clima promedio en la zona</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 SELECCIONES PRINCIPALES: Descriptivas, al grano y útiles */}
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold text-ink">¿Qué deseas realizar hoy?</h2>
        <p className="text-xs text-slate-500">Selecciona una de las 4 opciones principales de la plataforma para comenzar:</p>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-2">
        {SELECTIONS.map((sel) => (
          <button
            key={sel.id}
            onClick={() => go(sel.id)}
            className="card group flex flex-col justify-between p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(11,61,145,.35)] hover:border-sky/40"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${sel.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}
                  >
                    <Icon n={sel.icon} s={24} />
                  </span>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {sel.category}
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary transition-colors">
                      {sel.title}
                    </h3>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sel.badgeStyle}`}>
                  {sel.badge}
                </span>
              </div>

              <p className="mt-3.5 text-xs leading-relaxed text-slate-600">
                {sel.desc}
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="block font-bold text-ink">{sel.metric}</span>
                  <span className="text-[11px] text-slate-400">{sel.subMetric}</span>
                </div>
                <span className="flex items-center gap-1 font-semibold text-primary transition-all group-hover:translate-x-1">
                  {sel.actionLabel}
                  <Icon n="right" s={14} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Resumen rápido de telemetría agroclimática */}
      <div className="mb-6">
        <h3 className="mb-3 font-display text-sm font-bold text-slate-700">Estado de tus terrenos en cifras</h3>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="card p-4 transition-all duration-300 hover:-translate-y-0.5">
              <div className="mb-2 grid h-8 w-8 place-items-center rounded-xl" style={{ background: s.c + '18', color: s.c }}>
                <Icon n={s.i} s={16} />
              </div>
              <div className="text-xs font-medium text-slate-500">{s.l}</div>
              <div className="font-display text-xl font-bold text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.v}
              </div>
              <div className="text-[11px] text-slate-400">{s.u}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas activas si existen */}
      {alerts.length > 0 && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-amber-700">
                <Icon n="warn" s={14} />
              </span>
              Alertas agronómicas activas
            </h3>
            <span className="text-xs font-semibold text-slate-400">{alerts.length} alertas</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {alerts.slice(0, 4).map((a) => (
              <button
                key={a.id}
                onClick={() => go('detail', a.pid)}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/70 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-sky hover:shadow-md"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                    a.lvl === 'Alta' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Icon n="warn" s={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{a.name}</span>
                  <span className="block text-xs text-slate-500">{a.t} · {a.d}</span>
                </span>
                <Icon n="right" s={14} cls="text-slate-300 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
