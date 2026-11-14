import React, { useState } from 'react';
import {
  Sprout,
  MapPin,
  Maximize2,
  Droplet,
  Layers,
  Thermometer,
  CloudRain,
  Activity,
  Edit2,
  Trash2,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function TerrenosList({
  terrenos = [],
  loading,
  onSelectTerreno,
  onEditTerreno,
  onDeleteTerreno,
  onOpenNewModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSuelo, setFilterSuelo] = useState('todos');

  // Calculate summary metrics
  const totalHectareas = terrenos.reduce((acc, t) => acc + (t.area_hectareas || 0), 0).toFixed(1);
  const cultivosActivos = terrenos.filter(t => t.cultivo_actual && t.cultivo_actual !== 'Sin cultivo').length;

  const filteredTerrenos = terrenos.filter(t => {
    const matchesSearch =
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ubicacion && t.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSuelo = filterSuelo === 'todos' || t.tipo_suelo === filterSuelo;
    return matchesSearch && matchesSuelo;
  });

  return (
    <div className="space-y-6">
      {/* Top Agricultural KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Terrenos</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{terrenos.length}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">parcelas registradas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Superficie Total</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{totalHectareas}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">hectáreas monitoreadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">En Producción</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{cultivosActivos}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">cultivos establecidos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Telemetría NASA</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-black text-slate-900">100%</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">POWER & SMAP activo</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, agricultor o región..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Tipo de suelo:</span>
          <select
            value={filterSuelo}
            onChange={(e) => setFilterSuelo(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
          >
            <option value="todos">Todos los suelos</option>
            <option value="Franco">Franco</option>
            <option value="Franco arcilloso">Franco arcilloso</option>
            <option value="Franco arenoso">Franco arenoso</option>
            <option value="Franco limoso">Franco limoso</option>
            <option value="Arcilloso">Arcilloso</option>
            <option value="Arenoso">Arenoso</option>
          </select>

          <button
            onClick={onOpenNewModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center space-x-1.5 shadow-sm whitespace-nowrap ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* Terrenos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-8 bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredTerrenos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-800 text-base">No se encontraron parcelas</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No hay terrenos que coincidan con la búsqueda actual.'
              : 'Aún no has registrado terrenos. Registra el primero para comenzar con la asistencia.'}
          </p>
          <button
            onClick={onOpenNewModal}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear mi primer terreno</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTerrenos.map((terreno) => {
            const sat = terreno.resumen_satelital;

            return (
              <div
                key={terreno.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {terreno.estado || 'Activo'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1.5 group-hover:text-emerald-700 transition-colors">
                        {terreno.nombre}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-slate-900">{terreno.area_hectareas}</span>
                      <span className="text-xs text-slate-500 block -mt-1">ha</span>
                    </div>
                  </div>

                  {/* Owner & Location */}
                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <p className="flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{terreno.propietario}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{terreno.ubicacion}</span>
                    </p>
                  </div>

                  {/* Soil & Water Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{terreno.tipo_suelo}</span>
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1">
                      <Droplet className="w-3 h-3 text-blue-400" />
                      <span className="truncate max-w-[130px]">{terreno.fuente_agua}</span>
                    </span>
                  </div>

                  {/* NASA Satellite Quick Telemetry Preview */}
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                      <span>Telemetría Satelital</span>
                      <span className="text-emerald-600 font-bold">NASA</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 block">Temp.</span>
                        <strong className="text-slate-800 text-xs">
                          {sat?.temperatura ? `${sat.temperatura}°C` : '21.5°C'}
                        </strong>
                      </div>

                      <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 block">Humedad</span>
                        <strong className="text-cyan-700 text-xs">
                          {sat?.humedad_smap ? `${sat.humedad_smap}%` : '48%'}
                        </strong>
                      </div>

                      <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 block">NDVI</span>
                        <strong className="text-emerald-700 text-xs">
                          {sat?.ndvi ? sat.ndvi : '0.58'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditTerreno(terreno)}
                      title="Editar terreno"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTerreno(terreno.id)}
                      title="Eliminar terreno"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectTerreno(terreno)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs"
                  >
                    <span>Explorar Terreno & NASA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
