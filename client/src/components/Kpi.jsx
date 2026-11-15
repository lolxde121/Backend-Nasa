import { Icon } from './Icon';
import { Sparkline } from './charts';
import { fmt } from '../lib/utils';

export function Kpi({ icon, label, value, unit, delta, good, spark, color, active, onClick, foot }) {
  return <button onClick={onClick} className="card group relative overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={active ? { boxShadow: `0 0 0 2px ${color}, 0 14px 30px -18px ${color}` } : {}}>
    <div className="mb-2 flex items-center justify-between">
      <span className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: color + '1F', color }}><Icon n={icon} s={15} /></span>{label}</span>
      {delta != null && <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${good ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><Icon n={delta >= 0 ? 'up' : 'down'} s={11} sw={3} />{fmt(Math.abs(delta), unit === '' ? 2 : 1)}</span>}
    </div>
    <div className="font-display text-3xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}<span className="ml-1 text-sm font-medium text-slate-500">{unit}</span></div>
    <div className="mb-1 text-[11px] text-slate-500">{foot}</div>
    {spark && <Sparkline values={spark} color={color} />}
  </button>;
}
