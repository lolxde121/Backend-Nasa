import React from 'react';
import {
  Home,
  MapPin,
  Sparkles,
  CalendarCheck,
  BarChart3,
  User,
  Satellite
} from 'lucide-react';

export default function Sidebar({ currentNav, setCurrentNav }) {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'terrenos', label: 'Terrenos', icon: MapPin },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: Sparkles },
    { id: 'seguimiento', label: 'Seguimiento', icon: CalendarCheck },
    { id: 'graficas', label: 'Gráficas', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E1E8F0] min-h-screen flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-8 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#0B3D91] flex items-center justify-center text-white shadow-sm">
            <Satellite className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <span className="font-bold text-xl text-[#0F1F33] tracking-tight">AgroMonitor</span>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentNav(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EBF4FC] text-[#0B3D91] font-semibold'
                    : 'text-[#607289] hover:bg-slate-50 hover:text-[#0F1F33]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B3D91] stroke-[2.5]' : 'text-[#607289]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Account / Footer */}
      <div className="p-4 border-t border-[#E1E8F0]">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-[#EBF4FC] border border-[#D4E7F9] flex items-center justify-center text-[#0B3D91]">
            <User className="w-4 h-4 text-[#0B3D91]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-[#0F1F33]">Mi cuenta</span>
            <span className="text-xs text-[#607289]">Agricultor</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
