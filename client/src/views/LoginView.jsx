import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { Btn, L } from '../components/ui';
import { api } from '../services/api';

export function LoginView({ onLoginSuccess, onContinueAsGuest }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [fincaNombre, setFincaNombre] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      if (res && res.token && res.user) {
        onLoginSuccess(res.user, res.token);
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim() || !email.trim() || !password) {
      setError('Por favor completa los campos obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(nombre.trim(), email.trim(), password, fincaNombre.trim() || 'Finca Principal');
      if (res && res.token && res.user) {
        onLoginSuccess(res.user, res.token);
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err) {
      setError(err.message || 'Error al registrar tu cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-sky/5 to-mint/10">
      <div className="w-full max-w-md">
        {/* Encabezado con Logo y Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl border border-white mb-4">
            <Logo size={48} />
          </div>
          <h1 className="font-display text-3xl font-black text-ink tracking-tight">
            Lum <span className="text-primary text-xl font-bold">AgroMonitor</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">
            Plataforma de Asistencia Agrícola con Telemetría NASA
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky/15 px-3 py-1 text-xs font-bold text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Satélites NASA POWER, SMAP y MODIS en vivo
          </div>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="card p-7 shadow-2xl border border-white/80 bg-white/95 backdrop-blur-xl">
          {/* Pestañas Iniciar Sesión / Registro */}
          <div className="flex rounded-xl bg-slate-100/90 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-semibold text-rose-700 flex items-start gap-2.5">
              <Icon n="warn" s={16} cls="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <L t="Correo electrónico" id="login-email">
                <div className="relative">
                  <Icon n="user" s={18} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ej. cristopher@agromonitor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field !pl-10 !py-3 text-base font-medium"
                  />
                </div>
              </L>

              <L t="Contraseña" id="login-password">
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field !pr-10 !py-3 text-base font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-primary"
                  >
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </L>

              <Btn type="submit" className="w-full !py-3.5 mt-2 !text-base font-bold shadow-lg shadow-primary/25">
                {loading ? <Icon n="refresh" s={18} cls="spin" /> : <Icon n="check" s={18} />}
                {loading ? 'Iniciando sesión…' : 'Ingresar a la plataforma'}
              </Btn>

              {/* Botones de demostración rápida */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center mb-2.5">
                  Acceso rápido de prueba
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('cristopher@agromonitor.com', 'password123')}
                    className="w-full flex items-center justify-between rounded-xl bg-slate-50 hover:bg-sky/10 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors border border-slate-200/80"
                  >
                    <span>👤 Cristopher Méndez (Admin)</span>
                    <span className="text-primary font-bold">Auto-llenar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('demo@agromonitor.com', 'demo123')}
                    className="w-full flex items-center justify-between rounded-xl bg-slate-50 hover:bg-sky/10 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors border border-slate-200/80"
                  >
                    <span>🌾 Agricultor Demo</span>
                    <span className="text-primary font-bold">Auto-llenar</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <L t="Nombre completo" id="reg-nombre">
                <input
                  id="reg-nombre"
                  type="text"
                  required
                  placeholder="ej. Juan Carlos López"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="field !py-3 text-base font-medium"
                />
              </L>

              <L t="Correo electrónico" id="reg-email">
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="ej. juan@agromonitor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field !py-3 text-base font-medium"
                />
              </L>

              <L t="Contraseña (mínimo 6 caracteres)" id="reg-password">
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field !pr-10 !py-3 text-base font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-primary"
                  >
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </L>

              <L t="Nombre de tu finca o predio (opcional)" id="reg-finca">
                <input
                  id="reg-finca"
                  type="text"
                  placeholder="ej. Finca Santa María"
                  value={fincaNombre}
                  onChange={(e) => setFincaNombre(e.target.value)}
                  className="field !py-3 text-base font-medium"
                />
              </L>

              <Btn type="submit" className="w-full !py-3.5 mt-2 !text-base font-bold shadow-lg shadow-primary/25">
                {loading ? <Icon n="refresh" s={18} cls="spin" /> : <Icon n="plus" s={18} />}
                {loading ? 'Creando cuenta…' : 'Registrar mi cuenta'}
              </Btn>
            </form>
          )}

          {onContinueAsGuest && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs font-bold text-slate-400 hover:text-primary transition-colors"
              >
                Explorar como invitado temporal →
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Telemetría satelital en tiempo real · Cálculos agronómicos FAO-56
        </p>
      </div>
    </div>
  );
}
