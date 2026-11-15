import { useState, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Btn, ChipGroup, L, PageTitle } from '../components/ui';
import { CROP_DATABASE, SEG_CROPS, getCropAnalysis } from '../data/seguimiento';
import { TODAY_ISO, cap, shiftISO } from '../lib/dates';

export function SegForm({ parcels = [], onSave, onCancel, preset }) {
  const [f, setF] = useState({
    pid: preset && parcels.some(x => String(x.id) === String(preset.pid)) ? preset.pid : (parcels[0]?.id || '1'),
    crop: preset && preset.crop ? preset.crop : 'Maíz',
    sow: '2026-06-20',
    lastWater: '2026-11-11'
  });
  const [err, setErr] = useState({});

  const selectedParcel = useMemo(() => {
    return (parcels && parcels.find(p => String(p.id) === String(f.pid))) || parcels?.[0] || {
      id: '1',
      name: 'Parcela',
      soil: 'Franco',
      place: 'México',
      loc: 'México',
      temp: 22,
      hum: 35,
      rain30: 25
    };
  }, [parcels, f.pid]);

  const analysis = useMemo(() => {
    return getCropAnalysis(f.crop, selectedParcel);
  }, [f.crop, selectedParcel]);

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
      <PageTitle
        crumbs="Seguimiento / Nuevo seguimiento"
        title="Nuevo seguimiento"
        sub="Registra el cultivo y la fecha de tu último riego para calcular el balance hídrico y recomendaciones satelitales."
      />

      {/* Datalist con sugerencias de cultivos conocidos */}
      <datalist id="crop-suggestions">
        {CROP_DATABASE.map(c => (
          <option key={c.name} value={c.name}>{c.category} · {c.cycleDays} días</option>
        ))}
      </datalist>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,420px)]">
        <div className="card flex flex-col gap-5 p-6">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Datos del cultivo</h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Información para estimar los requerimientos hídricos de la planta y calcular recomendaciones de riego.
            </p>
          </div>

          <L t="Terreno" id="sg-pid">
            <div className="relative">
              <Icon n="pin" s={18} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                id="sg-pid"
                className="field appearance-none !pl-10 !pr-10 !py-3.5 text-base font-semibold"
                value={f.pid}
                onChange={e => set('pid', e.target.value)}
              >
                {parcels.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.place || p.loc} (Suelo: {p.soil})
                  </option>
                ))}
              </select>
              <Icon n="down" s={18} cls="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </L>

          <L t="¿Qué sembraste?" id="sg-crop" err={err.crop}>
            <div className="relative">
              <Icon n="sprout" s={18} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="sg-crop"
                list="crop-suggestions"
                autoComplete="off"
                className={`field !pl-10 !py-3.5 text-base font-medium ${err.crop ? '!border-rose-400' : ''}`}
                value={f.crop}
                onChange={e => set('crop', e.target.value)}
                placeholder="Escribe cualquier cultivo (ej. Trigo, Papa, Aguacate...)"
              />
            </div>
            <div className="mt-3">
              <ChipGroup options={SEG_CROPS} value={f.crop} onChange={v => set('crop', v)} />
            </div>

            {/* TARJETA DINÁMICA DE RECOMENDACIÓN Y ASISTENCIA AGRONÓMICA */}
            {analysis ? (
              <div className="mt-4 rounded-2xl border border-sky/25 bg-gradient-to-br from-sky/10 via-mint/10 to-transparent p-5 shadow-sm transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky/15 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow">
                      <Icon n="sprout" s={20} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-ink">
                          {analysis.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">({analysis.category})</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Recomendaciones para <b className="text-slate-700">{selectedParcel.name}</b> · {selectedParcel.soil}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    analysis.isKnown
                      ? analysis.compatLevel === 'Alta' ? 'bg-mint/20 text-teal-800 border border-mint/40' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-sky-100 text-sky-800 border border-sky-300'
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {analysis.isKnown ? `Compatibilidad ${analysis.compatLevel} (${analysis.compatibility}%)` : 'Cultivo personalizado · Telemetría NASA'}
                  </span>
                </div>

                {/* Métricas agronómicas clave */}
                <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/85 p-3 border border-sky/10 shadow-2xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase">
                      <Icon n="calendar" s={13} /> Ciclo vegetativo
                    </div>
                    <div className="mt-1 font-display text-base font-black text-slate-900">
                      {analysis.cycleDays} días
                    </div>
                    <div className="text-[10px] text-slate-400">Desde siembra a cosecha</div>
                  </div>

                  <div className="rounded-xl bg-white/85 p-3 border border-sky/10 shadow-2xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase">
                      <Icon n="drop" s={13} /> Demanda hídrica
                    </div>
                    <div className="mt-1 font-display text-base font-black text-primary">
                      {analysis.waterLevel}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate" title={analysis.waterDemand}>{analysis.waterDemand}</div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 rounded-xl bg-white/85 p-3 border border-sky/10 shadow-2xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase">
                      <Icon n="sparkles" s={13} /> Etapa crítica de agua
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-800 leading-tight">
                      {analysis.criticalStage}
                    </div>
                  </div>
                </div>

                {/* Recomendación de riego y manejo */}
                <div className="mt-3 rounded-xl bg-white/95 p-3.5 border border-sky/15 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <Icon n="bulb" s={17} cls="text-amber-500 mt-0.5 shrink-0" />
                    <div className="text-xs leading-relaxed text-slate-700">
                      <b className="text-ink font-bold block mb-0.5">Manejo agronómico recomendado:</b>
                      {analysis.keyTip}
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-start gap-2.5 pt-2.5 border-t border-slate-100">
                    <Icon n="satellite" s={16} cls="text-primary mt-0.5 shrink-0" />
                    <div className="text-xs leading-relaxed text-slate-600 font-medium">
                      <b className="text-primary font-bold">Estado satelital: </b>
                      {analysis.irrigationAdvice}
                    </div>
                  </div>
                </div>

                {/* Alerta fitosanitaria / climática */}
                {analysis.alert && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-amber-50/80 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-200/70">
                    <Icon n="warn" s={15} cls="text-amber-600 mt-0.5 shrink-0" />
                    <span>{analysis.alert}</span>
                  </div>
                )}

                {!analysis.isKnown && (
                  <div className="mt-2.5 flex items-start gap-2 text-xs font-semibold text-sky-800 bg-sky-50/90 rounded-xl p-2.5 border border-sky-200">
                    <Icon n="globe" s={15} cls="shrink-0 text-sky mt-0.5" />
                    <span>
                      Detectamos un cultivo no habitual en el catálogo básico. Hemos generado las recomendaciones agronómicas y el balance hídrico satelital FAO-56 adaptadas a las condiciones de <b>{selectedParcel.name}</b> (Suelo {selectedParcel.soil}).
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-xs text-slate-500 font-medium">
                <Icon n="sprout" s={20} cls="mx-auto mb-1.5 text-slate-400" />
                Escribe o selecciona un cultivo para ver su ficha técnica, ciclo estimado y recomendaciones de riego satelital.
              </div>
            )}
          </L>

          <div className="grid gap-5 sm:grid-cols-2">
            <L t="Fecha de siembra" id="sg-sow" err={err.sow}>
              <input
                id="sg-sow"
                type="date"
                max={TODAY_ISO}
                className={`field !py-3.5 text-base font-bold ${err.sow ? '!border-rose-400' : ''}`}
                value={f.sow}
                onChange={e => set('sow', e.target.value)}
              />
            </L>
            <L t="Último riego" id="sg-water" err={err.water}>
              <input
                id="sg-water"
                type="date"
                max={TODAY_ISO}
                className={`field !py-3.5 text-base font-bold ${err.water ? '!border-rose-400' : ''}`}
                value={f.lastWater}
                onChange={e => set('lastWater', e.target.value)}
              />
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[['Hoy', 0], ['Ayer', 1], ['Hace 3 días', 3]].map(([l, n]) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => set('lastWater', shiftISO(-n))}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all duration-300 ${
                      f.lastWater === shiftISO(-n)
                        ? 'border-primary bg-primary text-white shadow-md shadow-primary/25'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky hover:text-primary'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </L>
          </div>
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Fundamento del cálculo</h2>
          <ol className="flex flex-col gap-4">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-3.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky/20 to-mint/20 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div>
                  <b className="block text-base font-bold text-ink">{t}</b>
                  <span className="text-sm leading-relaxed text-slate-600 font-medium">{d}</span>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-sky/10 p-3.5 text-sm text-primary font-medium">
            <Icon n="globe" s={18} cls="mt-0.5 shrink-0" />
            Cualquier cultivo que registres contará con seguimiento hídrico continuo mediante satélites NASA POWER y SMAP.
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3.5">
        <Btn variant="ghost" onClick={onCancel} className="!text-base font-bold !px-6 !py-3">
          Cancelar
        </Btn>
        <Btn type="submit" className="!text-base font-bold !px-7 !py-3">
          <Icon n="check" s={18} />
          Guardar y calcular balance
        </Btn>
      </div>
    </form>
  );
}
