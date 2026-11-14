import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TerrenosList from './components/TerrenosList';
import TerrenoDetail from './components/TerrenoDetail';
import MapView from './components/MapView';
import TerrenoFormModal from './components/TerrenoFormModal';
import { api } from './services/api';
import { Sprout, Map, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [terrenos, setTerrenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'detail' | 'map'
  const [selectedTerreno, setSelectedTerreno] = useState(null);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerreno, setEditingTerreno] = useState(null);
  const [prefilledCoords, setPrefilledCoords] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTerrenos = async () => {
    try {
      setLoading(true);
      const res = await api.getTerrenos();
      if (res.success) {
        setTerrenos(res.data);
      }
    } catch (err) {
      console.error('Error al cargar terrenos:', err);
      showToast('Error al conectar con la base de datos de terrenos', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTerrenos();
  }, []);

  const handleSelectTerreno = (terreno) => {
    setSelectedTerreno(terreno);
    setCurrentView('detail');
  };

  const handleOpenNewModal = () => {
    setEditingTerreno(null);
    setPrefilledCoords(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (terreno) => {
    setEditingTerreno(terreno);
    setPrefilledCoords(null);
    setIsModalOpen(true);
  };

  const handleOpenCreateWithCoords = (lat, lon) => {
    setEditingTerreno(null);
    setPrefilledCoords({ lat, lon });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTerreno) {
      await api.updateTerreno(editingTerreno.id, formData);
      showToast('Terreno actualizado exitosamente');
    } else {
      await api.createTerreno(formData);
      showToast('Nuevo terreno registrado con éxito. Telemetría NASA sincronizada.');
    }
    await loadTerrenos();
    if (selectedTerreno && editingTerreno && selectedTerreno.id === editingTerreno.id) {
      setSelectedTerreno({ ...selectedTerreno, ...formData });
    }
  };

  const handleDeleteTerreno = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este terreno?')) return;
    try {
      await api.deleteTerreno(id);
      showToast('Terreno eliminado');
      if (selectedTerreno && selectedTerreno.id === id) {
        setSelectedTerreno(null);
        setCurrentView('list');
      }
      loadTerrenos();
    } catch (err) {
      showToast('Error al eliminar terreno', 'error');
    }
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    loadTerrenos();
    showToast('Datos satelitales y catálogo sincronizados');
  };

  const renderMainContent = () => {
    if (currentView === 'detail' && selectedTerreno) {
      return (
        <TerrenoDetail
          terreno={selectedTerreno}
          onBack={() => setCurrentView('list')}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTerreno}
        />
      );
    }

    if (currentView === 'map') {
      return (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Mapa Satelital de Parcelas Agrícolas</h2>
              <p className="text-xs text-slate-500">
                Haz clic en cualquier punto del mapa para consultar telemetría NASA (POWER, SMAP y MODIS) al instante.
              </p>
            </div>
            <button
              onClick={handleOpenNewModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
            >
              + Agregar Terreno
            </button>
          </div>

          <MapView
            terrenos={terrenos}
            selectedTerreno={selectedTerreno}
            onSelectTerreno={handleSelectTerreno}
            onOpenCreateWithCoords={handleOpenCreateWithCoords}
          />
        </div>
      );
    }

    return (
      <TerrenosList
        terrenos={terrenos}
        loading={loading}
        onSelectTerreno={handleSelectTerreno}
        onEditTerreno={handleOpenEditModal}
        onDeleteTerreno={handleDeleteTerreno}
        onOpenNewModal={handleOpenNewModal}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold border ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobileSimulator={isMobileSimulator}
        setIsMobileSimulator={setIsMobileSimulator}
        onOpenNewModal={handleOpenNewModal}
        totalTerrenos={terrenos.length}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isMobileSimulator ? (
          /* Mobile Device Frame Mockup (Web & Móvil preview from Figma) */
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-4">
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
                📱 Simulador Móvil Interactivo (Figma Ready)
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Visualización responsive optimizada para dispositivos móviles de agricultores
              </p>
            </div>

            <div className="w-[390px] max-w-full h-[780px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
              {/* Speaker & camera notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mr-2"></div>
                <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
              </div>

              {/* Mobile Screen Container */}
              <div className="bg-slate-50 w-full h-full rounded-[38px] overflow-y-auto pt-8 pb-16 px-3 flex flex-col">
                <div className="mb-3 px-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Módulo Terrenos
                  </span>
                  <h3 className="font-black text-slate-900 text-base">Mis Parcelas</h3>
                </div>
                <div className="flex-1">{renderMainContent()}</div>
              </div>

              {/* Mobile Bottom Navigation Bar */}
              <div className="absolute bottom-3 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-2 flex items-center justify-around z-30 shadow-lg">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`flex flex-col items-center text-[10px] font-medium ${
                    currentView === 'list' ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <Sprout className="w-4 h-4 mb-0.5" />
                  <span>Parcelas</span>
                </button>
                <button
                  onClick={() => setCurrentView('map')}
                  className={`flex flex-col items-center text-[10px] font-medium ${
                    currentView === 'map' ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <Map className="w-4 h-4 mb-0.5" />
                  <span>Mapa</span>
                </button>
                <button
                  onClick={handleOpenNewModal}
                  className="bg-emerald-600 text-white rounded-xl p-2 shadow-md hover:bg-emerald-500"
                >
                  <span className="text-xs font-bold px-1">+</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          renderMainContent()
        )}
      </main>

      {/* Terreno Create/Edit Modal */}
      <TerrenoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTerreno}
        prefilledCoords={prefilledCoords}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AgroAsist • Módulo Terrenos (Prototipo Web & Móvil)</span>
          <span>Integración: NASA POWER API (T2M, Rain, Rad) • SMAP • MODIS NDVI</span>
        </div>
      </footer>
    </div>
  );
}
