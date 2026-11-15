import { useState } from 'react';
import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Btn, ChipGroup, L, PageTitle } from '../components/ui';
import { PLACES, SOILS } from '../data/parcels';
import { areaHa, clamp, fmt, llToPx, pxToLL } from '../lib/utils';

export function ParcelForm({ initial, onSave, onCancel }) {
  const edit = !!initial;
  const startPlace = PLACES.find(x => x.n === initial?.place) || PLACES[0];
  const [f, setF] = useState(() => ({
    name: initial?.name || '',
    soil: initial ? (SOILS.includes(initial.soil) ? initial.soil : 'Otro') : 'Franco-arcillosa',
    soilOther: initial && !SOILS.includes(initial.soil) ? initial.soil : '',
    area: initial ? String(initial.area) : '',
    place: initial?.place || startPlace.n,
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
  const [geoQuery, setGeoQuery] = useState(initial?.place || startPlace.n);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResults, setGeoResults] = useState([]);
  const [showSearch, setShowSearch] = useState(true);

  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const place = PLACES.find(x => x.n === f.place) || { n: f.place, lat: parseFloat(latS) || 19.5124, lng: parseFloat(lngS) || -98.8828, clima: 'Templado', t: 21 };

  // Búsqueda geográfica real con OpenStreetMap Nominatim
  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    const query = (geoQuery || '').trim();
    if (!query) return;

    setGeoLoading(true);
    setSug(true);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=mx&q=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(item => ({
            n: item.name || item.display_name.split(',')[0],
            full: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            clima: 'Templado',
            t: 21
          }));
          setGeoResults(formatted);
          setGeoLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Geocodificación externa no disponible:', err);
    }

    // Fallback a PLACES precargados
    const localMatches = PLACES.filter(x => x.n.toLowerCase().includes(query.toLowerCase()));
    setGeoResults(localMatches);
    setGeoLoading(false);
  };

  const chooseGeoPlace = (item) => {
    set('place', item.n);
    setGeoQuery(item.n);
    setCenter({ lat: item.lat, lng: item.lng });
    setLatS(item.lat.toFixed(4));
    setLngS(item.lng.toFixed(4));
    setPin({ x: 300, y: 180 });
    setSug(false);
    setGeoResults([]);
  };

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

  const onLL = (la, ln) => {
    const a = parseFloat(la), b = parseFloat(ln);
    if (!isNaN(a) && !isNaN(b)) {
      setCenter({ lat: a, lng: b });
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
    setErr(er);
    if (Object.keys(er).length) return;

    const soil = f.soil === 'Otro' ? (f.soilOther.trim() || 'Otro') : f.soil;
    const finalArea = parseFloat(f.area) > 0 ? parseFloat(f.area) : (initial?.area || 5.0);

    onSave({
      ...(initial || { id: 'p' + Date.now(), seed: Math.floor(Math.random() * 90) + 5, temp: place.t + 3, hum: 33 }),
      dbId: initial?.dbId || (typeof initial?.id === 'number' ? initial.id : null),
      name: f.name.trim(),
      crop: initial?.crop || 'Por definir (Ver recomendaciones)',
      soil,
      irrigation: initial?.irrigation || 'Temporal',
      area: finalArea,
      place: f.place || place.n,
      loc: (f.place || place.n).replace('Estado de México', 'Edo. Méx.'),
      lat: parseFloat(latS),
      lng: parseFloat(lngS),
      clima: place.clima || 'Templado',
      center,
      pin,
      poly: pts.length >= 3 ? pts : initial?.poly,
    });
  };

  return (
    <form onSubmit={submit} className="fade-in" noValidate>
      <PageTitle
        crumbs={<>Terrenos / {edit ? `Editar ${initial.name}` : 'Crear terreno'}</>}
        title={edit ? 'Editar terreno' : 'Crear terreno'}
        sub="Registra los datos de tu terreno. La IA de recomendaciones te indicará qué cultivo y riego son óptimos."
      />

      <div className="mb-5 flex gap-2 text-xs font-semibold">
        {[
          ['1', 'Datos del terreno', !!f.name.trim()],
          ['2', 'Ubicación en mapa', true]
        ].map(([n, t, ok]) => (
          <span key={n} className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-1.5 shadow-sm">
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] text-white ${ok ? 'bg-mint' : 'bg-slate-300'}`}>
              {ok ? <Icon n="check" s={11} sw={3} /> : n}
            </span>
            {t}
          </span>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
        {/* Columna Izquierda: Datos esenciales (Nombre y Tipo de suelo) */}
        <div className="card flex flex-col gap-5 p-5">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Datos del terreno</h2>
            <p className="mt-0.5 text-xs text-slate-500">Solo necesitas ingresar el nombre y el tipo de tierra de tu predio.</p>
          </div>

          <L t="Nombre del terreno" err={err.name} id="f-name">
            <input
              id="f-name"
              className={`field ${err.name ? '!border-rose-400' : ''}`}
              placeholder="Ej. Parcela El Roble"
              value={f.name}
              onChange={e => set('name', e.target.value)}
            />
          </L>

          <L t="Tipo de tierra (textura del suelo)">
            <ChipGroup options={SOILS} value={f.soil} onChange={v => set('soil', v)} />
            {f.soil === 'Otro' && (
              <input
                aria-label="Otro tipo de tierra"
                className="field mt-2 fade-in"
                placeholder="Describe el tipo de tierra (ej. Pedregoso, Volcánico)"
                value={f.soilOther}
                onChange={e => set('soilOther', e.target.value)}
              />
            )}
          </L>

          {/* Tarjeta explicativa sobre Rotación y Recomendación IA */}
          <div className="rounded-2xl border border-sky/20 bg-gradient-to-br from-sky/10 via-mint/10 to-transparent p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky/20 text-primary shrink-0">
                <Icon n="sparkles" s={16} />
              </span>
              <div>
                <b className="block text-primary font-bold">Rotación y Selección de Cultivo con IA</b>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  No necesitas especificar cultivo ni tipo de riego ahora. Nuestra IA analizará la telemetría de la NASA (POWER y SMAP) junto con tu suelo para recomendarte la rotación de cultivo más conveniente y el manejo hídrico ideal.
                </p>
              </div>
            </div>
            {pts.length >= 3 && (
              <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-slate-700 font-semibold">
                <span>Superficie delimitada en mapa:</span>
                <span className="font-bold text-primary">{f.area} ha</span>
              </div>
            )}
          </div>

          <div>
            <div className="mb-1.5 text-xs font-bold text-slate-700">Clima promedio de la zona</div>
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky/10 to-mint/10 p-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white font-display text-sm font-bold text-primary shadow">
                {place.t}°
              </div>
              <div className="text-xs">
                <b className="block text-sm">{place.clima}</b>
                <span className="text-slate-500">Referencia climática para la coordenada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ubicación interactiva en el mapa */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <div className="mb-3">
              <h2 className="font-display text-base font-semibold flex items-center gap-2 text-ink">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-100 text-rose-600">
                  <Icon n="pin" s={16} />
                </span>
                Ubicación del terreno
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Toca cualquier punto del mapa satelital o arrastra el icono de ubicación rojo para fijar las coordenadas de tu parcela.
              </p>
            </div>

            {/* Buscador funcional o modo solo selección */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="f-place" className="block text-xs font-bold text-slate-700">
                  Buscar municipio o ejido (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => { setShowSearch(!showSearch); setSug(false); }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {showSearch ? 'Ocultar buscador (solo mapa)' : 'Mostrar buscador'}
                </button>
              </div>

              {showSearch && (
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Icon n="search" s={15} cls="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="f-place"
                        className="field !pl-9 text-xs"
                        placeholder="Escribe municipio, estado o ejido (ej. Texcoco, Toluca, Celaya)..."
                        value={geoQuery}
                        autoComplete="off"
                        onFocus={() => { if (geoResults.length) setSug(true); }}
                        onChange={e => {
                          setGeoQuery(e.target.value);
                          set('place', e.target.value);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchLocation();
                          }
                        }}
                      />
                      {geoQuery && (
                        <button
                          type="button"
                          onClick={() => { setGeoQuery(''); setGeoResults([]); setSug(false); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchLocation}
                      disabled={geoLoading}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                      {geoLoading ? 'Buscando…' : 'Buscar'}
                    </button>
                  </div>

                  {sug && geoResults.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSug(false)} />
                      <div className="pop absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl max-h-56 overflow-y-auto">
                        {geoResults.map((x, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => chooseGeoPlace(x)}
                            className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs border-b border-slate-50 last:border-b-0 hover:bg-sky/10"
                          >
                            <Icon n="pin" s={15} cls="text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <b className="block text-slate-800">{x.n}</b>
                              <span className="text-[11px] text-slate-500 line-clamp-1">
                                {x.full || `${x.lat.toFixed(4)}, ${x.lng.toFixed(4)}`}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Controles del mapa */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1">
                <button
                  type="button"
                  onClick={() => setMode('pin')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    mode === 'pin' ? 'bg-white text-rose-600 shadow' : 'text-slate-500'
                  }`}
                >
                  <Icon n="pin" s={13} cls={mode === 'pin' ? 'text-rose-600' : ''} />
                  Icono de ubicación
                </button>
                <button
                  type="button"
                  onClick={() => setMode('poly')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    mode === 'poly' ? 'bg-white text-primary shadow' : 'text-slate-500'
                  }`}
                >
                  <Icon n="poly" s={13} />
                  Dibujar polígono
                </button>
              </div>

              {pts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPts(pts.slice(0, -1))}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Deshacer punto
                </button>
              )}
              {pts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPts([])}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Icon n="trash" s={13} />
                  Borrar polígono
                </button>
              )}

              <div className="ml-auto flex gap-1 rounded-xl bg-slate-100/80 p-1">
                {[['Mapa', false], ['Satélite', true]].map(([l, v]) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setSat(v)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      sat === v ? 'bg-white text-primary shadow' : 'text-slate-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista del Mapa con Leaflet y Satélite real */}
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
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="absolute bottom-3 right-3 z-[400] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-white"
              >
                <Icon n="cross" s={14} />
                Usar mi ubicación GPS
              </button>
              <div className="pointer-events-none absolute left-3 top-3 z-[400] flex items-center gap-2 rounded-xl bg-slate-900/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                </span>
                {mode === 'pin'
                  ? '📍 Icono de ubicación activo: Toca o arrastra para fijar'
                  : `Polígono: ${pts.length}${pts.length >= 3 ? ` puntos · ${fmt(areaHa(pts))} ha` : ' (mínimo 3 puntos)'}`}
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <L t="Latitud (grados decimales)" id="f-lat">
                <input
                  id="f-lat"
                  className="field font-mono text-sm"
                  value={latS}
                  onChange={e => { setLatS(e.target.value); onLL(e.target.value, lngS); }}
                />
              </L>
              <L t="Longitud (grados decimales)" id="f-lng">
                <input
                  id="f-lng"
                  className="field font-mono text-sm"
                  value={lngS}
                  onChange={e => { setLngS(e.target.value); onLL(latS, e.target.value); }}
                />
              </L>
            </div>
            {err.ll && <p className="mt-1 text-xs font-medium text-rose-600">{err.ll}</p>}

            <div className="mt-3 flex items-start gap-2 rounded-xl bg-sky/10 p-3 text-xs text-primary">
              <Icon n="globe" s={15} cls="mt-0.5" />
              Al guardar, consultaremos automáticamente NASA POWER y SMAP para esta ubicación geográfica y se generarán las recomendaciones de cultivo.
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
            <Btn type="submit" variant="primary">
              <Icon n="check" s={16} />
              {edit ? 'Guardar cambios' : 'Guardar terreno'}
            </Btn>
          </div>
        </div>
      </div>
    </form>
  );
}
