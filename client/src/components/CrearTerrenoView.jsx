import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Search,
  Navigation,
  Info,
  Check,
  Layers,
  MapPin
} from 'lucide-react';

export default function CrearTerrenoView({
  onCancel,
  onSubmit,
  initialData = null,
  prefilledCoords = null
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_suelo: 'Franco-arcillosa',
    clima_zona: 'Templado',
    ubicacion: 'Texcoco, Estado de México',
    latitud: 19.5124,
    longitud: -98.8828,
    area_hectareas: 8.5,
    propietario: 'Roberto Méndez',
    fuente_agua: 'Pozo profundo y temporal',
    cultivo_actual: 'Sin cultivo'
  });

  const [mapLayer, setMapLayer] = useState('mapa'); // 'mapa' | 'satelite'
  const [loadingGps, setLoadingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customTipoSuelo, setCustomTipoSuelo] = useState('');
  const [isCustomTipo, setIsCustomTipo] = useState(false);
  const [searchAddress, setSearchAddress] = useState('Texcoco, Estado de México');

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  const TIERRA_OPTIONS = [
    'Arcillosa',
    'Arenosa',
    'Limosa',
    'Franca',
    'Franco-arcillosa',
    'Otro (escribe)'
  ];

  const CLIMA_OPTIONS = ['Templado', 'Semiárido', 'Cálido húmedo', 'Seco / Árido', '32° Cálido'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        tipo_suelo: initialData.tipo_suelo || 'Franco-arcillosa',
        clima_zona: initialData.clima_zona || 'Templado',
        ubicacion: initialData.ubicacion || 'Texcoco, Estado de México',
        latitud: initialData.latitud || 19.5124,
        longitud: initialData.longitud || -98.8828,
        area_hectareas: initialData.area_hectareas || 8.5,
        propietario: initialData.propietario || 'Roberto Méndez',
        fuente_agua: initialData.fuente_agua || 'Pozo profundo y temporal',
        cultivo_actual: initialData.cultivo_actual || 'Sin cultivo'
      });
      setSearchAddress(initialData.ubicacion || 'Texcoco, Estado de México');
    } else if (prefilledCoords) {
      setFormData(prev => ({
        ...prev,
        latitud: prefilledCoords.lat,
        longitud: prefilledCoords.lon
      }));
    }
  }, [initialData, prefilledCoords]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let L;
    import('leaflet').then((leafletModule) => {
      L = leafletModule.default || leafletModule;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([formData.latitud, formData.longitud], 14);

      L.control.zoom({ position: 'topright' }).addTo(map);

      const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      });

      const satTiles = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri', maxZoom: 18 }
      );

      if (mapLayer === 'satelite') {
        satTiles.addTo(map);
      } else {
        streetTiles.addTo(map);
      }

      // Draggable Marker
      const marker = L.marker([formData.latitud, formData.longitud], {
        draggable: true
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setFormData(prev => ({
          ...prev,
          latitud: parseFloat(pos.lat.toFixed(4)),
          longitud: parseFloat(pos.lng.toFixed(4))
        }));
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setFormData(prev => ({
          ...prev,
          latitud: parseFloat(lat.toFixed(4)),
          longitud: parseFloat(lng.toFixed(4))
        }));
      });

      markerRef.current = marker;
      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapLayer]);

  // Update marker when coords change manually
  const updateMapPosition = (newLat, newLon) => {
    if (markerRef.current && leafletMapRef.current && !isNaN(newLat) && !isNaN(newLon)) {
      markerRef.current.setLatLng([newLat, newLon]);
      leafletMapRef.current.setView([newLat, newLon], 14);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por tu navegador');
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        setFormData(prev => ({ ...prev, latitud: lat, longitud: lon }));
        updateMapPosition(lat, lon);
        setLoadingGps(false);
      },
      (err) => {
        alert('No se pudo obtener la ubicación GPS.');
        setLoadingGps(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('Por favor ingresa el nombre del terreno');
      return;
    }

    setSubmitting(true);
    try {
      const finalTipoSuelo = isCustomTipo ? customTipoSuelo : formData.tipo_suelo;
      await onSubmit({
        ...formData,
        tipo_suelo: finalTipoSuelo,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        area_hectareas: parseFloat(formData.area_hectareas)
      });
    } catch (err) {
      alert(err.message || 'Error al guardar el terreno');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-medium text-[#607289]">
        <button onClick={onCancel} className="hover:text-[#0B3D91] transition-colors cursor-pointer">
          Terrenos
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
        <span className="text-[#0F1F33]">Crear terreno</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1F33] tracking-tight">
          Crear terreno
        </h1>
        <p className="text-sm text-[#607289] mt-0.5">
          Registra los datos de tu terreno para comenzar a monitorearlo
        </p>
      </div>

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E1E8F0] shadow-xs p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column 1: Datos del terreno */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#0F1F33]">
              Datos del terreno
            </h2>

            {/* Nombre del terreno */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F33] mb-2">
                Nombre del terreno
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Parcela El Roble"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white text-[#0F1F33] placeholder:text-[#94A3B8]"
                required
              />
            </div>

            {/* Tipo de tierra (Pill selector) */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F33] mb-2.5">
                Tipo de tierra
              </label>
              <div className="flex flex-wrap gap-2">
                {TIERRA_OPTIONS.map((tipo) => {
                  const isSelected = isCustomTipo ? tipo === 'Otro (escribe)' : formData.tipo_suelo === tipo;

                  return (
                    <button
                      type="button"
                      key={tipo}
                      onClick={() => {
                        if (tipo === 'Otro (escribe)') {
                          setIsCustomTipo(true);
                        } else {
                          setIsCustomTipo(false);
                          setFormData({ ...formData, tipo_suelo: tipo });
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B3D91] text-white shadow-2xs'
                          : 'bg-white border border-[#E1E8F0] text-[#4A5B73] hover:bg-slate-50'
                      }`}
                    >
                      {tipo}
                    </button>
                  );
                })}
              </div>

              {isCustomTipo && (
                <input
                  type="text"
                  value={customTipoSuelo}
                  onChange={(e) => setCustomTipoSuelo(e.target.value)}
                  placeholder="Escribe el tipo de tierra..."
                  className="mt-3 w-full px-3 py-2 text-xs rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              )}
            </div>

            {/* Clima promedio de la zona */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F33] mb-2">
                Clima promedio de la zona
              </label>
              <div className="flex flex-wrap gap-2">
                {CLIMA_OPTIONS.map((clima) => {
                  const isSelected = formData.clima_zona === clima;
                  return (
                    <button
                      type="button"
                      key={clima}
                      onClick={() => setFormData({ ...formData, clima_zona: clima })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B3D91] text-white shadow-2xs font-semibold'
                          : 'bg-white border border-[#E1E8F0] text-[#4A5B73] hover:bg-slate-50'
                      }`}
                    >
                      {clima}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Área y Propietario (Campos secundarios) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F33] mb-1.5">
                  Superficie (ha)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.area_hectareas}
                  onChange={(e) => setFormData({ ...formData, area_hectareas: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1F33] mb-1.5">
                  Agricultor a cargo
                </label>
                <input
                  type="text"
                  value={formData.propietario}
                  onChange={(e) => setFormData({ ...formData, propietario: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>
          </div>

          {/* Column 2: Ubicación del terreno */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0F1F33]">
                Ubicación del terreno
              </h2>
              <p className="text-xs text-[#607289] mt-0.5">
                Busca con Google Maps o arrastra el pin para ajustar la ubicación
              </p>
            </div>

            {/* Search Address Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0F1F33] mb-1.5">
                Buscar dirección o lugar (Google Places)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => {
                    setSearchAddress(e.target.value);
                    setFormData({ ...formData, ubicacion: e.target.value });
                  }}
                  placeholder="Texcoco, Estado de México"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white text-[#0F1F33]"
                />
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-56 rounded-xl overflow-hidden border border-[#E1E8F0] bg-slate-100 shadow-inner">
              {/* Top Controls on Map */}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center space-x-1.5 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-[#E1E8F0] text-xs shadow-xs">
                <button
                  type="button"
                  onClick={() => setMapLayer('mapa')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    mapLayer === 'mapa' ? 'bg-[#0B3D91] text-white' : 'text-[#4A5B73]'
                  }`}
                >
                  Mapa
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayer('satelite')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    mapLayer === 'satelite' ? 'bg-[#0B3D91] text-white' : 'text-[#4A5B73]'
                  }`}
                >
                  Satélite
                </button>
              </div>

              {/* Usar mi ubicación Button */}
              <div className="absolute bottom-2.5 right-2.5 z-20">
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={loadingGps}
                  className="bg-white/95 hover:bg-white text-[#0F1F33] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E1E8F0] shadow-sm flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <Navigation className={`w-3.5 h-3.5 text-[#0B3D91] ${loadingGps ? 'animate-spin' : ''}`} />
                  <span>{loadingGps ? 'Localizando...' : 'Usar mi ubicación'}</span>
                </button>
              </div>

              {/* Leaflet Map Target */}
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Latitud & Longitud inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F1F33] mb-1">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitud}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, latitud: val });
                    updateMapPosition(val, formData.longitud);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1F33] mb-1">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitud}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, longitud: val });
                    updateMapPosition(formData.latitud, val);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white font-mono"
                  required
                />
              </div>
            </div>

            {/* NASA Telemetry Note Banner */}
            <div className="bg-[#EBF4FC] border border-[#D4E7F9] rounded-xl p-3 flex items-start space-x-2.5 text-xs text-[#0B3D91]">
              <Info className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Al guardar, consultaremos automáticamente <strong>NASA POWER, SMAP y MODIS</strong> para esta ubicación.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[#E1E8F0] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[#E1E8F0] bg-white hover:bg-slate-50 text-[#0F1F33] text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#0B3D91] hover:bg-[#082d6b] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{submitting ? 'Guardando...' : 'Guardar terreno'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
