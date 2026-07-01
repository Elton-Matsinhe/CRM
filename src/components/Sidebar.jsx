import {
  Crown,
  Rocket,
  X,
  ChevronDown,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { menuItems } from "../data/data";
import { menuLabelKeys } from "../i18n/menuKeys";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { cotacaoService } from "../services/api";

// Importando o logo diretamente
import logo from "../assets/logo.png";

function Sidebar({ sidebar, setSidebarOpen, sidebarCollapsed, activeTab }) {
  const { theme, themeConfig } = useTheme();
  const { t } = useTranslation();
  const { usuario } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [submenuScrollable, setSubmenuScrollable] = useState({});
  const [menuItemsComBadges, setMenuItemsComBadges] = useState(menuItems);
  const submenuRefs = useRef({});
  const navigate = useNavigate();

  const isCollapsed = sidebarCollapsed;

  const isItemActive = (item) => {
    if (item.path) return activeTab === item.path;
    if (item.submenu) return item.submenu.some((s) => activeTab === s.path);
    return false;
  };

  const getLabel = (id, fallback) => {
    const key = menuLabelKeys[id];
    return key ? t(key) : fallback;
  };

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

  // Carregar badges dinâmicos
  useEffect(() => {
    carregarBadgesDinamicos();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      carregarBadgesDinamicos();
    }, 30000);

    // Escutar evento de cotação criada para atualizar badges
    const handleCotacaoCriada = () => {
      carregarBadgesDinamicos();
    };

    window.addEventListener('cotacaoCriada', handleCotacaoCriada);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cotacaoCriada', handleCotacaoCriada);
    };
  }, []);

  // Abrir submenu do item activo automaticamente
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu?.some((s) => activeTab === s.path)) {
        setOpenSubmenus((prev) => ({ ...prev, [item.id]: true }));
      }
    });
  }, [activeTab]);

  // Carregar badges dinamicamente
  const carregarBadgesDinamicos = async () => {
    try {
      const result = await cotacaoService.buscarStats();
      if (result.success && result.data) {
        const { total, ativas } = result.data;
        const menuAtualizado = menuItems.map((item) => {
          if (item.id === 3) return { ...item, badge: String(total) };
          if (item.id === 5) return { ...item, badge: String(ativas) };
          if (item.id === 9) return { ...item, badge: String(result.data.aprovacao_aguardando || 0) };
          return item;
        });
        setMenuItemsComBadges(menuAtualizado);
      }
    } catch (error) {
      console.error("Erro ao carregar badges:", error);
    }
  };

  // Verificar se o submenu precisa de scroll
  useEffect(() => {
    const checkSubmenuHeight = () => {
      const newScrollable = {};
      Object.keys(submenuRefs.current).forEach((menuId) => {
        const element = submenuRefs.current[menuId];
        if (element) {
          // Se o submenu tiver mais de 5 itens, ativar scroll
          const itemCount = element.querySelectorAll('button').length;
          newScrollable[menuId] = itemCount > 5;
        }
      });
      setSubmenuScrollable(newScrollable);
    };

    checkSubmenuHeight();
    // Recalcular quando os submenus abrem/fecham
    const timeoutId = setTimeout(checkSubmenuHeight, 300);
    return () => clearTimeout(timeoutId);
  }, [openSubmenus]);

  // Obter cores do tema atual para sidebar
  const sidebarStyle = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
    borderColor: themeConfig.border,
    activeBg: themeConfig.sidebarActive,
    primary: themeConfig.primary,
    hoverGlow: themeConfig.hoverGlow,
  };

  return (
    <div
      className={`${
        sidebar ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-[60] backdrop-blur-xl border-r transform transition-all duration-300 ease-out lg:translate-x-0 flex flex-col shadow-xl overflow-visible ${
        isCollapsed ? 'w-[72px]' : 'w-72'
      }`}
      style={{
        background: sidebarStyle.background,
        borderColor: sidebarStyle.borderColor,
      }}
    >
      {/* Efeitos de Background — leves, sem animação contínua */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-60"
          style={{ background: sidebarStyle.hoverGlow }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: sidebarStyle.hoverGlow }}
        />
      </div>

      {/* Header do Sidebar - Design Limpo */}
      <div 
        className="relative flex items-center justify-center h-32 px-6 border-b flex-shrink-0 z-10"
        style={{ borderColor: '#e5e7eb' }}
      >
        {/* Container do Logo Centralizado - Oculto quando colapsado */}
        {!isCollapsed && (
          <div
            className="flex items-center justify-center group cursor-pointer w-full"
            onMouseEnter={() => setHoveredItem("logo")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() =>
              handleMenuClick({ type: "single", path: "/dashboard" })
            }
          >
            {/* Logo com Efeitos Especiais - Sem borda */}
            <div className="relative">
              {/* Efeito de auréola pulsante sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#106a37]/10 to-[#0a4f2e]/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-1000 scale-110 group-hover:scale-125 opacity-40 group-hover:opacity-60"></div>
              
              {/* Container do Logo SEM borda - Aumentado */}
              <div 
                className="relative w-50 h-50 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-2"
              >
                {/* Logo da Imperial - Aumentado significativamente */}
                <img 
                  src={logo}
                  alt="Imperial Insurance"
                  className="h-50 w-50 object-contain transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    console.log('Erro ao carregar logo, usando fallback');
                    e.target.style.display = 'none';
                  }}
                />

                {/* Efeito de brilho interno verde suave */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#106a37]/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Pontos de luz verdes nos cantos - sutis */}
                <div className="absolute top-3 left-3 w-2 h-2 bg-[#106a37] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500"></div>
                <div className="absolute bottom-3 right-3 w-2 h-2 bg-[#0a4f2e] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500 animation-delay-300"></div>
              </div>

              {/* Efeito de partículas flutuantes verdes - sutis */}
              <div className="absolute -top-3 -right-3 w-2.5 h-2.5 bg-[#106a37] rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-float transition-opacity duration-500"></div>
              <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-[#0a4f2e] rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-float transition-opacity duration-500 animation-delay-200"></div>
            </div>
          </div>
        )}

        {/* Botão X para fechar no mobile */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110 backdrop-blur-sm z-10 absolute right-4 top-4"
          style={{ color: '#374151' }}
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navegação com Scroll - Design Limpo */}
      <nav className={`flex-1 overflow-y-auto mt-2 ${isCollapsed ? 'px-2' : 'px-3'} space-y-1 custom-scrollbar relative z-10 py-4`}>
        {menuItemsComBadges
          .filter((item) => !item.adminOnly || usuario?.role === 'admin')
          .filter((item) => !item.approverOnly || usuario?.role === 'admin' || usuario?.role === 'subscritor')
          .map((item, index) => {
          const isActive = isItemActive(item);
          const hasSubmenu = item.type === "submenu";
          const isOpen = isSubmenuOpen(item.id);
          const IconComponent = item.icon;
          const needsScroll = submenuScrollable[item.id];
          const label = getLabel(item.id, item.label);

          const showDivider = item.id === 2 && !isCollapsed;

          return (
            <div key={item.id} className="space-y-1 relative overflow-visible">
              <button
                className={`menu-neon-hover w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-3 text-left rounded-xl relative overflow-hidden transition-all duration-300 ${
                  isActive ? 'menu-item-active' : ''
                }`}
                style={{
                  border: isActive ? '2px solid rgba(255,255,255,0.55)' : '1px solid rgba(209,213,219,0.75)',
                  background: isActive ? sidebarStyle.activeBg : 'rgba(255,255,255,0.85)',
                  boxShadow: isActive
                    ? `0 6px 24px ${sidebarStyle.hoverGlow}, inset 0 1px 0 rgba(255,255,255,0.2)`
                    : hoveredItem === item.id
                    ? `0 4px 16px ${sidebarStyle.hoverGlow}`
                    : 'none',
                  outline: 'none',
                }}
                onClick={() => handleMenuClick(item)}
                onMouseEnter={(e) => {
                  setHoveredItem(item.id);
                  if (isCollapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({
                      top: rect.top + rect.height / 2,
                      left: rect.right + 10,
                      text: label,
                    });
                  }
                }}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setTooltipPos(null);
                }}
              >
                {/* Indicador activo — barra lateral */}
                {isActive && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #fff, rgba(255,255,255,0.4))' }}
                  />
                )}

                {/* Glow pulsante no hover (sem sublinhado) */}
                {hoveredItem === item.id && !isActive && (
                  <span className="menu-hover-glow absolute inset-0 rounded-xl pointer-events-none" />
                )}

                <div className="flex items-center relative z-10 flex-1 min-w-0">
                  <div
                    className={`relative p-2 rounded-lg flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} transition-transform duration-300 ${
                      hoveredItem === item.id && !isActive ? 'scale-110' : ''
                    } ${isActive ? 'bg-white/35' : 'bg-gray-100 border border-gray-200'}`}
                    style={
                      isActive && isCollapsed
                        ? { boxShadow: `0 0 0 3px rgba(255,255,255,0.45)` }
                        : undefined
                    }
                  >
                    <IconComponent
                      className="h-5 w-5"
                      style={{
                        color: isActive ? '#fff' : hoveredItem === item.id ? sidebarStyle.primary : '#6b7280',
                      }}
                    />
                  </div>

                  {!isCollapsed && (
                    <span className={`font-medium truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
                      {label}
                    </span>
                  )}

                  {item.badge && !isCollapsed && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.35)' : sidebarStyle.hoverGlow,
                        color: isActive ? '#fff' : sidebarStyle.primary,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {hasSubmenu && !isCollapsed && (
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 relative z-10 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: isActive ? '#fff' : sidebarStyle.primary }}
                  />
                )}
              </button>

              {/* Submenu com animação de expansão e scroll quando necessário - Oculto quando colapsado */}
              {hasSubmenu && !isCollapsed && (
                <div
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div 
                    ref={(el) => submenuRefs.current[item.id] = el}
                    className={`ml-6 space-y-1 pt-1 ${
                      needsScroll ? 'max-h-[250px] overflow-y-auto pr-2 submenu-scrollbar' : ''
                    }`}
                  >
                    {item.submenu.map((subItem) => {
                      const isSubActive = activeTab === subItem.path;
                      const SubIconComponent = subItem.icon;

                      const subLabel = getLabel(subItem.id, subItem.label);

                      return (
                        <button
                          key={subItem.id}
                          className={`menu-neon-hover w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg relative overflow-hidden transition-all duration-300 ${
                            isSubActive ? '' : ''
                          }`}
                          style={{
                            border: isSubActive ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(209,213,219,0.6)',
                            background: isSubActive ? sidebarStyle.activeBg : 'rgba(255,255,255,0.9)',
                            boxShadow: isSubActive ? `0 4px 16px ${sidebarStyle.hoverGlow}` : 'none',
                            outline: 'none',
                            marginBottom: '2px',
                          }}
                          onClick={() => handleSubmenuItemClick(subItem.path)}
                          onMouseEnter={() => setHoveredItem(subItem.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          {hoveredItem === subItem.id && !isSubActive && (
                            <span className="menu-hover-glow absolute inset-0 rounded-lg pointer-events-none" />
                          )}
                          {isSubActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-white/80" />
                          )}
                          <div className="flex items-center relative z-10 flex-1 min-w-0">
                            <div className={`p-1.5 rounded-md mr-2 flex-shrink-0 ${isSubActive ? 'bg-white/35' : 'bg-gray-100 border border-gray-200'}`}>
                              <SubIconComponent
                                className="h-3.5 w-3.5"
                                style={{ color: isSubActive ? '#fff' : hoveredItem === subItem.id ? sidebarStyle.primary : '#6b7280' }}
                              />
                            </div>
                            <span className={`text-sm truncate ${isSubActive ? 'text-white font-medium' : 'text-gray-700'}`}>
                              {subLabel}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Linha divisória após Cotações - Termina no início do círculo */}
              {showDivider && (
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div 
                      className="w-full border-t"
                      style={{ 
                        borderColor: 'rgba(16,106,55,0.2)',
                        margin: '0 8px' // Margem para terminar no início do círculo
                      }}
                    ></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span 
                      className="px-3 text-xs rounded-full relative z-10"
                      style={{
                        color: '#106a37',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                        border: '1px solid rgba(16,106,55,0.3)',
                        boxShadow: '0 2px 6px rgba(16,106,55,0.1)',
                        position: 'relative',
                        zIndex: 10
                      }}
                    >
                      {t('menu.sistemaCrm')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Card CRM Pro - Design Limpo - Oculto quando colapsado */}
      {!isCollapsed && (
        <div 
          className="flex-shrink-0 p-4 border-t backdrop-blur-sm relative overflow-hidden"
          style={{
            borderColor: sidebarStyle.borderColor,
            background: sidebarStyle.background
          }}
        >
          {/* Efeitos de background sutis */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-20 h-20 bg-[#106a37]/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#0a4f2e]/5 rounded-full blur-xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#106a37] rounded-lg blur-sm opacity-30"></div>
                <div 
                  className="relative p-2 rounded-lg shadow-sm"
                  style={{
                    background: sidebarStyle.activeBg,
                    boxShadow: theme === 'verde' ? '0 4px 12px rgba(16,106,55,0.2)' : theme === 'vermelho' ? '0 4px 12px rgba(220,38,38,0.2)' : '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <Crown className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 font-bold text-sm">
                  Sistema Imperial
                </h3>
                <p 
                  className="text-xs truncate"
                  style={{ color: '#106a37' }}
                >
                  ✨ Gestão Inteligente
                </p>
              </div>
            </div>
            <button 
              className="w-full relative overflow-hidden group text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-400 hover:scale-[1.02]"
              style={{
                background: sidebarStyle.activeBg,
                boxShadow: theme === 'verde' ? '0 4px 15px rgba(16,106,55,0.2)' : theme === 'vermelho' ? '0 4px 15px rgba(220,38,38,0.2)' : '0 4px 15px rgba(0,0,0,0.2)',
                border: theme === 'verde' ? '1px solid rgba(16,106,55,0.3)' : theme === 'vermelho' ? '1px solid rgba(220,38,38,0.3)' : '1px solid rgba(0,0,0,0.3)'
              }}
            >
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

              {/* Partículas animadas sutis */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-0.5 h-0.5 bg-white rounded-full animate-particle1"></div>
                <div className="absolute top-1/3 right-1/4 w-0.25 h-0.25 bg-white rounded-full animate-particle2"></div>
              </div>

              <span className="relative z-10 flex items-center justify-center">
                <Rocket className="w-3.5 h-3.5 inline mr-2 transform group-hover:translate-y-[-1px] transition-transform duration-300" />
                Explorar Recursos
              </span>
            </button>
          </div>
        </div>
      )}

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
            opacity: 0.8;
          }
          50% {
            transform: translateY(-4px) translateX(2px);
            opacity: 0.6;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        /* Estilos para scrollbar principal */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16,106,55,0.05);
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #106a37, #0a4f2e);
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #15803d, #106a37);
        }

        /* Estilos para scrollbar dos submenus */
        .submenu-scrollbar::-webkit-scrollbar {
          width: 3px;
        }

        .submenu-scrollbar::-webkit-scrollbar-track {
          background: rgba(16,106,55,0.03);
          border-radius: 6px;
          margin: 4px 0;
        }

        .submenu-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(16,106,55,0.3), rgba(10,79,46,0.3));
          border-radius: 6px;
        }

        .submenu-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(16,106,55,0.5), rgba(10,79,46,0.5));
        }

        .submenu-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(16,106,55,0.3) rgba(16,106,55,0.05);
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
            opacity: 0.6;
          }
          50% {
            transform: translateY(-6px) translateX(6px);
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
            opacity: 0.4;
          }
          60% {
            transform: translateY(-4px) translateX(-4px);
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

      {/* Tooltip fixo — fora do overflow do nav */}
      {isCollapsed && tooltipPos && (
        <div
          className="fixed z-[200] px-3 py-2 rounded-xl text-sm font-semibold text-white whitespace-nowrap pointer-events-none shadow-2xl sidebar-tooltip"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateY(-50%)',
            background: sidebarStyle.activeBg,
            boxShadow: `0 8px 32px ${sidebarStyle.hoverGlow}`,
          }}
        >
          {tooltipPos.text}
        </div>
      )}
    </div>
  );
}

export default Sidebar;