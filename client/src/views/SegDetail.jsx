import { useState, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Btn, Chip, L } from '../components/ui';
import { HIST_TONE, REC_STYLE, getCropAnalysis, stageOf } from '../data/seguimiento';
import { TODAY_ISO, addDays, agoLabel, dLong, dayName, daysBetween, plural, shiftISO } from '../lib/dates';
import { Seguimiento } from './Seguimiento';

export function WaterModal({ seg, onSave, onClose }) {
  const [d, setD] = useState(TODAY_ISO);
  const bad = !d || d > TODAY_ISO || d < seg.sow;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Registrar riego" className="pop card w-full max-w-sm !bg-white p-6" onClick={e => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Registrar riego</h2>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
            <Icon n="x" s={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">Anota cuándo regaste {seg.crop.toLowerCase()} para afinar la próxima recomendación.</p>
        <L t="Fecha del riego" id="w-date" err={bad ? 'Elige una fecha entre la siembra y hoy.' : null}>
          <input id="w-date" type="date" min={seg.sow} max={TODAY_ISO} className="field" value={d} onChange={e => setD(e.target.value)} />
        </L>
        <div className="mt-3 flex gap-2">
          {[['Hoy', 0], ['Ayer', 1]].map(([l, n]) => (
            <button key={l} type="button" onClick={() => setD(shiftISO(-n))} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-sky hover:text-primary">
              {l}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={() => { if (!bad) onSave(d); }}>
            <Icon n="drop" s={16} />Guardar riego
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function SegDetail({ s, parcel, rec, go, onUpdate, updating, onWater }) {
  const [modal, setModal] = useState(false);
  const st = REC_STYLE[rec.state];
  const mx = Math.max(12, ...s.forecast.map(f => f[1]));
  const wIcon = (p) => p < 15 ? 'sun' : p < 45 ? 'cloud' : 'rain';

  const analysis = useMemo(() => {
    return getCropAnalysis(s.crop, parcel);
  }, [s.crop, parcel]);

  const rows = [
    ['Cultivo', <b>{s.crop}</b>],
    ['Categoría agronómica', <span className="font-medium text-slate-700">{analysis.category}</span>],
    ['Ciclo vegetativo', <b>{analysis.cycleDays} días</b>],
    ['Fecha de siembra', <b>{dLong(s.sow)}</b>],
    ['Tiempo desde la siembra', <b>{plural(daysBetween(s.sow, TODAY_ISO))}</b>],
    ['Etapa fenológica actual', <b className="text-primary">{stageOf(s)}</b>],
    ['Demanda de agua', <span className="font-bold text-sky">{analysis.waterDemand}</span>],
    ['Último riego', <b>{dLong(s.lastWater)} · {agoLabel(rec.ds).toLowerCase()}</b>],
    ['Terreno', <b>{parcel.name}</b>],
    ['Tipo de tierra', <Chip>{parcel.soil}</Chip>]
  ];

  const kp = [
    ['Próximo riego sugerido', rec.next],
    ['Lluvia esperada', rec.rain],
    ['Días sin regar', plural(rec.ds)]
  ];

  return (
    <div className="fade-in">
      <button onClick={() => go('seg')} className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-primary">
        <Icon n="back" s={14} />Seguimiento / {s.crop} · {parcel.name}
      </button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{s.crop}</h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              analysis.isKnown ? 'bg-mint/15 text-teal-800 border border-mint/30' : 'bg-sky-100 text-sky-800 border border-sky-300'
            }`}>
              {analysis.isKnown ? `Compatibilidad ${analysis.compatLevel}` : 'Cultivo personalizado'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {parcel.name} · {parcel.place || parcel.loc} · Actualizado {s.upd}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="ghost" onClick={onUpdate}>
            {updating ? <Icon n="refresh" s={16} cls="spin" /> : <Icon n="sparkles" s={16} />}
            {updating ? 'Actualizando…' : 'Actualizar recomendación'}
          </Btn>
          <Btn onClick={() => setModal(true)}>
            <Icon n="drop" s={16} />Registrar riego
          </Btn>
        </div>
      </div>

      {/* RECOMENDACIÓN PRINCIPAL DE RIEGO */}
      <section className="card mb-5 grid overflow-hidden md:grid-cols-[minmax(260px,340px)_1fr]" aria-label="Recomendación agronómica de riego">
        <div className={`relative flex flex-col justify-center gap-4 bg-gradient-to-br ${st.hero} p-7 text-white`}>
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white text-primary shadow-lg">
            <Icon n={st.icon} s={28} />
          </span>
          <div className="relative flex items-center gap-1.5 text-sm font-bold text-white/90">
            <Icon n="sprout" s={16} />Recomendación agronómica de riego
          </div>
          <h2 className="relative font-display text-2xl font-bold leading-tight md:text-3xl" style={{ textWrap: 'balance' }}>
            {rec.title}
          </h2>
          <span className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs md:text-sm font-bold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Certeza técnica: {rec.conf}
          </span>
        </div>
        <div className="flex flex-col justify-between gap-4 p-6">
          <div>
            <div className="mb-1.5 text-sm font-bold text-slate-700">Fundamento agronómico:</div>
            <p className="text-base leading-relaxed text-slate-800 font-medium">{rec.why}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {kp.map(([l, v]) => (
              <div key={l} className="rounded-xl bg-gradient-to-br from-sky/10 to-mint/5 p-4 border border-sky/15">
                <div className="text-xs font-bold text-slate-500">{l}</div>
                <div className="mt-1 text-base font-black text-slate-900" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs md:text-sm text-slate-500 font-medium pt-1 border-t border-slate-100">
            <Icon n="globe" s={15} cls="text-primary shrink-0" />
            Calculado con balance hídrico FAO-56, humedad SMAP y pronóstico satelital de lluvia.
          </p>
        </div>
      </section>

      {/* TARJETA DE RECOMENDACIONES ESPECÍFICAS DEL CULTIVO */}
      <section className="card mb-5 p-5 border-l-4 border-l-primary bg-gradient-to-r from-sky/10 via-mint/5 to-white">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-sm">
              <Icon n="bulb" s={20} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Ficha y Recomendaciones para {analysis.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pautas específicas de manejo hídrico y agronómico para la etapa de <b>{stageOf(s)}</b>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-white/90 border border-slate-200 rounded-full px-3 py-1">
            Momento crítico: {analysis.criticalStage}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white/90 p-4 border border-sky/15 shadow-2xs">
            <b className="block text-xs uppercase font-bold text-primary tracking-wider mb-1">
              Consejo de manejo agronómico:
            </b>
            <p className="text-sm leading-relaxed text-slate-700 font-medium">
              {analysis.keyTip}
            </p>
          </div>

          <div className="rounded-xl bg-white/90 p-4 border border-sky/15 shadow-2xs">
            <b className="block text-xs uppercase font-bold text-amber-700 tracking-wider mb-1">
              Alerta de vigilancia técnica:
            </b>
            <p className="text-sm leading-relaxed text-slate-700 font-medium">
              {analysis.alert}
            </p>
          </div>
        </div>

        {!analysis.isKnown && (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-sky-800 bg-sky-50 rounded-lg p-2.5 border border-sky-200">
            <Icon n="globe" s={15} cls="text-sky shrink-0" />
            <span>
              Cultivo personalizado registrado. Se calibraron automáticamente los parámetros de riego con la humedad SMAP y el clima satelital de tu terreno.
            </span>
          </div>
        )}
      </section>

      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_minmax(300px,380px)]">
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold">Pronóstico de lluvia · próximos 7 días</h2>
          <p className="mb-4 text-xs text-slate-500">Probabilidad y milímetros esperados en las coordenadas de tu terreno.</p>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {s.forecast.map(([p, mm], i) => (
              <div key={i} title={`${p} % de probabilidad · ${mm} mm`} className={`flex flex-col items-center rounded-2xl px-1 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 ${i === 0 ? 'bg-sky/20' : 'bg-slate-100/70 hover:bg-sky/10'}`}>
                <div className="text-xs font-bold capitalize">{dayName(i)}</div>
                <div className="mb-2 text-[10px] text-slate-500">{addDays(i).getDate()}{i === 0 ? ' · hoy' : ''}</div>
                <Icon n={wIcon(p)} s={20} cls={wIcon(p) === 'sun' ? 'text-amber-500' : 'text-primary'} />
                <div className="mt-2 text-xs font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{p} %</div>
                <div className="relative mt-2 flex h-28 w-5 items-end overflow-hidden rounded-full bg-white shadow-inner sm:w-7">
                  <div className="w-full rounded-full bg-gradient-to-t from-sky to-[#7CC1F0] transition-all duration-700" style={{ height: mm === 0 ? 0 : `${Math.max(mm / mx * 100, 8)}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-slate-500" style={{ fontVariantNumeric: 'tabular-nums' }}>{mm} mm</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-2 font-display text-base font-semibold">Datos del cultivo</h2>
          <dl>
            {rows.map(([l, v], i) => (
              <div key={l} className={`flex items-center justify-between gap-3 py-2.5 text-sm ${i ? 'border-t border-slate-100' : ''}`}>
                <dt className="text-slate-500">{l}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Historial de riego</h2>
          <Btn variant="ghost" onClick={() => setModal(true)}>
            <Icon n="drop" s={15} />Registrar riego
          </Btn>
        </div>
        <ul>
          {s.hist.map((h, i) => (
            <li key={h.id} className={`flex items-center gap-3 py-3.5 ${i ? 'border-t border-slate-100' : ''}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky/10 text-primary">
                <Icon n="drop" s={16} />
              </span>
              <div className="flex-1">
                <b className="block text-sm">Riego registrado</b>
                <span className="text-xs text-slate-500">{dLong(h.d)}</span>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${HIST_TONE[h.tone]}`}>
                {h.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {modal && <WaterModal seg={s} onClose={() => setModal(false)} onSave={(d) => { setModal(false); onWater(d); }} />}
    </div>
  );
}
