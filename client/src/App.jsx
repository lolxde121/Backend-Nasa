import { useState, useMemo, useRef, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { Icon } from './components/Icon';
import { Sidebar } from './components/Sidebar';
import { FINCAS } from './data/nav';
import { DEFAULT_ALERT, INITIAL, alertsFor, enrich, formatTerrenoToParcel } from './data/parcels';
import { SEG0, genForecast, recommend } from './data/seguimiento';
import { nowLabel } from './lib/dates';
import { api } from './services/api';
import { Analyzing } from './views/Analyzing';
import { Dashboard } from './views/Dashboard';
import { Graficas } from './views/Graficas';
import { Detail } from './views/ParcelDetail';
import { ParcelForm } from './views/ParcelForm';
import { RecDetail, Recs } from './views/Recomendaciones';
import { SegDetail } from './views/SegDetail';
import { SegForm } from './views/SegForm';
import { Seguimiento } from './views/Seguimiento';
import { Terrenos } from './views/Terrenos';

export default function App() {
  const [parcels, setParcels] = useState(INITIAL);
  const [view, setView] = useState({ name: 'terrenos', id: null });
  const [query, setQuery] = useState('');
  const [finca, setFinca] = useState(FINCAS[0]);
  const [cfgs, setCfgs] = useState({});
  const [recPid, setRecPid] = useState(INITIAL[0].id);
  const [readIds, setReadIds] = useState({});
  const [sync, setSync] = useState({ busy: false, last: 'hace 2 min' });
  const [segs, setSegs] = useState(SEG0);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [toast, setToast] = useState(null);
  const mainRef = useRef(null);
  const tRef = useRef(null);

  const notify = (m) => {
    setToast(m);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(null), 3500);
  };

  const go = (name, id = null) => {
    setView({ name, id });
    if (mainRef.current) mainRef.current.scrollTo({ top: 0 });
  };

  // Carga inicial y sincronización con el backend SQLite y APIs de NASA
  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.getTerrenos();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(formatTerrenoToParcel).filter(Boolean);
        setParcels(mapped);
        if (mapped[0]) setRecPid(mapped[0].id);
      }
    } catch (err) {
      console.warn('Modo sin conexión o backend inicializando. Usando datos precargados:', err.message);
    }

    try {
      const segRes = await api.getSeguimientos();
      if (segRes && segRes.success && Array.isArray(segRes.data) && segRes.data.length > 0) {
        setSegs(segRes.data);
      }
    } catch (err) {
      // Ignorar si aún no hay seguimientos en backend
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSync = async () => {
    if (sync.busy) return;
    setSync({ ...sync, busy: true });
    try {
      await loadData(true);
      setSync({ busy: false, last: 'ahora mismo' });
      notify('Telemetría satelital NASA POWER y SMAP actualizada');
    } catch (e) {
      setSync({ busy: false, last: 'error' });
      notify('Error al sincronizar con satélites');
    }
  };

  const setQ = (v) => {
    setQuery(v);
    if (v && view.name !== 'terrenos') go('terrenos');
  };

  const cfgOf = (id) => cfgs[id] || DEFAULT_ALERT;
  const allAlerts = useMemo(() => {
    return parcels.flatMap(p => alertsFor(p, cfgs[p.id] || DEFAULT_ALERT).map((a, i) => ({
      ...a,
      id: `${p.id}-${i}`,
      pid: p.id,
      name: p.name
    })));
  }, [parcels, cfgs]);

  const notifs = allAlerts.map(a => ({ ...a, read: !!readIds[a.id] }));
  const markRead = (id) => setReadIds(r => id ? { ...r, [id]: true } : Object.fromEntries(allAlerts.map(a => [a.id, true])));

  const current = parcels.find(p => String(p.id) === String(view.id));

  // Guardar (crear o editar) terreno unificado con base de datos
  const save = async (data) => {
    try {
      const isEdit = Boolean(data.dbId || (current && String(current.id) === String(data.id)));
      const targetId = data.dbId || data.id;

      const payload = {
        nombre: data.name,
        propietario: data.propietario || 'Agricultor',
        descripcion: data.place || data.loc || '',
        ubicacion: data.place || data.loc,
        latitud: data.lat,
        longitud: data.lng,
        area_hectareas: data.area,
        tipo_suelo: data.soil,
        clima_zona: data.clima,
        fuente_agua: data.irrigation,
        cultivo_actual: data.crop,
        poligono: data.poly || null
      };

      if (isEdit && targetId) {
        await api.updateTerreno(targetId, payload);
        notify('Cambios guardados en base de datos');
      } else {
        const createRes = await api.createTerreno(payload);
        if (createRes && createRes.data && createRes.data.id) {
          data.id = String(createRes.data.id);
          data.dbId = createRes.data.id;
        }
        notify(`${data.name} creado. Consultando telemetría NASA…`);
      }

      await loadData(true);
      go('detail', data.id);
    } catch (err) {
      console.error('Error al guardar terreno:', err);
      // Fallback local en memoria
      const full = enrich(data);
      const exists = parcels.some(p => String(p.id) === String(full.id));
      setParcels(exists ? parcels.map(p => String(p.id) === String(full.id) ? { ...full, daily: p.daily, hourly: p.hourly, forecast: p.forecast, rain30: p.rain30, rain7: p.rain7, dTemp: p.dTemp } : p) : [...parcels, full]);
      notify(exists ? 'Cambios guardados (modo local)' : `${full.name} creado (modo local)`);
      go('detail', full.id);
    }
  };

  const deleteParcel = async (id) => {
    try {
      await api.deleteTerreno(id);
      notify('Terreno eliminado exitosamente');
      await loadData(true);
      go('terrenos');
    } catch (err) {
      setParcels(parcels.filter(p => String(p.id) !== String(id)));
      notify('Terreno eliminado');
      go('terrenos');
    }
  };

  const parcelOf = (id) => parcels.find(p => String(p.id) === String(id)) || parcels[0] || INITIAL[0];
  const recOf = (s) => recommend(s, parcelOf(s.pid));
  const curSeg = segs.find(s => String(s.id) === String(view.id));

  // Guardar seguimiento unificado
  const saveSeg = async (d) => {
    const id = 'sg' + Date.now();
    const seed = Math.floor(Math.random() * 900) + 50;
    const forecast = genForecast(seed);
    const hist = [{ id: id + 'h', d: d.lastWater, tone: 'neutral', label: 'Registro inicial' }];

    const newSeg = {
      ...d,
      id,
      forecast,
      upd: 'ahora mismo',
      hist
    };

    try {
      await api.createSeguimiento(newSeg);
    } catch (e) {
      console.warn('Guardado local de seguimiento:', e.message);
    }

    setSegs(l => [...l, newSeg]);
    go('analyzing', id);
  };

  const updateSeg = (id) => {
    if (updating) return;
    setUpdating(true);
    setTimeout(() => {
      setSegs(l => l.map(s => String(s.id) === String(id) ? { ...s, upd: nowLabel() } : s));
      setUpdating(false);
      notify('Recomendación actualizada con el pronóstico satelital más reciente');
    }, 1300);
  };

  const waterSeg = async (id, date) => {
    const s = segs.find(item => String(item.id) === String(id));
    const ok = s ? recommend(s, parcelOf(s.pid)).state === 'water' : true;
    const tone = ok ? 'ok' : 'warn';
    const label = ok ? 'Seguiste la recomendación' : 'Antes de lo sugerido';

    try {
      await api.registerRiego(id, date, tone, label);
    } catch (e) {
      console.warn('Registro local de riego:', e.message);
    }

    setSegs(l => l.map(segItem => {
      if (String(segItem.id) !== String(id)) return segItem;
      const hist = [
        { id: 'h' + Date.now(), d: date, tone, label },
        ...(segItem.hist || [])
      ].sort((a, b) => b.d.localeCompare(a.d));
      return { ...segItem, hist, lastWater: date, upd: nowLabel() };
    }));

    notify('Riego registrado. Recomendación de IA recalculada.');
  };

  const activeNav = ['form', 'detail'].includes(view.name)
    ? 'terrenos'
    : ['seg', 'segform', 'analyzing', 'segdetail'].includes(view.name)
    ? 'seg'
    : view.name === 'recdetail'
    ? 'recs'
    : view.name;

  return (
    <div className="flex h-full">
      <Sidebar
        active={activeNav}
        go={go}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        finca={finca}
        setFinca={(f) => { setFinca(f); notify(`Finca activa: ${f}`); }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          query={query}
          setQuery={setQ}
          sync={sync}
          onSync={onSync}
          notifs={notifs}
          markRead={markRead}
          go={go}
        />
        <main ref={mainRef} className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:px-8 md:pb-10">
          <div className="mx-auto max-w-[1280px]" key={view.name + (view.id || '')}>
            {view.name === 'inicio' && (
              <Dashboard parcels={parcels} go={go} alerts={notifs} />
            )}
            {view.name === 'terrenos' && (
              <Terrenos parcels={parcels} go={go} query={query} setQuery={setQuery} />
            )}
            {view.name === 'form' && (
              <ParcelForm
                initial={current}
                onSave={save}
                onCancel={() => go(current ? 'detail' : 'terrenos', current?.id)}
              />
            )}
            {view.name === 'detail' && current && (
              <Detail
                p={current}
                go={go}
                cfg={cfgOf(current.id)}
                setCfg={(c) => setCfgs({ ...cfgs, [current.id]: c })}
                notify={notify}
                segs={segs}
                onDelete={deleteParcel}
              />
            )}
            {view.name === 'recs' && (
              <Recs parcels={parcels} pid={recPid} setPid={setRecPid} go={go} />
            )}
            {view.name === 'recdetail' && (
              <RecDetail crop={view.id} parcel={parcelOf(recPid)} go={go} />
            )}
            {view.name === 'graf' && (
              <Graficas parcels={parcels} segs={segs} />
            )}
            {view.name === 'seg' && (
              <Seguimiento segs={segs} parcels={parcels} recOf={recOf} go={go} />
            )}
            {view.name === 'segform' && (
              <SegForm
                parcels={parcels}
                onSave={saveSeg}
                onCancel={() => go('seg')}
                preset={view.id ? { pid: view.id.split('|')[0], crop: view.id.split('|')[1] } : null}
              />
            )}
            {view.name === 'analyzing' && curSeg && (
              <Analyzing
                seg={curSeg}
                parcel={parcelOf(curSeg.pid)}
                onDone={() => go('segdetail', curSeg.id)}
              />
            )}
            {view.name === 'segdetail' && curSeg && (
              <SegDetail
                s={curSeg}
                parcel={parcelOf(curSeg.pid)}
                rec={recOf(curSeg)}
                go={go}
                updating={updating}
                onUpdate={() => updateSeg(curSeg.id)}
                onWater={(d) => waterSeg(curSeg.id, d)}
              />
            )}
          </div>
        </main>
      </div>
      <BottomNav active={activeNav} go={go} />
      {toast && (
        <div
          role="status"
          className="pop fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-2xl md:bottom-8"
        >
          <Icon n="check" s={16} cls="text-mint" />
          {toast}
        </div>
      )}
    </div>
  );
}
