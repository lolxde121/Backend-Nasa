import { useState, useMemo, useEffect, useRef, useId } from 'react';
import { Icon } from './Icon';
import { METRICS } from '../data/parcels';
import { clamp, fmt } from '../lib/utils';

export function useWidth() {
  const ref = useRef(null); const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current); setW(ref.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export const smoothPath = (pts) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
};

export function Chart({ data, color, unit, bars, d = 1, height = 300 }) {
  const uid = useId().replace(/:/g, '');
  const [ref, w] = useWidth();
  const [hi, setHi] = useState(null);
  const m = { l: 46, r: 16, t: 16, b: 30 };
  const iw = Math.max(w - m.l - m.r, 10), ih = height - m.t - m.b, n = data.length;
  const vals = data.map(x => x.v);
  let min = bars ? 0 : Math.min(...vals), max = Math.max(...vals);
  if (bars) max = (max || 1) * 1.2; else { const pad = (max - min) * .18 || 1; min -= pad; max += pad; }
  const X = (i) => bars ? m.l + iw * (i + .5) / n : m.l + iw * (i / (n - 1));
  const Y = (v) => m.t + ih * (1 - (v - min) / (max - min));
  const ticks = Array.from({ length: 5 }, (_, i) => min + (max - min) * i / 4);
  const pts = data.map((x, i) => [X(i), Y(x.v)]);
  const line = smoothPath(pts);
  const step = Math.ceil(n / 6);
  const move = (e) => {
    const r = ref.current.getBoundingClientRect(), px = e.clientX - r.left;
    const i = bars ? Math.floor((px - m.l) / iw * n) : Math.round((px - m.l) / iw * (n - 1));
    setHi(clamp(i, 0, n - 1));
  };
  const sel = hi != null ? data[hi] : null;
  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {w > 0 && <svg width={w} height={height} onMouseMove={move} onMouseLeave={() => setHi(null)} onTouchMove={(e) => move(e.touches[0])} role="img" aria-label="Gráfica de tendencia">
        <defs>
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".38" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient>
        </defs>
        {ticks.map((t, i) => <g key={i}>
          <line x1={m.l} x2={w - m.r} y1={Y(t)} y2={Y(t)} stroke="#E3ECF5" strokeDasharray={i === 0 ? '0' : '3 5'} />
          <text x={m.l - 8} y={Y(t) + 4} textAnchor="end" fontSize="11" fill="#6B7E96" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(t, d === 2 ? 2 : max - min > 8 ? 0 : 1)}</text>
        </g>)}
        {data.map((x, i) => i % step === 0 && <text key={i} x={X(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="#6B7E96">{x.label}</text>)}
        {bars ? data.map((x, i) => {
          const bw = Math.max(iw / n * .62, 3), h = Math.max(Y(0) - Y(x.v), x.v > 0 ? 2 : 0);
          return <rect key={i} x={X(i) - bw / 2} y={Y(0) - h} width={bw} height={h} rx="3" fill={color} opacity={hi == null || hi === i ? 1 : .35} style={{ transition: 'opacity .2s' }} />;
        }) : <>
          <path d={`${line} L${X(n - 1)},${Y(min)} L${X(0)},${Y(min)} Z`} fill={`url(#g${uid})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={X(n - 1)} cy={Y(vals[n - 1])} r="4.5" fill={color} stroke="#fff" strokeWidth="2" />
        </>}
        {sel && !bars && <g>
          <line x1={X(hi)} x2={X(hi)} y1={m.t} y2={Y(min)} stroke={color} strokeOpacity=".4" strokeDasharray="4 4" />
          <circle cx={X(hi)} cy={Y(sel.v)} r="6" fill="#fff" stroke={color} strokeWidth="3" />
        </g>}
      </svg>}
      {sel && <div className="pointer-events-none absolute z-10 rounded-xl bg-ink/90 px-3 py-2 text-xs text-white shadow-xl backdrop-blur" style={{ left: clamp(X(hi), 60, Math.max(w - 60, 60)), top: 6, transform: 'translateX(-50%)' }}>
        <div className="text-[11px] text-sky-200">{sel.label}</div>
        <div className="mt-0.5 text-sm font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(sel.v, d)} {unit}</div>
      </div>}
    </div>
  );
}

export function Sparkline({ values, color }) {
  const uid = useId().replace(/:/g, '');
  const min = Math.min(...values), max = Math.max(...values), rg = max - min || 1;
  const pts = values.map((v, i) => [i / (values.length - 1) * 100, 30 - ((v - min) / rg) * 26 - 2]);
  const d = smoothPath(pts);
  return <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
    <defs><linearGradient id={`s${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".3" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    <path d={`${d} L100,32 L0,32 Z`} fill={`url(#s${uid})`} />
    <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
  </svg>;
}

export function MetricChart({ p, metric: mc, setMetric: sm }) {
  const [m0, setM0] = useState('temp');
  const metric = mc || m0, setMetric = sm || setM0;
  const [range, setRange] = useState('30d');
  const M = METRICS[metric];
  const eff = range;
  const data = useMemo(() => {
    const src = eff === '24h' ? p.hourly : eff === '7d' ? p.daily.slice(-7) : p.daily;
    return src.map(x => ({ label: x.label, v: x[metric] }));
  }, [p, metric, eff]);
  const vs = data.map(x => x.v), avg = vs.reduce((a, b) => a + b, 0) / vs.length;
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1" role="tablist">
          {Object.entries(METRICS).map(([k, v]) => <button key={k} role="tab" aria-selected={metric === k} onClick={() => setMetric(k)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${metric === k ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-ink'}`}>
            <Icon n={v.icon} s={14} />{v.label}</button>)}
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1">
          {['24h', '7d', '30d'].map(r => <button key={r} onClick={() => setRange(r)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${eff === r ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-ink'}`}>{r}</button>)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
        <div>
          <div className="text-xs font-medium text-slate-500">{M.label} · {eff === '24h' ? 'últimas 24 h' : eff === '7d' ? 'últimos 7 días' : 'últimos 30 días'}</div>
          <div className="font-display text-3xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(metric === 'rain' ? vs.reduce((a, b) => a + b, 0) : avg, M.d)}<span className="ml-1 text-base font-medium text-slate-500">{M.unit}{metric === 'rain' ? ' total' : ' prom.'}</span></div>
        </div>
        <div className="flex gap-5 text-xs text-slate-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span>Mín <b className="text-ink">{fmt(Math.min(...vs), M.d)}</b></span>
          <span>Máx <b className="text-ink">{fmt(Math.max(...vs), M.d)}</b></span>
        </div>
      </div>
      <div className="mt-3"><Chart key={metric + eff} data={data} color={M.color} unit={M.unit} bars={M.bars} d={M.d} /></div>
      <p className="mt-1 text-[11px] text-slate-400">Datos satelitales referenciales (resolución espacial). Fuente: NASA POWER · SMAP.</p>
    </div>
  );
}
