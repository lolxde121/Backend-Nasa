import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Edit2,
  MapPin,
  Compass,
  Layers,
  Sun,
  Droplets,
  Activity,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import MapThumbnail from './MapThumbnail';
import { api } from '../services/api';

export default function TerrenoDetail({
  terreno,
  onBack,
  onEdit
}) {
  const [nasaData, setNasaData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCrop, setExpandedCrop] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!terreno) return;
      setLoading(true);
      try {
        const [nasaRes, recsRes] = await Promise.all([
          api.getTerrenoNasaData(terreno.id),
          api.getTerrenoRecomendaciones(terreno.id)
        ]);
        if (isMounted) {
          if (nasaRes.success) setNasaData(nasaRes.data);
          if (recsRes.success) setRecommendationsData(recsRes.data);
        }
      } catch (err) {
        console.error('Error al cargar datos del terreno:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [terreno?.id]);

  if (!terreno) return null;

  const satTemp = nasaData?.clima?.temperatura_actual_promedio_c ?? 24.3;
  const satHum = nasaData?.smap?.humedad_superficie_porcentaje ?? 31;
  const satNdvi = nasaData?.modis?.ndvi_actual ?? 0.68;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-medium text-[#607289]">
        <button onClick={onBack} className="hover:text-[#0B3D91] transition-colors cursor-pointer">
          Terrenos
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
        <span className="text-[#0F1F33]">{terreno.nombre}</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1F33] tracking-tight">
            {terreno.nombre}
          </h1>
          <p className="text-xs sm:text-sm text-[#607289] mt-0.5">
            {terreno.ubicacion} • <span className="text-[#0B3D91] font-medium">Actualizado hoy, 6:00 a. m.</span>
          </p>
        </div>

        <button
          onClick={() => onEdit(terreno)}
          className="bg-white hover:bg-slate-50 text-[#0F1F33] border border-[#E1E8F0] font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-[#0F1F33]" />
          <span>Editar terreno</span>
        </button>
      </div>

      {/* Main Top Row (Exact Figma Mockup Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Información del terreno (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E1E8F0] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Map Preview at top */}
            <MapThumbnail
              lat={terreno.latitud}
              lon={terreno.longitud}
              name={terreno.nombre}
              height="h-44"
            />

            {/* Information List */}
            <div className="p-6 space-y-4">
              <h2 className="text-base font-bold text-[#0F1F33] pb-1">
                Información del terreno
              </h2>

              <div className="space-y-3.5 text-xs">
                {/* Ubicación */}
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#0B3D91]" />
                  </div>
                  <div>
                    <span className="text-[#607289] block text-[11px]">Ubicación</span>
                    <strong className="text-[#0F1F33] text-xs font-semibold">{terreno.ubicacion}</strong>
                  </div>
                </div>

                {/* Coordenadas */}
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] flex items-center justify-center shrink-0 mt-0.5">
                    <Compass className="w-4 h-4 text-[#0B3D91]" />
                  </div>
                  <div>
                    <span className="text-[#607289] block text-[11px]">Coordenadas</span>
                    <strong className="text-[#0F1F33] text-xs font-mono font-semibold">
                      {terreno.latitud?.toFixed(4)}, {terreno.longitud?.toFixed(4)}
                    </strong>
                  </div>
                </div>

                {/* Tipo de tierra */}
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-[#0B3D91]" />
                  </div>
                  <div>
                    <span className="text-[#607289] block text-[11px]">Tipo de tierra</span>
                    <span className="inline-block bg-[#EBF4FC] text-[#0B3D91] font-semibold text-xs px-2.5 py-0.5 rounded-md mt-0.5">
                      {terreno.tipo_suelo || 'Franco-arcillosa'}
                    </span>
                  </div>
                </div>

                {/* Clima promedio */}
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] flex items-center justify-center shrink-0 mt-0.5">
                    <Sun className="w-4 h-4 text-[#0B3D91]" />
                  </div>
                  <div>
                    <span className="text-[#607289] block text-[11px]">Clima promedio</span>
                    <span className="inline-block bg-[#F0F4F8] text-[#4A5B73] font-semibold text-xs px-2.5 py-0.5 rounded-md mt-0.5">
                      {terreno.clima_zona || 'Templado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E1E8F0] flex items-center justify-between text-[11px] text-[#607289]">
            <span>Superficie: <strong className="text-[#0F1F33]">{terreno.area_hectareas} ha</strong></span>
            <span>Riego: <strong className="text-[#0F1F33]">{terreno.fuente_agua}</strong></span>
          </div>
        </div>

        {/* Right Card: Temperatura (NASA POWER) (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E1E8F0] shadow-xs p-6 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#EBF4FC] flex items-center justify-center text-[#0B3D91]">
                  <Sun className="w-4 h-4 text-[#0B3D91]" />
                </div>
                <h2 className="text-base font-bold text-[#0F1F33]">Temperatura</h2>
              </div>

              <span className="bg-[#EBF4FC] text-[#0B3D91] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#D4E7F9]">
                NASA POWER
              </span>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-4xl sm:text-5xl font-black text-[#0F1F33] tracking-tight">
                {satTemp}
              </span>
              <span className="text-xl font-bold text-[#0F1F33]">°C</span>
              <span className="text-xs text-[#607289] font-medium ml-1">
                Promedio últimos 30 días
              </span>
            </div>

            {/* Smooth NASA POWER Temperature Wave Chart */}
            <div className="w-full h-44 sm:h-52 relative mt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4FA3E0" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4FA3E0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                {/* Filled Area */}
                <path
                  d="M 15 85 C 90 40, 150 120, 240 70 C 310 30, 390 110, 485 50 L 485 150 L 15 150 Z"
                  fill="url(#tempGradient)"
                />

                {/* Smooth Curve Stroke */}
                <path
                  d="M 15 85 C 90 40, 150 120, 240 70 C 310 30, 390 110, 485 50"
                  fill="none"
                  stroke="#4FA3E0"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                <circle cx="15" cy="85" r="4.5" fill="#FFFFFF" stroke="#0B3D91" strokeWidth="2.5" />
                <circle cx="165" cy="88" r="4.5" fill="#FFFFFF" stroke="#0B3D91" strokeWidth="2.5" />
                <circle cx="330" cy="55" r="4.5" fill="#FFFFFF" stroke="#0B3D91" strokeWidth="2.5" />
                <circle cx="485" cy="50" r="5.5" fill="#0B3D91" stroke="#FFFFFF" strokeWidth="2.5" />
              </svg>

              {/* Date Markers on X-Axis */}
              <div className="flex justify-between text-[11px] text-[#607289] font-medium pt-3 px-1">
                <span>15 oct</span>
                <span>24 oct</span>
                <span>3 nov</span>
                <span className="font-bold text-[#0B3D91]">14 nov</span>
              </div>
            </div>
          </div>

          {/* Chart Footer Note */}
          <div className="pt-4 border-t border-[#E1E8F0] mt-6 text-[11px] text-[#94A3B8]">
            Datos satelitales referenciales (resolución espacial). Fuente: NASA POWER - T2M
          </div>
        </div>
      </div>

      {/* Secondary NASA Metrics: SMAP (Humedad) & MODIS (Vegetación) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMAP Soil Moisture Card */}
        <div className="bg-white rounded-2xl border border-[#E1E8F0] shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#EBF4FC] flex items-center justify-center text-[#0B3D91]">
                  <Droplets className="w-4 h-4 text-[#0B3D91]" />
                </div>
                <h3 className="text-sm font-bold text-[#0F1F33]">Humedad de suelo (SMAP)</h3>
              </div>
              <span className="text-[10px] font-bold bg-[#EBF4FC] text-[#0B3D91] px-2 py-0.5 rounded">
                NASA SMAP L3/L4
              </span>
            </div>

            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-black text-[#0F1F33]">{satHum} %</span>
              <span className="text-xs text-[#607289]">saturación superficial</span>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-[#F0F4F8] h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#4FA3E0] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, satHum))}%` }}
              ></div>
            </div>

            <p className="text-xs text-[#607289] mt-3 leading-relaxed">
              {nasaData?.smap?.recomendacion_riego || 'Humedad en rango óptimo para desarrollo radicular.'}
            </p>
          </div>

          <div className="pt-3 border-t border-[#E1E8F0] mt-4 flex items-center justify-between text-[11px] text-[#607289]">
            <span>Zona radicular profunda:</span>
            <strong className="text-[#0F1F33]">{nasaData?.smap?.humedad_zona_radicular_porcentaje || 30}%</strong>
          </div>
        </div>

        {/* MODIS NDVI Card */}
        <div className="bg-white rounded-2xl border border-[#E1E8F0] shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#EBF4FC] flex items-center justify-center text-[#0B3D91] mr-2">
                <Activity className="w-4 h-4 text-[#0B3D91]" />
              </div>
              <h3 className="text-sm font-bold text-[#0F1F33] flex-1">Vigor vegetal (MODIS NDVI)</h3>
              <span className="text-[10px] font-bold bg-[#EBF4FC] text-[#0B3D91] px-2 py-0.5 rounded">
                MOD13Q1 250m
              </span>
            </div>

            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-black text-[#0F1F33]">{satNdvi}</span>
              <span className="text-xs text-[#607289]">escala -1 a +1</span>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-[#F0F4F8] h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-[#2BB3A3] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, satNdvi * 100))}%` }}
              ></div>
            </div>

            <p className="text-xs text-[#607289] mt-3 leading-relaxed">
              {nasaData?.modis?.interpretacion_agronomica || 'Canopia vegetal activa, adecuada fotosíntesis y cobertura foliar.'}
            </p>
          </div>

          <div className="pt-3 border-t border-[#E1E8F0] mt-4 flex items-center justify-between text-[11px] text-[#607289]">
            <span>Estado de canopia:</span>
            <strong className="text-[#2BB3A3] font-bold">{nasaData?.modis?.clasificacion_vigor || 'Favorable'}</strong>
          </div>
        </div>
      </div>

      {/* AI Crop Recommendations & Farmer Assistance Section */}
      {recommendationsData && recommendationsData.recomendaciones && (
        <div className="bg-white rounded-2xl border border-[#E1E8F0] shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E8F0]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#EBF4FC] flex items-center justify-center text-[#0B3D91]">
                <Sparkles className="w-4 h-4 text-[#0B3D91]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F1F33]">
                  Recomendaciones de cultivo y asistencia agronómica
                </h3>
                <p className="text-xs text-[#607289]">
                  Inferencia basada en datos de la NASA y las condiciones de suelo de {terreno.nombre}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recommendationsData.recomendaciones.slice(0, 3).map((rec, idx) => {
              const isExpanded = expandedCrop === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E1E8F0] overflow-hidden transition-all bg-[#F8FAFC]"
                >
                  <div
                    onClick={() => setExpandedCrop(isExpanded ? null : idx)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF4FC] text-[#0B3D91] font-bold text-sm flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0F1F33]">{rec.cultivo}</h4>
                        <span className="text-[11px] text-[#607289]">
                          Siembra sugerida: {rec.temporada_optima} • Ciclo: {rec.tiempo_cosecha_dias} días
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="bg-[#EBF4FC] text-[#0B3D91] font-bold text-xs px-3 py-1 rounded-md border border-[#D4E7F9]">
                        {rec.compatibilidad_porcentaje}% compatible
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#607289]" /> : <ChevronDown className="w-4 h-4 text-[#607289]" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 bg-white border-t border-[#E1E8F0] space-y-3 text-xs">
                      {rec.motivos_compatibilidad && rec.motivos_compatibilidad.length > 0 && (
                        <div>
                          <strong className="text-[#0B3D91] block mb-1">Por qué es viable:</strong>
                          <ul className="list-disc pl-4 space-y-0.5 text-[#4A5B73]">
                            {rec.motivos_compatibilidad.map((m, mIdx) => (
                              <li key={mIdx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rec.consejos_practicos && rec.consejos_practicos.length > 0 && (
                        <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E1E8F0]">
                          <strong className="text-[#0F1F33] block mb-1">Guía práctica para el agricultor:</strong>
                          <ul className="list-disc pl-4 space-y-0.5 text-[#607289]">
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
      )}
    </div>
  );
}
