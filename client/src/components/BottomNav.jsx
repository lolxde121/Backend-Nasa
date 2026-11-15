import { Icon } from './Icon';
import { NAV } from '../data/nav';

export function BottomNav({ active, go }) {
  return <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-white/70 bg-white/85 px-2 py-1.5 backdrop-blur-xl md:hidden">
    {NAV.map(it => <button key={it.k} onClick={() => go(it.k)} aria-label={it.l} className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold ${active === it.k ? 'text-primary' : 'text-slate-500'}`}><Icon n={it.i} s={20} />{it.s}</button>)}
  </nav>;
}
