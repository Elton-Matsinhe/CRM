import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  Download,
  Filter,
  MoreVertical,
  MapPin,
  Building,
  Loader2,
  Percent,
} from "lucide-react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import CriarCotacao from "./pages/CriarCotacao";
import EditarCotacao from "./pages/EditarCotacao";
import ListarCotacoes from "./pages/ListarCotacoes";
import GestaoCotacoes from "./pages/GestaoCotacoes";
import Acompanhamento from "./pages/Acompanhamento";
import AprovacaoTaxas from "./pages/AprovacaoTaxas";
import Relatorios from "./pages/Relatorios";
import GestaoUsuarios from "./pages/GestaoUsuarios";
import DepartamentoPlaceholder from "./pages/DepartamentoPlaceholder";
import Login from "./pages/Login";
import { useTheme } from "./contexts/ThemeContext";
import { cotacaoService } from "./services/api";

// Componente para rotas protegidas - versão simplificada
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const user = localStorage.getItem("user") || localStorage.getItem("usuario");
      
      if (token && user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-6 text-emerald-300 text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return children;
};

function App() {
  const { themeConfig } = useTheme();
  const [sidebar, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [performanceView, setPerformanceView] = useState("individual");
  const [crmData, setCrmData] = useState({
    totalQuotes: 0,
    pendingApproval: 0,
    policiesIssued: 0,
    expiredQuotes: 0,
    aprovacaoAguardando: 0,
    aprovacaoAprovadas: 0,
    aprovacaoRejeitadas: 0,
    activeAgents: 0,
    conversionRate: "0%",
    monthlyRevenue: "0",
    monthlyGrowth: 0,
    performance: {
      individual: [],
      equipe: [],
      provincia: []
    },
    recentQuotes: [],
    policyTypes: []
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    const user = localStorage.getItem("user") || localStorage.getItem("usuario");
    
    if (!token && !user && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location.pathname, navigate]);

  // Atualizar hora em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carregar dados do dashboard do backend
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      carregarDadosDashboard();
    }
  }, [location.pathname]);

  const carregarDadosDashboard = async () => {
    try {
      setLoadingDashboard(true);
      const result = await cotacaoService.buscarStats();
      
      if (result.success && result.data) {
        const s = result.data;
        const recentQuotes = (s.recentes || []).map((cotacao) => ({
          id: cotacao.numero_cotacao,
          client: `${cotacao.primeiro_nome || ''} ${cotacao.sobrenome || ''}`.trim() || 'N/A',
          value: `MT ${parseFloat(cotacao.total_premio || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}`,
          status: cotacao.status === 'aprovada' ? 'approved' : cotacao.status === 'expirada' ? 'expired' : 'pending',
          date: new Date(cotacao.data_criacao).toLocaleDateString('pt-MZ')
        }));

        setCrmData({
          totalQuotes: s.total || 0,
          pendingApproval: s.ativas || 0,
          policiesIssued: s.aprovadas || 0,
          expiredQuotes: s.expiradas || 0,
          aprovacaoAguardando: s.aprovacao_aguardando || 0,
          aprovacaoAprovadas: s.aprovacao_aprovadas || 0,
          aprovacaoRejeitadas: s.aprovacao_rejeitadas || 0,
          activeAgents: s.agentes_ativos || 0,
          conversionRate: `${s.taxa_conversao || 0}%`,
          monthlyRevenue: s.receita_total >= 1000000
            ? `MT ${(s.receita_total / 1000000).toFixed(1)}M`
            : `MT ${(s.receita_total / 1000).toFixed(0)}K`,
          monthlyGrowth: 0,
          performance: { individual: [], equipe: [], provincia: [] },
          recentQuotes,
          policyTypes: [{ type: "Automóvel", count: s.total || 0, color: "#4ade80" }]
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Dados padrão (fallback)
  const crmDataDefault = {
    totalQuotes: 156,
    pendingApproval: 23,
    policiesIssued: 89,
    expiredQuotes: 7,
    activeAgents: 12,
    conversionRate: "68%",
    monthlyRevenue: "2.4M",
    monthlyGrowth: 12.5,
    performance: {
      individual: [
        { agent: "Maria Silva", quotes: 45, conversion: "72%", policies: 32, equipe: "Norte" },
        { agent: "João Santos", quotes: 38, conversion: "65%", policies: 25, equipe: "Sul" },
        { agent: "Ana Costa", quotes: 42, conversion: "71%", policies: 30, equipe: "Centro" },
        { agent: "Pedro Lima", quotes: 31, conversion: "58%", policies: 18, equipe: "Norte" },
        { agent: "Carla Mondlane", quotes: 28, conversion: "75%", policies: 21, equipe: "Sul" },
      ],
      equipe: [
        { equipe: "Norte", quotes: 76, conversion: "68%", policies: 52, agents: 4 },
        { equipe: "Sul", quotes: 66, conversion: "70%", policies: 46, agents: 5 },
        { equipe: "Centro", quotes: 42, conversion: "71%", policies: 30, agents: 3 },
      ],
      provincia: [
        { provincia: "Cidade de Maputo", quotes: 45, conversion: "75%", policies: 34 },
        { provincia: "Maputo", quotes: 38, conversion: "68%", policies: 26 },
        { provincia: "Gaza", quotes: 32, conversion: "66%", policies: 21 },
        { provincia: "Inhambane", quotes: 28, conversion: "64%", policies: 18 },
        { provincia: "Sofala", quotes: 25, conversion: "72%", policies: 18 },
        { provincia: "Manica", quotes: 22, conversion: "59%", policies: 13 },
        { provincia: "Tete", quotes: 18, conversion: "61%", policies: 11 },
        { provincia: "Zambézia", quotes: 15, conversion: "53%", policies: 8 },
        { provincia: "Nampula", quotes: 12, conversion: "58%", policies: 7 },
        { provincia: "Cabo Delgado", quotes: 8, conversion: "50%", policies: 4 },
        { provincia: "Niassa", quotes: 6, conversion: "67%", policies: 4 },
      ]
    },
    recentQuotes: [
      { id: "IMP-2345", client: "Empresa A", value: "15.000 MZN", status: "approved", date: "2024-01-15" },
      { id: "IMP-2346", client: "Cliente B", value: "8.500 MZN", status: "pending", date: "2024-01-14" },
      { id: "IMP-2347", client: "Empresa C", value: "22.000 MZN", status: "expired", date: "2024-01-13" },
      { id: "IMP-2348", client: "Cliente D", value: "12.300 MZN", status: "approved", date: "2024-01-12" },
      { id: "IMP-2349", client: "Empresa E", value: "18.750 MZN", status: "pending", date: "2024-01-11" },
    ],
    policyTypes: [
      { type: "Automóvel", count: 45, color: "#4ade80" },
      { type: "Viagem", count: 23, color: "#22c55e" },
      { type: "Funerário", count: 15, color: "#16a34a" },
      { type: "Saúde", count: 6, color: "#15803d" },
    ]
  };

  // Cards com métricas principais
  const metricCards = [
    {
      title: "Total de Cotações",
      value: crmData.totalQuotes,
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "emerald",
      description: "Este mês"
    },
    {
      title: "Em Acompanhamento",
      value: crmData.pendingApproval,
      change: "+5%",
      trend: "up",
      icon: Clock,
      color: "amber",
      description: "Aguardando resposta"
    },
    {
      title: "Apólices Emitidas",
      value: crmData.policiesIssued,
      change: "+8%",
      trend: "up",
      icon: CheckCircle,
      color: "green",
      description: "Este mês"
    },
    {
      title: "Cotações Expiradas",
      value: crmData.expiredQuotes,
      change: "-3%",
      trend: "down",
      icon: XCircle,
      color: "red",
      description: "Necessitam follow-up"
    }
  ];

  const approvalMetricCards = [
    {
      title: "Aguardando Aprovação",
      value: crmData.aprovacaoAguardando,
      icon: Clock,
      color: "amber",
      description: "Taxas alteradas",
    },
    {
      title: "Taxas Aprovadas",
      value: crmData.aprovacaoAprovadas,
      icon: CheckCircle,
      color: "green",
      description: "Prontas para partilha",
    },
    {
      title: "Taxas Rejeitadas",
      value: crmData.aprovacaoRejeitadas,
      icon: XCircle,
      color: "red",
      description: "Requerem correção",
    },
  ];

  // Dashboard como componente interno
  const DashboardPage = () => {
    if (loadingDashboard) {
      return (
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados do dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto w-full px-1 sm:px-0">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Geral</h1>
          <p className="text-emerald-600 text-sm max-w-2xl mx-auto">
            Visão completa do desempenho do sistema CRM do Imperial Insurance Moçambique, S.A
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <MetricCard key={index} card={card} index={index} />
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Percent className="h-5 w-5 text-amber-600" />
          Aprovação de Taxas
        </h2>
        <p className="text-sm text-gray-500">Fluxo independente do status operacional da cotação</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {approvalMetricCards.map((card, index) => (
          <MetricCard key={`aprov-${index}`} card={card} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceCard 
          data={crmData.performance} 
          view={performanceView}
          onViewChange={setPerformanceView}
        />

        <div 
          className="rounded-2xl p-6 bg-white border border-emerald-100 transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-emerald-600" />
              Tipos de Seguro
            </h3>
            <button className="p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-300">
              <Filter className="h-4 w-4 text-emerald-600" />
            </button>
          </div>
          <div className="space-y-3">
            {crmData.policyTypes.map((policy, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: policy.color }}
                  ></div>
                  <span className="text-gray-700 text-sm">{policy.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        backgroundColor: policy.color,
                        width: `${(policy.count / 89) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium w-8 text-right">
                    {policy.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div 
        className="rounded-2xl p-6 bg-white border border-emerald-100 mb-8 transition-all duration-500"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-emerald-600" />
            Cotações Recentes
          </h3>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all duration-300 hover:scale-105 border border-emerald-200">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-200">
                <th className="text-left py-3 px-4 text-emerald-700 font-medium text-sm">ID Cotação</th>
                <th className="text-left py-3 px-4 text-emerald-700 font-medium text-sm">Cliente</th>
                <th className="text-left py-3 px-4 text-emerald-700 font-medium text-sm">Valor</th>
                <th className="text-left py-3 px-4 text-emerald-700 font-medium text-sm">Data</th>
                <th className="text-left py-3 px-4 text-emerald-700 font-medium text-sm">Estado</th>
              </tr>
            </thead>
            <tbody>
              {crmData.recentQuotes.map((quote, idx) => (
                <tr key={idx} className="border-b border-emerald-100 hover:bg-emerald-50 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-800 font-mono text-sm">{quote.id}</td>
                  <td className="py-3 px-4 text-gray-800 text-sm">{quote.client}</td>
                  <td className="py-3 px-4 text-emerald-700 text-sm font-medium">{quote.value}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{quote.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quote.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : quote.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {quote.status === 'approved' ? 'Aprovada' : quote.status === 'pending' ? 'Pendente' : 'Expirada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricBox 
          title="Taxa de Conversão" 
          value={crmData.conversionRate} 
          description="Cotações para Apólices"
          icon={Target}
          color="emerald"
        />
        <MetricBox 
          title="Agentes Ativos" 
          value={crmData.activeAgents} 
          description="Este mês"
          icon={Users}
          color="green"
        />
        <MetricBox 
          title="Receita Mensal" 
          value={crmData.monthlyRevenue} 
          description="Crescimento +12.5%"
          icon={TrendingUp}
          color="emerald"
        />
      </div>
    </div>
    );
  };

  // Se estiver na página de login, mostrar apenas o componente Login
  if (location.pathname === '/login') {
    return <Login />;
  }

  return (
    <div className="h-screen overflow-hidden">
      <div 
        className="h-screen relative transition-all duration-500 bg-gradient-to-br from-emerald-50 via-white to-green-50"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200 rounded-full blur-3xl animate-pulse-slow opacity-70"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-green-200 rounded-full blur-3xl animate-pulse-slower opacity-50"></div>
          <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-emerald-300 rounded-full blur-2xl animate-pulse opacity-60"></div>
        </div>

        {/* Overlay mobile quando sidebar aberto */}
        {sidebar && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar
          sidebar={sidebar}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          activeTab={location.pathname}
          setActiveTab={() => {}}
        />

        <div
          className={`relative z-10 flex flex-col h-screen min-w-0 transition-[margin] duration-300 ${
            sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-72'
          }`}
        >
          <Header
            sidebarOpen={sidebar}
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />

          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto min-w-0 relative z-0">
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/cotacoes/criar" element={
                  <ProtectedRoute>
                    <CriarCotacao />
                  </ProtectedRoute>
                } />
                <Route path="/cotacoes/editar" element={
                  <ProtectedRoute>
                    <EditarCotacao />
                  </ProtectedRoute>
                } />
                <Route path="/cotacoes/listar" element={
                  <ProtectedRoute>
                    <ListarCotacoes />
                  </ProtectedRoute>
                } />
                <Route path="/crm/gestao-cotacoes" element={
                  <ProtectedRoute>
                    <GestaoCotacoes />
                  </ProtectedRoute>
                } />
                <Route path="/crm/acompanhamento" element={
                  <ProtectedRoute>
                    <Acompanhamento />
                  </ProtectedRoute>
                } />
                <Route path="/crm/aprovacao-taxas" element={
                  <ProtectedRoute>
                    <AprovacaoTaxas />
                  </ProtectedRoute>
                } />
                <Route path="/crm/relatorios" element={
                  <ProtectedRoute>
                    <Relatorios />
                  </ProtectedRoute>
                } />
                <Route path="/admin/usuarios" element={
                  <ProtectedRoute>
                    <GestaoUsuarios />
                  </ProtectedRoute>
                } />
                <Route path="/departamentos/:departamento" element={
                  <ProtectedRoute>
                    <DepartamentoPlaceholder />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer currentTime={currentTime} />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.2; }
        }
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
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Componente de Performance com Filtros
function PerformanceCard({ data, view, onViewChange }) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const getPerformanceData = () => {
    switch (view) {
      case "individual":
        return data.individual;
      case "equipe":
        return data.equipe;
      case "provincia":
        return data.provincia;
      default:
        return data.individual;
    }
  };

  return (
    <div 
      className="rounded-2xl p-6 bg-white border border-emerald-100 transition-all duration-500 hover:scale-[1.02] relative"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
          Desempenho por {view === "individual" ? "Agente" : view === "equipe" ? "Equipe" : "Província"}
        </h3>
        
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-300"
          >
            <MoreVertical className="h-4 w-4 text-emerald-600" />
          </button>

          {showFilterMenu && (
            <div 
              className="absolute right-0 top-10 w-48 rounded-xl shadow-2xl z-50 animate-slideDown bg-white border border-emerald-200"
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    onViewChange("individual");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 ${
                    view === "individual" 
                      ? 'bg-emerald-100 border border-emerald-300' 
                      : 'hover:bg-emerald-50'
                  }`}
                >
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-800 flex-1">Desempenho Individual</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange("equipe");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 ${
                    view === "equipe" 
                      ? 'bg-emerald-100 border border-emerald-300' 
                      : 'hover:bg-emerald-50'
                  }`}
                >
                  <Building className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-800 flex-1">Desempenho por Equipe</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange("provincia");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                    view === "provincia" 
                      ? 'bg-emerald-100 border border-emerald-300' 
                      : 'hover:bg-emerald-50'
                  }`}
                >
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-800 flex-1">Desempenho por Província</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {getPerformanceData().map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                {view === "individual" 
                  ? item.agent.split(' ').map(n => n[0]).join('')
                  : view === "equipe"
                  ? item.equipe[0]
                  : item.provincia.split(' ').map(n => n[0]).join('').substring(0, 2)
                }
              </div>
              <div>
                <p className="text-gray-800 font-medium text-sm">
                  {view === "individual" 
                    ? item.agent 
                    : view === "equipe"
                    ? `Equipe ${item.equipe}`
                    : item.provincia
                  }
                </p>
                <p className="text-emerald-600 text-xs">
                  {item.quotes} cotações
                  {view === "individual" && item.equipe && ` • ${item.equipe}`}
                  {view === "equipe" && ` • ${item.agents} agentes`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-800 font-semibold text-sm">{item.conversion}</p>
              <p className="text-emerald-600 text-xs">{item.policies} apólices</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de Card de Métrica
function MetricCard({ card, index }) {
  const IconComponent = card.icon;
  
  return (
    <div 
      className="rounded-2xl p-6 bg-white border border-emerald-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl group"
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 bg-emerald-50"
        >
          <IconComponent className={`h-6 w-6 ${
            card.color === 'emerald' ? 'text-emerald-600' :
            card.color === 'amber' ? 'text-amber-600' :
            card.color === 'green' ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          card.trend === 'up' 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {card.trend === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{card.change}</span>
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-800">{card.value}</p>
        <p className="text-sm font-medium text-emerald-700 mt-1">{card.title}</p>
      </div>
      
      <p className="text-xs text-gray-600">{card.description}</p>
      
      <div className="mt-4 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            background: `linear-gradient(90deg, ${
              card.color === 'emerald' ? '#4ade80' :
              card.color === 'amber' ? '#f59e0b' :
              card.color === 'green' ? '#22c55e' : '#ef4444'
            }, ${
              card.color === 'emerald' ? '#22c55e' :
              card.color === 'amber' ? '#d97706' :
              card.color === 'green' ? '#16a34a' : '#dc2626'
            })`,
            width: card.trend === 'up' ? '85%' : '60%'
          }}
        ></div>
      </div>
    </div>
  );
}

// Componente de Caixa de Métrica Simples
function MetricBox({ title, value, description, icon: Icon, color }) {
  return (
    <div 
      className="rounded-xl p-4 bg-white border border-emerald-100 transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-center space-x-3">
        <div 
          className="p-2 rounded-lg bg-emerald-50"
        >
          <Icon className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-gray-800 font-semibold text-lg">{value}</p>
          <p className="text-emerald-700 text-sm">{title}</p>
          <p className="text-gray-600 text-xs">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Componente Footer
function Footer({ currentTime }) {
  return (
    <footer 
      className="border-t border-emerald-100 bg-white py-4 px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-emerald-700 text-sm">
            © 2026 CRM Imperial Insurance Moçambique, S.A. @Todos os direitos reservados.
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-emerald-600 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-gray-700">{currentTime.toLocaleDateString('pt-PT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
            <span className="font-mono text-gray-700">
              {currentTime.toLocaleTimeString('pt-PT', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default App;