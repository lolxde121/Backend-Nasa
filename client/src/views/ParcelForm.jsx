import { useState } from 'react';
import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Btn, ChipGroup, L, PageTitle } from '../components/ui';
import { CROPS, PLACES, RIEGOS, SOILS } from '../data/parcels';
import { areaHa, clamp, fmt, llToPx, pxToLL } from '../lib/utils';
import { Terrenos } from './Terrenos';

export function ParcelForm({ initial, onSave, onCancel }) {
  const edit = !!initial;
  const startPlace = PLACES.find(x => x.n === initial?.place) || PLACES[0];
  const [f, setF] = useState(() => ({
    name: initial?.name || '', crop: initial?.crop || 'Maíz', soil: initial ? (SOILS.includes(initial.soil) ? initial.soil : 'Otro') : 'Franco-arcillosa', soilOther: initial && !SOILS.includes(initial.soil) ? initial.soil : '',
    irrigation: initial?.irrigation || 'Goteo', area: initial ? String(initial.area) : '', place: initial?.place || startPlace.n,
  }));
  const [center, setCenter] = useState(initial?.center || { lat: startPlace.lat, lng: startPlace.lng });
  const [pin, setPin] = useState(initial?.pin || { x: 300, y: 180 });
  const [latS, setLatS] = useState(String((initial?.lat ?? startPlace.lat).toFixed(4)));
  const [lngS, setLngS] = useState(String((initial?.lng ?? startPlace.lng).toFixed(4)));
  const [pts, setPts] = useState([]);
  const [mode, setMode] = useState('pin');
  const [sat, setSat] = useState(false);
  const [sug, setSug] = useState(false);
  const [err, setErr] = useState({});
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const place = PLACES.find(x => x.n === f.place) || PLACES[0];

  const pick = (x, y, geo) => {
    if (mode === 'pin') {
      if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
        setLatS(geo.lat.toFixed(4));
        setLngS(geo.lng.toFixed(4));
        setCenter({ lat: geo.lat, lng: geo.lng });
      } else {
        setPin({ x, y });
        const ll = pxToLL(center, x, y);
        setLatS(ll.lat.toFixed(4));
        setLngS(ll.lng.toFixed(4));
      }
    } else {
      if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
        const np = [...pts, { lat: geo.lat, lng: geo.lng, x: Math.round(x || 300), y: Math.round(y || 180) }];
        setPts(np);
        if (np.length >= 3) {
          const rad = Math.PI / 180;
          const lat0 = np[0].lat * rad;
          let s = 0;
          for (let i = 0; i < np.length; i++) {
            const a = np[i], b = np[(i + 1) % np.length];
            const ax = a.lng * rad * 6378137 * Math.cos(lat0);
            const ay = a.lat * rad * 6378137;
            const bx = b.lng * rad * 6378137 * Math.cos(lat0);
            const by = b.lat * rad * 6378137;
            s += ax * by - bx * ay;
          }
          const ha = Math.abs(s / 2) / 10000;
          set('area', (ha > 0.05 ? ha : areaHa(np)).toFixed(1));
        }
      } else {
        const np = [...pts, { x: Math.round(x), y: Math.round(y) }];
        setPts(np);
        if (np.length >= 3) set('area', areaHa(np).toFixed(1));
      }
    }
  };
  const choosePlace = (pl) => {
    set('place', pl.n);
    setCenter({ lat: pl.lat, lng: pl.lng });
    setPin({ x: 300, y: 180 });
    setPts([]);
    setLatS(pl.lat.toFixed(4));
    setLngS(pl.lng.toFixed(4));
    setSug(false);
  };
  const onLL = (la, ln) => {
    const a = parseFloat(la), b = parseFloat(ln);
    if (!isNaN(a) && !isNaN(b)) {
      setCenter({ lat: a, lng: b });
      const p = llToPx({ lat: a, lng: b }, a, b);
      setPin({ x: clamp(p.x, 20, 580), y: clamp(p.y, 20, 340) });
    }
  };
  const handleUseMyLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const la = parseFloat(pos.coords.latitude.toFixed(4));
          const ln = parseFloat(pos.coords.longitude.toFixed(4));
          setLatS(String(la));
          setLngS(String(ln));
          setCenter({ lat: la, lng: ln });
          setPin({ x: 300, y: 180 });
        },
        () => {
          setPin({ x: 300, y: 180 });
          setLatS(center.lat.toFixed(4));
          setLngS(center.lng.toFixed(4));
        }
      );
    } else {
      setPin({ x: 300, y: 180 });
      setLatS(center.lat.toFixed(4));
      setLngS(center.lng.toFixed(4));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Escribe un nombre para identificar el terreno.';
    if (isNaN(parseFloat(latS)) || isNaN(parseFloat(lngS))) er.ll = 'Ingresa latitud y longitud numéricas.';
    if (!(parseFloat(f.area) > 0)) er.area = 'Indica la superficie o dibuja el límite en el mapa.';
    setErr(er);
    if (Object.keys(er).length) return;
    const soil = f.soil === 'Otro' ? (f.soilOther.trim() || 'Otro') : f.soil;
    onSave({
      ...(initial || { id: 'p' + Date.now(), seed: Math.floor(Math.random() * 90) + 5, temp: place.t + 3, hum: 33 }),
      dbId: initial?.dbId || (typeof initial?.id === 'number' ? initial.id : null),
      name: f.name.trim(), crop: f.crop, soil, irrigation: f.irrigation, area: parseFloat(f.area), place: place.n, loc: place.n.replace('Estado de México', 'Edo. Méx.'),
      lat: parseFloat(latS), lng: parseFloat(lngS), clima: place.clima, center, pin, poly: pts.length >= 3 ? pts : initial?.poly,
    });
  };
  const sugs = PLACES.filter(x => x.n.toLowerCase().includes(f.place.toLowerCase()) && x.n !== f.place);

  return (
    <form onSubmit={submit} className="fade-in" noValidate>
      <PageTitle crumbs={<>Terrenos / {edit ? `Editar ${initial.name}` : 'Crear terreno'}</>} title={edit ? 'Editar terreno' : 'Crear terreno'} sub="Registra los datos de tu terreno para comenzar a monitorearlo" />
      <div className="mb-5 flex gap-2 text-xs font-semibold">
        {[['1', 'Datos del terreno', !!f.name.trim()], ['2', 'Ubicación y límites', true]].map(([n, t, ok]) => <span key={n} className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-1.5 shadow-sm">
          <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] text-white ${ok ? 'bg-mint' : 'bg-slate-300'}`}>{ok ? <Icon n="check" s={11} sw={3} /> : n}</span>{t}</span>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
        <div className="card flex flex-col gap-5 p-5">
          <div><h2 className="font-display text-base font-semibold">Datos del terreno</h2></div>
          <L t="Nombre del terreno" err={err.name} id="f-name"><input id="f-name" className={`field ${err.name ? '!border-rose-400' : ''}`} placeholder="Ej. Parcela El Roble" value={f.name} onChange={e => set('name', e.target.value)} /></L>
          <L t="Cultivo"><ChipGroup options={CROPS} value={f.crop} onChange={v => set('crop', v)} /></L>
          <L t="Tipo de tierra"><ChipGroup options={SOILS} value={f.soil} onChange={v => set('soil', v)} />
            {f.soil === 'Otro' && <input aria-label="Otro tipo de tierra" className="field mt-2 fade-in" placeholder="Describe el tipo de tierra" value={f.soilOther} onChange={e => set('soilOther', e.target.value)} />}</L>
          <L t="Sistema de riego"><ChipGroup options={RIEGOS} value={f.irrigation} onChange={v => set('irrigation', v)} /></L>
          <L t="Superficie (ha)" err={err.area} id="f-area"><input id="f-area" inputMode="decimal" className={`field ${err.area ? '!border-rose-400' : ''}`} placeholder="Ej. 12.4" value={f.area} onChange={e => set('area', e.target.value.replace(',', '.'))} /></L>
          <div>
            <div className="mb-1.5 text-xs font-bold text-slate-700">Clima promedio de la zona</div>
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky/10 to-mint/10 p-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white font-display text-sm font-bold text-primary shadow">{place.t}°</div>
              <div className="text-xs"><b className="block text-sm">{place.clima}</b><span className="text-slate-500">Referencia para {place.n.split(',')[0]}</span></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h2 className="font-display text-base font-semibold">Ubicación del terreno</h2>
            <p className="mb-4 text-xs text-slate-500">Busca un lugar, haz clic en el mapa para colocar el pin o dibuja el límite con varios puntos.</p>
            <div className="relative mb-3">
              <label htmlFor="f-place" className="mb-1.5 block text-xs font-bold text-slate-700">Buscar dirección o lugar</label>
              <Icon n="search" s={15} cls="pointer-events-none absolute left-3 top-[2.15rem] text-slate-400" />
              <input id="f-place" className="field !pl-9" value={f.place} autoComplete="off" onFocus={() => setSug(true)} onChange={e => { set('place', e.target.value); setSug(true); }} />
              {sug && sugs.length > 0 && <>
                <div className="fixed inset-0 z-10" onClick={() => setSug(false)} />
                <div className="pop absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                  {sugs.map(x => <button type="button" key={x.n} onClick={() => choosePlace(x)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sky/10"><Icon n="pin" s={14} cls="text-sky" />{x.n}</button>)}
                </div>
              </>}
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1">
                <button type="button" onClick={() => setMode('pin')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${mode === 'pin' ? 'bg-white text-primary shadow' : 'text-slate-500'}`}><Icon n="pin" s={13} />Colocar pin</button>
                <button type="button" onClick={() => setMode('poly')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${mode === 'poly' ? 'bg-white text-primary shadow' : 'text-slate-500'}`}><Icon n="poly" s={13} />Dibujar límite</button>
              </div>
              {pts.length > 0 && <button type="button" onClick={() => setPts(pts.slice(0, -1))} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100">Deshacer punto</button>}
              {pts.length > 0 && <button type="button" onClick={() => setPts([])} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"><Icon n="trash" s={13} />Borrar límite</button>}
              <div className="ml-auto flex gap-1 rounded-xl bg-slate-100/80 p-1">
                {[['Mapa', false], ['Satélite', true]].map(([l, v]) => <button type="button" key={l} onClick={() => setSat(v)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${sat === v ? 'bg-white text-primary shadow' : 'text-slate-500'}`}>{l}</button>)}
              </div>
            </div>
            <div className="relative aspect-[5/3] overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
              <MapView
                lat={parseFloat(latS) || center.lat}
                lng={parseFloat(lngS) || center.lng}
                seed={place.lat * 10 | 0}
                pin={pin}
                satellite={sat}
                draft={pts}
                poly={initial?.poly}
                onPick={pick}
                label={f.name.trim() || 'Ubicación del terreno'}
              />
              <button type="button" onClick={handleUseMyLocation} className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-lg transition-all hover:scale-105"><Icon n="cross" s={14} />Usar mi ubicación</button>
              <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow backdrop-blur">{mode === 'pin' ? 'Haz clic para mover el pin' : `Puntos: ${pts.length}${pts.length >= 3 ? ` · ${fmt(areaHa(pts))} ha` : ' (mínimo 3)'}`}</div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <L t="Latitud" id="f-lat"><input id="f-lat" className="field" value={latS} onChange={e => { setLatS(e.target.value); onLL(e.target.value, lngS); }} /></L>
              <L t="Longitud" id="f-lng"><input id="f-lng" className="field" value={lngS} onChange={e => { setLngS(e.target.value); onLL(latS, e.target.value); }} /></L>
            </div>
            {err.ll && <p className="mt-1 text-xs font-medium text-rose-600">{err.ll}</p>}
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-sky/10 p-3 text-xs text-primary"><Icon n="globe" s={15} cls="mt-0.5" />Al guardar, consultaremos automáticamente NASA POWER y SMAP para esta ubicación.</div>
          </div>
          <div className="flex justify-end gap-3">
            <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
            <Btn type="submit" variant="primary"><Icon n="check" s={16} />{edit ? 'Guardar cambios' : 'Guardar terreno'}</Btn>
          </div>
        </div>
      </div>
    </form>
  );
}
