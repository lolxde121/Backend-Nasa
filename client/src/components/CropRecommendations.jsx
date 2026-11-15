import React, { useState } from 'react';
import {
  Sprout,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  Droplets,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function CropRecommendations({ recommendationsData, loading }) {
  const [expandedCrop, setExpandedCrop] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-700 font-medium text-sm">Evaluando compatibilidad edafoclimática con datos satelitales NASA...</p>
        <p className="text-slate-400 text-xs mt-1">Cruzando datos NASA con catálogo agronómico de cultivos</p>
      </div>
    );
  }

  if (!recommendationsData || !recommendationsData.recomendaciones) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
        <Sprout className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p>No se han generado recomendaciones agronómicas aún.</p>
      </div>
    );
  }

  const { resumen_agroclimatico, recomendaciones } = recommendationsData;

  const toggleExpand = (index) => {
    setExpandedCrop(expandedCrop === index ? null : index);
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 55) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="space-y-6">
      {/* Agroclimatic Context Summary */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Sprout className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Condiciones del Terreno — Telemetría Satelital NASA
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Temperatura Clave:</span>
            <strong className="text-slate-800 text-sm">{resumen_agroclimatico.temperatura}</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Precipitación Mes:</span>
            <strong className="text-slate-800 text-sm">{resumen_agroclimatico.precipitacion_mes}</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Humedad SMAP:</span>
            <strong className="text-slate-800 text-sm">{resumen_agroclimatico.humedad_suelo_smap}</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-slate-500 block">Tipo de Suelo:</span>
            <strong className="text-slate-800 text-sm">{resumen_agroclimatico.tipo_suelo}</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-slate-500 block">Disponibilidad Agua:</span>
            <strong className="text-slate-800 text-sm truncate">{resumen_agroclimatico.disponibilidad_agua}</strong>
          </div>
        </div>
      </div>

      {/* Recommended Crops List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Cultivos Recomendados para este Terreno</h4>
            <p className="text-xs text-slate-500">
              Ordenados por índice de aptitud edafoclimática y menor riesgo para agricultores principiantes
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            {recomendaciones.length} cultivos analizados
          </span>
        </div>

        <div className="space-y-3">
          {recomendaciones.map((rec, index) => {
            const isExpanded = expandedCrop === index;
            const badgeClasses = getScoreBadgeColor(rec.compatibilidad_porcentaje);

            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-all overflow-hidden"
              >
                {/* Crop Header Row */}
                <div
                  onClick={() => toggleExpand(index)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-bold text-slate-900 text-sm sm:text-base">{rec.cultivo}</h5>
                        <span className="text-xs text-slate-400 italic hidden sm:inline">
                          ({rec.nombre_cientifico})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {rec.categoria}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Siembra: {rec.temporada_optima}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1.5 rounded-xl border text-center font-bold text-sm ${badgeClasses}`}>
                      {rec.compatibilidad_porcentaje}%
                      <span className="block text-[10px] font-medium leading-none mt-0.5">
                        {rec.nivel_aptitud}
                      </span>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    {/* Key Technical Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 flex items-center space-x-1 mb-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Ciclo de Cultivo</span>
                        </span>
                        <strong className="text-slate-800">{rec.tiempo_cosecha_dias} días</strong>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 flex items-center space-x-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-slate-400" />
                          <span>Rendimiento Est.</span>
                        </span>
                        <strong className="text-slate-800">{rec.rendimiento_estimado_ton_ha} ton/ha</strong>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 flex items-center space-x-1 mb-1">
                          <Droplets className="w-3 h-3 text-slate-400" />
                          <span>Demanda de Agua</span>
                        </span>
                        <strong className="text-slate-800 text-[11px] truncate block">{rec.requerimiento_agua}</strong>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 flex items-center space-x-1 mb-1">
                          <ShieldCheck className="w-3 h-3 text-slate-400" />
                          <span>Tol. a Sequía</span>
                        </span>
                        <strong className="text-slate-800">{rec.tolerancia_sequia}</strong>
                      </div>
                    </div>

                    {/* Compatibility Justification */}
                    {rec.motivos_compatibilidad && rec.motivos_compatibilidad.length > 0 && (
                      <div>
                        <h6 className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1 flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Por qué es viable en este terreno:</span>
                        </h6>
                        <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                          {rec.motivos_compatibilidad.map((m, mIdx) => (
                            <li key={mIdx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Agronomic Alerts & Risks */}
                    {rec.alertas_agronomicas && rec.alertas_agronomicas.length > 0 && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                        <span className="font-semibold flex items-center space-x-1 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Factores de Cuidado y Alertas Tempranas:</span>
                        </span>
                        <ul className="space-y-1 pl-4 list-disc text-amber-800">
                          {rec.alertas_agronomicas.map((a, aIdx) => (
                            <li key={aIdx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Practical Farmer Advice */}
                    {rec.consejos_practicos && rec.consejos_practicos.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs">
                        <span className="font-semibold text-slate-900 flex items-center space-x-1 mb-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Guía Práctica para el Agricultor:</span>
                        </span>
                        <ul className="space-y-1 pl-4 list-disc text-slate-600">
                          {rec.consejos_practicos.map((c, cIdx) => (
                            <li key={cIdx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
