import { useState, useMemo } from 'react';
import * as RC from 'recharts';
import { Chart } from '../components/charts';
import { PageTitle, ParcelSelect } from '../components/ui';
import { METRICS } from '../data/parcels';
import { addDays, dayName } from '../lib/dates';
import { fmt } from '../lib/utils';
import { Seguimiento } from './Seguimiento';

export const TT = { contentStyle: { borderRadius: 12, border: 'none', background: 'rgba(15,31,51,.94)', color: '#fff', fontSize: 12, boxShadow: '0 10px 30px -10px rgba(0,0,0,.4)' }, labelStyle: { color: '#BFE3FA', fontWeight: 600 }, itemStyle: { color: '#fff' } };

export const AX = { tick: { fontSize: 11, fill: '#6B7E96' }, axisLine: false, tickLine: false };

export function ChartCard({ title, sub, right, children }) {
  return <section className="card p-5"><div className="mb-3 flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-display text-base font-semibold">{title}</h2>{sub && <p className="text-xs text-slate-500">{sub}</p>}</div>{right}</div>{children}</section>;
}

export function NoRC() { return <p className="grid h-40 place-items-center text-sm text-slate-500">No se pudo cargar la librería de gráficas. Revisa tu conexión.</p>; }

export function RSeries({ data, color, unit, d = 1, bars, name, id, height = 240 }) {
  if (!RC) return <Chart data={data} color={color} unit={unit} bars={bars} d={d} height={height} />;
  const { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } = RC;
  const fm = (v) => [`${fmt(v, d)} ${unit}`, name];
  const common = { data, margin: { top: 8, right: 8, left: -8, bottom: 0 } };
  const grid = <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#E3ECF5" />;
  const yax = <YAxis {...AX} width={40} tickFormatter={(v) => fmt(v, 0)} domain={bars ? [0, 'auto'] : ['auto', 'auto']} />;
  return <div style={{ height }}><ResponsiveContainer width="100%" height="100%">
    {bars ? <BarChart {...common}>{grid}<XAxis dataKey="label" {...AX} minTickGap={18} />{yax}<Tooltip {...TT} formatter={fm} cursor={{ fill: 'rgba(79,163,224,.12)' }} /><Bar dataKey="v" name={name} fill={color} radius={[4, 4, 0, 0]} /></BarChart>
      : <AreaChart {...common}><defs><linearGradient id={`rg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.4} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>{grid}<XAxis dataKey="label" {...AX} minTickGap={18} />{yax}<Tooltip {...TT} formatter={fm} /><Area type="monotone" dataKey="v" name={name} stroke={color} strokeWidth={2.5} fill={`url(#rg${id})`} dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} /></AreaChart>}
  </ResponsiveContainer></div>;
}

export function Graficas({ parcels, segs }) {
  const [pid, setPid] = useState(parcels[0].id);
  const [am, setAm] = useState('temp');
  const [sid, setSid] = useState(segs[0] ? segs[0].id : null);
  const p = parcels.find(x => x.id === pid) || parcels[0];
  const seg = segs.find(x => x.id === sid) || segs[0];
  const daily = (k) => p.daily.map(d => ({ label: d.label, v: d[k] }));
  const hourly = p.hourly.map(h => ({ label: h.label, v: h.temp }));
  const avg = useMemo(() => parcels[0].daily.map((d, i) => ({ label: d.label, v: parcels.reduce((a, q) => a + q.daily[i][am], 0) / parcels.length })), [parcels, am]);
  const humBy = parcels.map(q => ({ label: q.name, v: q.hum }));
  const fc5 = p.forecast.map(f => ({ label: `${f.day} ${f.num}`, hi: f.hi, lo: f.lo, rain: f.rain }));
  const fc7 = seg ? seg.forecast.map(([pr, mm], i) => ({ label: `${dayName(i)} ${addDays(i).getDate()}`, prob: pr, mm })) : [];
  const M = METRICS[am];
  const R = RC || {};
  return (
    <div className="fade-in">
      <PageTitle title="Gráficas" sub="Todas las gráficas de temperatura, humedad, lluvia y pronóstico en un solo lugar" right={<ParcelSelect parcels={parcels} value={p.id} onChange={setPid} />} />
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Temperatura" sub={`${p.name} · últimos 30 días (°C)`}><RSeries id="t30" data={daily('temp')} color={METRICS.temp.color} unit="°C" name="Temperatura" /></ChartCard>
        <ChartCard title="Humedad del suelo" sub={`${p.name} · últimos 30 días (%)`}><RSeries id="h30" data={daily('hum')} color={METRICS.hum.color} unit="%" name="Humedad del suelo" /></ChartCard>
        <ChartCard title="Precipitación diaria" sub={`${p.name} · últimos 30 días (mm)`}><RSeries id="r30" data={daily('rain')} color={METRICS.rain.color} unit="mm" name="Lluvia" bars /></ChartCard>
        <ChartCard title="Temperatura en las últimas 24 h" sub={`${p.name} · por hora (°C)`}><RSeries id="t24" data={hourly} color={METRICS.temp.color} unit="°C" name="Temperatura" /></ChartCard>
        <ChartCard title="Promedio de tus terrenos" sub={`${M.label} · últimos 30 días (${M.unit})`}
          right={<div className="flex gap-1 rounded-xl bg-slate-100/80 p-1" role="tablist">{['temp', 'hum', 'rain'].map(k => <button key={k} role="tab" aria-selected={am === k} onClick={() => setAm(k)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-300 ${am === k ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-ink'}`}>{METRICS[k].label.replace(' del suelo', '')}</button>)}</div>}>
          <RSeries key={am} id={'avg' + am} data={avg} color={M.color} unit={M.unit} name={M.label} bars={M.bars} />
        </ChartCard>
        <ChartCard title="Humedad del suelo por terreno" sub="La línea naranja marca el mínimo recomendado (30 %)">
          {RC ? <div style={{ height: 240 }}><R.ResponsiveContainer width="100%" height="100%">
            <R.BarChart layout="vertical" data={humBy} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <R.CartesianGrid strokeDasharray="3 5" horizontal={false} stroke="#E3ECF5" />
              <R.XAxis type="number" domain={[0, 60]} {...AX} unit="%" />
              <R.YAxis type="category" dataKey="label" width={130} {...AX} />
              <R.Tooltip {...TT} formatter={(v) => [`${fmt(v, 0)} %`, 'Humedad del suelo']} cursor={{ fill: 'rgba(79,163,224,.12)' }} />
              <R.ReferenceLine x={30} stroke="#E8833A" strokeDasharray="4 4" />
              <R.Bar dataKey="v" name="Humedad del suelo" radius={[0, 6, 6, 0]}>{humBy.map((d, i) => <R.Cell key={i} fill={d.v < 30 ? '#E8833A' : '#4FA3E0'} />)}</R.Bar>
            </R.BarChart></R.ResponsiveContainer></div> : <NoRC />}
        </ChartCard>
        <ChartCard title="Pronóstico de 5 días" sub={`${p.name} · temperatura máxima, mínima y probabilidad de lluvia`}>
          {RC ? <div style={{ height: 240 }}><R.ResponsiveContainer width="100%" height="100%">
            <R.ComposedChart data={fc5} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <R.CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#E3ECF5" />
              <R.XAxis dataKey="label" {...AX} />
              <R.YAxis yAxisId="t" {...AX} width={40} unit="°" />
              <R.YAxis yAxisId="r" orientation="right" domain={[0, 100]} {...AX} width={40} unit="%" />
              <R.Tooltip {...TT} />
              <R.Legend wrapperStyle={{ fontSize: 12 }} />
              <R.Bar yAxisId="r" dataKey="rain" name="Prob. de lluvia (%)" fill="#4FA3E0" fillOpacity={0.55} barSize={26} radius={[6, 6, 0, 0]} />
              <R.Line yAxisId="t" type="monotone" dataKey="hi" name="Máx (°C)" stroke="#E8833A" strokeWidth={2.5} dot={{ r: 3 }} />
              <R.Line yAxisId="t" type="monotone" dataKey="lo" name="Mín (°C)" stroke="#0B3D91" strokeWidth={2.5} dot={{ r: 3 }} />
            </R.ComposedChart></R.ResponsiveContainer></div> : <NoRC />}
        </ChartCard>
        <ChartCard title="Pronóstico de lluvia a 7 días" sub="Probabilidad y milímetros esperados en el seguimiento elegido"
          right={seg && <select aria-label="Seguimiento" value={seg.id} onChange={e => setSid(e.target.value)} className="field !w-auto !py-1.5 text-xs">{segs.map(s => <option key={s.id} value={s.id}>{s.crop} · {(parcels.find(x => x.id === s.pid) || parcels[0]).name}</option>)}</select>}>
          {RC ? <div style={{ height: 240 }}><R.ResponsiveContainer width="100%" height="100%">
            <R.ComposedChart data={fc7} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <R.CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#E3ECF5" />
              <R.XAxis dataKey="label" {...AX} />
              <R.YAxis yAxisId="mm" {...AX} width={40} unit=" mm" />
              <R.YAxis yAxisId="pr" orientation="right" domain={[0, 100]} {...AX} width={40} unit="%" />
              <R.Tooltip {...TT} />
              <R.Legend wrapperStyle={{ fontSize: 12 }} />
              <R.Bar yAxisId="mm" dataKey="mm" name="Lluvia esperada (mm)" fill="#0B3D91" barSize={26} radius={[6, 6, 0, 0]} />
              <R.Line yAxisId="pr" type="monotone" dataKey="prob" name="Probabilidad (%)" stroke="#4FA3E0" strokeWidth={2.5} dot={{ r: 3 }} />
            </R.ComposedChart></R.ResponsiveContainer></div> : <NoRC />}
        </ChartCard>
      </div>
    </div>
  );
}
