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
} from "lucide-react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import CriarCotacao from "./pages/CriarCotacao";
import EditarCotacao from "./pages/EditarCotacao";
import ListarCotacoes from "./pages/ListarCotacoes";
import GestaoCotacoes from "./pages/GestaoCotacoes";
import Acompanhamento from "./pages/Acompanhamento";
import DepartamentoPlaceholder from "./pages/DepartamentoPlaceholder";
import { useTheme } from "./contexts/ThemeContext";

function App() {
  const { themeConfig, language } = useTheme();
  const [sidebar, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [performanceView, setPerformanceView] = useState("individual"); // individual, equipe, provincia
  const location = useLocation();

  // Atualizar hora em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados fictícios do CRM Imperial Seguros
  const crmData = {
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

  // Dashboard como componente interno para reutilizar o conteúdo existente
  const DashboardPage = () => (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Geral</h1>
        <p className="text-emerald-200/80 text-sm max-w-2xl mx-auto">
          Visão completa do desempenho do sistema CRM do Imperial Insurance Moçambique, S.A
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <MetricCard key={index} card={card} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceCard 
          data={crmData.performance} 
          view={performanceView}
          onViewChange={setPerformanceView}
        />

        <div 
          className="rounded-2xl p-6 backdrop-blur-sm border transition-all duration-500 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.02))',
            borderColor: 'rgba(74, 222, 128, 0.1)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-emerald-400" />
              Tipos de Seguro
            </h3>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300">
              <Filter className="h-4 w-4 text-emerald-400" />
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
                  <span className="text-white text-sm">{policy.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        backgroundColor: policy.color,
                        width: `${(policy.count / 89) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-emerald-300 text-sm font-medium w-8 text-right">
                    {policy.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div 
        className="rounded-2xl p-6 backdrop-blur-sm border mb-8 transition-all duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.02))',
          borderColor: 'rgba(74, 222, 128, 0.1)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-emerald-400" />
            Cotações Recentes
          </h3>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-emerald-400 hover:bg-white/5 transition-all duration-300 hover:scale-105">
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/20">
                <th className="text-left py-3 px-4 text-emerald-400 font-medium text-sm">ID Cotação</th>
                <th className="text-left py-3 px-4 text-emerald-400 font-medium text-sm">Cliente</th>
                <th className="text-left py-3 px-4 text-emerald-400 font-medium text-sm">Valor</th>
                <th className="text-left py-3 px-4 text-emerald-400 font-medium text-sm">Data</th>
                <th className="text-left py-3 px-4 text-emerald-400 font-medium text-sm">Estado</th>
              </tr>
            </thead>
            <tbody>
              {crmData.recentQuotes.map((quote, idx) => (
                <tr key={idx} className="border-b border-emerald-500/10 hover:bg-white/5 transition-colors duration-200">
                  <td className="py-3 px-4 text-white font-mono text-sm">{quote.id}</td>
                  <td className="py-3 px-4 text-white text-sm">{quote.client}</td>
                  <td className="py-3 px-4 text-emerald-300 text-sm font-medium">{quote.value}</td>
                  <td className="py-3 px-4 text-emerald-200/70 text-sm">{quote.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quote.status === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : quote.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
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

  return (
    <div className="min-h-screen">
      <div 
        className="min-h-screen relative overflow-hidden transition-all duration-500"
        style={{
          background: themeConfig.background
        }}
      >
        {/* Efeitos de background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-green-500/3 rounded-full blur-3xl animate-pulse-slower"></div>
          <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="flex min-h-screen relative z-10">
          {/* Sidebar */}
          <Sidebar
            sidebar={sidebar}
            setSidebarOpen={setSidebarOpen}
            activeTab={location.pathname}
            setActiveTab={() => {}}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <Header
              sidebarOpen={sidebar}
              setSidebarOpen={setSidebarOpen}
            />

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cotacoes/criar" element={<CriarCotacao />} />
                <Route path="/cotacoes/editar" element={<EditarCotacao />} />
                <Route path="/cotacoes/listar" element={<ListarCotacoes />} />
                <Route path="/crm/gestao-cotacoes" element={<GestaoCotacoes />} />
                <Route path="/crm/acompanhamento" element={<Acompanhamento />} />
                <Route path="/departamentos/:departamento" element={<DepartamentoPlaceholder />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>

            {/* Footer Bonito */}
            <Footer currentTime={currentTime} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
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

  const getViewIcon = () => {
    switch (view) {
      case "individual":
        return Users;
      case "equipe":
        return Building;
      case "provincia":
        return MapPin;
      default:
        return Users;
    }
  };

  const ViewIcon = getViewIcon();

  return (
    <div 
      className="rounded-2xl p-6 backdrop-blur-sm border transition-all duration-500 hover:scale-[1.02] relative"
      style={{
        background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.02))',
        borderColor: 'rgba(74, 222, 128, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-emerald-400" />
          Desempenho por {view === "individual" ? "Agente" : view === "equipe" ? "Equipe" : "Província"}
        </h3>
        
        {/* Menu de Filtros */}
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300"
          >
            <MoreVertical className="h-4 w-4 text-emerald-400" />
          </button>

          {showFilterMenu && (
            <div 
              className="absolute right-0 top-10 w-48 rounded-xl shadow-2xl backdrop-blur-xl z-50 animate-slideDown"
              style={{
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
                border: '1px solid rgba(74, 222, 128, 0.2)'
              }}
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    onViewChange("individual");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 ${
                    view === "individual" 
                      ? 'bg-emerald-500/20 border border-emerald-500/30' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-white flex-1">Desempenho Individual</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange("equipe");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 mb-1 ${
                    view === "equipe" 
                      ? 'bg-emerald-500/20 border border-emerald-500/30' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Building className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-white flex-1">Desempenho por Equipe</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange("provincia");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                    view === "provincia" 
                      ? 'bg-emerald-500/20 border border-emerald-500/30' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-white flex-1">Desempenho por Província</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {getPerformanceData().map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 backdrop-blur-sm">
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
                <p className="text-white font-medium text-sm">
                  {view === "individual" 
                    ? item.agent 
                    : view === "equipe"
                    ? `Equipe ${item.equipe}`
                    : item.provincia
                  }
                </p>
                <p className="text-emerald-300/70 text-xs">
                  {item.quotes} cotações
                  {view === "individual" && item.equipe && ` • ${item.equipe}`}
                  {view === "equipe" && ` • ${item.agents} agentes`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">{item.conversion}</p>
              <p className="text-emerald-300/70 text-xs">{item.policies} apólices</p>
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
      className="rounded-2xl p-6 backdrop-blur-sm border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group"
      style={{
        background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(34, 197, 94, 0.04))',
        borderColor: 'rgba(74, 222, 128, 0.15)',
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
          style={{
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.1))'
          }}
        >
          <IconComponent className={`h-6 w-6 ${
            card.color === 'emerald' ? 'text-emerald-400' :
            card.color === 'amber' ? 'text-amber-400' :
            card.color === 'green' ? 'text-green-400' : 'text-red-400'
          }`} />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          card.trend === 'up' 
            ? 'bg-emerald-500/20 text-emerald-300' 
            : 'bg-red-500/20 text-red-300'
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
        <p className="text-2xl font-bold text-white">{card.value}</p>
        <p className="text-sm font-medium text-emerald-300/80 mt-1">{card.title}</p>
      </div>
      
      <p className="text-xs text-emerald-200/60">{card.description}</p>
      
      {/* Barra de progresso animada */}
      <div className="mt-4 w-full bg-white/10 rounded-full h-1 overflow-hidden">
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
      className="rounded-xl p-4 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.02))',
        borderColor: 'rgba(74, 222, 128, 0.1)'
      }}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="p-2 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.08))'
          }}
        >
          <Icon className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{value}</p>
          <p className="text-emerald-300/80 text-sm">{title}</p>
          <p className="text-emerald-200/60 text-xs">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Componente Footer
function Footer({ currentTime }) {
  return (
    <footer 
      className="border-t backdrop-blur-2xl py-4 px-6"
      style={{
        borderColor: 'rgba(74, 222, 128, 0.1)',
        background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.03), rgba(34, 197, 94, 0.01))'
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <p className="text-emerald-300/80 text-sm">
            © 2025 CRM Imperial Seguros. Todos os direitos reservados.
          </p>
        </div>
        
        <div className="flex items-center space-x-4 text-emerald-300/70 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{currentTime.toLocaleDateString('pt-PT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
            <span className="font-mono">
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