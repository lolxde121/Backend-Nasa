import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Kpi } from '../components/Kpi';
import { MapView } from '../components/MapView';
import { MetricChart } from '../components/charts';
import { Btn, Chip, StatusBadge } from '../components/ui';
import { METRICS, PRIO, alertsFor, recsFor } from '../data/parcels';
import { TODAY_ISO, dLong, daysBetween } from '../lib/dates';
import { fmt, statusOf } from '../lib/utils';
import { Terrenos } from './Terrenos';

export function Row({ l, k, min, max, step, u, c, setC }) { return <div><div className="mb-1 flex justify-between text-sm"><label htmlFor={'a-' + k} className="font-semibold">{l}</label><b className="text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>{c[k]} {u}</b></div>
    <input id={'a-' + k} type="range" min={min} max={max} step={step} value={c[k]} onChange={e => setC({ ...c, [k]: parseFloat(e.target.value) })} /></div>; }

export function AlertsModal({ p, cfg, onSave, onClose }) {
  const [c, setC] = useState(cfg);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label="Ajustar alertas" className="pop card w-full max-w-md !bg-white p-6" onClick={e => e.stopPropagation()}>
      <div className="mb-1 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Ajustar alertas</h2><button onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"><Icon n="x" s={18} /></button></div>
      <p className="mb-5 text-sm text-slate-500">Recibe un aviso cuando {p.name} salga de estos rangos.</p>
      <div className="flex flex-col gap-5">
        <Row c={c} setC={setC} l="Humedad mínima del suelo" k="humMin" min={10} max={50} step={1} u="%" />
        <Row c={c} setC={setC} l="Temperatura máxima" k="tempMax" min={20} max={40} step={1} u="°C" />
        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold">Enviar notificación push
          <input type="checkbox" checked={c.push} onChange={e => setC({ ...c, push: e.target.checked })} className="h-5 w-5 accent-[#0B3D91]" /></label>
      </div>
      <div className="mt-6 flex justify-end gap-3"><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn onClick={() => onSave(c)}>Guardar alertas</Btn></div>
    </div>
  </div>;
}

export function Detail({ p, go, cfg, setCfg, notify, segs, onDelete }) {
  const [layer, setLayer] = useState('sat');
  const [modal, setModal] = useState(false);
  const st = statusOf(p);
  const al = alertsFor(p, cfg), recs = recsFor(p);
  const copy = async () => {
    const txt = `${p.name} (${p.loc}) · ${fmt(p.area)} ha · ${p.crop}\nTemp ${fmt(p.temp)} °C · Humedad ${fmt(p.hum, 0)} % · Lluvia 30 d ${fmt(p.rain30)} mm\nEstado: ${st}`;
    try { await navigator.clipboard.writeText(txt); notify('Resumen del reporte copiado al portapapeles'); } catch (e) { notify('No se pudo copiar. Selecciona el texto manualmente.'); }
  };
  const info = [['pin', 'Ubicación', p.place || p.loc], ['map', 'Coordenadas', `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`], ['layers', 'Tipo de tierra', p.soil], ['leaf', 'Cultivo', p.crop], ['drop', 'Sistema de riego', p.irrigation], ['thermo', 'Clima promedio', p.clima]];
  return (
    <div className="fade-in">
      <button onClick={() => go('terrenos')} className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-primary"><Icon n="back" s={14} />Terrenos / {p.name}</button>
      <div className="card mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{p.name}</h1><StatusBadge status={st} /></div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500"><span className="flex items-center gap-1"><Icon n="pin" s={14} />{p.place || p.loc}</span><span>Actualizado hoy, 6:00 p. m.</span></p>
          <div className="mt-3 flex flex-wrap gap-2"><Chip>{fmt(p.area)} ha</Chip><Chip tone="mint">{p.crop}</Chip><Chip tone="slate" icon="drop">{p.irrigation}</Chip>{al.length > 0 && <Chip tone="slate" icon="warn">{al.length} {al.length === 1 ? 'alerta' : 'alertas'}</Chip>}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="ghost" icon="download" onClick={copy}>Exportar reporte</Btn>
          <Btn variant="ghost" icon="bell" onClick={() => setModal(true)}>Ajustar alertas</Btn>
          {onDelete && (
            <Btn variant="ghost" className="!text-rose-600 hover:!border-rose-200 hover:!bg-rose-50" icon="trash" onClick={() => {
              if (window.confirm(`¿Estás seguro de que deseas eliminar la parcela "${p.name}"?`)) {
                onDelete(p.dbId || p.id);
              }
            }}>Eliminar</Btn>
          )}
          <Btn variant="primary" icon="pencil" onClick={() => go('form', p.id)}>Editar terreno</Btn>
        </div>
      </div>

      <DetailBody p={p} layer={layer} setLayer={setLayer} info={info} al={al} recs={recs} segs={segs} go={go} />
      {modal && <AlertsModal p={p} cfg={cfg} onClose={() => setModal(false)} onSave={(c) => { setCfg(c); setModal(false); notify('Alertas actualizadas'); }} />}
    </div>
  );
}

export function DetailBody({ p, layer, setLayer, info, al, recs, segs, go }) {
  const [metric, setMetric] = useState('temp');
  const last7 = p.daily.slice(-7);
  const lw = (segs || []).filter(s => s.pid === p.id).sort((a, b) => b.lastWater.localeCompare(a.lastWater))[0];
  const dsr = lw ? daysBetween(lw.lastWater, TODAY_ISO) : null;
  const kp = [
    { k: 'temp', icon: 'thermo', label: 'Temperatura', value: fmt(p.temp), unit: '°C', delta: p.dTemp, good: Math.abs(p.dTemp) < 2, foot: 'vs. ayer', spark: p.hourly.map(x => x.temp), color: METRICS.temp.color },
    { k: 'hum', icon: 'drop', label: 'Humedad del suelo', value: fmt(p.hum, 0), unit: '%', delta: p.hum - p.daily[28].hum, good: p.hum >= 30, foot: 'Capa 0–10 cm · SMAP', spark: last7.map(x => x.hum), color: METRICS.hum.color },
    { k: 'rain', icon: 'rain', label: 'Precipitación acumulada', value: fmt(p.rain30), unit: 'mm', foot: `${fmt(p.rain7)} mm en los últimos 7 días`, spark: p.daily.map(x => x.rain), color: METRICS.rain.color },
    { k: 'riego', icon: 'calendar', label: 'Último riego', value: dsr == null ? '—' : String(dsr), unit: dsr == null ? '' : dsr === 1 ? 'día' : 'días', foot: lw ? `${lw.crop} · ${dLong(lw.lastWater)}` : 'Sin seguimiento. Toca para crear uno.', color: '#2BB3A3', onClick: () => lw ? go('segdetail', lw.id) : go('segform') },
  ];
  return <>
    <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">{kp.map(k => <Kpi key={k.k} {...k} active={metric === k.k} onClick={k.onClick || (() => setMetric(k.k))} />)}</div>
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="xl:col-span-2 flex flex-col gap-5">
        <MetricChart p={p} metric={metric} setMetric={setMetric} />
        <div className="card p-5">
          <h2 className="mb-3 font-display text-base font-semibold">Pronóstico de 5 días</h2>
          <div className="grid grid-cols-5 gap-2">
            {p.forecast.map(d => <div key={d.num} className="rounded-xl bg-gradient-to-b from-sky/10 to-transparent p-3 text-center transition-all hover:-translate-y-0.5 hover:from-sky/20">
              <div className="text-xs font-semibold capitalize text-slate-500">{d.day} {d.num}</div>
              <Icon n={d.rain > 50 ? 'rain' : 'sun'} s={24} cls={`mx-auto my-2 ${d.rain > 50 ? 'text-primary' : 'text-amber-500'}`} />
              <div className="text-sm font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.hi}° <span className="font-medium text-slate-400">{d.lo}°</span></div>
              <div className="mt-0.5 text-[11px] font-semibold text-sky" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.rain} % lluvia</div>
            </div>)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="font-display text-lg font-bold text-ink">Ubicación de la parcela</h2>
            <div className="flex gap-1.5 rounded-xl bg-slate-100/90 p-1">
              {[['map', 'Mapa'], ['sat', 'Satélite']].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setLayer(k)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    layer === k ? 'bg-white text-primary shadow' : 'text-slate-500'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="relative m-4 aspect-[5/4] overflow-hidden rounded-2xl border border-slate-200">
            {/* Sin polígonos: mapa limpio centrado en el pin de ubicación */}
            <MapView
              lat={p.lat}
              lng={p.lng}
              seed={p.seed}
              pin={p.pin}
              satellite={layer !== 'map'}
              label={p.name}
            />
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100">
            {info.map(([i, l, v]) => (
              <div key={l} className="flex items-start gap-3 bg-white/95 p-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky/10 text-primary">
                  <Icon n={i} s={16} />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{l}</div>
                  <div className="truncate text-sm font-bold text-ink" title={v}>{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Telemetría Satelital NASA</h2>
            <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-bold text-teal-700">En vivo</span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-600">Misión NASA POWER</span>
              <span className="font-bold text-primary">T2M · {fmt(p.temp)} °C</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-600">Sensor NASA SMAP L3/L4</span>
              <span className="font-bold text-sky">{fmt(p.hum, 0)} % Humedad Suelo</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-medium text-slate-600">Satélite MODIS NDVI 250m</span>
              <span className="font-bold text-teal-600">{p.ndvi ? fmt(p.ndvi, 2) : '0.68'} Vigor Vegetal</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Alertas y recomendaciones</h2>
          <div className="flex flex-col gap-3">
            {al.map((a, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-rose-100 bg-rose-50/70 p-3.5">
                <Icon n="warn" s={18} cls="mt-0.5 text-rose-600 shrink-0" />
                <div>
                  <b className="block text-sm font-bold text-rose-900">{a.t}</b>
                  <span className="text-xs text-rose-700 leading-relaxed">{a.d}</span>
                </div>
              </div>
            ))}
            {recs.map((r, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-slate-100 bg-white/90 p-3.5 shadow-sm">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mint/10 text-teal-700">
                  <Icon n={r.icon} s={17} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <b className="text-sm font-bold text-ink">{r.t}</b>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${PRIO[r.pr]}`}>{r.pr}</span>
                  </div>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">{r.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>;
}
