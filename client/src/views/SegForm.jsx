import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Btn, ChipGroup, L, PageTitle } from '../components/ui';
import { SEG_CROPS } from '../data/seguimiento';
import { TODAY_ISO, cap, shiftISO } from '../lib/dates';
import { Seguimiento } from './Seguimiento';

export function SegForm({ parcels, onSave, onCancel, preset }) {
  const [f, setF] = useState({ pid: preset && parcels.some(x => x.id === preset.pid) ? preset.pid : parcels[0].id, crop: preset && preset.crop ? preset.crop : 'Maíz', sow: '2026-06-20', lastWater: '2026-11-11' });
  const [err, setErr] = useState({});
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.crop.trim()) er.crop = 'Escribe o elige un cultivo.';
    if (!f.sow || f.sow > TODAY_ISO) er.sow = 'La fecha de siembra no puede ser futura.';
    if (!f.lastWater || f.lastWater > TODAY_ISO) er.water = 'El último riego no puede ser futuro.';
    else if (f.sow && f.lastWater < f.sow) er.water = 'El último riego debe ser posterior a la siembra.';
    setErr(er);
    if (Object.keys(er).length) return;
    onSave({ ...f, crop: cap(f.crop.trim()) });
  };
  const steps = [
    ['Telemetría satelital NASA', 'Consultamos temperatura y lluvia acumulada en las coordenadas exactas de tu parcela.'],
    ['Balance hídrico FAO-56', 'Cruzamos el tipo de cultivo, evapotranspiración y tiempo transcurrido desde el último riego.'],
    ['Decisión agronómica', 'Determinamos si conviene regar hoy, esperar lluvia satelital o no regar para optimizar agua.']
  ];
  return (
    <form onSubmit={submit} noValidate className="fade-in">
      <PageTitle crumbs="Seguimiento / Nuevo seguimiento" title="Nuevo seguimiento" sub="Registra el cultivo y la fecha de tu último riego para calcular el balance hídrico satelital." />
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,420px)]">
        <div className="card flex flex-col gap-5 p-6">
          <div><h2 className="font-display text-lg font-bold text-ink">Datos del cultivo</h2><p className="mt-1 text-sm text-slate-500 font-medium">Información para estimar los requerimientos hídricos de la planta.</p></div>
          <L t="Terreno" id="sg-pid">
            <div className="relative">
              <Icon n="pin" s={18} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select id="sg-pid" className="field appearance-none !pl-10 !pr-10 !py-3.5 text-base font-semibold" value={f.pid} onChange={e => set('pid', e.target.value)}>{parcels.map(p => <option key={p.id} value={p.id}>{p.name} · {p.place || p.loc}</option>)}</select>
              <Icon n="down" s={18} cls="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </L>
          <L t="¿Qué sembraste?" id="sg-crop" err={err.crop}>
            <div className="relative"><Icon n="sprout" s={18} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input id="sg-crop" className={`field !pl-10 !py-3.5 text-base font-medium ${err.crop ? '!border-rose-400' : ''}`} value={f.crop} onChange={e => set('crop', e.target.value)} placeholder="Ej. Maíz" /></div>
            <div className="mt-3"><ChipGroup options={SEG_CROPS} value={f.crop} onChange={v => set('crop', v)} /></div>
          </L>
          <div className="grid gap-5 sm:grid-cols-2">
            <L t="Fecha de siembra" id="sg-sow" err={err.sow}><input id="sg-sow" type="date" max={TODAY_ISO} className={`field !py-3.5 text-base font-bold ${err.sow ? '!border-rose-400' : ''}`} value={f.sow} onChange={e => set('sow', e.target.value)} /></L>
            <L t="Último riego" id="sg-water" err={err.water}>
              <input id="sg-water" type="date" max={TODAY_ISO} className={`field !py-3.5 text-base font-bold ${err.water ? '!border-rose-400' : ''}`} value={f.lastWater} onChange={e => set('lastWater', e.target.value)} />
              <div className="mt-2.5 flex flex-wrap gap-2">{[['Hoy', 0], ['Ayer', 1], ['Hace 3 días', 3]].map(([l, n]) => <button type="button" key={l} onClick={() => set('lastWater', shiftISO(-n))}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all duration-300 ${f.lastWater === shiftISO(-n) ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-slate-200 bg-white text-slate-700 hover:border-sky hover:text-primary'}`}>{l}</button>)}</div>
            </L>
          </div>
        </div>
        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Fundamento del cálculo</h2>
          <ol className="flex flex-col gap-4">{steps.map(([t, d], i) => <li key={t} className="flex gap-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky/20 to-mint/20 text-sm font-bold text-primary">{i + 1}</span>
            <div><b className="block text-base font-bold text-ink">{t}</b><span className="text-sm leading-relaxed text-slate-600 font-medium">{d}</span></div></li>)}</ol>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-sky/10 p-3.5 text-sm text-primary font-medium"><Icon n="globe" s={18} cls="mt-0.5 shrink-0" />Podrás consultar el balance hídrico actualizado en cualquier momento.</div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3.5"><Btn variant="ghost" onClick={onCancel} className="!text-base font-bold !px-6 !py-3">Cancelar</Btn><Btn type="submit" className="!text-base font-bold !px-7 !py-3"><Icon n="check" s={18} />Guardar y calcular balance</Btn></div>
    </form>
  );
}
