import React from 'react';
import {
  Thermometer,
  CloudRain,
  Droplets,
  Activity,
  Sun,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Database
} from 'lucide-react';

export default function NasaDataCard({ nasaData, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-700 font-medium text-base">Consultando satélites de la NASA en tiempo real...</p>
        <p className="text-slate-400 text-xs mt-1">Conectando con NASA POWER Climatology, sensor SMAP y MODIS 250m</p>
      </div>
    );
  }

  if (!nasaData) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500">
        <Database className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p>No hay información satelital disponible para este terreno.</p>
      </div>
    );
  }

  const { clima, smap, modis, metadata } = nasaData;

  // Helper for alert colors
  const getAlertBadge = (level) => {
    switch (level) {
      case 'critica':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
          classes: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'advertencia':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          classes: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
    }
  };

  const smapBadge = getAlertBadge(smap?.nivel_alerta);

  return (
    <div className="space-y-6">
      {/* Telemetry Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="font-semibold text-base text-white">Telemetría Agroclimática Espacial</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30">
                {metadata?.estado_fuente === 'NASA_LIVE' ? '📡 NASA En Vivo' : '🔄 Modelo Calibrado'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {metadata?.fuente} • Mes analizado: <strong className="text-emerald-300">{metadata?.mes_evaluado}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-300 bg-black/30 px-3 py-2 rounded-xl border border-white/10">
            <div className="flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>{metadata?.coordenadas?.lat}°, {metadata?.coordenadas?.lon}°</span>
            </div>
            <div className="border-l border-white/20 pl-3">
              <span>Elevación: </span>
              <strong className="text-white">{metadata?.elevacion_msnm} msnm</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Temperatura (NASA POWER) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temperatura 2m</span>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{clima?.temperatura_actual_promedio_c}°C</span>
            <span className="text-xs text-slate-500">promedio mensual</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Promedio anual: <strong className="text-slate-700">{clima?.temperatura_anual_promedio_c}°C</strong>
          </p>

          {/* Mini thermal status */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Sensor:</span>
            <span className="font-medium text-slate-700">NASA POWER (T2M)</span>
          </div>
        </div>

        {/* 2. Precipitación (NASA POWER) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Precipitación</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{clima?.precipitacion_mes_actual_mm}</span>
            <span className="text-sm font-semibold text-slate-600">mm/mes</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Régimen diario: <strong className="text-slate-700">{clima?.precipitacion_diaria_promedio_mm} mm/día</strong>
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Acumulado anual:</span>
            <span className="font-medium text-slate-700">{clima?.precipitacion_anual_acumulada_mm} mm</span>
          </div>
        </div>

        {/* 3. Humedad de Suelo (NASA SMAP) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Humedad Suelo</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{smap?.humedad_superficie_porcentaje}%</span>
            <span className="text-xs text-slate-500">saturación</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Volumétrica: <strong className="text-slate-700">{smap?.humedad_volumetrica_m3_m3} m³/m³</strong>
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Satélite:</span>
            <span className="font-medium text-cyan-700">NASA SMAP L3/L4</span>
          </div>
        </div>

        {/* 4. Vigor Vegetal (NASA MODIS NDVI) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Índice NDVI</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{modis?.ndvi_actual}</span>
            <span className="text-xs text-slate-500">escala -1 a +1</span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: modis?.color_hex || '#22c55e' }}
            ></span>
            <span className="text-xs font-medium text-slate-700">{modis?.clasificacion_vigor}</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Sensor:</span>
            <span className="font-medium text-emerald-700">MODIS Terra/Aqua</span>
          </div>
        </div>
      </div>

      {/* Deep Dive: SMAP & MODIS Detailed Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMAP Deep Dive */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Diagnóstico Hídrico de Suelo (SMAP)</h4>
                <p className="text-xs text-slate-500">Misión NASA Soil Moisture Active Passive</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-cyan-100 text-cyan-800">
              Profundidad: 0-5 cm
            </span>
          </div>

          {/* Moisture Bar Gauge */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Nivel de humedad actual:</span>
              <strong className="text-slate-900 font-bold">{smap?.humedad_superficie_porcentaje}%</strong>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(5, smap?.humedad_superficie_porcentaje || 0))}%`,
                  backgroundColor:
                    smap?.humedad_superficie_porcentaje < 30
                      ? '#ef4444'
                      : smap?.humedad_superficie_porcentaje < 50
                      ? '#f59e0b'
                      : '#06b6d4'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 px-1">
              <span>Déficit (&lt;30%)</span>
              <span>Óptimo (40-75%)</span>
              <span>Saturación (&gt;85%)</span>
            </div>
          </div>

          {/* Condition and Advice */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${smapBadge.classes}`}>
            {smapBadge.icon}
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide">
                Condición: {smap?.condicion_humedad}
              </p>
              <p className="text-xs mt-1 leading-relaxed">
                {smap?.recomendacion_riego}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Humedad en zona radicular profunda:</span>
            <strong className="text-slate-700">{smap?.humedad_zona_radicular_porcentaje}%</strong>
          </div>
        </div>

        {/* MODIS NDVI Deep Dive */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Monitoreo de Vegetación y Biomasa (MODIS)</h4>
                <p className="text-xs text-slate-500">Espectrorradiómetro MOD13Q1 250m</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800">
              EVI: {modis?.evi_indice_mejorado}
            </span>
          </div>

          {/* NDVI Bar Gauge */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Valor NDVI calculado:</span>
              <strong className="text-slate-900 font-bold">{modis?.ndvi_actual}</strong>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.max(5, (modis?.ndvi_actual || 0) * 100))}%`,
                  backgroundColor: modis?.color_hex || '#22c55e'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 px-1">
              <span>Suelo desnudo (&lt;0.2)</span>
              <span>Moderado (0.4)</span>
              <span>Denso/Óptimo (&gt;0.7)</span>
            </div>
          </div>

          {/* Interpretation */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-950">
            <p className="font-semibold text-xs uppercase tracking-wide text-emerald-900">
              Estado de Canopia: {modis?.clasificacion_vigor}
            </p>
            <p className="text-xs mt-1 text-emerald-800 leading-relaxed">
              {modis?.interpretacion_agronomica}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Radiación Solar Disponible:</span>
            <strong className="text-slate-700 flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{clima?.radiacion_solar_mj_m2_dia} MJ/m²/día</span>
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
