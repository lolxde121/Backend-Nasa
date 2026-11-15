import { useState, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Chart } from '../components/charts';
import { METRICS } from '../data/parcels';
import { fmt, statusOf } from '../lib/utils';
import { Seguimiento } from './Seguimiento';
import { Terrenos } from './Terrenos';

export function Dashboard({ parcels, go, alerts }) {
  const [metric, setMetric] = useState('temp');
  const avgT = parcels.reduce((a, p) => a + p.temp, 0) / parcels.length;
  const avgH = parcels.reduce((a, p) => a + p.hum, 0) / parcels.length;
  const riego = parcels.filter(p => statusOf(p) === 'Requiere riego');
  const rain7 = parcels.reduce((a, p) => a + p.rain7, 0) / parcels.length;
  const M = METRICS[metric];
  const series = useMemo(() => parcels[0].daily.map((d, i) => ({ label: d.label, v: parcels.reduce((a, p) => a + p.daily[i][metric], 0) / parcels.length })), [parcels, metric]);
  const ranked = [...parcels].sort((a, b) => a.hum - b.hum);
  const stats = [
    { i: 'thermo', l: 'Temperatura media', v: fmt(avgT), u: '°C en tus terrenos', c: '#E8833A' },
    { i: 'drop', l: 'Humedad del suelo', v: fmt(avgH, 0), u: '% promedio', c: '#4FA3E0' },
    { i: 'warn', l: 'Requieren riego', v: riego.length, u: `de ${parcels.length} terrenos`, c: '#D97706' },
    { i: 'rain', l: 'Lluvia en 7 días', v: fmt(rain7), u: 'mm promedio', c: '#0B3D91' },
  ];
  return (
    <div className="fade-in">
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#1555B8] to-sky p-6 text-white shadow-xl shadow-primary/25 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-56 w-56 rounded-full bg-mint/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-sky-100">Sábado 14 de noviembre · 18:20</p>
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">Buenas tardes, Agricultor</h1>
            <p className="mt-2 max-w-md text-sm text-sky-100">{riego.length ? `${riego.length} terrenos necesitan riego pronto. El resto avanza dentro de lo esperado.` : 'Todos tus terrenos están dentro de los rangos esperados.'}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => go('terrenos')} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">Ver mis terrenos</button>
              <button onClick={() => go('seg')} className="rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur transition-all hover:bg-white/20">Ir a Seguimiento</button>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/25 bg-white/10 px-5 py-4 backdrop-blur-md">
            <Icon n="sun" s={38} cls="text-amber-200" />
            <div><div className="font-display text-4xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(avgT)}°</div><div className="text-xs text-sky-100">Temperatura media en tus fincas</div></div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-2" aria-label="Accesos rápidos">
        {[['terrenos', 'Terrenos', 'Administra tus parcelas y consulta su información agroclimática.', 'map', 'from-primary to-[#1B5BC4]'],
          ['seg', 'Seguimiento en el terreno', 'Registra tu siembra y recibe cuándo regar, esperar lluvia o no regar.', 'sprout', 'from-mint to-sky']].map(([k, t, d, i, g]) => <button key={k} onClick={() => go(k)}
          className="card group flex items-center gap-4 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(11,61,145,.4)]">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${g} text-white shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}><Icon n={i} s={26} /></span>
          <span className="min-w-0 flex-1"><span className="block font-display text-base font-semibold">{t}</span><span className="text-xs text-slate-500">{d}</span></span>
          <Icon n="right" s={20} cls="text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
        </button>)}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(s => <div key={s.l} className="card p-4 transition-all duration-300 hover:-translate-y-0.5">
          <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl" style={{ background: s.c + '1A', color: s.c }}><Icon n={s.i} s={18} /></div>
          <div className="text-xs font-medium text-slate-500">{s.l}</div>
          <div className="font-display text-2xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
          <div className="text-xs text-slate-500">{s.u}</div>
        </div>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold">{M.label} de tus terrenos</h2>
            <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1" role="tablist">{['temp', 'hum', 'rain'].map(k => <button key={k} role="tab" aria-selected={metric === k} onClick={() => setMetric(k)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${metric === k ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-ink'}`}><Icon n={METRICS[k].icon} s={14} />{METRICS[k].label.replace(' del suelo', '')}</button>)}</div>
          </div>
          <p className="mb-3 text-xs text-slate-500">Promedio de todos tus terrenos · últimos 30 días ({M.unit}).</p>
          <Chart key={metric} data={series} color={M.color} unit={M.unit} bars={M.bars} d={M.d} height={260} />
        </div>
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold">Humedad del suelo por terreno</h2>
          <p className="mb-4 text-xs text-slate-500">La línea marca el mínimo recomendado (30 %).</p>
          <div className="flex flex-col gap-3">
            {ranked.map(p => <button key={p.id} onClick={() => go('detail', p.id)} className="group text-left">
              <div className="mb-1 flex justify-between text-xs"><span className="font-semibold group-hover:text-primary">{p.name}</span><b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(p.hum, 0)} %</b></div>
              <div className="relative h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(p.hum / 60 * 100, 100)}%`, background: p.hum < 30 ? '#E8833A' : '#4FA3E0' }} /><span className="absolute inset-y-0 w-px bg-ink/40" style={{ left: '50%' }} /></div>
            </button>)}
          </div>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Alertas activas</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.length ? alerts.slice(0, 6).map(a => <button key={a.id} onClick={() => go('detail', a.pid)} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/70 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-sky hover:shadow-md">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${a.lvl === 'Alta' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}><Icon n="warn" s={16} /></span>
            <span><span className="block text-sm font-bold">{a.name}</span><span className="block text-xs text-slate-500">{a.t}. {a.d}</span></span>
          </button>) : <p className="text-sm text-slate-500">No hay alertas activas.</p>}
        </div>
      </div>
    </div>
  );
}
