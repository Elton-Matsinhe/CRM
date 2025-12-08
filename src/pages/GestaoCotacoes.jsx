import React, { useState } from 'react';
import { 
  Search, Filter, Download, Eye, Edit, MoreVertical, 
  FileText, CheckCircle, Clock, XCircle, TrendingUp,
  Calendar, User, Building, Phone, Mail, MapPin,
  Printer, Send, X, AlertCircle, ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function GestaoCotacoes() {
  const { themeConfig, language } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCotacao, setSelectedCotacao] = useState(null);
  const [showActions, setShowActions] = useState({});

  const getText = (pt, en, fr) => {
    switch (language) {
      case 'pt': return pt;
      case 'en': return en;
      case 'fr': return fr;
      default: return pt;
    }
  };

  const cotacoes = [
    {
      id: 'CT-2024-001',
      cliente: 'João Santos',
      tipo: 'Automóvel',
      valor: 85000,
      data: '2024-01-15',
      status: 'ativa',
      agente: 'Maria Silva',
      seguradora: 'Imperial Seguros',
      vencimento: '2024-07-15',
      progresso: 75,
      ultimaAtualizacao: '2024-01-20'
    },
    {
      id: 'CT-2024-002',
      cliente: 'Maria Costa',
      tipo: 'Saúde',
      valor: 50000,
      data: '2024-01-10',
      status: 'pendente',
      agente: 'Pedro Lima',
      seguradora: 'Imperial Seguros',
      vencimento: '2024-04-10',
      progresso: 45,
      ultimaAtualizacao: '2024-01-18'
    },
    {
      id: 'CT-2024-003',
      cliente: 'Carlos Oliveira',
      tipo: 'Residência',
      valor: 250000,
      data: '2024-01-05',
      status: 'aprovada',
      agente: 'Ana Costa',
      seguradora: 'Imperial Seguros',
      vencimento: '2025-01-05',
      progresso: 100,
      ultimaAtualizacao: '2024-01-19'
    },
    {
      id: 'CT-2024-004',
      cliente: 'Ana Silva',
      tipo: 'Viagem',
      valor: 15000,
      data: '2024-01-12',
      status: 'expirada',
      agente: 'João Santos',
      seguradora: 'Imperial Seguros',
      vencimento: '2024-02-12',
      progresso: 30,
      ultimaAtualizacao: '2024-01-17'
    },
    {
      id: 'CT-2024-005',
      cliente: 'Empresa ABC Ltda',
      tipo: 'Empresarial',
      valor: 500000,
      data: '2024-01-08',
      status: 'ativa',
      agente: 'Carla Mondlane',
      seguradora: 'Imperial Seguros',
      vencimento: '2025-01-08',
      progresso: 60,
      ultimaAtualizacao: '2024-01-21'
    }
  ];

  const filteredCotacoes = cotacoes.filter(cotacao => {
    const matchesSearch = cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.agente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cotacao.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa': return { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' };
      case 'aprovada': return { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' };
      case 'pendente': return { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' };
      case 'expirada': return { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' };
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'aprovada': return 'Aprovada';
      case 'pendente': return 'Pendente';
      case 'expirada': return 'Expirada';
      default: return status;
    }
  };

  const handleClose = (id) => {
    console.log('Fechar cotação:', id);
    alert(`Cotação ${id} será fechada.`);
  };

  const handlePrint = (cotacao) => {
    console.log('Imprimir cotação:', cotacao);
    window.print();
  };

  const handleEmail = (cotacao) => {
    console.log('Enviar email:', cotacao);
    const subject = encodeURIComponent(`Cotação ${cotacao.id} - ${cotacao.cliente}`);
    const body = encodeURIComponent(`Prezado(a) ${cotacao.cliente},\n\nSegue em anexo a cotação ${cotacao.id}.\n\nAtenciosamente,\nImperial Seguros`);
    window.location.href = `mailto:${cotacao.cliente}@example.com?subject=${subject}&body=${body}`;
  };

  return (
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
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-black mb-2 bg-clip-text text-transparent"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.primaryLight}, ${themeConfig.primaryDark})`
            }}
          >
            {getText("Gestão de Cotações", "Quote Management", "Gestion des Devis")}
          </h1>
          <p style={{ color: themeConfig.textSecondary }}>
            {getText("Gerencie e acompanhe todas as cotações do sistema", "Manage and track all system quotes", "Gérez et suivez tous les devis du système")}
          </p>
        </div>

        {/* Filtros e Busca */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-sm border mb-8 transition-all duration-500"
          style={{
            background: themeConfig.cardBg,
            borderColor: themeConfig.border
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: themeConfig.primary }} />
                <input
                  type="text"
                  placeholder={getText("Buscar por cliente, ID ou agente...", "Search by client, ID or agent...", "Rechercher par client, ID ou agent...")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02] focus:ring-2"
                  style={{
                    background: themeConfig.cardBg,
                    border: `1px solid ${themeConfig.border}`,
                    color: themeConfig.text,
                    placeholderColor: themeConfig.textSecondary
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <select
                className="px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02] focus:ring-2"
                style={{
                  background: themeConfig.cardBg,
                  border: `1px solid ${themeConfig.border}`,
                  color: themeConfig.text
                }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{getText("Todos os status", "All status", "Tous les statuts")}</option>
                <option value="ativa">{getText("Ativas", "Active", "Actives")}</option>
                <option value="aprovada">{getText("Aprovadas", "Approved", "Approuvées")}</option>
                <option value="pendente">{getText("Pendentes", "Pending", "En attente")}</option>
                <option value="expirada">{getText("Expiradas", "Expired", "Expirées")}</option>
              </select>
              
              <button 
                className="px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.primaryLight}, ${themeConfig.primaryDark})`,
                  color: 'white'
                }}
              >
                <Download className="h-5 w-5" />
                <span>{getText("Exportar", "Export", "Exporter")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Cotações */}
        <div 
          className="rounded-2xl backdrop-blur-sm border overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.02))',
            borderColor: 'rgba(74, 222, 128, 0.1)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(74, 222, 128, 0.2)' }}>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Valor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Agente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Progresso</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCotacoes.map((cotacao) => {
                  const statusColors = getStatusColor(cotacao.status);
                  return (
                    <tr 
                      key={cotacao.id} 
                      className="hover:bg-white/5 transition-colors duration-200"
                      style={{ borderBottom: '1px solid rgba(74, 222, 128, 0.1)' }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-emerald-300 font-semibold">{cotacao.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{cotacao.cliente}</div>
                        <div className="text-emerald-200/60 text-xs">{cotacao.data}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-200/80">{cotacao.tipo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">{cotacao.valor.toLocaleString('pt-MZ')} MZN</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                          {getStatusText(cotacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-200/80 text-sm">{cotacao.agente}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(74, 222, 128, 0.1)' }}>
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${cotacao.progresso}%`,
                                background: 'linear-gradient(90deg, #4ade80, #22c55e)'
                              }}
                            ></div>
                          </div>
                          <span className="text-emerald-300 text-xs font-medium w-10">{cotacao.progresso}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2 relative">
                          <button 
                            onClick={() => handlePrint(cotacao)}
                            className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Imprimir"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEmail(cotacao)}
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Enviar Email"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setSelectedCotacao(cotacao)}
                            className="p-2 text-emerald-300 hover:bg-emerald-300/10 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleClose(cotacao.id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Fechar Cotação"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rodapé */}
          <div className="px-6 py-4 border-t" style={{ borderColor: 'rgba(74, 222, 128, 0.1)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-200/70">
                Mostrando {filteredCotacoes.length} de {cotacoes.length} cotações
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestaoCotacoes;

