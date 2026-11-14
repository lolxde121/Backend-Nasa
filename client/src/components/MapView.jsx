import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  Satellite,
  Compass,
  Thermometer,
  CloudRain,
  Droplets,
  Activity,
  Plus,
  Key,
  Info,
  ExternalLink,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function MapView({
  terrenos = [],
  selectedTerreno,
  onSelectTerreno,
  onOpenCreateWithCoords
}) {
  const [mapEngine, setMapEngine] = useState('leaflet'); // 'leaflet' | 'google'
  const [layerType, setLayerType] = useState('satellite'); // 'satellite' | 'streets'
  const [googleApiKey, setGoogleApiKey] = useState(
    () => localStorage.getItem('agro_google_maps_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(googleApiKey);

  // Clicked point NASA telemetry
  const [clickedPoint, setClickedPoint] = useState(null);
  const [pointData, setPointData] = useState(null);
  const [loadingPointData, setLoadingPointData] = useState(false);

  const leafletMapRef = useRef(null);
  const googleMapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const googleMarkersRef = useRef([]);

  // Default center: Guadalajara / Jalisco (central agricultural area)
  const defaultCenter = selectedTerreno
    ? [selectedTerreno.latitud, selectedTerreno.longitud]
    : [20.6597, -103.3496];

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapContainerRef.current) return;

    let L;
    let mapInstance;

    // Dynamically load leaflet instance
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule;

      // Fix Leaflet default marker icon paths in Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Clear previous container if needed
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      const initialLat = selectedTerreno ? selectedTerreno.latitud : 20.6597;
      const initialLon = selectedTerreno ? selectedTerreno.longitud : -103.3496;

      mapInstance = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([initialLat, initialLon], selectedTerreno ? 14 : 9);

      L.control.zoom({ position: 'topright' }).addTo(mapInstance);

      // Tile layers
      const satelliteTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri &mdash; NASA / USGS', maxZoom: 18 }
      );

      const streetTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }
      );

      if (layerType === 'satellite') {
        satelliteTiles.addTo(mapInstance);
      } else {
        streetTiles.addTo(mapInstance);
      }

      // Draw Terrenos markers and polygons
      terrenos.forEach((t) => {
        const isSelected = selectedTerreno && selectedTerreno.id === t.id;
        
        // Custom marker icon
        const marker = L.circleMarker([t.latitud, t.longitud], {
          radius: isSelected ? 10 : 8,
          fillColor: isSelected ? '#10b981' : '#22c55e',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(mapInstance);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <strong style="color: #065f46; font-size: 14px;">${t.nombre}</strong><br/>
            <span style="color: #64748b;">${t.propietario}</span><br/>
            <strong>Área:</strong> ${t.area_hectareas} ha<br/>
            <strong>Cultivo:</strong> ${t.cultivo_actual || 'Sin cultivo'}
          </div>
        `);

        marker.on('click', () => {
          onSelectTerreno(t);
        });

        // Draw polygon if available
        if (t.poligono && Array.isArray(t.poligono)) {
          L.polygon(t.poligono, {
            color: isSelected ? '#10b981' : '#34d399',
            fillColor: '#10b981',
            fillOpacity: isSelected ? 0.35 : 0.2,
            weight: isSelected ? 3 : 2
          }).addTo(mapInstance);
        }
      });

      // Click on map to inspect coordinate with NASA API
      mapInstance.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setClickedPoint({ lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lng.toFixed(4)) });
        setLoadingPointData(true);

        try {
          const res = await api.getClimaPuntual(lat, lng);
          if (res.success) {
            setPointData(res.data);
          }
        } catch (err) {
          console.error('Error al consultar telemetría:', err);
        } finally {
          setLoadingPointData(false);
        }
      });

      leafletMapRef.current = mapInstance;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapEngine, layerType, terrenos, selectedTerreno]);

  // Handle Google Maps Loader
  useEffect(() => {
    if (mapEngine !== 'google' || !googleApiKey) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initGoogleMap();
        return;
      }

      const scriptId = 'google-maps-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogleMap();
        document.head.appendChild(script);
      } else {
        initGoogleMap();
      }
    };

    const initGoogleMap = () => {
      if (!mapContainerRef.current || !window.google?.maps) return;

      const center = selectedTerreno
        ? { lat: selectedTerreno.latitud, lng: selectedTerreno.longitud }
        : { lat: 20.6597, lng: -103.3496 };

      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: selectedTerreno ? 14 : 9,
        mapTypeId: layerType === 'satellite' ? 'hybrid' : 'roadmap',
        mapTypeControl: false,
        streetViewControl: false
      });

      googleMapInstanceRef.current = map;

      // Add Markers
      googleMarkersRef.current.forEach(m => m.setMap(null));
      googleMarkersRef.current = [];

      terrenos.forEach(t => {
        const marker = new window.google.maps.Marker({
          position: { lat: t.latitud, lng: t.longitud },
          map,
          title: t.nombre,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        marker.addListener('click', () => {
          onSelectTerreno(t);
        });

        googleMarkersRef.current.push(marker);

        // Draw Polygon if present
        if (t.poligono && Array.isArray(t.poligono)) {
          const coords = t.poligono.map(p => ({ lat: p[0], lng: p[1] }));
          new window.google.maps.Polygon({
            paths: coords,
            strokeColor: '#10b981',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#10b981',
            fillOpacity: 0.25,
            map
          });
        }
      });

      // Click to inspect
      map.addListener('click', async (e) => {
        const lat = parseFloat(e.latLng.lat().toFixed(4));
        const lon = parseFloat(e.latLng.lng().toFixed(4));
        setClickedPoint({ lat, lon });
        setLoadingPointData(true);

        try {
          const res = await api.getClimaPuntual(lat, lon);
          if (res.success) {
            setPointData(res.data);
          }
        } catch (err) {
          console.error('Error NASA punto:', err);
        } finally {
          setLoadingPointData(false);
        }
      });
    };

    loadGoogleMaps();
  }, [mapEngine, googleApiKey, layerType, terrenos, selectedTerreno]);

  const saveApiKey = () => {
    localStorage.setItem('agro_google_maps_key', tempApiKey.trim());
    setGoogleApiKey(tempApiKey.trim());
    setShowKeyModal(false);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900">
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer and Engine Selectors */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Motor:</span>

          <button
            onClick={() => setMapEngine('leaflet')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mapEngine === 'leaflet'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Satelital Esri (Open)
          </button>

          <button
            onClick={() => setMapEngine('google')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
              mapEngine === 'google'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Google Maps</span>
            {!googleApiKey && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
          </button>
        </div>

        {/* View Mode (Satellite vs Street) & Google Key button */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-md border border-slate-200 flex space-x-1 text-xs">
            <button
              onClick={() => setLayerType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                layerType === 'satellite'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satélite</span>
            </button>
            <button
              onClick={() => setLayerType('streets')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                layerType === 'streets'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Calles
            </button>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            title="Configurar Google Maps API Key"
            className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Google Maps Missing Key Warning Overlay (Only if Google Maps chosen without Key) */}
      {mapEngine === 'google' && !googleApiKey && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">API Key de Google Maps requerida</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Para utilizar la capa de Google Maps oficial necesitas ingresar una clave con la API Maps JavaScript activada.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setShowKeyModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors shadow"
              >
                Ingresar Clave de Google Maps
              </button>
              <button
                onClick={() => setMapEngine('leaflet')}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium py-2 px-4 rounded-xl transition-colors border border-emerald-200"
              >
                Volver a Satélite Esri / OpenStreetMap (Gratuito y 100% Funcional)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Coordinate Telemetry Card (When user clicks anywhere on map) */}
      {clickedPoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-slate-900">Telemetría en Coordenada</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {clickedPoint.lat}°, {clickedPoint.lon}°
              </p>
            </div>

            <button
              onClick={() => {
                setClickedPoint(null);
                setPointData(null);
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          {loadingPointData ? (
            <div className="py-4 text-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-600">Consultando NASA POWER en tiempo real...</p>
            </div>
          ) : pointData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Temperatura</span>
                    <strong className="text-slate-800">{pointData.clima?.temperatura_actual_promedio_c}°C</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                  <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lluvia Mensual</span>
                    <strong className="text-slate-800">{pointData.clima?.precipitacion_mes_actual_mm} mm</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Humedad SMAP</span>
                    <strong className="text-slate-800">{pointData.smap?.humedad_superficie_porcentaje}%</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">NDVI MODIS</span>
                    <strong className="text-slate-800">{pointData.modis?.ndvi_actual}</strong>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                <strong className="text-emerald-900 block">Diagnóstico Agrícola:</strong>
                {pointData.smap?.recomendacion_riego}
              </div>

              <button
                onClick={() => {
                  onOpenCreateWithCoords(clickedPoint.lat, clickedPoint.lon);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar nuevo terreno aquí</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-2">Haz clic en el mapa para consultar cualquier punto con satélites.</p>
          )}
        </div>
      )}

      {/* Google API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base">Configurar Google Maps API</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Ingresa tu API Key de Google Cloud con la biblioteca <strong>Maps JavaScript API</strong> habilitada. Si no cuentas con una, el prototipo funciona al 100% con la capa Satelital Esri y OpenStreetMap.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Maps API Key
              </label>
              <input
                type="text"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveApiKey}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar y Aplicar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
