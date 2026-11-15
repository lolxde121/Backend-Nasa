import { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/Icon';
import { PageTitle } from '../components/ui';
import { Seguimiento } from './Seguimiento';

export function Analyzing({ seg, parcel, onDone }) {
  const [step, setStep] = useState(0);
  const cb = useRef(onDone); cb.current = onDone;
  useEffect(() => {
    const t = [setTimeout(() => setStep(1), 600), setTimeout(() => setStep(2), 1300), setTimeout(() => cb.current(), 2000)];
    return () => t.forEach(clearTimeout);
  }, []);
  const items = [
    'Consultando precipitación y temperatura en NASA POWER',
    'Evaluando humedad del suelo con sensor NASA SMAP',
    'Calculando balance hídrico y recomendación de riego'
  ];
  const pct = [25, 60, 90][step];
  return (
    <div className="fade-in">
      <PageTitle crumbs={`Seguimiento / ${seg.crop} · ${parcel.name}`} title="Evaluando balance del cultivo" sub="Consultando telemetría satelital en tiempo real para determinar el riego." />
      <div className="grid place-items-center py-10 md:py-16">
        <div className="card w-full max-w-lg p-8 shadow-xl" role="status" aria-live="polite">
          <div className="mx-auto mb-5 grid h-18 w-18 place-items-center">
            <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-sky/15 text-primary">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-sky/25" />
              <Icon n="satellite" s={30} cls="relative" />
            </span>
          </div>
          <h2 className="text-center font-display text-2xl font-bold text-ink">Consultando telemetría satelital NASA</h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">Procesando balance hídrico y precipitación para tu predio...</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-sky transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-6 flex flex-col gap-4">
            {items.map((t, i) => {
              const state = i < step ? 'done' : i === step ? 'run' : 'wait';
              return (
                <li key={t} className="flex items-center gap-3.5 text-base">
                  {state === 'done' ? (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-mint text-white shrink-0">
                      <Icon n="check" s={15} sw={3} />
                    </span>
                  ) : state === 'run' ? (
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-primary shrink-0">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                    </span>
                  ) : (
                    <span className="h-7 w-7 rounded-full border-2 border-slate-200 shrink-0" />
                  )}
                  <span className={`flex-1 ${state === 'wait' ? 'text-slate-400' : 'font-semibold text-slate-800'}`}>
                    {t}
                  </span>
                  <span className={`text-sm font-bold ${state === 'done' ? 'text-teal-600' : state === 'run' ? 'text-primary' : 'text-slate-400'}`}>
                    {state === 'done' ? 'Listo' : state === 'run' ? 'En curso…' : 'Pendiente'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
