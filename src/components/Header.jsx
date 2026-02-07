import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  Settings,
  Menu,
  User,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  BarChart3,
  Users,
  Activity,
  LogOut,
  UserCog,
  Database,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { estatisticasService } from "../services/api";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, setTheme, language, setLanguage } = useTheme();
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [crmMetrics, setCrmMetrics] = useState({
    totalQuotes: 0,
    pendingApproval: 0,
    policiesIssued: 0,
    activeAgents: 0,
    conversionRate: "0%",
    revenue: "MT 0"
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);
  const settingsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Carregar dados dinâmicos
  useEffect(() => {
    carregarDadosDinamicos();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      carregarDadosDinamicos();
    }, 30000);

    // Escutar evento de cotação criada para atualizar métricas
    const handleCotacaoCriada = () => {
      carregarDadosDinamicos();
    };

    window.addEventListener('cotacaoCriada', handleCotacaoCriada);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cotacaoCriada', handleCotacaoCriada);
    };
  }, []);

  // Carregar dados dinâmicos do backend
  const carregarDadosDinamicos = async () => {
    try {
      setLoadingMetrics(true);
      
      // Carregar métricas, notificações e mensagens em paralelo
      const [metricasResult, notificacoesResult, mensagensResult] = await Promise.all([
        estatisticasService.buscarMetricas(),
        estatisticasService.buscarNotificacoes(),
        estatisticasService.buscarMensagens()
      ]);

      if (metricasResult.success) {
        setCrmMetrics(metricasResult.data);
      }

      if (notificacoesResult.success) {
        setNotifications(notificacoesResult.data);
      }

      if (mensagensResult.success) {
        setMessages(mensagensResult.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados dinâmicos:", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setIsMessagesOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dados agora são carregados dinamicamente do backend via useEffect

  // Dados de idiomas - Agora com siglas visíveis
  const languages = [
    { code: "pt", name: "Português", flag: "🇵🇹", shortName: "PT" },
    { code: "en", name: "English", flag: "🇺🇸", shortName: "EN" },
    { code: "fr", name: "Français", flag: "🇫🇷", shortName: "FR" }
  ];

  const unreadNotifications = notifications.filter((n) => n.unread).length;
  const unreadMessages = messages.filter((m) => m.unread).length;

  // Função para obter ícone baseado no tipo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expiry': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'achievement': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'policy': return <FileText className="h-4 w-4 text-emerald-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'system': return <Activity className="h-4 w-4 text-cyan-600" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para obter cor de prioridade
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'rgba(22, 163, 74, 0.1)'; // Verde claro
      case 'medium': return 'rgba(245, 158, 11, 0.1)';
      case 'low': return 'rgba(22, 163, 74, 0.05)'; // Verde muito claro
      default: return 'rgba(22, 163, 74, 0.05)';
    }
  };

  // Função de pesquisa
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Pesquisando por:", searchQuery);
      // Aqui você implementaria a lógica de pesquisa real
      alert(`Pesquisando por: ${searchQuery}`);
    }
  };

  // Função para lidar com Enter na pesquisa
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Função para mudar idioma
  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsSettingsOpen(false);
  };

  // Função para mudar tema
  const handleThemeChange = (themeName) => {
    setTheme(themeName);
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para obter texto baseado no idioma
  const getText = (pt, en, fr) => {
    switch (language) {
      case 'pt': return pt;
      case 'en': return en;
      case 'fr': return fr;
      default: return pt;
    }
  };

  // Obter cores do tema atual - FUNDO BRANCO PARA TODOS
  const getHeaderStyle = () => {
    return {
      background: '#ffffff',
      color: '#000000', // Texto preto
      borderColor: '#e5e7eb' // Border cinza claro
    };
  };

  const headerStyle = getHeaderStyle();

  return (
    <header 
      className="sticky top-0 z-40 border-b shadow-sm transition-all duration-500"
      style={{
        background: headerStyle.background,
        color: headerStyle.color,
        borderColor: headerStyle.borderColor
      }}
    >
      <div className="px-6 py-4">
        {/* Primeira Linha: Navegação e Ações */}
        <div className="flex items-center justify-between mb-4">
          {/* Lado Esquerdo: Navegação */}
          <div className="flex items-center space-x-6">
            {/* Botão Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-105 group hover:bg-green-50 border border-gray-200"
            >
              <Menu className="h-5 w-5 text-green-600 transition-colors duration-300 group-hover:text-green-700" />
            </button>

            {/* Navegação */}
            <div className="hidden md:flex items-center space-x-3">
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full border"
                style={{
                  background: '#16a34a', // Verde
                  color: '#ffffff',
                  borderColor: '#16a34a'
                }}
              >
                CRM Imperial
              </span>
              <span style={{ color: '#000000' }}>•</span>
              <span className="text-sm font-semibold" style={{ color: '#000000' }}>
                {getText("Painel Administrativo", "Admin Dashboard", "Tableau de Bord Admin")}
              </span>
            </div>

            {/* Barra de Pesquisa Dinâmica */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getText(
                  "Pesquisar cotações, apólices, agentes...",
                  "Search quotes, policies, agents...",
                  "Rechercher devis, polices, agents..."
                )}
                className="pl-10 pr-12 py-2.5 w-80 rounded-xl focus:ring-2 transition-all duration-300 placeholder-gray-400 border text-sm"
                style={{
                  background: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#000000'
                }}
              />
              {/* Botão de Pesquisa Dinâmico */}
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-300 ${
                  searchQuery.trim() 
                    ? 'text-green-600 hover:text-green-700 cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lado Direito: Ações Rápidas */}
          <div className="flex items-center space-x-3">
            {/* Seleção de Tema - Branco, Verde, Preto */}
            <div className="flex items-center space-x-2">
              {/* Branco (Primeira opção) */}
              <button
                onClick={() => handleThemeChange('branco')}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 border-2 ${
                  theme === 'branco' ? 'ring-2 ring-offset-2 ring-gray-300' : ''
                } bg-white hover:bg-gray-50 border-gray-300`}
                title={getText("Tema Branco", "White Theme", "Thème Blanc")}
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white to-gray-100 border border-gray-300"></div>
              </button>
              
              {/* Verde */}
              <button
                onClick={() => handleThemeChange('verde')}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 border-2 ${
                  theme === 'verde' ? 'ring-2 ring-offset-2 ring-green-500' : ''
                } bg-white hover:bg-green-50 border-green-300`}
                title={getText("Tema Verde", "Green Theme", "Thème Vert")}
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
              </button>
              
              {/* Preto */}
              <button
                onClick={() => handleThemeChange('preto')}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 border-2 ${
                  theme === 'preto' ? 'ring-2 ring-offset-2 ring-black' : ''
                } bg-white hover:bg-gray-100 border-gray-700`}
                title={getText("Tema Preto", "Black Theme", "Thème Noir")}
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-700 to-black"></div>
              </button>
            </div>

            {/* Mensagens */}
            <div className="relative" ref={messagesRef}>
              <button
                onClick={() => {
                  setIsMessagesOpen(!isMessagesOpen);
                  setIsNotificationsOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 group hover:bg-green-50 border border-gray-200"
              >
                <MessageSquare className="h-5 w-5 text-green-600 transition-colors duration-300 group-hover:text-green-700" />
                {unreadMessages > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center animate-pulse font-medium bg-green-600 text-white"
                  >
                    {unreadMessages}
                  </span>
                )}
              </button>

              {/* Dropdown Mensagens */}
              {isMessagesOpen && (
                <div 
                  className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl bg-white border border-gray-200 z-50 animate-slideDown"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {getText("Mensagens do Sistema", "System Messages", "Messages du Système")}
                      </h3>
                      <span className="text-sm px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        {unreadMessages} {getText("não lidas", "unread", "non lues")}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 border-b border-gray-100 transition-all duration-200 hover:bg-green-50 ${
                          message.unread ? "border-l-4 border-green-500" : ""
                        }`}
                        style={{ 
                          background: message.unread ? getPriorityColor(message.priority) : 'transparent'
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(message.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {message.text}
                            </p>
                            <p className="text-xs mt-1 text-green-600">
                              {message.time}
                            </p>
                          </div>
                          {message.unread && (
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <button 
                      className="w-full text-center text-sm font-medium py-2 rounded-lg transition-all duration-200 hover:bg-green-50 text-green-700 border border-green-200"
                    >
                      {getText("Ver Todas as Mensagens", "View All Messages", "Voir Tous les Messages")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notificações */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsMessagesOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 group hover:bg-green-50 border border-gray-200"
              >
                <Bell className="h-5 w-5 text-green-600 transition-colors duration-300 group-hover:text-green-700" />
                {unreadNotifications > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center animate-pulse font-medium bg-green-600 text-white"
                  >
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Dropdown Notificações */}
              {isNotificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl bg-white border border-gray-200 z-50 animate-slideDown"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {getText("Notificações CRM", "CRM Notifications", "Notifications CRM")}
                      </h3>
                      <span className="text-sm px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        {unreadNotifications} {getText("não lidas", "unread", "non lues")}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 transition-all duration-200 hover:bg-green-50 ${
                          notification.unread ? "border-l-4 border-green-500" : ""
                        }`}
                        style={{ 
                          background: notification.unread ? getPriorityColor(notification.priority) : 'transparent'
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {notification.text}
                            </p>
                            <p className="text-xs mt-1 text-green-600">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <button 
                      className="w-full text-center text-sm font-medium py-2 rounded-lg transition-all duration-200 hover:bg-green-50 text-green-700 border border-green-200"
                    >
                      {getText("Ver Todas as Notificações", "View All Notifications", "Voir Toutes les Notifications")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Configurações com Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsMessagesOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-110 group hover:bg-green-50 border border-gray-200"
              >
                <Settings className="h-5 w-5 text-green-600 transition-colors duration-300 group-hover:text-green-700" />
              </button>

              {/* Dropdown Configurações */}
              {isSettingsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white border border-gray-200 z-50 animate-slideDown"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {getText("Configurações", "Settings", "Paramètres")}
                    </h3>
                  </div>

                  <div className="p-2">
                    {/* Idioma */}
                    <div className="mb-2">
                      <p className="text-xs font-medium px-3 mb-2 text-green-700">
                        {getText("Idioma", "Language", "Langue")}
                      </p>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 ${
                            language === lang.code 
                              ? 'bg-green-50 border border-green-200' 
                              : 'hover:bg-green-50'
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span className="text-sm text-gray-900 flex-1">{lang.name}</span>
                          <span className="text-xs px-2 py-1 rounded font-medium bg-green-50 text-green-700 border border-green-200">
                            {lang.shortName}
                          </span>
                          {language === lang.code && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t my-2 border-gray-100"></div>

                    {/* Outras Configurações */}
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 hover:bg-green-50 group">
                      <UserCog className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900 group-hover:text-green-700">
                        {getText("Preferências", "Preferences", "Préférences")}
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 hover:bg-green-50 group">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900 group-hover:text-green-700">
                        {getText("Backup & Restauro", "Backup & Restore", "Sauvegarde & Restauration")}
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 hover:bg-green-50 group">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900 group-hover:text-green-700">
                        {getText("Segurança", "Security", "Sécurité")}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil do Administrador */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsSettingsOpen(false);
                }}
                className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 group hover:bg-green-50 border border-gray-200"
              >
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-green-200"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)' // Gradiente verde
                  }}
                >
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {usuario?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-green-700">
                    {usuario?.role === 'admin' 
                      ? getText("Administrador", "Administrator", "Administrateur")
                      : getText("Agente", "Agent", "Agent")}
                  </p>
                </div>
              </button>

              {/* Dropdown Perfil */}
              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white border border-gray-200 z-50 animate-slideDown"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #16a34a, #15803d)'
                        }}
                      >
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {usuario?.nome || 'Usuário'}
                        </p>
                        <p className="text-xs text-green-700">
                          {usuario?.email || ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {usuario?.role === 'admin' 
                            ? getText("Administrador do Sistema", "System Administrator", "Administrateur Système")
                            : getText("Agente", "Agent", "Agent")}
                          {usuario?.departamento ? ` - ${usuario.departamento}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 hover:bg-green-50 group">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900 group-hover:text-green-700">
                        {getText("Meu Perfil", "My Profile", "Mon Profil")}
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 hover:bg-green-50 group">
                      <Settings className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900 group-hover:text-green-700">
                        {getText("Configurações", "Settings", "Paramètres")}
                      </span>
                    </button>

                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 hover:bg-green-50 group">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-900 group-hover:text-green-700">
                        {getText("Relatórios", "Reports", "Rapports")}
                      </span>
                    </button>

                    <div className="border-t my-2 border-gray-100"></div>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 hover:bg-red-50 group"
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-gray-900 group-hover:text-red-700">
                        {getText("Terminar Sessão", "Logout", "Déconnexion")}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Segunda Linha: Saudação e Métricas */}
        <div className="flex items-center justify-between">
          {/* Saudação */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>
              {getText("Olá, Administrador! 👋", "Hello, Administrator! 👋", "Bonjour, Administrateur! 👋")}
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#374151' }}>
              {getText(
                "Aqui está o resumo do desempenho do sistema hoje",
                "Here's today's system performance summary", 
                "Voici le résumé des performances du sistema aujourd'hui"
              )}
            </p>
          </div>

          {/* Métricas Rápidas */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-black">{crmMetrics.totalQuotes}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {getText("Cotações", "Quotes", "Devis")}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-black">{crmMetrics.pendingApproval}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {getText("Pendentes", "Pending", "En Attente")}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-black">{crmMetrics.policiesIssued}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {getText("Apólices", "Policies", "Polices")}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-black">{crmMetrics.activeAgents}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {getText("Agentes", "Agents", "Agents")}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-black">{crmMetrics.conversionRate}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {getText("Conversão", "Conversion", "Conversion")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;