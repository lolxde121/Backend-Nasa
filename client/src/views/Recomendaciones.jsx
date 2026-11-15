import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Btn, PageTitle, ParcelSelect } from '../components/ui';
import { LVL, REC_CROPS } from '../data/recomendaciones';
import { fmt } from '../lib/utils';

export function Recs({ parcels, pid, setPid, go }) {
  const [f, setF] = useState('all');
  const p = parcels.find(x => x.id === pid) || parcels[0];
  const list = REC_CROPS.filter(c => f === 'all' || (f === 'alta' && c.lvl === 'Alta') || (f === 'agua' && c.agua !== 'Alta') || (f === 'corto' && typeof c.ciclo === 'number' && c.ciclo <= 100));
  const info = [['Ubicación', p.loc], ['Tipo de tierra', p.soil], ['Temperatura', `${fmt(p.temp, 0)} °C`], ['Humedad', `${fmt(p.hum, 0)} %`], ['Último cultivo', p.crop]];
  const elegir = (c) => go('segform', `${p.id}|${c.n === 'Tomate' ? 'Jitomate' : c.n}`);
  return (
    <div className="fade-in">
      <PageTitle title="Recomendaciones" sub="Elige el cultivo ideal para tu terreno con datos agroclimáticos de la NASA" right={<ParcelSelect parcels={parcels} value={p.id} onChange={setPid} />} />
      <div className="card mb-4 grid grid-cols-2 gap-x-6 gap-y-4 p-5 md:grid-cols-5">
        {info.map(([l, v]) => <div key={l}><div className="text-xs text-slate-500">{l}</div><div className="mt-0.5 text-sm font-bold">{v}</div></div>)}
      </div>
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-mint/30 bg-gradient-to-r from-mint/15 to-sky/10 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-white"><Icon n="bulb" s={18} /></span>
        <div><b className="block text-sm">Asistencia</b><span className="text-sm text-slate-700">{p.crop === 'Maíz' ? 'Tu último cultivo fue maíz, que consume mucho nitrógeno. Una leguminosa como el frijol ayuda a recuperar el suelo antes de volver a sembrar maíz.' : `Tu último cultivo fue ${p.crop.toLowerCase()}. Rotar con una leguminosa como el frijol ayuda a recuperar el nitrógeno del suelo y reduce plagas.`}</span></div>
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[['all', 'Todos'], ['alta', 'Compatibilidad alta'], ['agua', 'Poca agua'], ['corto', 'Ciclo corto']].map(([k, l]) => <button key={k} onClick={() => setF(k)}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${f === k ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-white bg-white/80 text-slate-600 hover:border-sky hover:text-primary'}`}>{l}</button>)}
        <span className="ml-auto text-xs font-semibold text-slate-500">{list.length} {list.length === 1 ? 'cultivo recomendado' : 'cultivos recomendados'}</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c, i) => <div key={c.n} style={{ animationDelay: `${i * 50}ms` }} className="card fade-in flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(11,61,145,.35)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky/10 font-display text-base font-bold text-primary">{c.n[0]}</span>
            <div className="flex-1"><div className="font-display text-base font-semibold">{c.n}</div><div className="text-xs text-slate-500">{c.f}</div></div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${LVL[c.lvl].badge}`}>{c.lvl}</span>
          </div>
          <div className="mt-4 flex justify-between text-xs"><span className="text-slate-500">Compatibilidad</span><b style={{ fontVariantNumeric: 'tabular-nums' }}>{c.c} %</b></div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.c}%`, background: LVL[c.lvl].bar }} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2">{[['Agua', c.agua], ['Ciclo', typeof c.ciclo === 'number' ? `${c.ciclo} días` : c.ciclo], ['Siembra', c.siembra]].map(([l, v]) => <div key={l} className="rounded-xl bg-slate-100/70 px-2.5 py-2"><div className="text-[10px] text-slate-500">{l}</div><div className="text-xs font-bold">{v}</div></div>)}</div>
          <p className="mt-4 flex-1 text-xs leading-relaxed text-slate-600">{c.desc}</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5"><Btn variant="soft" onClick={() => go('recdetail', c.n)}>Ver detalle</Btn><Btn onClick={() => elegir(c)}>Elegir</Btn></div>
        </div>)}
      </div>
    </div>
  );
}

export function RecDetail({ crop, parcel, go }) {
  const c = REC_CROPS.find(x => x.n === crop) || REC_CROPS[0];
  const L2 = LVL[c.lvl];
  const ficha = [['Agua', c.agua], ['Ciclo', typeof c.ciclo === 'number' ? `${c.ciclo} días` : c.ciclo], ['Siembra', c.siembra], ['Suelo ideal', c.suelo], ['Temperatura ideal', c.temp]];
  return (
    <div className="fade-in">
      <div className="mb-3 text-xs font-medium text-slate-500"><button onClick={() => go('recs')} className="font-semibold text-primary hover:underline">Recomendaciones</button> / {c.n}</div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{c.n}</h1><p className="mt-1 text-sm text-slate-500">{c.f} · Para {parcel.name}</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${L2.badge}`}>Compatibilidad {c.lvl.toLowerCase()}</span>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_minmax(280px,400px)]">
        <div className="card p-6">
          <h2 className="mb-4 font-display text-base font-semibold">Por qué esta recomendación</h2>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Compatibilidad con tu terreno</span><b style={{ fontVariantNumeric: 'tabular-nums' }}>{c.c} %</b></div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.c}%`, background: L2.bar }} /></div>
          <ul className="mt-5 flex flex-col gap-4">{c.why.map(([t, x], i) => <li key={i} className="flex items-center gap-3 text-sm">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${t === 'ok' ? 'bg-mint/15 text-teal-700' : 'bg-amber-100 text-amber-600'}`}><Icon n={t === 'ok' ? 'check' : 'warn'} s={14} sw={t === 'ok' ? 3 : 2.5} /></span>{x}</li>)}</ul>
        </div>
        <div className="card p-6">
          <h2 className="mb-2 font-display text-base font-semibold">Ficha del cultivo</h2>
          <dl>{ficha.map(([l, v], i) => <div key={l} className={`py-3 ${i ? 'border-t border-slate-100' : ''}`}><dt className="text-xs text-slate-500">{l}</dt><dd className="text-sm font-bold">{v}</dd></div>)}</dl>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><Btn variant="soft" onClick={() => go('recs')}>Volver a recomendaciones</Btn><Btn onClick={() => go('segform', `${parcel.id}|${c.n === 'Tomate' ? 'Jitomate' : c.n}`)}>Elegir este cultivo</Btn></div>
    </div>
  );
}
