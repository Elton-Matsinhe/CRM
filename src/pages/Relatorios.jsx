import React, { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Filter, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { relatorioService, cotacaoService, usuarioService } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Relatorios() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    status: '',
    agente_id: '',
    data_inicio: '',
    data_fim: ''
  });
  const [agentes, setAgentes] = useState([]);

  // Verificar se é admin
  useEffect(() => {
    if (usuario && usuario.role !== 'admin') {
      alert('❌ Acesso negado. Apenas administradores podem acessar relatórios.');
      navigate('/dashboard');
    }
  }, [usuario, navigate]);

  // Carregar agentes
  useEffect(() => {
    carregarAgentes();
  }, []);

  const carregarAgentes = async () => {
    try {
      const usuarios = await usuarioService.findAll();
      if (usuarios && usuarios.length > 0) {
        setAgentes(usuarios.filter(u => u.role === 'agente'));
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
    }
  };

  const handleBaixarPDF = async () => {
    try {
      setLoading(true);
      const result = await relatorioService.baixarPDF(filtros);
      
      if (result.success) {
        alert('✅ Relatório PDF baixado com sucesso!');
      } else {
        alert(`❌ Erro ao baixar relatório: ${result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('❌ Erro ao baixar relatório PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleBaixarExcel = async () => {
    try {
      setLoading(true);
      const result = await relatorioService.baixarExcel(filtros);
      
      if (result.success) {
        alert('✅ Relatório Excel baixado com sucesso!');
      } else {
        alert(`❌ Erro ao baixar relatório: ${result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao baixar Excel:', error);
      alert('❌ Erro ao baixar relatório Excel.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (usuario && usuario.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📊 Relatórios de Cotações
              </h1>
              <p className="text-gray-600">
                Gere relatórios completos em PDF ou Excel com todas as informações das cotações
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Filtros de Relatório</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mês */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Mês
              </label>
              <select
                value={filtros.mes}
                onChange={(e) => handleFiltroChange('mes', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {meses.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>

            {/* Ano */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={filtros.ano}
                onChange={(e) => handleFiltroChange('ano', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {anos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) => handleFiltroChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos</option>
                <option value="ativa">Ativa</option>
                <option value="pendente">Pendente</option>
                <option value="expirada">Expirada</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Agente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Agente
              </label>
              <select
                value={filtros.agente_id}
                onChange={(e) => handleFiltroChange('agente_id', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos os Agentes</option>
                {agentes.map(agente => (
                  <option key={agente.id} value={agente.id}>{agente.nome}</option>
                ))}
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início (Personalizado)
              </label>
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => handleFiltroChange('data_inicio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim (Personalizado)
              </label>
              <input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Botões de Download */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Baixar Relatórios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Botão PDF */}
            <button
              onClick={handleBaixarPDF}
              disabled={loading}
              className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <FileText className="h-6 w-6" />
                  <span className="font-semibold text-lg">Baixar Relatório PDF</span>
                </>
              )}
            </button>

            {/* Botão Excel */}
            <button
              onClick={handleBaixarExcel}
              disabled={loading}
              className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <FileSpreadsheet className="h-6 w-6" />
                  <span className="font-semibold text-lg">Baixar Relatório Excel</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">Informações sobre os Relatórios:</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Os relatórios incluem todas as cotações que correspondem aos filtros selecionados</li>
                  <li>Relatórios mensais: selecione o mês e ano desejados</li>
                  <li>Relatórios personalizados: use as datas de início e fim</li>
                  <li>Os relatórios incluem resumo estatístico e detalhes completos de cada cotação</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;

