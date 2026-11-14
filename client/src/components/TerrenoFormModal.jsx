import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Compass,
  Sprout,
  User,
  Layers,
  Droplet,
  Maximize2,
  FileText,
  Navigation,
  Check
} from 'lucide-react';

export default function TerrenoFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  prefilledCoords = null
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    propietario: '',
    descripcion: '',
    ubicacion: '',
    latitud: '',
    longitud: '',
    area_hectareas: '',
    tipo_suelo: 'Franco',
    fuente_agua: 'Temporal',
    cultivo_actual: 'Sin cultivo',
    estado: 'Activo'
  });

  const [loadingGps, setLoadingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        propietario: initialData.propietario || '',
        descripcion: initialData.descripcion || '',
        ubicacion: initialData.ubicacion || '',
        latitud: initialData.latitud || '',
        longitud: initialData.longitud || '',
        area_hectareas: initialData.area_hectareas || '',
        tipo_suelo: initialData.tipo_suelo || 'Franco',
        fuente_agua: initialData.fuente_agua || 'Temporal',
        cultivo_actual: initialData.cultivo_actual || 'Sin cultivo',
        estado: initialData.estado || 'Activo'
      });
    } else if (prefilledCoords) {
      setFormData(prev => ({
        ...prev,
        latitud: prefilledCoords.lat,
        longitud: prefilledCoords.lon,
        ubicacion: `Punto GPS (${prefilledCoords.lat}, ${prefilledCoords.lon})`
      }));
    } else {
      // Default reset
      setFormData({
        nombre: '',
        propietario: '',
        descripcion: '',
        ubicacion: 'Jalisco, México',
        latitud: 20.6597,
        longitud: -103.3496,
        area_hectareas: '5.0',
        tipo_suelo: 'Franco',
        fuente_agua: 'Temporal',
        cultivo_actual: 'Sin cultivo',
        estado: 'Activo'
      });
    }
    setError('');
  }, [initialData, prefilledCoords, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no es soportada por tu navegador.');
      return;
    }

    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitud: parseFloat(pos.coords.latitude.toFixed(4)),
          longitud: parseFloat(pos.coords.longitude.toFixed(4)),
          ubicacion: prev.ubicacion || 'Mi Ubicación Actual'
        }));
        setLoadingGps(false);
      },
      (err) => {
        setError('No se pudo obtener la ubicación GPS actual.');
        setLoadingGps(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.propietario || !formData.latitud || !formData.longitud || !formData.area_hectareas) {
      setError('Por favor completa todos los campos requeridos (*)');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        area_hectareas: parseFloat(formData.area_hectareas)
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el terreno');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {initialData ? 'Editar Terreno Agrícola' : 'Registrar Nuevo Terreno'}
              </h3>
              <p className="text-xs text-slate-400">
                Configura los parámetros para telemetría espacial NASA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Parcela / Terreno *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Parcela Santa Rosa"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agricultor / Propietario *
              </label>
              <input
                type="text"
                name="propietario"
                value={formData.propietario}
                onChange={handleChange}
                placeholder="Ej. Carmen Velázquez"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ubicación Descriptiva (Municipio, Estado)
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Ej. Tlajomulco de Zúñiga, Jalisco"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Coordinates Block with GPS Button */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Georreferencia Satelital (Lat / Lon) *</span>
              </span>

              <button
                type="button"
                onClick={handleGetGps}
                disabled={loadingGps}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
              >
                <Navigation className={`w-3 h-3 ${loadingGps ? 'animate-spin' : ''}`} />
                <span>{loadingGps ? 'Obteniendo GPS...' : 'Usar mi GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Latitud (°N)
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitud"
                  value={formData.latitud}
                  onChange={handleChange}
                  placeholder="20.6597"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Longitud (°W)
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitud"
                  value={formData.longitud}
                  onChange={handleChange}
                  placeholder="-103.3496"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Superficie (ha) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="area_hectareas"
                value={formData.area_hectareas}
                onChange={handleChange}
                placeholder="5.0"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Suelo
              </label>
              <select
                name="tipo_suelo"
                value={formData.tipo_suelo}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Franco">Franco (Equilibrado)</option>
                <option value="Franco arcilloso">Franco arcilloso</option>
                <option value="Franco arenoso">Franco arenoso</option>
                <option value="Franco limoso">Franco limoso</option>
                <option value="Arcilloso">Arcilloso (Pesado)</option>
                <option value="Arenoso">Arenoso (Ligero)</option>
                <option value="Limoso">Limoso</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fuente de Agua
              </label>
              <select
                name="fuente_agua"
                value={formData.fuente_agua}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Temporal">Temporal (Solo Lluvia)</option>
                <option value="Riego por goteo">Riego por goteo</option>
                <option value="Pozo profundo y temporal">Pozo profundo</option>
                <option value="Canal de riego por gravedad">Canal de gravedad</option>
                <option value="Aspersión">Aspersión</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cultivo Actual o Planeado
              </label>
              <input
                type="text"
                name="cultivo_actual"
                value={formData.cultivo_actual}
                onChange={handleChange}
                placeholder="Ej. Maíz, Frijol, Sin cultivo"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado del Terreno
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Activo">Activo</option>
                <option value="En producción">En producción</option>
                <option value="En preparación">En preparación</option>
                <option value="En descanso">En descanso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas u Observaciones del Agricultor
            </label>
            <textarea
              name="descripcion"
              rows={2}
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles sobre historial de la parcela, inclinación, antecedentes..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Registrar Terreno'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
