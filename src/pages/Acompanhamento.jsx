import React, { useState } from 'react';
import { 
  Search, Filter, Eye, Phone, MapPin, Clock, CheckCircle,
  Calendar, User, MessageSquare, FileText, TrendingUp,
  XCircle, AlertCircle, ChevronRight, Printer, Send, Mail
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const initialCotacoes = [
    {
      id: 'CT-2024-001',
      cliente: 'João Santos',
      tipo: 'Automóvel',
      valor: 85000,
      dataCriacao: '2024-01-15',
      status: 'ativa',
      finalizada: false,
      agente: 'Maria Silva',
      agenteInicial: 'Maria Silva',
      subscritorFinalizou: '',
      encerradoPor: '',
      telefone: '+258 84 123 4567',
      email: 'joao.santos@email.com',
      estagio: 'Negociação',
      progresso: [
        { etapa: 'Criação', data: '2024-01-15', status: 'concluida', tipo: 'sistema' },
        { etapa: 'Envio ao Cliente', data: '2024-01-16', status: 'concluida', tipo: 'email' },
        { etapa: 'Contato Telefônico', data: '2024-01-17', status: 'concluida', tipo: 'telefone' },
        { etapa: 'Visita ao Cliente', data: '2024-01-18', status: 'concluida', tipo: 'visita' },
        { etapa: 'Negociação', data: '2024-01-20', status: 'em_andamento', tipo: 'telefone' },
        { etapa: 'Aprovação', data: null, status: 'pendente', tipo: null }
      ],
      ultimaAtualizacao: '2024-01-20',
      motivoNaoFinalizada: 'Aguardando resposta do cliente sobre condições',
      proximaAcao: 'Ligar novamente em 2 dias'
    },
    {
      id: 'CT-2024-002',
      cliente: 'Maria Costa',
      tipo: 'Saúde',
      valor: 50000,
      dataCriacao: '2024-01-10',
      status: 'pendente',
      finalizada: false,
      agente: 'Pedro Lima',
      agenteInicial: 'Pedro Lima',
      subscritorFinalizou: '',
      encerradoPor: '',
      telefone: '+258 84 234 5678',
      email: 'maria.costa@email.com',
      estagio: 'Aguardando Documentos',
      progresso: [
        { etapa: 'Criação', data: '2024-01-10', status: 'concluida', tipo: 'sistema' },
        { etapa: 'Envio ao Cliente', data: '2024-01-11', status: 'concluida', tipo: 'email' },
        { etapa: 'Contato Telefônico', data: '2024-01-12', status: 'concluida', tipo: 'telefone' },
        { etapa: 'Aguardando Documentos', data: '2024-01-13', status: 'em_andamento', tipo: 'telefone' },
        { etapa: 'Análise', data: null, status: 'pendente', tipo: null },
        { etapa: 'Aprovação', data: null, status: 'pendente', tipo: null }
      ],
      ultimaAtualizacao: '2024-01-18',
      motivoNaoFinalizada: 'Cliente precisa enviar documentos médicos',
      proximaAcao: 'Enviar lembrete por email'
    },
    {
      id: 'CT-2024-003',
      cliente: 'Carlos Oliveira',
      tipo: 'Residência',
      valor: 250000,
      dataCriacao: '2024-01-05',
      status: 'finalizada',
      finalizada: true,
      agente: 'Ana Costa',
      agenteInicial: 'Ana Costa',
      subscritorFinalizou: 'João Ferraz',
      encerradoPor: '',
      telefone: '+258 84 345 6789',
      email: 'carlos.oliveira@email.com',
      estagio: 'Finalizada',
      progresso: [
        { etapa: 'Criação', data: '2024-01-05', status: 'concluida', tipo: 'sistema' },
        { etapa: 'Envio ao Cliente', data: '2024-01-06', status: 'concluida', tipo: 'email' },
        { etapa: 'Contato Telefônico', data: '2024-01-07', status: 'concluida', tipo: 'telefone' },
        { etapa: 'Visita ao Cliente', data: '2024-01-08', status: 'concluida', tipo: 'visita' },
        { etapa: 'Análise', data: '2024-01-10', status: 'concluida', tipo: 'sistema' },
        { etapa: 'Aprovação', data: '2024-01-15', status: 'concluida', tipo: 'sistema' }
      ],
      ultimaAtualizacao: '2024-01-19',
      motivoNaoFinalizada: null,
      proximaAcao: 'Apólice emitida - seguimento pós-venda'
    },
    {
      id: 'CT-2024-004',
      cliente: 'Ana Silva',
      tipo: 'Viagem',
      valor: 15000,
      dataCriacao: '2024-01-12',
      status: 'expirada',
      finalizada: false,
      agente: 'João Santos',
      agenteInicial: 'João Santos',
      subscritorFinalizou: '',
      encerradoPor: 'Equipe Comercial',
      telefone: '+258 84 456 7890',
      email: 'ana.silva@email.com',
      estagio: 'Expirada',
      progresso: [
        { etapa: 'Criação', data: '2024-01-12', status: 'concluida', tipo: 'sistema' },
        { etapa: 'Envio ao Cliente', data: '2024-01-12', status: 'concluida', tipo: 'email' },
        { etapa: 'Contato Telefônico', data: '2024-01-14', status: 'concluida', tipo: 'telefone' },
        { etapa: 'Aguardando Resposta', data: '2024-01-15', status: 'em_andamento', tipo: 'telefone' }
      ],
      ultimaAtualizacao: '2024-01-17',
      motivoNaoFinalizada: 'Cotação expirada - cliente não respondeu',
      proximaAcao: 'Follow-up para renovação'
    }
  ];

function Acompanhamento() {
  const { themeConfig, language } = useTheme();
  const logoUrl = new URL('../assets/logo.png', import.meta.url).href;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCotacao, setSelectedCotacao] = useState(null);
  const [cotacoes, setCotacoes] = useState(() => initialCotacoes);
  const [formState, setFormState] = useState({});

  const getText = (pt, en, fr) => {
    switch (language) {
      case 'pt': return pt;
      case 'en': return en;
      case 'fr': return fr;
      default: return pt;
    }
  };

  const buildDefaultForm = (cotacao, extra = {}) => ({
    etapa: '',
    tipo: 'telefone',
    status: 'pendente',
    data: '',
    observacoes: '',
    responsavel: '',
    agenteInicial: cotacao.agenteInicial || cotacao.agente || '',
    subscritorFinalizou: cotacao.subscritorFinalizou || '',
    encerradoPor: cotacao.encerradoPor || '',
    ...extra
  });

  const updateFormState = (cotacao, field, value) => {
    setFormState((prev) => {
      const current = prev[cotacao.id] ? { ...prev[cotacao.id] } : buildDefaultForm(cotacao);
      return {
        ...prev,
        [cotacao.id]: {
          ...current,
          [field]: value
        }
      };
    });
  };

  const handleAddProgress = (cotacao) => {
    const current = formState[cotacao.id] ? { ...buildDefaultForm(cotacao), ...formState[cotacao.id] } : buildDefaultForm(cotacao);
    if (!current.etapa.trim()) return;

    const newEntry = {
      etapa: current.etapa,
      data: current.data || new Date().toISOString().slice(0, 10),
      status: current.status,
      tipo: current.tipo || 'sistema'
    };

    setCotacoes((prev) =>
      prev.map((c) =>
        c.id === cotacao.id
          ? {
              ...c,
              progresso: [...c.progresso, newEntry],
              observacoes: current.observacoes || c.observacoes,
              responsavelAtual: current.responsavel || c.responsavelAtual,
              agenteInicial: current.agenteInicial || c.agenteInicial,
              subscritorFinalizou: current.subscritorFinalizou || c.subscritorFinalizou,
              encerradoPor: current.encerradoPor || c.encerradoPor
            }
          : c
      )
    );

    setFormState((prev) => ({
      ...prev,
      [cotacao.id]: buildDefaultForm(cotacao)
    }));
  };

  const filteredCotacoes = cotacoes.filter(cotacao => {
    const matchesSearch = cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.agente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'finalizada' && cotacao.finalizada) ||
                         (filterStatus === 'ativa' && cotacao.status === 'ativa' && !cotacao.finalizada) ||
                         (filterStatus === 'pendente' && cotacao.status === 'pendente');
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (tipo) => {
    switch (tipo) {
      case 'telefone': return Phone;
      case 'email': return Mail;
      case 'visita': return MapPin;
      case 'sistema': return FileText;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluida': 
        return { 
          style: {
            background: themeConfig.primary + '33',
            color: themeConfig.primaryLight,
            borderColor: themeConfig.primary + '4d'
          }
        };
      case 'em_andamento': 
        return { 
          style: {
            background: 'rgba(245, 158, 11, 0.2)', 
            color: '#fbbf24', 
            borderColor: 'rgba(245, 158, 11, 0.3)'
          }
        };
      case 'pendente': 
        return { 
          style: {
            background: 'rgba(107, 114, 128, 0.2)', 
            color: themeConfig.textSecondary, 
            borderColor: 'rgba(107, 114, 128, 0.3)'
          }
        };
      default: 
        return { 
          style: {
            background: 'rgba(107, 114, 128, 0.2)', 
            color: themeConfig.textSecondary, 
            borderColor: 'rgba(107, 114, 128, 0.3)'
          }
        };
    }
  };

  const handlePrint = (cotacao) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) return;

    const progressoRows = cotacao.progresso
      .map(
        (p) => `
        <tr>
          <td>${p.etapa}</td>
          <td>${p.data || '-'}</td>
          <td>${p.status}</td>
          <td>${p.tipo || '-'}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Acompanhamento - ${cotacao.id}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 32px; background: #f5f6f8; color: #0f172a; }
            .sheet { background: #fff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .brand { display: flex; align-items: center; gap: 12px; }
            .brand img { height: 56px; }
            .title { font-size: 20px; font-weight: 800; color: #16a34a; }
            .subtitle { font-size: 12px; color: #475569; }
            .section { margin-top: 18px; }
            .section h3 { margin: 0 0 8px; font-size: 14px; color: #111827; }
            .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; font-size: 13px; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; text-align: left; }
            th { background: #f8fafc; color: #0f172a; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div class="brand">
                <img src="${logoUrl}" alt="Logo" />
                <div>
                  <div class="title">Imperial Seguros</div>
                  <div class="subtitle">Acompanhamento da Cotação</div>
                </div>
              </div>
              <div class="meta" style="max-width: 280px;">
                <div><strong>ID:</strong> ${cotacao.id}</div>
                <div><strong>Data:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Cliente:</strong> ${cotacao.cliente}</div>
                <div><strong>Valor:</strong> ${cotacao.valor.toLocaleString('pt-MZ')} MZN</div>
              </div>
            </div>

            <div class="section">
              <h3>Resumo</h3>
              <div class="meta">
                <div><strong>Agente:</strong> ${cotacao.agente}</div>
                <div><strong>Agente Inicial:</strong> ${cotacao.agenteInicial || '-'}</div>
                <div><strong>Subscritor Finalizou:</strong> ${cotacao.subscritorFinalizou || '-'}</div>
                <div><strong>Encerrado por:</strong> ${cotacao.encerradoPor || '-'}</div>
                <div><strong>Estágio Atual:</strong> ${cotacao.estagio}</div>
                <div><strong>Status:</strong> ${cotacao.status}</div>
                <div><strong>Telefone:</strong> ${cotacao.telefone}</div>
                <div><strong>Email:</strong> ${cotacao.email}</div>
              </div>
            </div>

            <div class="section">
              <h3>Progresso</h3>
              <table>
                <thead>
                  <tr>
                    <th>Etapa</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Canal</th>
                  </tr>
                </thead>
                <tbody>${progressoRows}</tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  const handleEmail = (cotacao) => {
    console.log('Enviar email:', cotacao);
    const subject = encodeURIComponent(`Acompanhamento - Cotação ${cotacao.id}`);
    const body = encodeURIComponent(`Prezado(a) ${cotacao.cliente},\n\nSegue o acompanhamento da sua cotação ${cotacao.id}.\n\nStatus atual: ${cotacao.estagio}\nProgresso: ${cotacao.progresso.filter(p => p.status === 'concluida').length}/${cotacao.progresso.length} etapas\n\nAtenciosamente,\nImperial Seguros`);
    window.location.href = `mailto:${cotacao.email}?subject=${subject}&body=${body}`;
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
            {getText("Acompanhamento de Cotações", "Quote Tracking", "Suivi des Devis")}
          </h1>
          <p style={{ color: themeConfig.textSecondary }}>
            {getText("Visualize o andamento e acompanhe o progresso das cotações ativas", "View progress and track active quotes", "Visualisez la progression et suivez les devis actifs")}
          </p>
        </div>

        {/* Filtros */}
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
                    color: themeConfig.text
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" style={{ color: themeConfig.primary }} />
              <select
                className="px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02] focus:ring-2"
                style={{
                  background: '#ffffff',
                  border: `1px solid ${themeConfig.border}`,
                  color: '#000000'
                }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{getText("Todas", "All", "Toutes")}</option>
                <option value="ativa">{getText("Ativas", "Active", "Actives")}</option>
                <option value="finalizada">{getText("Finalizadas", "Completed", "Terminées")}</option>
                <option value="pendente">{getText("Pendentes", "Pending", "En attente")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Cotações */}
        <div className="space-y-4">
          {filteredCotacoes.map((cotacao) => {
            const progressoCompleto = cotacao.progresso.filter(p => p.status === 'concluida').length;
            const totalEtapas = cotacao.progresso.length;
            const progressoPercent = Math.round((progressoCompleto / totalEtapas) * 100);
            const currentForm = formState[cotacao.id]
              ? { ...buildDefaultForm(cotacao), ...formState[cotacao.id] }
              : buildDefaultForm(cotacao);

            return (
              <div
                key={cotacao.id}
                className="rounded-2xl p-6 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.02))',
                  borderColor: cotacao.finalizada ? 'rgba(34, 197, 94, 0.3)' : 'rgba(74, 222, 128, 0.1)'
                }}
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-bold text-white">{cotacao.cliente}</h3>
                      <span className="font-mono text-emerald-300 text-sm">{cotacao.id}</span>
                      {cotacao.finalizada && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Finalizada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-emerald-200/70">
                      <span className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{cotacao.agente}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{cotacao.tipo}</span>
                      </span>
                      <span>{cotacao.valor.toLocaleString('pt-MZ')} MZN</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs text-emerald-100/80">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-300" />
                        <span>Agente inicial: <strong>{cotacao.agenteInicial || '—'}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-amber-300" />
                        <span>Subscritor finalizou: <strong>{cotacao.subscritorFinalizou || '—'}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-rose-300" />
                        <span>Encerrado por: <strong>{cotacao.encerradoPor || '—'}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
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
                      onClick={() => setSelectedCotacao(selectedCotacao === cotacao.id ? null : cotacao.id)}
                      className="p-2 text-emerald-300 hover:bg-emerald-300/10 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-300 font-medium">{cotacao.estagio}</span>
                    <span className="text-sm text-emerald-200/70">{progressoPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(74, 222, 128, 0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressoPercent}%`,
                        background: cotacao.finalizada 
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : 'linear-gradient(90deg, #4ade80, #22c55e)'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Timeline de Progresso */}
                {selectedCotacao === cotacao.id && (
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(74, 222, 128, 0.1)' }}>
                    <h4 className="text-sm font-semibold text-white mb-4">Histórico de Progresso</h4>
                    <div className="space-y-3">
                      {cotacao.progresso.map((etapa, idx) => {
                        const IconComponent = getStatusIcon(etapa.tipo);
                        const statusColors = getStatusColor(etapa.status);
                        return (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg border" style={statusColors.style}>
                              <IconComponent className="h-4 w-4" style={{ color: statusColors.style.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium" style={{ color: statusColors.style.color }}>
                                  {etapa.etapa}
                                </span>
                                {etapa.data && (
                                  <span className="text-xs text-emerald-200/60">{etapa.data}</span>
                                )}
                              </div>
                              {etapa.tipo && (
                                <span className="text-xs text-emerald-200/50">
                                  Via {etapa.tipo === 'telefone' ? 'Chamada Telefónica' : 
                                       etapa.tipo === 'email' ? 'Email' : 
                                       etapa.tipo === 'visita' ? 'Visita ao Cliente' : 'Sistema'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Formulário de acompanhamento */}
                    <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: 'rgba(74, 222, 128, 0.15)', background: 'rgba(15, 23, 42, 0.35)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white">Adicionar atualização</h4>
                        <span className="text-[11px] text-emerald-200/70">Registre novas etapas, responsáveis e observações</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={currentForm.etapa}
                          onChange={(e) => updateFormState(cotacao, 'etapa', e.target.value)}
                          placeholder="Etapa / atividade"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        />
                        <input
                          type="date"
                          value={currentForm.data}
                          onChange={(e) => updateFormState(cotacao, 'data', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        />
                        <select
                          value={currentForm.tipo}
                          onChange={(e) => updateFormState(cotacao, 'tipo', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        >
                          <option value="telefone" className="text-black">Telefone</option>
                          <option value="email" className="text-black">Email</option>
                          <option value="visita" className="text-black">Visita</option>
                          <option value="sistema" className="text-black">Sistema</option>
                        </select>
                        <select
                          value={currentForm.status}
                          onChange={(e) => updateFormState(cotacao, 'status', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        >
                          <option value="concluida" className="text-black">Concluída</option>
                          <option value="em_andamento" className="text-black">Em andamento</option>
                          <option value="pendente" className="text-black">Pendente</option>
                        </select>
                        <input
                          type="text"
                          value={currentForm.responsavel}
                          onChange={(e) => updateFormState(cotacao, 'responsavel', e.target.value)}
                          placeholder="Responsável atual"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={currentForm.agenteInicial}
                          onChange={(e) => updateFormState(cotacao, 'agenteInicial', e.target.value)}
                          placeholder="Agente que iniciou"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={currentForm.subscritorFinalizou}
                          onChange={(e) => updateFormState(cotacao, 'subscritorFinalizou', e.target.value)}
                          placeholder="Subscritor que finalizou"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={currentForm.encerradoPor}
                          onChange={(e) => updateFormState(cotacao, 'encerradoPor', e.target.value)}
                          placeholder="Quem encerrou"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                        />
                      </div>
                      <textarea
                        rows="3"
                        value={currentForm.observacoes}
                        onChange={(e) => updateFormState(cotacao, 'observacoes', e.target.value)}
                        placeholder="Observações ou notas adicionais"
                        className="w-full mt-3 px-3 py-2 rounded-lg bg-slate-900/40 border border-emerald-500/20 text-white text-sm"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleAddProgress(cotacao)}
                          className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition"
                        >
                          Guardar atualização
                        </button>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    {!cotacao.finalizada && (
                      <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-300 mb-1">Motivo da não finalização:</p>
                            <p className="text-sm text-amber-200/80">{cotacao.motivoNaoFinalizada}</p>
                            <p className="text-xs text-amber-200/60 mt-2">
                              <strong>Próxima ação:</strong> {cotacao.proximaAcao}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {cotacao.finalizada && (
                      <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-emerald-300 mb-1">Cotação Finalizada</p>
                            <p className="text-sm text-emerald-200/80">
                              Apólice emitida com sucesso. Seguimento pós-venda ativo.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Informações de Contato */}
                    <div className="mt-4 flex items-center space-x-4 text-sm text-emerald-200/70">
                      <span className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{cotacao.telefone}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{cotacao.email}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Botão para expandir */}
                {selectedCotacao !== cotacao.id && (
                  <button
                    onClick={() => setSelectedCotacao(cotacao.id)}
                    className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 transition-colors"
                  >
                    <span>Ver detalhes completos</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Acompanhamento;