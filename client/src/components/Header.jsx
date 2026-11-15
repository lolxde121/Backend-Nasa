import { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './Logo';

export function Header({ query, setQuery, sync, onSync, notifs, markRead, go, currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unread = notifs.filter(n => !n.read).length;

  const initials = currentUser?.nombre
    ? currentUser.nombre.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AG';

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/70 bg-white/55 px-4 py-3 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <Logo size={28} />
        <span className="font-display text-lg font-bold text-primary">Lum</span>
      </div>

      <div className="relative max-w-md flex-1">
        <Icon n="search" s={16} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          aria-label="Buscar terrenos"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar terrenos, cultivos o ubicaciones"
          className="field !rounded-full !bg-white/90 !pl-10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <button
          onClick={onSync}
          className="hidden items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:shadow-md sm:flex"
          title="Sincronizar ahora"
        >
          {sync.busy ? (
            <Icon n="refresh" s={14} cls="spin text-sky" />
          ) : (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint" />
            </span>
          )}
          {sync.busy ? 'Sincronizando…' : `Sincronizado ${sync.last}`}
        </button>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Notificaciones"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-white bg-white/80 text-slate-600 shadow-sm transition-all hover:text-primary hover:shadow-md"
          >
            <Icon n="bell" s={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="pop absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-white bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <b className="text-sm">Notificaciones</b>
                  <button onClick={() => markRead()} className="text-xs font-semibold text-sky hover:underline">
                    Marcar leídas
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { markRead(n.id); setOpen(false); go('detail', n.pid); }}
                      className="flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-sky/5"
                    >
                      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${n.lvl === 'Alta' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                        <Icon n="warn" s={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm ${n.read ? 'font-medium text-slate-500' : 'font-bold'}`}>{n.t}</span>
                        <span className="block text-xs text-slate-500">{n.name} · {n.d}</span>
                      </span>
                    </button>
                  ))}
                  {!notifs.length && <p className="p-6 text-center text-sm text-slate-500">Sin alertas activas.</p>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar y Menú de Usuario */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title={currentUser?.nombre || 'Mi cuenta'}
            aria-label="Perfil de usuario"
            className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-sky text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {initials}
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
              <div className="pop absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-white bg-white p-2 shadow-2xl">
                <div className="p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1">
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {currentUser?.nombre || 'Usuario Conectado'}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {currentUser?.email || 'demo@agromonitor.com'}
                  </div>
                  {currentUser?.finca_nombre && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      <Icon n="pin" s={12} />
                      {currentUser.finca_nombre}
                    </div>
                  )}
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Icon n="x" s={16} />
                    Cerrar sesión
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
