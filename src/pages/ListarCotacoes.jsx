// src/pages/ListarCotacoes.jsx
import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, MoreVertical } from 'lucide-react';
import CotacoesLayout from '../components/CotacoesLayout';

function ListarCotacoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dados de exemplo
  const cotações = [
    {
      id: 'CT001',
      cliente: 'João Santos',
      tipo: 'Automóvel',
      valor: '85.000,00',
      data: '15/01/2024',
      status: 'ativa',
      seguradora: 'Imperial Seguros',
      vencimento: '15/01/2025'
    },
    {
      id: 'CT002',
      cliente: 'Maria Costa',
      tipo: 'Saúde',
      valor: '50.000,00',
      data: '20/01/2024',
      status: 'expirada',
      seguradora: 'Imperial Seguros',
      vencimento: '20/01/2024'
    },
    {
      id: 'CT003',
      cliente: 'Carlos Oliveira',
      tipo: 'Residência',
      valor: '250.000,00',
      data: '10/01/2024',
      status: 'ativa',
      seguradora: 'Imperial Seguros',
      vencimento: '10/01/2025'
    },
    {
      id: 'CT004',
      cliente: 'Ana Silva',
      tipo: 'Viagem',
      valor: '15.000,00',
      data: '05/01/2024',
      status: 'cancelada',
      seguradora: 'Imperial Seguros',
      vencimento: '05/04/2024'
    }
  ];

  const filteredCotações = cotações.filter(cotacao => {
    const matchesSearch = cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cotacao.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa': return 'bg-green-500/20 text-green-400';
      case 'expirada': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelada': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'expirada': return 'Expirada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <CotacoesLayout
      title="Listar Cotações"
      subtitle="Visualize e gerencie todas as cotações do sistema"
    >
      <div className="p-8">
        {/* Filtros e Busca */}
        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente ou ID..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <select
                className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="ativa">Ativas</option>
                <option value="expirada">Expiradas</option>
                <option value="cancelada">Canceladas</option>
              </select>
              
              <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Cotações */}
        <div className="bg-gray-700/30 rounded-xl border border-gray-600/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-600/20 border-b border-gray-600/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Valor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vencimento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600/30">
                {filteredCotações.map((cotacao) => (
                  <tr key={cotacao.id} className="hover:bg-gray-600/10 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="font-mono text-green-400 font-semibold">{cotacao.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{cotacao.cliente}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{cotacao.tipo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">${cotacao.valor}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{cotacao.data}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cotacao.status)}`}>
                        {getStatusText(cotacao.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{cotacao.vencimento}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors duration-200" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors duration-200" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:bg-gray-400/10 rounded-lg transition-colors duration-200" title="Mais opções">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rodapé da Tabela */}
          <div className="px-6 py-4 bg-gray-600/20 border-t border-gray-600/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Mostrando {filteredCotações.length} de {cotações.length} cotações
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-600/50 text-gray-300 rounded hover:bg-gray-600 transition-colors duration-200">
                  Anterior
                </button>
                <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200">
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CotacoesLayout>
  );
}

export default ListarCotacoes;