import { useState, useMemo } from 'react';
import { clamp, rng } from '../lib/utils';

export function MapView({ seed, pin, satellite, draft, onPick, slice, showPin = true, label }) {
  const [hov, setHov] = useState(false);
  const blocks = useMemo(() => {
    const r = rng(seed * 13 + 5);
    return Array.from({ length: 8 }, () => ({ x: r() * 520, y: r() * 300, w: 50 + r() * 90, h: 30 + r() * 60, g: r() > .45, c: Math.floor(r() * 6) }));
  }, [seed]);
  const SAT = ['#35553A', '#3E6340', '#4B6B3A', '#5A6E3D', '#6B6A42', '#2F4D3A'];
  const tw = label ? Math.min(label.length * 9.5 + 26, 300) : 0;
  const tx = pin ? clamp(pin.x - tw / 2, 6, 594 - tw) : 0, ty = pin ? Math.max(pin.y - 56, 6) : 0;
  return (
    <svg viewBox="0 0 600 360" preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'} className={`block h-full w-full ${onPick ? 'cursor-crosshair' : ''}`}
      onClick={onPick ? (e) => { const r = e.currentTarget.getBoundingClientRect(); onPick(((e.clientX - r.left) / r.width) * 600, ((e.clientY - r.top) / r.height) * 360); } : undefined}>
      <rect width="600" height="360" fill={satellite ? '#2F4A34' : '#E6EFF9'} />
      {blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={satellite ? 6 : 10} fill={satellite ? SAT[b.c] : b.g ? '#CDEBDD' : '#D4E3F5'} opacity={satellite ? .95 : 1} />)}
      {draft && draft.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="7" fill="#fff" stroke="#0B3D91" strokeWidth="3.5" />)}
      {showPin && pin && <g onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={label ? { cursor: 'pointer' } : undefined}>
        <circle className="pulse-ring" cx={pin.x} cy={pin.y} r="14" fill="#0B3D91" opacity=".35" />
        <circle cx={pin.x} cy={pin.y} r="8" fill="#fff" stroke="#0B3D91" strokeWidth="4" />
        <circle cx={pin.x} cy={pin.y} r="22" fill="transparent" />
        {label && <title>{label}</title>}
      </g>}
      {hov && label && showPin && pin && <g pointerEvents="none">
        <rect x={tx} y={ty} width={tw} height="36" rx="10" fill="#0F1F33" opacity=".94" />
        <text x={tx + tw / 2} y={ty + 24} textAnchor="middle" fontSize="18" fontWeight="600" fill="#fff" fontFamily="Plus Jakarta Sans, system-ui, sans-serif">{label}</text>
      </g>}
    </svg>
  );
}
