import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Download, FileText, FileSpreadsheet, Calendar, Filter,
  User, MapPin, Loader2, TrendingUp, PieChart, Info, Sparkles, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { relatorioService, cotacaoService, usuarioService, balcaoService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { MESES, filtrarCotacoes, getTituloRelatorio, getResumoFiltros } from '../utils/relatorioFilters';
import { calcularEstatisticas, gerarPieChartSVG } from '../utils/relatorioStats';
import { baixarRelatorioPDF } from '../utils/relatorioCotacaoPdf';
import { STATUS_FILTER_OPTIONS } from '../utils/cotacaoStatus';

function Relatorios() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [cotacoes, setCotacoes] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [balcoes, setBalcoes] = useState([]);
  const [filtros, setFiltros] = useState({
    modo: 'mensal',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    status: '',
    agente_id: '',
    balcao: '',
    data_inicio: '',
    data_fim: '',
  });

  useEffect(() => {
    if (usuario && usuario.role !== 'admin') {
      alert('❌ Acesso negado. Apenas administradores podem aceder a relatórios.');
      navigate('/dashboard');
    }
  }, [usuario, navigate]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoadingPreview(true);
    try {
      const [resCot, resAg, resBal] = await Promise.all([
        cotacaoService.listar({ page: 1, limit: 10000 }),
        usuarioService.findAll(),
        balcaoService.listar(),
      ]);
      if (resCot.success) setCotacoes(resCot.data || []);
      if (resAg.success && resAg.data) {
        setAgentes(resAg.data.filter((u) => u.role === 'agente'));
      }
      if (resBal.success) setBalcoes(resBal.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPreview(false);
    }
  };

  const cotacoesFiltradas = useMemo(
    () => filtrarCotacoes(cotacoes, filtros),
    [cotacoes, filtros]
  );

  const stats = useMemo(
    () => calcularEstatisticas(cotacoesFiltradas),
    [cotacoesFiltradas]
  );

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({
      modo: 'mensal',
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      status: '',
      agente_id: '',
      balcao: '',
      data_inicio: '',
      data_fim: '',
    });
  };

  const handleBaixarPDF = async () => {
    if (cotacoesFiltradas.length === 0) {
      alert('⚠️ Nenhuma cotação encontrada com os filtros seleccionados.');
      return;
    }
    try {
      setLoading(true);
      const result = await baixarRelatorioPDF(cotacoesFiltradas, filtros, { agentes, balcoes });
      if (result.success) {
        alert('✅ Relatório PDF descarregado com sucesso!');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erro ao gerar relatório PDF.');
    } finally {
      setLoading(false);
    }
  };

  const buildFiltrosExport = () => {
    const base = {
      status: filtros.status,
      agente_id: filtros.agente_id,
      balcao: filtros.balcao,
    };
    if (filtros.modo === 'personalizado') {
      return { ...base, data_inicio: filtros.data_inicio, data_fim: filtros.data_fim };
    }
    return { ...base, mes: filtros.mes, ano: filtros.ano };
  };

  const handleBaixarExcel = async () => {
    try {
      setLoading(true);
      const result = await relatorioService.baixarExcel(buildFiltrosExport());
      if (result.success) {
        alert('✅ Relatório Excel descarregado com sucesso!');
      } else {
        alert(`❌ Erro: ${result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erro ao descarregar relatório Excel.');
    } finally {
      setLoading(false);
    }
  };

  const anos = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  if (usuario && usuario.role !== 'admin') return null;

  const statCards = [
    { label: 'Total Cotações', value: stats.total, icon: FileText, color: 'from-emerald-500 to-teal-600' },
    { label: 'Valor Total (MT)', value: stats.totalPremio.toLocaleString('pt-MZ', { minimumFractionDigits: 2 }), icon: TrendingUp, color: 'from-green-600 to-emerald-700' },
    { label: 'Ativas', value: stats.ativas, icon: Sparkles, color: 'from-teal-500 to-cyan-600' },
    { label: 'Pendentes', value: stats.pendentes, icon: Calendar, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="w-full max-w-[100%]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 pb-5 border-b border-gray-200/80"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
                  <BarChart3 className="h-7 w-7" />
                </span>
                Relatórios de Cotações
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Gere relatórios completos em PDF ou Excel com resumo estatístico, gráficos e detalhes de cada cotação.
              </p>
            </div>
            <button
              type="button"
              onClick={carregarDados}
              disabled={loadingPreview}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 hover:bg-emerald-50 hover:border-emerald-300 transition-colors text-sm font-medium text-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${loadingPreview ? 'animate-spin' : ''}`} />
              Actualizar dados
            </button>
          </div>
        </motion.div>

        {/* Preview título dinâmico */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200/60"
        >
          <p className="text-sm text-emerald-800 font-medium">{getTituloRelatorio(filtros)}</p>
          <p className="text-xs text-gray-600 mt-0.5">{getResumoFiltros(filtros, agentes, balcoes)}</p>
        </motion.div>

        {/* Stats cards animados */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white/70 backdrop-blur-sm p-4 hover:shadow-md hover:border-emerald-200 transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-full`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                    {loadingPreview ? '—' : card.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white shadow-sm`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-1 space-y-4"
          >
            <div className="rounded-xl border border-gray-200/80 bg-white/60 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  Filtros
                </h2>
                <button type="button" onClick={limparFiltros} className="text-xs text-emerald-600 hover:underline">
                  Limpar
                </button>
              </div>

              {/* Modo */}
              <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
                {[
                  { id: 'mensal', label: 'Mensal' },
                  { id: 'personalizado', label: 'Personalizado' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleFiltroChange('modo', m.id)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      filtros.modo === m.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filtros.modo === 'mensal' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mês</label>
                      <select
                        value={filtros.mes}
                        onChange={(e) => handleFiltroChange('mes', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/80 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {MESES.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ano</label>
                      <select
                        value={filtros.ano}
                        onChange={(e) => handleFiltroChange('ano', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/80 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {anos.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {filtros.modo === 'personalizado' && (
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
                      <input
                        type="date"
                        value={filtros.data_inicio}
                        onChange={(e) => handleFiltroChange('data_inicio', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/80 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
                      <input
                        type="date"
                        value={filtros.data_fim}
                        onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/80 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={filtros.status}
                    onChange={(e) => handleFiltroChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/80 text-sm"
                  >
                    <option value="">Todos os status</option>
                    {STATUS_FILTER_OPTIONS.filter((o) => o.value !== 'all').map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> Agente
                  </label>
                  <select
                    value={filtros.agente_id}
                    onChange={(e) => handleFiltroChange('agente_id', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/80 text-sm"
                  >
                    <option value="">Todos os agentes</option>
                    {agentes.map((a) => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Balcão
                  </label>
                  <select
                    value={filtros.balcao}
                    onChange={(e) => handleFiltroChange('balcao', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/80 text-sm"
                  >
                    <option value="">Todos os balcões</option>
                    {balcoes.map((b) => (
                      <option key={b.id || b.nome} value={b.nome}>{b.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Download buttons */}
            <div className="rounded-xl border border-gray-200/80 bg-white/60 backdrop-blur-sm p-5 space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-600" />
                Exportar
              </h3>
              <button
                type="button"
                onClick={handleBaixarPDF}
                disabled={loading || loadingPreview}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200/50 hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                Baixar Relatório PDF
              </button>
              <button
                type="button"
                onClick={handleBaixarExcel}
                disabled={loading || loadingPreview}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-semibold shadow-lg hover:from-gray-900 hover:to-black transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet className="h-5 w-5" />}
                Baixar Relatório Excel
              </button>
              <p className="text-xs text-center text-gray-500">
                {cotacoesFiltradas.length} cotação(ões) seleccionada(s)
              </p>
            </div>
          </motion.div>

          {/* Gráficos preview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartPreviewCard
                title="Por Status"
                loading={loadingPreview}
                svg={gerarPieChartSVG(stats.porStatus, 160)}
                items={stats.porStatus}
              />
              <ChartPreviewCard
                title="Por Balcão"
                loading={loadingPreview}
                svg={gerarPieChartSVG(stats.porBalcao.slice(0, 8), 160)}
                items={stats.porBalcao.slice(0, 8)}
              />
            </div>

            {/* Info box */}
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-5">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900 mb-2">Informações sobre os Relatórios</p>
                  <ul className="text-sm text-emerald-800/90 space-y-1.5 list-disc list-inside">
                    <li>Os relatórios incluem todas as cotações que correspondem aos filtros seleccionados</li>
                    <li>Relatórios mensais: seleccione o mês e ano desejados</li>
                    <li>Relatórios personalizados: use as datas de início e fim</li>
                    <li>O PDF inclui papel timbrado, gráficos de pizza, resumo e tabela detalhada</li>
                    <li>Cores oficiais: verde Imperial, preto e cinza</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mini preview tabela */}
            <AnimatePresence mode="wait">
              {!loadingPreview && cotacoesFiltradas.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-gray-200/80 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-emerald-50/40 border-b border-gray-200 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-gray-700">Pré-visualização (5 primeiras)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead>
                        <tr className="bg-emerald-700 text-white text-xs uppercase">
                          <th className="px-3 py-2 text-left">Número</th>
                          <th className="px-3 py-2 text-left">Cliente</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Balcão</th>
                          <th className="px-3 py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cotacoesFiltradas.slice(0, 5).map((c, i) => (
                          <tr key={c.id} className={i % 2 === 0 ? 'bg-white/80' : 'bg-emerald-50/30'}>
                            <td className="px-3 py-2 font-mono text-emerald-700 text-xs">{c.numero_cotacao}</td>
                            <td className="px-3 py-2 truncate max-w-[140px]">
                              {`${c.primeiro_nome || ''} ${c.sobrenome || ''}`.trim() || '—'}
                            </td>
                            <td className="px-3 py-2 capitalize">{c.status}</td>
                            <td className="px-3 py-2">{c.agente_balcao || '—'}</td>
                            <td className="px-3 py-2 text-right font-semibold">
                              MT {parseFloat(c.total_premio || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ChartPreviewCard({ title, loading, svg, items }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white/70 backdrop-blur-sm p-5 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <PieChart className="h-4 w-4 text-emerald-600" />
        {title}
      </h3>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div dangerouslySetInnerHTML={{ __html: svg }} className="flex-shrink-0" />
          <div className="flex-1 space-y-1.5 w-full">
            {items.slice(0, 6).map((item) => (
              <div key={item.label || item.key} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                <span className="text-gray-600 truncate flex-1">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value}</span>
                <span className="text-gray-400 w-10 text-right">{((item.value / total) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Relatorios;
