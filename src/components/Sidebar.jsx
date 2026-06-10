import {
  Crown,
  Rocket,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { menuItems } from "../data/data";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { estatisticasService, cotacaoService } from "../services/api";

// Importando o logo diretamente
import logo from "../assets/logo.png";

function Sidebar({ sidebar, setSidebarOpen, activeTab, setActiveTab }) {
  const { theme } = useTheme();
  const { usuario } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [submenuScrollable, setSubmenuScrollable] = useState({});
  const [menuItemsComBadges, setMenuItemsComBadges] = useState(menuItems);
  const submenuRefs = useRef({});
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

  // Carregar badges dinamicamente
  const carregarBadgesDinamicos = async () => {
    try {
      // Buscar todas as cotações para calcular badges
      const result = await cotacaoService.listar({ limit: 10000 });
      
      if (result.success && result.data) {
        const cotacoes = result.data;
        
        // Calcular badges
        const totalCotacoes = cotacoes.length;
        const cotacoesAtivas = cotacoes.filter(c => c.status === 'ativa' || c.status === 'pendente').length;
        
        // Atualizar menu items com badges dinâmicos
        const menuAtualizado = menuItems.map(item => {
          if (item.id === 3) { // Gestão de Cotações
            return { ...item, badge: totalCotacoes.toString() };
          }
          if (item.id === 5) { // Acompanhamento
            return { ...item, badge: cotacoesAtivas.toString() };
          }
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
  const getSidebarStyle = () => {
    switch (theme) {
      case 'verde':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
          borderColor: '#e5e7eb',
          activeBg: 'linear-gradient(135deg, #106a37, #0a4f2e)'
        };
      case 'vermelho':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #ffffff 100%)',
          borderColor: '#fee2e2',
          activeBg: 'linear-gradient(135deg, #dc2626, #b91c1c)'
        };
      case 'preto':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #ffffff 100%)',
          borderColor: '#e5e5e5',
          activeBg: 'linear-gradient(135deg, #1a1a1a, #000000)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
          borderColor: '#e5e7eb',
          activeBg: 'linear-gradient(135deg, #106a37, #0a4f2e)'
        };
    }
  };

  const sidebarStyle = getSidebarStyle();

  // Efeitos de partículas
  const [particles, setParticles] = useState([]);
  const particleCount = 20;

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.1 + 0.05,
        color: theme === 'verde' ? 'rgba(16, 106, 55, 0.1)' : 
               theme === 'vermelho' ? 'rgba(220, 38, 38, 0.1)' : 
               'rgba(0, 0, 0, 0.1)'
      });
    }
    setParticles(newParticles);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speedX) % 100,
        y: (p.y + p.speedY) % 100,
        color: theme === 'verde' ? 'rgba(16, 106, 55, 0.1)' : 
               theme === 'vermelho' ? 'rgba(220, 38, 38, 0.1)' : 
               'rgba(0, 0, 0, 0.1)'
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [theme]);

  return (
    <div
      className={`${
        sidebar ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-80'} backdrop-blur-xl border-r transform transition-all duration-700 ease-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shadow-xl`}
      style={{
        background: sidebarStyle.background,
        borderColor: sidebarStyle.borderColor
      }}
    >
      {/* Efeitos de Background Animados - Partículas sutis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Partículas flutuantes */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              filter: 'blur(1px)',
            }}
          />
        ))}
        
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#106a37]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0a4f2e]/5 rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#106a37]/3 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Efeitos de grade sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,106,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,106,55,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_70%,transparent_100%)]"></div>
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

        {/* Botão para colapsar/expandir sidebar */}
        <button
          className="hidden lg:flex absolute right-2 top-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110 backdrop-blur-sm z-10"
          style={{ color: '#374151' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir Menu" : "Ocultar Menu"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navegação com Scroll - Design Limpo */}
      <nav className={`flex-1 overflow-y-auto mt-2 ${isCollapsed ? 'px-2' : 'px-3'} space-y-1 custom-scrollbar relative z-10 py-4`}>
        {menuItemsComBadges
          .filter((item) => !item.adminOnly || usuario?.role === 'admin')
          .map((item, index) => {
          const isActive = activeTab === item.path;
          const hasSubmenu = item.type === "submenu";
          const isOpen = isSubmenuOpen(item.id);
          const IconComponent = item.icon;
          const needsScroll = submenuScrollable[item.id];

          // Adicionar linha divisória após "Cotações"
          const showDivider = item.label === "Cotações" && !isCollapsed;

          return (
            <div key={item.id} className="space-y-1 relative">
              {/* Efeito de brilho no hover - Verde sutil */}
              <div
                className="absolute inset-0 rounded-lg opacity-0 blur-sm transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(16,106,55,0.1), rgba(10,79,46,0.05))',
                  opacity: hoveredItem === item.id ? 0.1 : 0,
                  transform: hoveredItem === item.id ? 'scale(1.02)' : 'scale(1)'
                }}
              ></div>

              {/* Item Principal - Com bordas visíveis */}
              <button
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-3.5 text-left rounded-lg transition-all duration-400 group relative overflow-hidden backdrop-blur-sm ${
                  isActive
                    ? "text-white shadow-md scale-[1.02]"
                    : "text-gray-800 hover:text-gray-900 bg-white hover:bg-white"
                }`}
                style={{
                  border: isActive 
                    ? '2px solid rgba(255, 255, 255, 0.6)' // Linha branca para menus ativos
                    : '1px solid rgba(209, 213, 219, 0.8)', // Cinza mais visível
                  background: isActive
                    ? sidebarStyle.activeBg
                    : '',
                  boxShadow: isActive 
                    ? '0 4px 20px rgba(16,106,55,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.08)', // Sombra mais visível
                  outline: 'none'
                }}
                onClick={() => handleMenuClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Efeito de onda no hover - muito sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#106a37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

                {/* Linha brilhante lateral - BRANCA para menus ativos */}
                {!isCollapsed && (
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-12 rounded-r-full transition-all duration-500"
                    style={{
                      background: 'linear-gradient(to bottom, #ffffff, #f8fafc)', // Linha branca
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scaleY(1)' : 'scaleY(0.5)',
                      boxShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
                    }}
                  ></div>
                )}

                <div className="flex items-center relative z-10 flex-1">
                  {/* Ícone com efeito flutuante */}
                  <div
                    className={`relative p-2 rounded-lg ${isCollapsed ? 'mr-0' : 'mr-3'} transition-all duration-400 group-hover:scale-105 ${
                      isActive
                        ? "bg-white/40 shadow-inner shadow-white/30" // Mais branco para ativos
                        : "bg-gray-100 group-hover:bg-gray-200 border border-gray-200"
                    }`}
                    style={{
                      boxShadow: isActive 
                        ? 'inset 0 2px 6px rgba(255,255,255,0.3), 0 2px 8px rgba(255,255,255,0.2)'
                        : '0 2px 4px rgba(0,0,0,0.05)',
                      border: !isActive ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    {/* Brilho atrás do ícone - Branco para ativos */}
                    <div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-400 blur-sm"
                      style={{
                        background: isActive 
                          ? 'linear-gradient(135deg, #ffffff, #f8fafc)' // Branco para ativos
                          : 'linear-gradient(135deg, #106a37, #0a4f2e)'
                      }}
                    ></div>
                    <IconComponent
                      className={`h-5 w-5 relative z-10 transition-all duration-300 ${
                        isActive
                          ? "text-white scale-110" // Branco para ativos
                          : "text-gray-600 group-hover:text-[#106a37]"
                      }`}
                      style={{
                        filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                      }}
                    />
                  </div>

                  {/* Label com efeito de brilho - Oculto quando colapsado */}
                  {!isCollapsed && (
                    <span
                      className={`font-medium relative transition-all duration-400 flex-1 ${
                        isActive
                          ? "text-white drop-shadow-lg" // Mais contraste para ativos
                          : "text-gray-800 group-hover:text-gray-900"
                      }`}
                    >
                      {item.label}
                      {/* Sublinhado animado - BRANCO para menus ativos */}
                      <span
                        className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-400"
                        style={{
                          background: isActive 
                            ? 'linear-gradient(90deg, #ffffff, #f8fafc)' // Branco para ativos
                            : 'linear-gradient(90deg, #106a37, #0a4f2e)',
                          width: isActive ? '100%' : (hoveredItem === item.id ? '100%' : '0'),
                          boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.5)' : 'none'
                        }}
                      ></span>
                    </span>
                  )}

                  {/* Badge para contadores nos menus principais - Oculto quando colapsado */}
                  {item.badge && !isCollapsed && (
                    <span 
                      className="text-xs font-semibold px-2 py-1 rounded-full ml-2 transition-all duration-300 whitespace-nowrap"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.4)' : 'rgba(16,106,55,0.1)',
                        color: isActive ? 'white' : '#106a37',
                        border: isActive ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(16,106,55,0.3)',
                        boxShadow: isActive ? '0 2px 8px rgba(255,255,255,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Seta animada apenas para submenus - Oculto quando colapsado */}
                {hasSubmenu && !isCollapsed && (
                  <div
                    className={`relative z-10 transition-all duration-400 transform ${
                      isOpen
                        ? "rotate-180"
                        : "text-gray-500 group-hover:text-[#106a37]"
                    }`}
                    style={{
                      color: isOpen ? (isActive ? '#ffffff' : '#106a37') : ''
                    }}
                  >
                    <ChevronDown className="h-4 w-4 transition-transform duration-400" />
                  </div>
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

                      return (
                        <button
                          key={subItem.id}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-400 group relative overflow-hidden backdrop-blur-sm ${
                            isSubActive
                              ? "text-white shadow-sm scale-[1.02]"
                              : "text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50"
                          }`}
                          style={{
                            border: isSubActive 
                              ? '2px solid rgba(255, 255, 255, 0.5)' // Linha branca para submenus ativos
                              : '1px solid rgba(209, 213, 219, 0.7)', // Borda mais visível
                            background: isSubActive
                              ? sidebarStyle.activeBg
                              : '',
                            boxShadow: isSubActive 
                              ? '0 2px 12px rgba(16,106,55,0.1), 0 0 10px rgba(255,255,255,0.2)'
                              : '0 1px 4px rgba(0,0,0,0.06)',
                            outline: 'none',
                            marginBottom: '2px'
                          }}
                          onClick={() => handleSubmenuItemClick(subItem.path)}
                          onMouseEnter={() => setHoveredItem(subItem.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div className="flex items-center relative z-10 flex-1">
                            {/* Ícone do subitem */}
                            <div
                              className={`p-1.5 rounded-md mr-3 transition-all duration-400 group-hover:scale-105 relative z-10 ${
                                isSubActive
                                  ? "bg-white/40" // Mais branco para ativos
                                  : "bg-gray-100 group-hover:bg-gray-200 border border-gray-200"
                              }`}
                            >
                              <SubIconComponent
                                className={`h-3.5 w-3.5 transition-colors duration-300 ${
                                  isSubActive
                                    ? "text-white scale-105"
                                    : "text-gray-500 group-hover:text-[#106a37]"
                                }`}
                              />
                            </div>

                            {/* Label do subitem */}
                            <div className="flex flex-col flex-1 min-w-0">
                              <span
                                className={`text-sm font-normal relative z-10 transition-all duration-300 ${
                                  isSubActive
                                    ? "text-white"
                                    : "group-hover:text-gray-900"
                                }`}
                              >
                                {subItem.label}
                                {/* Sublinhado branco para submenus ativos */}
                                {isSubActive && (
                                  <span
                                    className="absolute bottom-0 left-0 w-full h-0.5"
                                    style={{
                                      background: 'linear-gradient(90deg, #ffffff, #f8fafc)',
                                      boxShadow: '0 0 6px rgba(255,255,255,0.4)'
                                    }}
                                  ></span>
                                )}
                              </span>
                              {/* Formato dos relatórios */}
                              {subItem.formats && (
                                <span className={`text-xs mt-1 ${
                                  isSubActive ? "text-gray-300" : "text-gray-500"
                                }`}>
                                  {subItem.formats}
                                </span>
                              )}
                            </div>

                            {/* Badge para contadores */}
                            {subItem.badge && (
                              <span 
                                className="text-xs font-medium px-2 py-0.5 rounded-full ml-2 transition-all duration-300 whitespace-nowrap"
                                style={{
                                  background: isSubActive 
                                    ? 'rgba(255,255,255,0.4)' 
                                    : 'rgba(16,106,55,0.1)',
                                  color: isSubActive 
                                    ? 'white' 
                                    : '#106a37',
                                  border: isSubActive 
                                    ? '1px solid rgba(255,255,255,0.6)'
                                    : '1px solid rgba(16,106,55,0.3)',
                                  boxShadow: isSubActive 
                                    ? '0 2px 6px rgba(255,255,255,0.3)'
                                    : '0 1px 2px rgba(0,0,0,0.05)'
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
                      Sistema CRM
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
    </div>
  );
}

export default Sidebar;