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
  const items = ['Pronóstico de lluvia obtenido', 'Analizando cultivo y último riego con IA', 'Preparando tu recomendación'];
  const pct = [18, 45, 78][step];
  return (
    <div className="fade-in">
      <PageTitle crumbs={`Seguimiento / ${seg.crop} · ${parcel.name}`} title="Analizando tu cultivo" sub="Estamos consultando el clima y generando tu recomendación de riego." />
      <div className="grid place-items-center py-10 md:py-16">
        <div className="card w-full max-w-md p-8" role="status" aria-live="polite">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center"><span className="relative grid h-16 w-16 place-items-center rounded-full bg-sky/15 text-primary"><span className="absolute inset-0 animate-ping rounded-full bg-sky/25" /><Icon n="sparkles" s={26} cls="relative" /></span></div>
          <h2 className="text-center font-display text-lg font-semibold">Consultando el clima y analizando con IA</h2>
          <p className="mt-1.5 text-center text-xs text-slate-500">Esto toma solo unos segundos. Puedes quedarte en esta pantalla.</p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-primary to-sky transition-all duration-700" style={{ width: `${pct}%` }} /></div>
          <ul className="mt-5 flex flex-col gap-3.5">{items.map((t, i) => {
            const state = i < step ? 'done' : i === step ? 'run' : 'wait';
            return <li key={t} className="flex items-center gap-3 text-sm">
              {state === 'done' ? <span className="grid h-6 w-6 place-items-center rounded-full bg-mint text-white"><Icon n="check" s={13} sw={3} /></span>
                : state === 'run' ? <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-primary"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" /></span>
                : <span className="h-6 w-6 rounded-full border-2 border-slate-200" />}
              <span className={`flex-1 ${state === 'wait' ? 'text-slate-400' : 'font-medium'}`}>{t}</span>
              <span className={`text-xs font-semibold ${state === 'done' ? 'text-teal-600' : state === 'run' ? 'text-primary' : 'text-slate-400'}`}>{state === 'done' ? 'Listo' : state === 'run' ? 'En curso…' : 'Pendiente'}</span>
            </li>;
          })}</ul>
        </div>
      </div>
    </div>
  );
}
