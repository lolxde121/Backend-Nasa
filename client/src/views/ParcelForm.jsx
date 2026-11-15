import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Btn, ChipGroup, L, PageTitle } from '../components/ui';
import { PLACES, SOILS } from '../data/parcels';
import { fmt } from '../lib/utils';
import { api } from '../services/api';

function formatAddress(data) {
  if (!data || !data.address) return data?.name || data?.display_name || '';
  const a = data.address;
  const local = a.village || a.town || a.city || a.municipality || a.county || a.suburb || a.quarter || data.name || '';
  const municipality = (a.county && a.county !== local) ? a.county : (a.municipality && a.municipality !== local ? a.municipality : '');
  const state = a.state || '';
  const parts = [local, municipality, state].filter(Boolean);
  const uniqueParts = parts.filter((item, index) => parts.indexOf(item) === index);
  return uniqueParts.join(', ') || data.display_name?.split(',').slice(0, 3).join(', ') || '';
}

export function ParcelForm({ initial, onSave, onCancel }) {
  const edit = !!initial;
  const startPlace = PLACES.find(x => x.n === initial?.place) || PLACES[0];
  const [f, setF] = useState(() => ({
    name: initial?.name || '',
    soil: initial ? (SOILS.includes(initial.soil) ? initial.soil : 'Otro') : 'Franco-arcillosa',
    soilOther: initial && !SOILS.includes(initial.soil) ? initial.soil : '',
    place: initial?.place || startPlace.n,
  }));
  const [center, setCenter] = useState(initial?.center || { lat: startPlace.lat, lng: startPlace.lng });
  const [latS, setLatS] = useState(String((initial?.lat ?? startPlace.lat).toFixed(4)));
  const [lngS, setLngS] = useState(String((initial?.lng ?? startPlace.lng).toFixed(4)));
  const [sat, setSat] = useState(false);
  const [sug, setSug] = useState(false);
  const [err, setErr] = useState({});
  const [geoQuery, setGeoQuery] = useState(initial?.place || startPlace.n);
  const [geoLoading, setGeoLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [geoResults, setGeoResults] = useState([]);
  const [showSearch, setShowSearch] = useState(true);

  // Telemetría satelital en vivo de la NASA (POWER y SMAP)
  const [nasaClima, setNasaClima] = useState(null);
  const [nasaLoading, setNasaLoading] = useState(false);
  const reverseTimeoutRef = useRef(null);
  const nasaTimeoutRef = useRef(null);

  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  // Consulta en vivo a la NASA POWER & SMAP con debounce
  const fetchNasaLive = useCallback((latVal, lngVal, soilVal) => {
    const la = parseFloat(latVal);
    const lo = parseFloat(lngVal);
    if (isNaN(la) || isNaN(lo)) return;

    if (nasaTimeoutRef.current) {
      clearTimeout(nasaTimeoutRef.current);
    }

    setNasaLoading(true);
    nasaTimeoutRef.current = setTimeout(async () => {
      try {
        const soilType = soilVal === 'Otro' ? 'Franco' : (soilVal || 'Franco-arcillosa');
        const res = await api.getClimaPuntual(la, lo, soilType);
        if (res && res.data) {
          setNasaClima(res.data);
        }
      } catch (e) {
        console.warn('Consulta a NASA POWER puntual falló:', e);
      } finally {
        setNasaLoading(false);
      }
    }, 380); // 380ms debounce
  }, []);

  // Sincronizar telemetría de la NASA cuando cambian las coordenadas o el suelo
  useEffect(() => {
    fetchNasaLive(latS, lngS, f.soil);
    return () => {
      if (nasaTimeoutRef.current) clearTimeout(nasaTimeoutRef.current);
    };
  }, [latS, lngS, f.soil, fetchNasaLive]);

  const currentTemp = nasaClima?.clima?.temperatura_actual_promedio_c ?? null;
  const currentClima = nasaClima?.clima?.clima_clasificacion ?? (nasaLoading ? 'Consultando satélites NASA…' : 'Templado');
  const currentRain = nasaClima?.clima?.precipitacion_mes_actual_mm ?? null;
  const currentSmap = nasaClima?.smap?.humedad_superficie_porcentaje ?? null;
  const currentElevation = nasaClima?.metadata?.elevacion_msnm ?? null;

  // Reverse geocoding: al tocar o arrastrar el icono, actualizar el buscador con la localidad real
  const reverseGeocode = (latitude, longitude) => {
    if (reverseTimeoutRef.current) {
      clearTimeout(reverseTimeoutRef.current);
    }
    setReverseLoading(true);
    reverseTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          const locality = formatAddress(data);
          if (locality) {
            setGeoQuery(locality);
            set('place', locality);
          }
        }
      } catch (err) {
        console.warn('Reverse geocoding no disponible:', err);
      } finally {
        setReverseLoading(false);
      }
    }, 450); // 450ms debounce
  };

  // Búsqueda geográfica directa con OpenStreetMap Nominatim
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

    // Fallback a lista precargada
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
    setSug(false);
    setGeoResults([]);
  };

  // Selección directa tocando en el mapa o arrastrando el icono de ubicación
  const pick = (x, y, geo) => {
    if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
      const formattedLat = geo.lat.toFixed(4);
      const formattedLng = geo.lng.toFixed(4);
      setLatS(formattedLat);
      setLngS(formattedLng);
      setCenter({ lat: geo.lat, lng: geo.lng });
      // Actualizar automáticamente el buscador con la localidad detectada
      reverseGeocode(geo.lat, geo.lng);
    }
  };

  const onLL = (la, ln) => {
    const a = parseFloat(la), b = parseFloat(ln);
    if (!isNaN(a) && !isNaN(b)) {
      setCenter({ lat: a, lng: b });
      reverseGeocode(a, b);
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
          reverseGeocode(la, ln);
        },
        () => {
          setLatS(center.lat.toFixed(4));
          setLngS(center.lng.toFixed(4));
        }
      );
    } else {
      setLatS(center.lat.toFixed(4));
      setLngS(center.lng.toFixed(4));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Escribe un nombre para identificar el terreno.';
    if (isNaN(parseFloat(latS)) || isNaN(parseFloat(lngS))) er.ll = 'Ingresa latitud y longitud numéricas válidas.';
    setErr(er);
    if (Object.keys(er).length) return;

    const soil = f.soil === 'Otro' ? (f.soilOther.trim() || 'Otro') : f.soil;
    const finalArea = initial?.area ? initial.area : 5.0;

    const realClima = (currentClima && !currentClima.includes('Consultando') && currentClima !== 'Templado')
      ? currentClima
      : (nasaClima?.clima?.clima_clasificacion || initial?.clima || 'Templado');

    onSave({
      ...(initial || { id: 'p' + Date.now(), seed: Math.floor(Math.random() * 90) + 5 }),
      dbId: initial?.dbId || (typeof initial?.id === 'number' ? initial.id : null),
      name: f.name.trim(),
      crop: initial?.crop || 'Por definir (Ver recomendaciones)',
      soil,
      irrigation: initial?.irrigation || 'Temporal',
      area: finalArea,
      place: f.place || (geoQuery.trim() || 'Ubicación seleccionada'),
      loc: (f.place || geoQuery.trim() || 'Ubicación seleccionada').replace('Estado de México', 'Edo. Méx.'),
      lat: parseFloat(latS),
      lng: parseFloat(lngS),
      clima: realClima,
      temp: currentTemp != null ? currentTemp : (initial?.temp || 20.0),
      hum: currentSmap != null ? currentSmap : (initial?.hum || 35.0),
      rain30: currentRain != null ? currentRain : (initial?.rain30 || 25.0),
      resumen_satelital: nasaClima ? {
        temperatura: nasaClima.clima?.temperatura_actual_promedio_c,
        precipitacion: nasaClima.clima?.precipitacion_mes_actual_mm,
        humedad_smap: nasaClima.smap?.humedad_superficie_porcentaje,
        ndvi: nasaClima.modis?.ndvi_actual,
        calidad_vegetacion: nasaClima.modis?.clasificacion_vigor,
        condicion_hidrica: nasaClima.smap?.condicion_humedad,
        elevacion: nasaClima.metadata?.elevacion_msnm,
        clima_clasificacion: nasaClima.clima?.clima_clasificacion,
        fuente: nasaClima.metadata?.fuente
      } : null,
      center,
      poly: null,
    });
  };

  return (
    <form onSubmit={submit} className="fade-in max-w-[1240px] mx-auto" noValidate>
      <PageTitle
        crumbs={<>Terrenos / {edit ? `Editar ${initial.name}` : 'Crear terreno'}</>}
        title={edit ? 'Editar Terreno' : 'Crear Terreno'}
        sub="Registra los datos de tu terreno. La IA agroclimática te sugerirá la rotación de cultivo y manejo hídrico ideal."
      />

      <div className="mb-6 flex gap-3 text-sm font-bold">
        {[
          ['1', 'Datos del terreno', !!f.name.trim()],
          ['2', 'Ubicación en mapa', true]
        ].map(([n, t, ok]) => (
          <span key={n} className="flex items-center gap-2.5 rounded-full border border-white bg-white/90 px-4 py-2 shadow-sm">
            <span className={`grid h-6 w-6 place-items-center rounded-full text-xs text-white ${ok ? 'bg-mint' : 'bg-slate-400'}`}>
              {ok ? <Icon n="check" s={13} sw={3} /> : n}
            </span>
            <span className="text-slate-800">{t}</span>
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,400px)_1fr]">
        {/* Columna Izquierda: Datos esenciales (Nombre y Tipo de suelo) */}
        <div className="card flex flex-col gap-6 p-6">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Datos del terreno</h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">Solo necesitas el nombre y el tipo de suelo de tu predio.</p>
          </div>

          <L t="Nombre del terreno" err={err.name} id="f-name">
            <input
              id="f-name"
              className={`field !py-3.5 !px-4 text-base font-medium ${err.name ? '!border-rose-400' : ''}`}
              placeholder="Ej. Parcela Santa María"
              value={f.name}
              onChange={e => set('name', e.target.value)}
            />
          </L>

          <L t="Tipo de tierra (textura del suelo)">
            <ChipGroup options={SOILS} value={f.soil} onChange={v => set('soil', v)} />
            {f.soil === 'Otro' && (
              <input
                aria-label="Otro tipo de tierra"
                className="field mt-2.5 !py-3 !px-4 text-base fade-in"
                placeholder="Describe el tipo de tierra (ej. Pedregoso, Volcánico)"
                value={f.soilOther}
                onChange={e => set('soilOther', e.target.value)}
              />
            )}
          </L>

          {/* Tarjeta explicativa sobre Rotación y Recomendación IA */}
          <div className="rounded-2xl border border-sky/20 bg-gradient-to-br from-sky/10 via-mint/10 to-transparent p-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky/20 text-primary shrink-0">
                <Icon n="sparkles" s={18} />
              </span>
              <div>
                <b className="block text-primary font-bold text-base">Rotación y Selección de Cultivo con IA</b>
                <p className="mt-1.5 text-slate-600 leading-relaxed font-normal">
                  No necesitas especificar cultivo ni tipo de riego. Al guardar la ubicación, nuestra IA evaluará la telemetría de la NASA (POWER y SMAP) junto con tu suelo para recomendarte la rotación de cultivo más conveniente y el manejo hídrico óptimo.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Telemetría Agroclimática NASA</span>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                <span className={`h-2 w-2 rounded-full ${nasaLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                {nasaLoading ? 'Sincronizando…' : 'En vivo'}
              </span>
            </div>

            <div className="rounded-2xl border border-sky/20 bg-gradient-to-br from-sky/10 via-mint/10 to-transparent p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white font-display text-xl font-extrabold text-primary shadow">
                  {nasaLoading && currentTemp == null ? (
                    <span className="animate-pulse text-xs text-slate-400">...</span>
                  ) : (
                    `${currentTemp != null ? currentTemp : '--'}°`
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <b className="block text-base font-bold text-ink leading-tight">
                    {nasaLoading && !nasaClima ? 'Consultando satélites…' : currentClima}
                  </b>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentElevation ? `${currentElevation} msnm · ` : ''}NASA POWER Climatology (T2M)
                  </span>
                </div>
              </div>

              {/* Sub-métricas satelitales en vivo */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3 text-xs">
                <div className="rounded-xl bg-white/80 p-2.5 backdrop-blur">
                  <div className="flex items-center gap-1.5 font-bold text-slate-500">
                    <Icon n="rain" s={14} cls="text-primary" />
                    <span>Lluvia mensual</span>
                  </div>
                  <div className="mt-1 font-display text-sm font-extrabold text-slate-900">
                    {currentRain != null ? `${currentRain} mm` : '—'}
                  </div>
                </div>

                <div className="rounded-xl bg-white/80 p-2.5 backdrop-blur">
                  <div className="flex items-center gap-1.5 font-bold text-slate-500">
                    <Icon n="drop" s={14} cls="text-sky" />
                    <span>Humedad SMAP</span>
                  </div>
                  <div className="mt-1 font-display text-sm font-extrabold text-slate-900">
                    {currentSmap != null ? `${currentSmap} %` : '—'}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>🛰️ Fuente: NASA POWER & SMAP</span>
                <span>Coord: {parseFloat(latS) ? parseFloat(latS).toFixed(2) : '--'}, {parseFloat(lngS) ? parseFloat(lngS).toFixed(2) : '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ubicación interactiva en el mapa */}
        <div className="flex flex-col gap-6">
          <div className="card p-6">
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-ink">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose-600">
                  <Icon n="pin" s={18} />
                </span>
                Ubicación del terreno
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-medium">
                Toca cualquier punto del mapa satelital o arrastra el icono de ubicación rojo para fijar las coordenadas exactas de tu predio.
              </p>
            </div>

            {/* Buscador de municipio/ejido con sincronización bidireccional */}
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="f-place" className="block text-sm font-bold text-slate-800">
                  Municipio, ejido o localidad
                </label>
                <button
                  type="button"
                  onClick={() => { setShowSearch(!showSearch); setSug(false); }}
                  className="text-xs md:text-sm font-bold text-primary hover:underline"
                >
                  {showSearch ? 'Ocultar buscador (solo mapa)' : 'Mostrar buscador'}
                </button>
              </div>

              {showSearch && (
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Icon n="search" s={16} cls="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="f-place"
                        className="field !pl-10 !py-3 text-sm font-medium"
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
                      {reverseLoading && (
                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-bold text-primary animate-pulse bg-sky/10 px-2 py-0.5 rounded-md">
                          Localizando…
                        </span>
                      )}
                      {geoQuery && !reverseLoading && (
                        <button
                          type="button"
                          onClick={() => { setGeoQuery(''); setGeoResults([]); setSug(false); }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchLocation}
                      disabled={geoLoading}
                      className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                      {geoLoading ? 'Buscando…' : 'Buscar'}
                    </button>
                  </div>

                  {sug && geoResults.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSug(false)} />
                      <div className="pop absolute z-20 mt-1.5 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl max-h-60 overflow-y-auto">
                        {geoResults.map((x, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => chooseGeoPlace(x)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left border-b border-slate-100 last:border-b-0 hover:bg-sky/10 transition-colors"
                          >
                            <Icon n="pin" s={18} cls="text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <b className="block text-sm font-bold text-slate-900">{x.n}</b>
                              <span className="text-xs text-slate-500 font-medium line-clamp-1">
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

            {/* Controles de capa de mapa */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs md:text-sm font-bold text-slate-600">
                Vista del terreno
              </span>
              <div className="flex gap-1.5 rounded-xl bg-slate-100/90 p-1">
                {[['Mapa', false], ['Satélite', true]].map(([l, v]) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setSat(v)}
                    className={`rounded-lg px-4 py-1.5 text-xs md:text-sm font-bold transition-all ${
                      sat === v ? 'bg-white text-primary shadow' : 'text-slate-600'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista del Mapa con Leaflet y Satélite real */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
              <MapView
                lat={parseFloat(latS) || center.lat}
                lng={parseFloat(lngS) || center.lng}
                seed={(parseFloat(latS) || 19) * 10 | 0}
                satellite={sat}
                poly={null}
                onPick={pick}
                label={f.name.trim() || 'Ubicación seleccionada'}
              />

              <button
                type="button"
                onClick={handleUseMyLocation}
                className="absolute bottom-3.5 right-3.5 z-[400] flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs md:text-sm font-bold text-primary shadow-xl backdrop-blur transition-all hover:scale-105 hover:bg-white"
              >
                <Icon n="cross" s={16} />
                Usar mi ubicación GPS
              </button>

              <div className="pointer-events-none absolute left-3.5 top-3.5 z-[400] flex items-center gap-2.5 rounded-xl bg-slate-900/90 px-4 py-2 text-xs md:text-sm font-bold text-white shadow-xl backdrop-blur">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
                </span>
                📍 Arrastra el icono de ubicación rojo o toca el mapa para fijar tu terreno
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <L t="Latitud (grados decimales)" id="f-lat">
                <input
                  id="f-lat"
                  className="field font-mono text-base font-bold !py-3 !px-4"
                  value={latS}
                  onChange={e => { setLatS(e.target.value); onLL(e.target.value, lngS); }}
                />
              </L>
              <L t="Longitud (grados decimales)" id="f-lng">
                <input
                  id="f-lng"
                  className="field font-mono text-base font-bold !py-3 !px-4"
                  value={lngS}
                  onChange={e => { setLngS(e.target.value); onLL(latS, e.target.value); }}
                />
              </L>
            </div>
            {err.ll && <p className="mt-1 text-sm font-bold text-rose-600">{err.ll}</p>}

            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sky/10 p-3.5 text-sm text-primary font-medium">
              <Icon n="globe" s={18} cls="mt-0.5 shrink-0" />
              <span>Al tocar el mapa o mover el pin, se detecta automáticamente la localidad en el buscador y se consultarán los datos satelitales NASA POWER y SMAP.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3.5">
            <Btn variant="ghost" onClick={onCancel} className="!text-sm md:!text-base !px-6 !py-3">
              Cancelar
            </Btn>
            <Btn type="submit" variant="primary" className="!text-sm md:!text-base !px-6 !py-3">
              <Icon n="check" s={18} />
              {edit ? 'Guardar cambios' : 'Guardar terreno'}
            </Btn>
          </div>
        </div>
      </div>
    </form>
  );
}
