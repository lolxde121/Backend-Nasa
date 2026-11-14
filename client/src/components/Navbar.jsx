import React from 'react';
import { Sprout, Map, Plus, Smartphone, Monitor, Satellite, RefreshCw } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  isMobileSimulator,
  setIsMobileSimulator,
  onOpenNewModal,
  totalTerrenos = 0,
  onRefreshData,
  isRefreshing
}) {
  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Module Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('list')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">AgroAsist</span>
                <span className="bg-emerald-800 text-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-700">
                  Módulo Terrenos
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 hidden sm:block">
                Asistencia agrícola con telemetría satelital NASA & IA
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentView === 'list'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Mis Terrenos ({totalTerrenos})</span>
            </button>

            <button
              onClick={() => setCurrentView('map')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentView === 'map'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Mapa Satelital</span>
            </button>

            {/* Toggle Web / Mobile Simulator */}
            <button
              onClick={() => setIsMobileSimulator(!isMobileSimulator)}
              title={isMobileSimulator ? 'Cambiar a vista Web completa' : 'Simular vista Móvil (Figma)'}
              className={`p-2 rounded-lg text-sm font-medium transition-colors border ${
                isMobileSimulator
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  : 'border-emerald-700 text-emerald-200 hover:bg-emerald-800/60'
              }`}
            >
              {isMobileSimulator ? (
                <div className="flex items-center space-x-1 text-xs">
                  <Monitor className="w-4 h-4" />
                  <span className="hidden md:inline">Vista Web</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden md:inline">Simulador Móvil</span>
                </div>
              )}
            </button>

            {/* New Terreno Button */}
            <button
              onClick={onOpenNewModal}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold px-3 sm:px-4 py-1.5 rounded-lg text-sm transition-all shadow hover:shadow-emerald-500/20 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Nuevo Terreno</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Satellite Info Banner */}
      <div className="bg-emerald-950/70 border-t border-emerald-800/50 px-4 py-1.5 text-xs text-emerald-300/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Satellite className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium text-emerald-200">Integración Activa:</span>
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[11px] border border-emerald-700/60">
              NASA POWER (Clima & Radiación)
            </span>
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[11px] border border-emerald-700/60">
              SMAP (Humedad Suelo)
            </span>
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[11px] border border-emerald-700/60">
              MODIS (NDVI Vegetación)
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="text-emerald-300 hover:text-white flex items-center space-x-1 text-[11px] transition-colors"
              title="Refrescar datos satelitales"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-emerald-300">En línea</span>
          </div>
        </div>
      </div>
    </header>
  );
}
