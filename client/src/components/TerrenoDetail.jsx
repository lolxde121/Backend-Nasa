import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Edit2,
  Trash2,
  MapPin,
  Maximize2,
  Layers,
  Droplet,
  User,
  Calendar,
  Satellite,
  Sprout,
  Compass,
  AlertCircle
} from 'lucide-react';
import NasaDataCard from './NasaDataCard';
import CropRecommendations from './CropRecommendations';
import MapView from './MapView';
import { api } from '../services/api';

export default function TerrenoDetail({
  terreno,
  onBack,
  onEdit,
  onDelete
}) {
  const [activeTab, setActiveTab] = useState('nasa'); // 'nasa' | 'recommendations' | 'map'
  const [nasaData, setNasaData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [loadingNasa, setLoadingNasa] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!terreno) return;
    setError(null);
    setLoadingNasa(true);
    setLoadingRecs(true);

    try {
      const [nasaRes, recsRes] = await Promise.all([
        api.getTerrenoNasaData(terreno.id),
        api.getTerrenoRecomendaciones(terreno.id)
      ]);

      if (nasaRes.success) setNasaData(nasaRes.data);
      if (recsRes.success) setRecommendationsData(recsRes.data);
    } catch (err) {
      console.error('Error al cargar telemetría y recomendaciones:', err);
      setError('No se pudo conectar con el servidor para obtener los datos.');
    } finally {
      setLoadingNasa(false);
      setLoadingRecs(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [terreno?.id]);

  const handleSync = () => {
    setSyncing(true);
    loadData();
  };

  if (!terreno) return null;

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Volver a lista"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  {terreno.estado || 'Activo'}
                </span>
                <span className="text-xs text-slate-400">ID #{terreno.id}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{terreno.nombre}</h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Satélites</span>
            </button>

            <button
              onClick={() => onEdit(terreno)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={() => onDelete(terreno.id)}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>

        {/* Plot Characteristics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Agricultor / Propietario</span>
            <strong className="text-slate-800 truncate block">{terreno.propietario}</strong>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Ubicación</span>
            <strong className="text-slate-800 truncate block">{terreno.ubicacion}</strong>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Superficie Total</span>
            <strong className="text-slate-800 block">{terreno.area_hectareas} Hectáreas</strong>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Tipo de Suelo / Riego</span>
            <strong className="text-slate-800 block truncate">{terreno.tipo_suelo} • {terreno.fuente_agua}</strong>
          </div>
        </div>

        {terreno.descripcion && (
          <p className="text-xs text-slate-500 mt-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <strong>Descripción de parcela:</strong> {terreno.descripcion}
          </p>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('nasa')}
          className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center space-x-2 ${
            activeTab === 'nasa'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Satellite className="w-4 h-4" />
          <span>Métricas Satelitales NASA</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center space-x-2 ${
            activeTab === 'recommendations'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Asistencia IA & Cultivos</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`pb-3 px-2 text-sm font-bold transition-all relative flex items-center space-x-2 ${
            activeTab === 'map'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Perímetro en Mapa</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'nasa' && (
          <NasaDataCard nasaData={nasaData} loading={loadingNasa} />
        )}

        {activeTab === 'recommendations' && (
          <CropRecommendations recommendationsData={recommendationsData} loading={loadingRecs} />
        )}

        {activeTab === 'map' && (
          <MapView
            terrenos={[terreno]}
            selectedTerreno={terreno}
            onSelectTerreno={() => {}}
            onOpenCreateWithCoords={() => {}}
          />
        )}
      </div>
    </div>
  );
}
