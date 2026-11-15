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
  const steps = [['Pronóstico de lluvia', 'Consultamos el clima en las coordenadas de tu terreno para los próximos 7 días.'], ['Análisis con IA', 'La IA combina tu cultivo, el tiempo desde la siembra y la fecha de tu último riego.'], ['Recomendación', 'Te decimos si conviene regar hoy, esperar la lluvia o no regar, y cuándo volver a revisar.']];
  return (
    <form onSubmit={submit} noValidate className="fade-in">
      <PageTitle crumbs="Seguimiento / Nuevo seguimiento" title="Nuevo seguimiento" sub="Cuéntanos qué sembraste y cuándo regaste por última vez para calcular tu próxima recomendación de riego." />
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(300px,400px)]">
        <div className="card flex flex-col gap-5 p-5 md:p-6">
          <div><h2 className="font-display text-base font-semibold">Datos del cultivo</h2><p className="mt-1 text-xs text-slate-500">Esta información nos ayuda a estimar cuánta agua necesita la planta.</p></div>
          <L t="Terreno" id="sg-pid">
            <div className="relative">
              <Icon n="pin" s={15} cls="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select id="sg-pid" className="field appearance-none !pl-9 !pr-9" value={f.pid} onChange={e => set('pid', e.target.value)}>{parcels.map(p => <option key={p.id} value={p.id}>{p.name} · {p.place || p.loc}</option>)}</select>
              <Icon n="down" s={15} cls="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Usaremos sus coordenadas para consultar el pronóstico de lluvia.</p>
          </L>
          <L t="¿Qué sembraste?" id="sg-crop" err={err.crop}>
            <div className="relative"><Icon n="sprout" s={15} cls="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input id="sg-crop" className={`field !pl-9 ${err.crop ? '!border-rose-400' : ''}`} value={f.crop} onChange={e => set('crop', e.target.value)} placeholder="Ej. Maíz" /></div>
            <div className="mt-2.5"><ChipGroup options={SEG_CROPS} value={f.crop} onChange={v => set('crop', v)} /></div>
          </L>
          <div className="grid gap-5 sm:grid-cols-2">
            <L t="Fecha de siembra" id="sg-sow" err={err.sow}><input id="sg-sow" type="date" max={TODAY_ISO} className={`field ${err.sow ? '!border-rose-400' : ''}`} value={f.sow} onChange={e => set('sow', e.target.value)} /></L>
            <L t="Último riego" id="sg-water" err={err.water}>
              <input id="sg-water" type="date" max={TODAY_ISO} className={`field ${err.water ? '!border-rose-400' : ''}`} value={f.lastWater} onChange={e => set('lastWater', e.target.value)} />
              <div className="mt-2 flex flex-wrap gap-2">{[['Hoy', 0], ['Ayer', 1], ['Hace 3 días', 3]].map(([l, n]) => <button type="button" key={l} onClick={() => set('lastWater', shiftISO(-n))}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 ${f.lastWater === shiftISO(-n) ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-slate-200 bg-white text-slate-600 hover:border-sky hover:text-primary'}`}>{l}</button>)}</div>
            </L>
          </div>
        </div>
        <div className="card h-fit p-5 md:p-6">
          <h2 className="mb-4 font-display text-base font-semibold">Así calculamos tu recomendación</h2>
          <ol className="flex flex-col gap-4">{steps.map(([t, d], i) => <li key={t} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky/20 to-mint/20 text-xs font-bold text-primary">{i + 1}</span>
            <div><b className="block text-sm">{t}</b><span className="text-xs leading-relaxed text-slate-500">{d}</span></div></li>)}</ol>
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-sky/10 p-3 text-xs text-primary"><Icon n="globe" s={15} cls="mt-0.5" />Podrás actualizar la recomendación cuando quieras desde el detalle del seguimiento.</div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3"><Btn variant="ghost" onClick={onCancel}>Cancelar</Btn><Btn type="submit"><Icon n="sparkles" s={16} />Guardar y obtener recomendación</Btn></div>
    </form>
  );
}
