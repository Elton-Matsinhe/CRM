import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bell,
  MessageSquare,
  Settings,
  PanelLeftClose,
  PanelLeft,
  User,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield,
  BarChart3,
  Users,
  Activity,
  LogOut,
  UserCog,
  Database,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { estatisticasService } from "../services/api";
import { useTranslation } from 'react-i18next';
import GlobalSearch from "./GlobalSearch";
import LanguageSelector from "./LanguageSelector";
import UserAvatar from "./ui/UserAvatar";
import { getGreetingKey, getFirstName } from "../utils/greeting";

const Header = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) => {
  const { theme, setTheme, language, themeConfig } = useTheme();
  const { t } = useTranslation();
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const greeting = useMemo(() => t(getGreetingKey()), [t, language]);
  const userName = getFirstName(usuario?.nome);

  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      const next = !sidebarCollapsed;
      setSidebarCollapsed(next);
      localStorage.setItem('sidebarCollapsed', String(next));
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const themes = [
    { id: 'branco', colors: ['#ffffff', '#e5e7eb'], ring: '#3b82f6' },
    { id: 'verde', colors: ['#16a34a', '#0a4f2e'], ring: '#16a34a' },
    { id: 'preto', colors: ['#374151', '#000000'], ring: '#374151' },
  ];

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

  // Dados de idiomas movidos para LanguageSelector com Google Translate

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

  // Pesquisa em tempo real via GlobalSearch

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

  // Obter cores do tema atual
  const headerStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    color: themeConfig.text,
    borderColor: themeConfig.border,
  };

  return (
    <header 
      className="flex-shrink-0 relative z-[80] border-b shadow-sm transition-all duration-500 backdrop-blur-xl overflow-visible"
      style={{
        background: headerStyle.background,
        color: headerStyle.color,
        borderColor: headerStyle.borderColor,
        boxShadow: `0 4px 24px -4px ${themeConfig.hoverGlow}`,
      }}
    >
      <div className="px-4 py-3 overflow-visible">
        {/* Linha única — sem quebras, dropdowns visíveis */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-nowrap overflow-visible">
          <div className="flex items-center gap-2 min-w-0 flex-shrink overflow-visible">
            {/* Botão Menu — ocultar/expandir sidebar */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMenuToggle}
              className="p-2.5 rounded-2xl transition-all duration-300 group border-2"
              style={{
                borderColor: themeConfig.border,
                background: themeConfig.hoverGlow,
              }}
              title={sidebarCollapsed ? "Expandir menu" : "Ocultar menu"}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-5 w-5 transition-colors duration-300" style={{ color: themeConfig.primary }} />
              ) : (
                <PanelLeftClose className="h-5 w-5 transition-colors duration-300" style={{ color: themeConfig.primary }} />
              )}
            </motion.button>

            {/* Badge CRM */}
            <span 
              className="hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm flex-shrink-0 whitespace-nowrap"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.primary}, ${themeConfig.primaryDark})`,
                color: '#ffffff',
                borderColor: themeConfig.primaryDark,
              }}
            >
              CRM Imperial
            </span>

            <GlobalSearch />
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 relative z-[90] overflow-visible">
            {/* Seleção de Tema */}
            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl border bg-white/60 backdrop-blur-sm" style={{ borderColor: themeConfig.border }}>
              {themes.map((t) => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleThemeChange(t.id)}
                  className={`p-1.5 rounded-xl transition-all duration-300 border-2 ${
                    theme === t.id ? 'ring-2 ring-offset-1' : 'border-transparent'
                  }`}
                  style={{
                    ringColor: t.ring,
                    borderColor: theme === t.id ? t.ring : 'transparent',
                  }}
                  title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                >
                  <div
                    className="w-4 h-4 rounded-full shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`,
                      border: t.id === 'branco' ? '1px solid #d1d5db' : 'none',
                    }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Seletor de Idioma — Google Translate */}
            <LanguageSelector />

            {/* Mensagens */}
            <div className="relative z-[90]" ref={messagesRef}>
              <button
                onClick={() => {
                  setIsMessagesOpen(!isMessagesOpen);
                  setIsNotificationsOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 group border"
                style={{ borderColor: themeConfig.border, background: themeConfig.hoverGlow }}
              >
                <MessageSquare className="h-5 w-5 transition-colors duration-300" style={{ color: themeConfig.primary }} />
                {unreadMessages > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center animate-pulse font-medium text-white"
                    style={{ background: themeConfig.primary }}
                  >
                    {unreadMessages}
                  </span>
                )}
              </button>

              {/* Dropdown Mensagens */}
              {isMessagesOpen && (
                <div 
                  className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl bg-white border border-gray-200 z-[200] animate-slideDown"
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
            <div className="relative z-[90]" ref={notificationsRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsMessagesOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 group border"
                style={{ borderColor: themeConfig.border, background: themeConfig.hoverGlow }}
              >
                <Bell className="h-5 w-5 transition-colors duration-300" style={{ color: themeConfig.primary }} />
                {unreadNotifications > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center animate-pulse font-medium text-white"
                    style={{ background: themeConfig.primary }}
                  >
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Dropdown Notificações */}
              {isNotificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl bg-white border border-gray-200 z-[200] animate-slideDown"
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
            <div className="relative z-[90]" ref={settingsRef}>
              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsMessagesOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-110 group border"
                style={{ borderColor: themeConfig.border, background: themeConfig.hoverGlow }}
              >
                <Settings className="h-5 w-5 transition-colors duration-300" style={{ color: themeConfig.primary }} />
              </button>

              {/* Dropdown Configurações */}
              {isSettingsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white border border-gray-200 z-[200] animate-slideDown"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {getText("Configurações", "Settings", "Paramètres")}
                    </h3>
                  </div>

                  <div className="p-2">
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
            <div className="relative z-[90]" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsSettingsOpen(false);
                }}
                className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 group border"
                style={{ borderColor: themeConfig.border, background: themeConfig.hoverGlow }}
              >
                <UserAvatar size={36} className="ring-0 shadow-md" />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {usuario?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs" style={{ color: themeConfig.primary }}>
                    {usuario?.role === 'admin' 
                      ? getText("Administrador", "Administrator", "Administrateur")
                      : usuario?.role === 'subscritor'
                      ? getText("Subscritor", "Underwriter", "Souscripteur")
                      : getText("Agente", "Agent", "Agent")}
                  </p>
                </div>
              </button>

              {/* Dropdown Perfil */}
              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white border border-gray-200 z-[200] animate-slideDown"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <UserAvatar size={40} />
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
          {/* Saudação dinâmica */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: themeConfig.text }}
            >
              <span>{greeting},</span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${themeConfig.primary}, ${themeConfig.accent})`,
                }}
              >
                {userName}!
              </span>
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                👋
              </motion.span>
            </motion.h1>
            <p className="mt-1 text-sm" style={{ color: themeConfig.textSecondary }}>
              {t('header.summary')}
            </p>
          </div>

          {/* Métricas Rápidas */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <FileText className="h-4 w-4" style={{ color: themeConfig.primary }} />
                <span className="text-sm font-semibold text-black">{crmMetrics.totalQuotes}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {t('header.quotes')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <Clock className="h-4 w-4" style={{ color: themeConfig.primary }} />
                <span className="text-sm font-semibold text-black">{crmMetrics.pendingApproval}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {t('header.pending')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <CheckCircle className="h-4 w-4" style={{ color: themeConfig.primary }} />
                <span className="text-sm font-semibold text-black">{crmMetrics.policiesIssued}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {t('header.policies')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <Users className="h-4 w-4" style={{ color: themeConfig.primary }} />
                <span className="text-sm font-semibold text-black">{crmMetrics.activeAgents}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {t('header.agents')}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <TrendingUp className="h-4 w-4" style={{ color: themeConfig.primary }} />
                <span className="text-sm font-semibold text-black">{crmMetrics.conversionRate}</span>
              </div>
              <p className="text-xs mt-1 text-gray-700">
                {t('header.conversion')}
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