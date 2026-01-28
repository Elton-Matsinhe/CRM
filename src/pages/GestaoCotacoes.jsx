import React, { useState } from 'react';
import { 
  Search, Filter, Download, Eye, Edit, MoreVertical, 
  FileText, CheckCircle, Clock, XCircle, TrendingUp,
  Calendar, User, Building, Phone, Mail, MapPin,
  Printer, Send, X, AlertCircle, ChevronRight,
  ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function GestaoCotacoes() {
  const { themeConfig, language } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCotacao, setSelectedCotacao] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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
    },
    {
      id: 'CT-2024-006',
      cliente: 'Roberto Fernandes',
      tipo: 'Vida',
      valor: 100000,
      data: '2024-01-22',
      status: 'pendente',
      agente: 'Luís Santos',
      seguradora: 'Imperial Seguros',
      vencimento: '2024-04-22',
      progresso: 20,
      ultimaAtualizacao: '2024-01-25'
    },
    {
      id: 'CT-2024-007',
      cliente: 'Sofia Martins',
      tipo: 'Automóvel',
      valor: 95000,
      data: '2024-01-18',
      status: 'aprovada',
      agente: 'Pedro Lima',
      seguradora: 'Imperial Seguros',
      vencimento: '2025-01-18',
      progresso: 100,
      ultimaAtualizacao: '2024-01-23'
    },
    {
      id: 'CT-2024-008',
      cliente: 'Miguel Costa',
      tipo: 'Empresarial',
      valor: 750000,
      data: '2024-01-14',
      status: 'ativa',
      agente: 'Carla Mondlane',
      seguradora: 'Imperial Seguros',
      vencimento: '2025-01-14',
      progresso: 85,
      ultimaAtualizacao: '2024-01-24'
    },
    {
      id: 'CT-2024-009',
      cliente: 'Lara Silva',
      tipo: 'Residência',
      valor: 350000,
      data: '2024-01-20',
      status: 'pendente',
      agente: 'Ana Costa',
      seguradora: 'Imperial Seguros',
      vencimento: '2024-04-20',
      progresso: 40,
      ultimaAtualizacao: '2024-01-26'
    },
    {
      id: 'CT-2024-010',
      cliente: 'Ricardo Almeida',
      tipo: 'Viagem',
      valor: 25000,
      data: '2024-01-16',
      status: 'expirada',
      agente: 'Maria Silva',
      seguradora: 'Imperial Seguros',
      vencimento: '2024-02-16',
      progresso: 15,
      ultimaAtualizacao: '2024-01-27'
    }
  ];

  const filteredCotacoes = cotacoes.filter(cotacao => {
    const matchesSearch = cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.agente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cotacao.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Paginação
  const totalPages = Math.ceil(filteredCotacoes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCotacoes.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa': return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' };
      case 'aprovada': return { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' };
      case 'pendente': return { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' };
      case 'expirada': return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' };
      default: return { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-700' };
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

  // Função para gerar números de página com animação
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((number, index) => (
      <button
        key={index}
        onClick={() => typeof number === 'number' && setCurrentPage(number)}
        disabled={typeof number !== 'number'}
        className={`
          relative px-4 py-2 text-sm font-medium transition-all duration-300
          ${typeof number === 'number'
            ? currentPage === number
              ? 'text-white scale-105'
              : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
            : 'text-gray-400 cursor-default'
          }
        `}
      >
        {typeof number === 'number' && currentPage === number && (
          <span className="absolute inset-0 bg-emerald-600 rounded-lg shadow-lg -z-10 animate-fadeIn"></span>
        )}
        {number}
      </button>
    ));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Efeitos de background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-emerald-50 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-green-100/30 rounded-full blur-3xl animate-pulse-slower"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-3xl font-black mb-2 text-gray-900 tracking-tight">
            {getText("Gestão de Cotações", "Quote Management", "Gestion des Devis")}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            {getText("Gerencie e acompanhe todas as cotações do sistema", "Manage and track all system quotes", "Gérez et suivez tous les devis du système")}
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: getText("Total de Cotações", "Total Quotes", "Total Devis"), value: cotacoes.length, icon: FileText, color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
            { label: getText("Ativas", "Active", "Actives"), value: cotacoes.filter(c => c.status === 'ativa').length, icon: CheckCircle, color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
            { label: getText("Pendentes", "Pending", "En attente"), value: cotacoes.filter(c => c.status === 'pendente').length, icon: Clock, color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
            { label: getText("Valor Total", "Total Value", "Valeur Totale"), value: "2.0M", icon: TrendingUp, color: "bg-purple-100 text-purple-700 hover:bg-purple-200" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="rounded-xl p-6 bg-white border border-gray-200 transition-all duration-300 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} transition-colors duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </div>
              <h3 className="text-sm font-semibold mb-2 text-gray-700">{stat.label}</h3>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${(index + 1) * 25}%`,
                    background: `linear-gradient(90deg, ${themeConfig.primaryLight || '#4ade80'}, ${themeConfig.primaryDark || '#22c55e'})`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros e Busca */}
        <div className="rounded-xl p-6 bg-white border border-gray-200 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                <input
                  type="text"
                  placeholder={getText("Buscar por cliente, ID ou agente...", "Search by client, ID or agent...", "Rechercher par client, ID ou agent...")}
                  className="w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-300 border border-gray-300 text-gray-900 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                <select
                  className="pl-10 pr-4 py-3 rounded-lg transition-all duration-300 border border-gray-300 text-gray-900 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-w-[180px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">{getText("Todos os status", "All status", "Tous les statuts")}</option>
                  <option value="ativa">{getText("Ativas", "Active", "Actives")}</option>
                  <option value="aprovada">{getText("Aprovadas", "Approved", "Approuvées")}</option>
                  <option value="pendente">{getText("Pendentes", "Pending", "En attente")}</option>
                  <option value="expirada">{getText("Expiradas", "Expired", "Expirées")}</option>
                </select>
              </div>
              
              <button 
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-emerald-700 flex items-center space-x-2 group bg-emerald-600 text-white"
              >
                <Download className="h-5 w-5 group-hover:animate-bounce" />
                <span>{getText("Exportar", "Export", "Exporter")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Cotações */}
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Agente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Progresso</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((cotacao) => {
                  const statusColors = getStatusColor(cotacao.status);
                  return (
                    <tr 
                      key={cotacao.id} 
                      className="border-b border-gray-100 hover:bg-emerald-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-emerald-700 font-semibold">
                          {cotacao.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{cotacao.cliente}</div>
                        <div className="text-gray-600 text-xs">{cotacao.data}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{cotacao.tipo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-semibold">
                          {cotacao.valor.toLocaleString('pt-MZ')} MZN
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                          {getStatusText(cotacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 text-sm">{cotacao.agente}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200">
                            <div 
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${cotacao.progresso}%`,
                                background: `linear-gradient(90deg, ${themeConfig.primaryLight || '#4ade80'}, ${themeConfig.primaryDark || '#22c55e'})`
                              }}
                            ></div>
                          </div>
                          <span className="text-emerald-700 text-xs font-medium w-10">
                            {cotacao.progresso}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handlePrint(cotacao)}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors duration-200"
                            title="Imprimir"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEmail(cotacao)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Enviar Email"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setSelectedCotacao(cotacao)}
                            className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors duration-200"
                            title="Ver Detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleClose(cotacao.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
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

          {/* Paginação Profissional */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {getText("Mostrar:", "Show:", "Afficher:")}
                </span>
                <select
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-400"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="text-sm text-gray-600">
                  {getText("Itens por página", "Items per page", "Éléments par page")}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 mr-4">
                  {getText("Página", "Page", "Page")} <span className="font-semibold">{currentPage}</span> {getText("de", "of", "de")} <span className="font-semibold">{totalPages}</span>
                </span>

                <div className="flex items-center space-x-1">
                  {/* Primeira página */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={getText("Primeira página", "First page", "Première page")}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>

                  {/* Página anterior */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={getText("Página anterior", "Previous page", "Page précédente")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg p-1">
                    {renderPageNumbers()}
                  </div>

                  {/* Próxima página */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={getText("Próxima página", "Next page", "Page suivante")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Última página */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={getText("Última página", "Last page", "Dernière page")}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCotacoes.length)} {getText("de", "of", "de")} {filteredCotacoes.length} {getText("cotações", "quotes", "devis")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedCotacao && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="rounded-xl p-6 w-full max-w-md bg-white border border-gray-200 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalhes da Cotação</h3>
              <button 
                onClick={() => setSelectedCotacao(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="text-gray-900 font-medium">{selectedCotacao.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="text-gray-900 font-medium">{selectedCotacao.cliente}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="text-gray-900 font-medium">{selectedCotacao.valor.toLocaleString('pt-MZ')} MZN</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedCotacao.status).bg} ${getStatusColor(selectedCotacao.status).text} ${getStatusColor(selectedCotacao.status).border}`}>
                    {getStatusText(selectedCotacao.status)}
                  </span>
                </div>
              </div>
              <button 
                className="w-full py-3 rounded-lg font-semibold transition-colors duration-300 hover:bg-emerald-700 bg-emerald-600 text-white"
              >
                Ver Detalhes Completos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestaoCotacoes;