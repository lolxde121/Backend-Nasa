import React, { useState } from 'react';
import {
  Search,
  Plus,
  MapPin,
  ChevronRight,
  Thermometer,
  Droplets,
  Activity,
  Edit2,
  Trash2
} from 'lucide-react';
import MapThumbnail from './MapThumbnail';

export default function TerrenosList({
  terrenos = [],
  loading,
  onSelectTerreno,
  onOpenCreateModal,
  onEditTerreno,
  onDeleteTerreno
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerrenos = terrenos.filter(t =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.propietario && t.propietario.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1F33] tracking-tight">
            Mis terrenos
          </h1>
          <p className="text-sm text-[#607289] mt-0.5">
            Administra tus parcelas y consulta su información agroclimática
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="bg-[#0B3D91] hover:bg-[#082d6b] text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Crear terreno</span>
        </button>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar terreno por nombre o ubicación"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E1E8F0] focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white text-[#0F1F33] placeholder:text-[#94A3B8] shadow-2xs"
          />
        </div>

        <div className="text-xs text-[#607289] font-medium self-end sm:self-center">
          <span>{filteredTerrenos.length} terrenos registrados</span>
        </div>
      </div>

      {/* Terrenos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#E1E8F0] h-64 animate-pulse p-4 space-y-3">
              <div className="h-32 bg-slate-100 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredTerrenos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-[#E1E8F0]">
          <p className="text-base font-bold text-[#0F1F33]">No se encontraron parcelas</p>
          <p className="text-xs text-[#607289] mt-1">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Registra tu primer terreno para comenzar el monitoreo satelital.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-4 bg-[#0B3D91] hover:bg-[#082d6b] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear terreno</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredTerrenos.map((terreno) => {
            const sat = terreno.resumen_satelital;
            const tempVal = sat?.temperatura ? Math.round(sat.temperatura) : 24;
            const humVal = sat?.humedad_smap ? Math.round(sat.humedad_smap) : 31;
            const ndviVal = sat?.ndvi ? sat.ndvi : 0.68;

            return (
              <div
                key={terreno.id}
                onClick={() => onSelectTerreno(terreno)}
                className="bg-white rounded-2xl border border-[#E1E8F0] shadow-2xs hover:shadow-md hover:border-[#4FA3E0] transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col justify-between"
              >
                {/* Map Preview Thumbnail */}
                <MapThumbnail
                  lat={terreno.latitud}
                  lon={terreno.longitud}
                  name={terreno.nombre}
                  height="h-40"
                />

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-[#0F1F33] group-hover:text-[#0B3D91] transition-colors">
                        {terreno.nombre}
                      </h3>

                      {/* Quick action buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditTerreno(terreno)}
                          title="Editar"
                          className="p-1 text-slate-400 hover:text-[#0B3D91] rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTerreno(terreno.id)}
                          title="Eliminar"
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-1 text-xs text-[#607289] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#607289] shrink-0" />
                      <span>{terreno.ubicacion}</span>
                    </div>

                    {/* Pills Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="bg-[#EBF4FC] text-[#0B3D91] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                        {terreno.tipo_suelo || 'Franco-arcillosa'}
                      </span>
                      <span className="bg-[#F0F4F8] text-[#4A5B73] text-xs font-medium px-2.5 py-0.5 rounded-md">
                        {terreno.clima_zona || 'Templado'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom NASA Indicators Bar */}
                  <div className="pt-4 mt-4 border-t border-[#E1E8F0] flex items-center justify-between text-xs text-[#0F1F33]">
                    <div className="flex items-center space-x-4">
                      {/* Temp */}
                      <div className="flex items-center space-x-1" title="Temperatura actual NASA POWER">
                        <Thermometer className="w-3.5 h-3.5 text-[#0F1F33]" />
                        <span className="font-semibold">{tempVal} °C</span>
                      </div>

                      {/* Moisture */}
                      <div className="flex items-center space-x-1" title="Humedad de suelo SMAP">
                        <Droplets className="w-3.5 h-3.5 text-[#0F1F33]" />
                        <span className="font-semibold">{humVal} %</span>
                      </div>

                      {/* NDVI */}
                      <div className="flex items-center space-x-1" title="Índice de vegetación MODIS NDVI">
                        <Activity className="w-3.5 h-3.5 text-[#0F1F33]" />
                        <span className="font-semibold">{ndviVal}</span>
                      </div>
                    </div>

                    <div className="text-[#4FA3E0] group-hover:text-[#0B3D91] group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
