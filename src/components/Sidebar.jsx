import {
  Crown,
  Rocket,
  X,
  ChevronDown,
} from "lucide-react";
import React, { useState } from "react";
import { menuItems } from "../data/data";
import { useNavigate } from "react-router-dom";

// Importando o logo diretamente
import logo from "../assets/logo.png";

function Sidebar({ sidebar, setSidebarOpen, activeTab, setActiveTab }) {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleMenuClick = (item) => {
    if (item.type === "single") {
      navigate(item.path || "/dashboard");
      setSidebarOpen(false);
    } else if (item.type === "submenu") {
      toggleSubmenu(item.id);
    }
  };

  const handleSubmenuItemClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const isSubmenuOpen = (menuId) => {
    return openSubmenus[menuId] || false;
  };

  return (
    <div
      className={`${
        sidebar ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-80 backdrop-blur-2xl border-r transform transition-all duration-700 ease-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shadow-2xl`}
      style={{
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)',
        borderColor: '#2a2a2a'
      }}
    >
      {/* Efeitos de Background Animados - Tons de Verde Imperial */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#106a37]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0a4f2e]/10 rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#106a37]/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Efeitos de grade sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,106,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,106,55,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_70%,transparent_100%)]"></div>
      </div>

      {/* Header do Sidebar - Design Imperial */}
      <div 
        className="relative flex items-center justify-between h-28 px-6 border-b flex-shrink-0 z-10"
        style={{ borderColor: '#2a2a2a' }}
      >
        <div
          className="flex items-center space-x-4 group cursor-pointer w-full"
          onMouseEnter={() => setHoveredItem("logo")}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() =>
            handleMenuClick({ type: "single", path: "/dashboard" })
          }
        >
          {/* Container Principal do Logo e Texto */}
          <div className="relative flex items-center space-x-4 w-full">
            {/* Logo com Efeitos Especiais */}
            <div className="relative">
              {/* Efeito de auréola pulsante em verde */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#106a37]/30 to-[#0a4f2e]/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-1000 scale-110 group-hover:scale-125 opacity-60 group-hover:opacity-80"></div>
              
              {/* Container do Logo com borda verde */}
              <div 
                className="relative w-16 h-16 flex items-center justify-center rounded-2xl backdrop-blur-sm border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,106,55,0.1) 0%, rgba(10,79,46,0.05) 100%)',
                  borderColor: 'rgba(16,106,55,0.3)'
                }}
              >
                {/* Logo da Imperial Seguros */}
                <img 
                  src={logo}
                  alt="Imperial Seguros"
                  className="h-12 w-12 object-contain transform group-hover:scale-105 transition-transform duration-500 filter drop-shadow-lg"
                  onError={(e) => {
                    console.log('Erro ao carregar logo, usando fallback');
                    e.target.style.display = 'none';
                  }}
                />

                {/* Efeito de brilho interno verde */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#106a37]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Pontos de luz verdes nos cantos */}
                <div className="absolute top-1 left-1 w-1 h-1 bg-[#4ade80] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500"></div>
                <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#22c55e] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500 animation-delay-300"></div>
              </div>

              {/* Efeito de partículas flutuantes verdes */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#4ade80] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float transition-opacity duration-500"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#22c55e] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float transition-opacity duration-500 animation-delay-200"></div>
            </div>

            {/* Texto CRM com Design Imperial */}
            <div className="flex flex-col transform group-hover:translate-x-2 transition-transform duration-500">
              <div className="relative">
                {/* Efeito de brilho atrás do texto em verde */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#106a37]/20 via-[#0a4f2e]/20 to-[#15803d]/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h1 
                  className="text-3xl font-black relative drop-shadow-2xl tracking-tight transition-all duration-500"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  CRM
                  {/* Sublinhado animado verde */}
                  <span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-700 ease-out"
                    style={{
                      background: 'linear-gradient(90deg, #4ade80, #22c55e)'
                    }}
                  ></span>
                </h1>
              </div>
              
              {/* Tagline sutil */}
              <div className="flex items-center space-x-1 mt-1">
                <div 
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80, #22c55e)'
                  }}
                ></div>
                <p 
                  className="text-xs font-medium transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #a7f3d0, #86efac)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Imperial Seguros
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão X para fechar no mobile */}
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-110 backdrop-blur-sm z-10 absolute right-4 top-4"
          style={{ color: '#a7f3d0' }}
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navegação com Scroll - Design Imperial */}
      <nav className="flex-1 overflow-y-auto mt-2 px-3 space-y-1 custom-scrollbar relative z-10 py-4">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.path;
          const hasSubmenu = item.type === "submenu";
          const isOpen = isSubmenuOpen(item.id);
          const IconComponent = item.icon;

          // Adicionar linha divisória após "Cotações"
          const showDivider = item.label === "Cotações";

          return (
            <div key={item.id} className="space-y-1 relative">
              {/* Efeito de brilho no hover - Verde Imperial */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 blur-md transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,106,55,0.3), rgba(10,79,46,0.2))',
                  opacity: hoveredItem === item.id ? 0.2 : 0,
                  transform: hoveredItem === item.id ? 'scale(1.05)' : 'scale(1)'
                }}
              ></div>

              {/* Item Principal */}
              <button
                className={`w-full flex items-center justify-between px-4 py-4 text-left rounded-xl transition-all duration-500 group relative overflow-hidden backdrop-blur-sm ${
                  isActive
                    ? "text-white shadow-lg scale-[1.02]"
                    : "text-gray-300/80 hover:text-white bg-white/5 hover:bg-white/10"
                }`}
                style={{
                  border: isActive 
                    ? '1px solid rgba(16,106,55,0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(16,106,55,0.3), rgba(10,79,46,0.2))'
                    : ''
                }}
                onClick={() => handleMenuClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Efeito de onda no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>

                {/* Linha brilhante lateral - Verde Imperial */}
                <div
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 rounded-r-full transition-all duration-500"
                  style={{
                    background: 'linear-gradient(to bottom, #4ade80, #22c55e)',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'scaleY(1)' : 'scaleY(0.5)'
                  }}
                ></div>

                <div className="flex items-center relative z-10 flex-1">
                  {/* Ícone com efeito flutuante */}
                  <div
                    className={`relative p-2 rounded-xl mr-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${
                      isActive
                        ? "bg-white/20 shadow-inner shadow-white/20"
                        : "bg-white/10 group-hover:bg-white/20"
                    }`}
                  >
                    {/* Brilho atrás do ícone - Verde */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm"
                      style={{
                        background: 'linear-gradient(135deg, #4ade80, #22c55e)'
                      }}
                    ></div>
                    <IconComponent
                      className={`h-5 w-5 relative z-10 transition-all duration-300 ${
                        isActive
                          ? "text-white scale-110"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                  </div>

                  {/* Label com efeito de brilho */}
                  <span
                    className={`font-semibold relative transition-all duration-500 flex-1 ${
                      isActive
                        ? "text-white drop-shadow-lg"
                        : "text-gray-300/90 group-hover:text-white group-hover:drop-shadow-md"
                    }`}
                  >
                    {item.label}
                    {/* Sublinhado animado - Verde Imperial */}
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500"
                      style={{
                        background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                        width: isActive ? '100%' : (hoveredItem === item.id ? '100%' : '0')
                      }}
                    ></span>
                  </span>

                  {/* Badge para contadores nos menus principais */}
                  {item.badge && (
                    <span 
                      className="text-xs font-bold px-2 py-1 rounded-full ml-2 transition-all duration-300 whitespace-nowrap"
                      style={{
                        background: 'rgba(16,106,55,0.3)',
                        color: '#86efac',
                        border: '1px solid rgba(16,106,55,0.5)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Seta animada apenas para submenus */}
                {hasSubmenu && (
                  <div
                    className={`relative z-10 transition-all duration-500 transform ${
                      isOpen
                        ? "rotate-180"
                        : "text-gray-400/60 group-hover:text-green-300"
                    }`}
                    style={{
                      color: isOpen ? '#4ade80' : ''
                    }}
                  >
                    <ChevronDown className="h-4 w-4 transition-transform duration-500" />
                  </div>
                )}
              </button>

              {/* Submenu com animação de expansão */}
              {hasSubmenu && (
                <div
                  className={`overflow-hidden transition-all duration-700 ease-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-6 space-y-1 pt-1">
                    {item.submenu.map((subItem) => {
                      const isSubActive = activeTab === subItem.path;
                      const SubIconComponent = subItem.icon;

                      return (
                        <button
                          key={subItem.id}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-500 group relative overflow-hidden backdrop-blur-sm ${
                            isSubActive
                              ? "text-white shadow-md scale-[1.02]"
                              : "text-gray-300/70 hover:text-white bg-white/3 hover:bg-white/8"
                          }`}
                          style={{
                            border: isSubActive 
                              ? '1px solid rgba(16,106,55,0.4)'
                              : '1px solid rgba(255,255,255,0.1)',
                            background: isSubActive
                              ? 'linear-gradient(135deg, rgba(16,106,55,0.25), rgba(10,79,46,0.15))'
                              : ''
                          }}
                          onClick={() => handleSubmenuItemClick(subItem.path)}
                          onMouseEnter={() => setHoveredItem(subItem.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div className="flex items-center relative z-10 flex-1">
                            {/* Ícone do subitem */}
                            <div
                              className={`p-1.5 rounded-lg mr-3 transition-all duration-500 group-hover:scale-110 relative z-10 ${
                                isSubActive
                                  ? "bg-white/20"
                                  : "bg-white/5 group-hover:bg-white/10"
                              }`}
                            >
                              <SubIconComponent
                                className={`h-4 w-4 transition-colors duration-300 ${
                                  isSubActive
                                    ? "text-white"
                                    : "text-gray-400 group-hover:text-white"
                                }`}
                              />
                            </div>

                            {/* Label do subitem */}
                            <div className="flex flex-col flex-1 min-w-0">
                              <span
                                className={`text-sm font-medium relative z-10 transition-all duration-300 ${
                                  isSubActive
                                    ? "text-white"
                                    : "group-hover:text-white"
                                }`}
                              >
                                {subItem.label}
                              </span>
                              {/* Formato dos relatórios */}
                              {subItem.formats && (
                                <span className="text-xs text-gray-400 mt-1">
                                  {subItem.formats}
                                </span>
                              )}
                            </div>

                            {/* Badge para contadores */}
                            {subItem.badge && (
                              <span 
                                className="text-xs font-bold px-2 py-1 rounded-full ml-2 transition-all duration-300 whitespace-nowrap"
                                style={{
                                  background: 'rgba(16,106,55,0.3)',
                                  color: '#86efac',
                                  border: '1px solid rgba(16,106,55,0.5)'
                                }}
                              >
                                {subItem.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linha divisória após Cotações */}
              {showDivider && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: 'rgba(16,106,55,0.3)' }}></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span 
                      className="px-3 text-xs rounded-full backdrop-blur-sm"
                      style={{
                        color: '#86efac',
                        background: 'rgba(16,106,55,0.2)',
                        border: '1px solid rgba(16,106,55,0.3)'
                      }}
                    >
                      Sistema CRM
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Card CRM Pro - Design Imperial */}
      <div 
        className="flex-shrink-0 p-4 border-t backdrop-blur-lg relative overflow-hidden"
        style={{
          borderColor: '#2a2a2a',
          background: 'linear-gradient(135deg, rgba(16,106,55,0.1), rgba(10,79,46,0.05))'
        }}
      >
        {/* Efeitos de background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-20 h-20 bg-[#106a37]/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#0a4f2e]/10 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#106a37] rounded-xl blur-md opacity-50"></div>
              <div 
                className="relative p-2 rounded-xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #106a37, #0a4f2e)'
                }}
              >
                <Crown className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm drop-shadow">
                CRM Imperial
              </h3>
              <p 
                className="text-xs truncate"
                style={{ color: '#86efac' }}
              >
                ✨ Gestão Completa
              </p>
            </div>
          </div>
          <button 
            className="w-full relative overflow-hidden group text-white py-3 rounded-xl font-semibold hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #106a37, #0a4f2e)'
            }}
          >
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Partículas animadas */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-particle1"></div>
              <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-particle2"></div>
            </div>

            <span className="relative z-10 flex items-center justify-center">
              <Rocket className="w-4 h-4 inline mr-2 transform group-hover:translate-y-[-2px] transition-transform duration-300" />
              Explorar Recursos
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 1;
          }
          50% {
            transform: translateY(-8px) translateX(4px);
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16,106,55,0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #106a37, #0a4f2e);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #15803d, #106a37);
        }

        @keyframes drip {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(20px) scale(0.5);
            opacity: 0;
          }
        }

        .animate-drip {
          animation: drip 1s ease-in-out infinite;
        }

        @keyframes particle1 {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10%,
          90% {
            opacity: 1;
          }
          50% {
            transform: translateY(-10px) translateX(10px);
          }
        }

        @keyframes particle2 {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          20%,
          80% {
            opacity: 1;
          }
          60% {
            transform: translateY(-8px) translateX(-8px);
          }
        }

        .animate-particle1 {
          animation: particle1 3s ease-in-out infinite;
        }

        .animate-particle2 {
          animation: particle2 3s ease-in-out infinite 1.5s;
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-slower {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}

export default Sidebar;