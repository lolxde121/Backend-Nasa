import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TerrenosList from './components/TerrenosList';
import CrearTerrenoView from './components/CrearTerrenoView';
import TerrenoDetail from './components/TerrenoDetail';
import { api } from './services/api';
import { Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentNav, setCurrentNav] = useState('terrenos'); // 'inicio' | 'terrenos' | 'recomendaciones' | 'seguimiento' | 'graficas'
  const [viewState, setViewState] = useState('list'); // 'list' | 'create' | 'detail'
  const [terrenos, setTerrenos] = useState([]);
  const [selectedTerreno, setSelectedTerreno] = useState(null);
  const [editingTerreno, setEditingTerreno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      console.error('Error cargando terrenos:', err);
      showToast('Error al conectar con la base de datos de terrenos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerrenos();
  }, []);

  const handleSelectTerreno = (terreno) => {
    setSelectedTerreno(terreno);
    setViewState('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreate = () => {
    setEditingTerreno(null);
    setViewState('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (terreno) => {
    setEditingTerreno(terreno);
    setViewState('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (formData) => {
    if (editingTerreno) {
      await api.updateTerreno(editingTerreno.id, formData);
      showToast('Terreno actualizado correctamente');
    } else {
      await api.createTerreno(formData);
      showToast('Terreno creado exitosamente. Telemetría NASA sincronizada.');
    }
    await loadTerrenos();
    setViewState('list');
  };

  const handleDeleteTerreno = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este terreno?')) return;
    try {
      await api.deleteTerreno(id);
      showToast('Terreno eliminado');
      if (selectedTerreno && selectedTerreno.id === id) {
        setSelectedTerreno(null);
      }
      setViewState('list');
      loadTerrenos();
    } catch (err) {
      showToast('Error al eliminar terreno', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F7FB] flex text-[#0F1F33]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-xs font-semibold bg-white border border-[#E1E8F0] text-[#0F1F33]">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#2BB3A3] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar (Fixed) */}
      <div className="hidden md:block">
        <Sidebar
          currentNav={currentNav}
          setCurrentNav={(nav) => {
            setCurrentNav(nav);
            if (nav === 'terrenos') setViewState('list');
          }}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="relative w-64 bg-white z-50 flex flex-col">
            <Sidebar
              currentNav={currentNav}
              setCurrentNav={(nav) => {
                setCurrentNav(nav);
                setMobileMenuOpen(false);
                if (nav === 'terrenos') setViewState('list');
              }}
            />
          </div>
          <div
            className="flex-1 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden bg-white border-b border-[#E1E8F0] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-[#0F1F33] hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-base text-[#0F1F33]">AgroMonitor</span>
          <div className="w-5" />
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {viewState === 'create' && (
            <CrearTerrenoView
              onCancel={() => setViewState('list')}
              onSubmit={handleFormSubmit}
              initialData={editingTerreno}
            />
          )}

          {viewState === 'detail' && selectedTerreno && (
            <TerrenoDetail
              terreno={selectedTerreno}
              onBack={() => setViewState('list')}
              onEdit={handleOpenEdit}
            />
          )}

          {viewState === 'list' && (
            <TerrenosList
              terrenos={terrenos}
              loading={loading}
              onSelectTerreno={handleSelectTerreno}
              onOpenCreateModal={handleOpenCreate}
              onEditTerreno={handleOpenEdit}
              onDeleteTerreno={handleDeleteTerreno}
            />
          )}
        </main>
      </div>
    </div>
  );
}
