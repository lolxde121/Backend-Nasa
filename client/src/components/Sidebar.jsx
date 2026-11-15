import { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { FINCAS, NAV } from '../data/nav';

export function Sidebar({ active, go, finca, setFinca, collapsed, setCollapsed }) {
  const [open, setOpen] = useState(false);
  const tip = (t) => collapsed ? <span role="tooltip" className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">{t}</span> : null;
  return (
    <aside className={`relative z-30 hidden shrink-0 flex-col border-r border-white/70 bg-white/60 p-3 backdrop-blur-xl transition-[width] duration-300 ease-out md:flex ${collapsed ? 'w-[76px]' : 'w-64'}`}>
      <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'} aria-expanded={!collapsed}
        className="absolute -right-3.5 top-7 z-40 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-all duration-300 hover:scale-110 hover:text-primary">
        <Icon n={collapsed ? 'right' : 'left'} s={15} />
      </button>
      <div className={`mb-6 flex h-11 items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-1'}`}>
        <Logo size={34} />{!collapsed && <span className="font-display text-xl font-bold tracking-tight text-primary">Lum</span>}
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(it => {
          const on = active === it.k;
          return <button key={it.k} onClick={() => go(it.k)} aria-label={it.l} aria-current={on ? 'page' : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${collapsed ? 'justify-center' : ''} ${on ? 'bg-gradient-to-r from-primary to-[#1B5BC4] text-white shadow-md shadow-primary/25' : 'text-slate-600 hover:bg-sky/10 hover:text-primary'}`}>
            <Icon n={it.i} s={19} cls="transition-transform duration-300 group-hover:scale-110" />{!collapsed && <span className="whitespace-nowrap">{it.l}</span>}{tip(it.l)}
          </button>;
        })}
      </nav>
      <div className="relative">
        {open && <div className={`pop absolute z-50 w-60 rounded-2xl border border-white bg-white p-1.5 shadow-xl ${collapsed ? 'bottom-0 left-full ml-3' : 'bottom-full left-0 mb-2'}`}>
          {FINCAS.map(f => <button key={f} onClick={() => { setFinca(f); setOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-sky/10">{f}{f === finca && <Icon n="check" s={15} cls="text-mint" />}</button>)}
        </div>}
        <button onClick={() => setOpen(!open)} aria-label="Mi cuenta" className={`group relative flex w-full items-center gap-3 rounded-2xl border border-white bg-white/80 p-2.5 text-left shadow-sm transition-all duration-300 hover:shadow-md ${collapsed ? 'justify-center' : ''}`}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mint to-sky text-white"><Icon n="user" s={17} /></div>
          {!collapsed && <><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{finca}</div><div className="text-xs text-slate-500">Mi cuenta · Agricultor</div></div><Icon n="down" s={15} cls="text-slate-400" /></>}
          {!open && tip('Mi cuenta')}
        </button>
      </div>
    </aside>
  );
}
