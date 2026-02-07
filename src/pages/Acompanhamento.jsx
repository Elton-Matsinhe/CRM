import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, Phone, MapPin, Clock, CheckCircle,
  Calendar, User, MessageSquare, FileText, TrendingUp,
  XCircle, AlertCircle, ChevronRight, Printer, Send, Mail,
  Upload, X, Check, ChevronLeft, Download, FileCheck, SendHorizontal,
  FileUp, CheckSquare, ChevronsLeft, ChevronsRight, Ban, Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cotacaoService, followUpService, usuarioService } from '../services/api';

// Dados fictícios removidos - agora vem do backend

// Questões diferentes para cada semana
const questoesPorSemana = [
  [
    {
      id: 'opcao1',
      label: 'Cliente demonstrou resistência ao valor proposto',
      description: 'O cliente expressou preocupação com o preço da cotação'
    },
    {
      id: 'opcao2',
      label: 'Cliente precisa de mais informações técnicas',
      description: 'Solicitou detalhes sobre coberturas e exclusões'
    },
    {
      id: 'opcao3',
      label: 'Cliente está analisando outras propostas',
      description: 'Mencionou que está comparando com concorrentes'
    },
    {
      id: 'opcao4',
      label: 'Cliente precisa consultar outras pessoas',
      description: 'Decisão depende de sócios, familiares ou conselho'
    }
  ],
  [
    {
      id: 'opcao1',
      label: 'Cliente solicitou alterações na proposta',
      description: 'Quer ajustar valores, coberturas ou condições'
    },
    {
      id: 'opcao2',
      label: 'Aguardando documentação do cliente',
      description: 'Cliente precisa fornecer documentos pendentes'
    },
    {
      id: 'opcao3',
      label: 'Proposta precisa de ajustes internos',
      description: 'Necessita revisão técnica ou aprovação da subscrição'
    },
    {
      id: 'opcao4',
      label: 'Cliente com dificuldade de agenda',
      description: 'Não conseguiu agendar reunião para dar seguimento'
    }
  ],
  [
    {
      id: 'opcao1',
      label: 'Cliente tem dúvidas sobre termos do contrato',
      description: 'Precisa esclarecer cláusulas específicas'
    },
    {
      id: 'opcao2',
      label: 'Questões sobre forma de pagamento',
      description: 'Discutindo parcelamento ou métodos de pagamento'
    },
    {
      id: 'opcao3',
      label: 'Aguardando aprovação orçamentária',
      description: 'Cliente precisa de aprovação financeira interna'
    },
    {
      id: 'opcao4',
      label: 'Precisa de proposta comparativa formal',
      description: 'Solicitou apresentação comparativa com concorrentes'
    }
  ],
  [
    {
      id: 'opcao1',
      label: 'Cliente pediu prazo adicional para decisão',
      description: 'Solicitou mais tempo para analisar a proposta final'
    },
    {
      id: 'opcao2',
      label: 'Necessita de revisão jurídica',
      description: 'Contrato em análise pelo departamento jurídico'
    },
    {
      id: 'opcao3',
      label: 'Dificuldades com sinistralidade anterior',
      description: 'Histórico de sinistros requer análise especial'
    },
    {
      id: 'opcao4',
      label: 'Questões operacionais pendentes',
      description: 'Detalhes logísticos ou operacionais a resolver'
    }
  ]
];

// Opções de motivo para recusa
const motivosRecusa = [
  {
    id: 'preco',
    label: 'Preço muito elevado',
    description: 'Cliente considerou o valor da cotação acima do esperado'
  },
  {
    id: 'cobertura',
    label: 'Cobertura insuficiente',
    description: 'Cliente deseja mais coberturas ou condições diferentes'
  },
  {
    id: 'concorrente',
    label: 'Proposta de concorrente',
    description: 'Cliente recebeu proposta melhor de outra seguradora'
  },
  {
    id: 'orcamento',
    label: 'Restrição orçamental',
    description: 'Cliente não tem orçamento disponível no momento'
  },
  {
    id: 'urgencia',
    label: 'Perdeu a urgência',
    description: 'Cliente não tem mais necessidade imediata do seguro'
  },
  {
    id: 'confianca',
    label: 'Falta de confiança',
    description: 'Cliente não se sente confortável com a seguradora'
  }
];

const titulosPorSemana = [
  "Primeiro Contato - Análise Inicial",
  "Follow-up - Negociação Detalhada",
  "Apresentação Final - Resolução de Dúvidas",
  "Conclusão - Decisão do Cliente"
];

function Acompanhamento() {
  const { themeConfig, language } = useTheme();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCotacao, setSelectedCotacao] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);
  const [showAcompanhamentoModal, setShowAcompanhamentoModal] = useState(false);
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState(null);
  const [semanaAtual, setSemanaAtual] = useState(0);
  const [formState, setFormState] = useState({});
  const [showEncerramento, setShowEncerramento] = useState(false);
  const [showRecusa, setShowRecusa] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedComprovativo, setUploadedComprovativo] = useState(null);
  const [motivoRecusaSelecionado, setMotivoRecusaSelecionado] = useState('');
  const [outrosMotivosRecusa, setOutrosMotivosRecusa] = useState('');
  const [subscritores, setSubscritores] = useState([]);
  const [subscritoresSelecionados, setSubscritoresSelecionados] = useState([]);
  const [enviarTodosSubscritores, setEnviarTodosSubscritores] = useState(false);
  const [loadingFinalizar, setLoadingFinalizar] = useState(false);
  
  // Paginação - 3 cotações por página
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Carregar cotações do backend
  useEffect(() => {
    carregarCotacoes();
  }, [filterStatus, searchTerm]);

  // Escutar evento de cotação criada para atualizar lista
  useEffect(() => {
    const handleCotacaoCriada = () => {
      carregarCotacoes();
    };

    window.addEventListener('cotacaoCriada', handleCotacaoCriada);
    return () => window.removeEventListener('cotacaoCriada', handleCotacaoCriada);
  }, []);

  // Carregar follow-ups quando uma cotação for selecionada
  useEffect(() => {
    if (selectedCotacao) {
      carregarFollowUps(selectedCotacao);
    }
  }, [selectedCotacao]);

  // Carregar subscritores quando mostrar encerramento
  useEffect(() => {
    if (showEncerramento) {
      carregarSubscritores();
    }
  }, [showEncerramento]);

  const carregarCotacoes = async () => {
    try {
      setLoading(true);
      const filters = {
        page: 1,
        limit: 1000, // Limite alto para buscar todas as cotações
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      };

      console.log('🔍 Buscando cotações com filtros:', filters);
      const result = await cotacaoService.listar(filters);
      console.log('📊 Resultado da busca:', {
        success: result.success,
        total: result.data?.length || 0,
        pagination: result.pagination
      });
      
      if (result.success && result.data) {
        console.log('✅ [Acompanhamento] Dados recebidos:', result.data.length, 'cotações');
        console.log('📋 [Acompanhamento] Primeira cotação (exemplo):', result.data[0]);
        
        const cotacoesFormatadas = result.data.map((cotacao, index) => {
          const cotacaoFormatada = {
            id: cotacao.numero_cotacao || cotacao.id, // Para exibição
            idNumerico: cotacao.id, // ID numérico do backend (importante para operações)
            cliente: `${cotacao.primeiro_nome || ''} ${cotacao.sobrenome || ''}`.trim() || cotacao.cliente?.nome_empresa || 'N/A',
            tipo: 'Automóvel',
            valor: parseFloat(cotacao.total_premio) || 0,
            dataCriacao: cotacao.data_criacao || cotacao.created_at,
            status: cotacao.status || 'pendente',
            finalizada: cotacao.status === 'aprovada' || cotacao.status === 'cancelada',
            agente: cotacao.agente_nome || 'N/A',
            agenteInicial: cotacao.agente_nome || 'N/A',
            telefone: cotacao.cliente_telefone || 'N/A',
            email: cotacao.cliente_email || 'N/A',
            estagio: getEstagio(cotacao.status || 'pendente'),
            progresso: gerarProgresso(cotacao),
            ultimaAtualizacao: cotacao.data_atualizacao || cotacao.updated_at || cotacao.data_criacao || cotacao.created_at,
            motivoNaoFinalizada: '',
            motivoRecusa: '',
            proximaAcao: 'Aguardando follow-up',
            acompanhamentoSemanas: gerarAcompanhamentoSemanas(),
            encerrado: false,
            recusado: false,
            dataEncerramento: null,
            dataRecusa: null,
            comprovativoEncerramento: null,
            reencaminhadoSubscricao: false,
            dadosSubscricao: null
          };
          
          if (index === 0) {
            console.log('📝 [Acompanhamento] Cotação formatada (exemplo):', cotacaoFormatada);
          }
          
          return cotacaoFormatada;
        });
        
        console.log('✅ [Acompanhamento] Total de cotações formatadas:', cotacoesFormatadas.length);
        setCotacoes(cotacoesFormatadas);
      } else {
        console.error('❌ [Acompanhamento] Erro ao carregar cotações:', result.message || 'Erro desconhecido');
        setCotacoes([]);
      }
    } catch (error) {
      console.error("❌ [Acompanhamento] Erro ao carregar cotações:", error);
      console.error("❌ [Acompanhamento] Detalhes do erro:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setCotacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarFollowUps = async (cotacaoId) => {
    try {
      setLoadingFollowUps(true);
      // Usar ID numérico se disponível
      const idParaBuscar = typeof cotacaoId === 'object' ? (cotacaoId.idNumerico || cotacaoId.id) : cotacaoId;
      const result = await followUpService.listar({ cotacao_id: idParaBuscar });
      
      if (result.success) {
        setFollowUps(result.data || []);
        
        // Atualizar acompanhamentoSemanas com dados do backend
        if (cotacaoSelecionada && result.data && result.data.length > 0) {
          const updatedSemanas = cotacaoSelecionada.acompanhamentoSemanas.map((semana, idx) => {
            const followUpSemana = result.data.find(f => f.semana === idx + 1);
            if (followUpSemana) {
              return {
                ...semana,
                status: followUpSemana.status || 'concluida',
                data: followUpSemana.data || semana.data,
                feedback: followUpSemana.feedback || semana.feedback,
                impasses: {
                  opcao1: followUpSemana.impasse_opcao1 || false,
                  opcao2: followUpSemana.impasse_opcao2 || false,
                  opcao3: followUpSemana.impasse_opcao3 || false,
                  opcao4: followUpSemana.impasse_opcao4 || false,
                  outros: followUpSemana.impasse_outros || false,
                  outrosTexto: followUpSemana.impasse_outros_texto || ''
                },
                comprovativo: followUpSemana.comprovativo_path || null
              };
            }
            return semana;
          });
          
          setCotacaoSelecionada(prev => ({
            ...prev,
            acompanhamentoSemanas: updatedSemanas
          }));
        }
      } else {
        setFollowUps([]);
      }
    } catch (error) {
      console.error("Erro ao carregar follow-ups:", error);
      setFollowUps([]);
    } finally {
      setLoadingFollowUps(false);
    }
  };

  const getEstagio = (status) => {
    switch (status) {
      case 'ativa': return 'Negociação';
      case 'aprovada': return 'Aprovada';
      case 'expirada': return 'Expirada';
      case 'cancelada': return 'Cancelada';
      default: return 'Pendente';
    }
  };

  const gerarProgresso = (cotacao) => {
    const etapas = [
      { etapa: 'Criação', data: cotacao.data_criacao, status: 'concluida', tipo: 'sistema' }
    ];

    if (cotacao.status === 'aprovada') {
      etapas.push(
        { etapa: 'Envio ao Cliente', data: cotacao.data_criacao, status: 'concluida', tipo: 'email' },
        { etapa: 'Aprovação', data: cotacao.data_atualizacao || cotacao.data_criacao, status: 'concluida', tipo: 'sistema' }
      );
    } else if (cotacao.status === 'ativa') {
      etapas.push(
        { etapa: 'Envio ao Cliente', data: cotacao.data_criacao, status: 'concluida', tipo: 'email' },
        { etapa: 'Negociação', data: cotacao.data_atualizacao || cotacao.data_criacao, status: 'em_andamento', tipo: 'telefone' },
        { etapa: 'Aprovação', data: null, status: 'pendente', tipo: null }
      );
    }

    return etapas;
  };

  const gerarAcompanhamentoSemanas = () => {
    return [
      {
        semana: 1,
        data: null,
        status: 'pendente',
        feedback: '',
        impasses: {
          opcao1: false,
          opcao2: false,
          opcao3: false,
          opcao4: false,
          outros: false,
          outrosTexto: ''
        },
        comprovativo: null
      },
      {
        semana: 2,
        data: null,
        status: 'pendente',
        feedback: '',
        impasses: {
          opcao1: false,
          opcao2: false,
          opcao3: false,
          opcao4: false,
          outros: false,
          outrosTexto: ''
        },
        comprovativo: null
      },
      {
        semana: 3,
        data: null,
        status: 'pendente',
        feedback: '',
        impasses: {
          opcao1: false,
          opcao2: false,
          opcao3: false,
          opcao4: false,
          outros: false,
          outrosTexto: ''
        },
        comprovativo: null
      },
      {
        semana: 4,
        data: null,
        status: 'pendente',
        feedback: '',
        impasses: {
          opcao1: false,
          opcao2: false,
          opcao3: false,
          opcao4: false,
          outros: false,
          outrosTexto: ''
        },
        comprovativo: null
      }
    ];
  };

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

  const handleAcompanhamentoClick = async (cotacao) => {
    setCotacaoSelecionada(cotacao);
    setSemanaAtual(0);
    setShowAcompanhamentoModal(true);
    setUploadedFile(null);
    setUploadedComprovativo(null);
    setShowEncerramento(false);
    setShowRecusa(false);
    setMotivoRecusaSelecionado('');
    setOutrosMotivosRecusa('');
    
    // Carregar follow-ups existentes do backend
    const cotacaoId = cotacao.idNumerico || cotacao.id;
    if (cotacaoId) {
      await carregarFollowUps(cotacaoId);
    }
  };

  const handleImpassesChange = (semanaIndex, impasse, value) => {
    if (!cotacaoSelecionada) return;

    const updatedCotacao = {
      ...cotacaoSelecionada,
      acompanhamentoSemanas: cotacaoSelecionada.acompanhamentoSemanas.map((semana, idx) => {
        if (idx === semanaIndex) {
          return {
            ...semana,
            impasses: {
              ...semana.impasses,
              [impasse]: value
            }
          };
        }
        return semana;
      })
    };

    setCotacaoSelecionada(updatedCotacao);
  };

  const handleFeedbackChange = (semanaIndex, value) => {
    if (!cotacaoSelecionada) return;

    const updatedCotacao = {
      ...cotacaoSelecionada,
      acompanhamentoSemanas: cotacaoSelecionada.acompanhamentoSemanas.map((semana, idx) => {
        if (idx === semanaIndex) {
          return {
            ...semana,
            feedback: value
          };
        }
        return semana;
      })
    };

    setCotacaoSelecionada(updatedCotacao);
  };

  const handleUpdateAcompanhamento = async () => {
    if (!cotacaoSelecionada) return;

    try {
      // Obter o ID numérico da cotação (pode ser id ou idNumerico)
      const cotacaoId = cotacaoSelecionada.idNumerico || cotacaoSelecionada.id;
      
      if (!cotacaoId) {
        alert('❌ Erro: ID da cotação não encontrado.');
        return;
      }

      const semanasAtual = cotacaoSelecionada.acompanhamentoSemanas[semanaAtual];
      const temImpassesMarcados = Object.entries(semanasAtual.impasses)
        .some(([key, value]) => key !== 'outrosTexto' && value === true);

      // Preparar dados do follow-up para salvar no backend
      const followUpData = {
        cotacao_id: cotacaoId,
        semana: semanaAtual + 1, // Semana 1, 2, 3 ou 4
        data: new Date().toISOString().slice(0, 10),
        feedback: semanasAtual.feedback || '',
        tipo_contato: 'telefone', // Pode ser expandido para permitir seleção
        impasses: {
          opcao1: semanasAtual.impasses?.opcao1 || false,
          opcao2: semanasAtual.impasses?.opcao2 || false,
          opcao3: semanasAtual.impasses?.opcao3 || false,
          opcao4: semanasAtual.impasses?.opcao4 || false,
          outros: semanasAtual.impasses?.outros || false,
          outrosTexto: semanasAtual.impasses?.outrosTexto || null
        },
        comprovativo_path: uploadedComprovativo || null
      };

      // Salvar no backend
      const result = await followUpService.criar(followUpData);

      if (!result.success) {
        alert(`❌ Erro ao salvar acompanhamento: ${result.message || 'Erro desconhecido'}`);
        return;
      }

      // Atualizar estado local após sucesso
      const updatedCotacao = {
        ...cotacaoSelecionada,
        acompanhamentoSemanas: cotacaoSelecionada.acompanhamentoSemanas.map((semana, idx) => {
          if (idx === semanaAtual) {
            return {
              ...semana,
              status: 'concluida',
              data: new Date().toISOString().slice(0, 10),
              comprovativo: uploadedComprovativo
            };
          }
          return semana;
        }),
        ultimaAtualizacao: new Date().toISOString().slice(0, 10)
      };

      setCotacoes(prev => prev.map(c => {
        if (c.id === cotacaoSelecionada.id || c.idNumerico === cotacaoId) {
          return {
            ...c,
            acompanhamentoSemanas: updatedCotacao.acompanhamentoSemanas,
            ultimaAtualizacao: updatedCotacao.ultimaAtualizacao,
            status: temImpassesMarcados ? 'pendente' : c.status,
            motivoNaoFinalizada: temImpassesMarcados ? 
              'Identificado impasse durante acompanhamento' : 
              c.motivoNaoFinalizada
          };
        }
        return c;
      }));

      setCotacaoSelecionada(updatedCotacao);
      setUploadedComprovativo(null);
      setUploadedFile(null);

      // Recarregar follow-ups para mostrar os salvos
      await carregarFollowUps(cotacaoId);

      if (semanaAtual < 3) {
        setSemanaAtual(prev => prev + 1);
      } else {
        alert('✅ Acompanhamento concluído e salvo com sucesso!');
        setShowAcompanhamentoModal(false);
      }
    } catch (error) {
      console.error('Erro ao salvar acompanhamento:', error);
      alert(`❌ Erro ao salvar acompanhamento: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleRecusarCotacao = () => {
    if (!cotacaoSelecionada) return;

    if (!motivoRecusaSelecionado && !outrosMotivosRecusa.trim()) {
      alert('Por favor, selecione um motivo ou descreva o motivo da recusa.');
      return;
    }

    const motivoFinal = motivoRecusaSelecionado 
      ? motivosRecusa.find(m => m.id === motivoRecusaSelecionado)?.label
      : 'Outros: ' + outrosMotivosRecusa;
    
    const dataAtual = new Date().toISOString().slice(0, 10);

    const newProgress = {
      etapa: 'Cotação Recusada pelo Cliente',
      data: dataAtual,
      status: 'concluida',
      tipo: 'sistema',
      observacao: `Motivo: ${motivoFinal}`
    };

    const updatedCotacao = {
      ...cotacaoSelecionada,
      recusado: true,
      encerrado: true,
      finalizada: true,
      status: 'recusada',
      motivoRecusa: motivoFinal,
      dataRecusa: dataAtual,
      estagio: 'Encerrado - Recusado pelo Cliente',
      progresso: [...cotacaoSelecionada.progresso, newProgress],
      acompanhamentoSemanas: cotacaoSelecionada.acompanhamentoSemanas.map(semana => ({
        ...semana,
        status: 'concluida'
      })),
      ultimaAtualizacao: dataAtual,
      proximaAcao: 'Follow-up para entender melhor as objeções'
    };

    // Atualizar a lista de cotações
    setCotacoes(prev => prev.map(c => 
      c.id === cotacaoSelecionada.id ? updatedCotacao : c
    ));

    // Enviar email para administração
    enviarEmailRecusa(updatedCotacao);

    // Resetar estados
    setShowRecusa(false);
    setShowAcompanhamentoModal(false);
    setSelectedCotacao(null);
    setMotivoRecusaSelecionado('');
    setOutrosMotivosRecusa('');
  };

  const enviarEmailRecusa = (cotacao) => {
    // Lista de emails da administração
    const emailsAdministracao = [
      'admin@empresa.com',
      'gerencia@empresa.com',
      'comercial@empresa.com',
      'analise@empresa.com'
    ];

    const emailSubject = `📉 Cotação ${cotacao.id} Recusada pelo Cliente`;
    
    const emailBody = `
===========================================
📊 NOTIFICAÇÃO DE RECUSA DE COTAÇÃO
===========================================

⚠️ INFORMAÇÕES DA COTAÇÃO RECUSADA
----------------------------------
CÓDIGO: ${cotacao.id}
CLIENTE: ${cotacao.cliente}
AGENTE RESPONSÁVEL: ${cotacao.agente}
DATA DA RECUSA: ${cotacao.dataRecusa}

📋 DADOS DO CLIENTE:
--------------------
📧 Email: ${cotacao.email}
📞 Telefone: ${cotacao.telefone}
💼 Tipo de Seguro: ${cotacao.tipo}
💰 Valor da Cotação: ${cotacao.valor.toLocaleString('pt-MZ')} MZN

🔍 MOTIVO DA RECUSA:
-------------------
${cotacao.motivoRecusa}

📊 HISTÓRICO:
------------
Data de Criação: ${cotacao.dataCriacao}
Última Atualização: ${cotacao.ultimaAtualizacao}
Etapa Atual: ${cotacao.estagio}

📈 ESTATÍSTICAS:
----------------
Total de Etapas Concluídas: ${cotacao.progresso.filter(p => p.status === 'concluida').length}
Semanas de Acompanhamento: ${cotacao.acompanhamentoSemanas.filter(s => s.status === 'concluida').length}

===========================================
🎯 AÇÕES RECOMENDADAS:
1. Analisar motivo da recusa para melhorias
2. Contatar cliente para feedback adicional
3. Atualizar estratégia comercial
4. Registrar aprendizado no sistema

📌 Esta cotação foi automaticamente encerrada no sistema.
===========================================

Atenciosamente,
Sistema de Gestão de Cotações
    `;

    // Simulação do envio de email
    console.log('📧 Email de recusa enviado para:');
    emailsAdministracao.forEach(email => {
      console.log(`  📤 ${email}`);
    });
    console.log(`\nAssunto: ${emailSubject}`);
    console.log(`\nCorpo do email:\n${emailBody}`);

    // Mostrar alerta com os dados enviados
    alert(`📧 NOTIFICAÇÃO DE RECUSA ENVIADA\n\nEmail enviado para a administração com os seguintes dados:\n\n${emailBody}`);
  };

  const carregarSubscritores = async () => {
    try {
      const result = await usuarioService.findAll();
      if (result.success && result.data) {
        const subscritoresAtivos = result.data.filter(u => u.role === 'subscritor' && u.ativo);
        setSubscritores(subscritoresAtivos);
      }
    } catch (error) {
      console.error("Erro ao carregar subscritores:", error);
      setSubscritores([]);
    }
  };

  const handleEncerrarCotacao = async () => {
    if (!cotacaoSelecionada) return;

    if (!uploadedComprovativo) {
      alert('Por favor, faça upload do comprovativo de aceitação.');
      return;
    }

    // Verificar se há subscritores selecionados ou se deve enviar para todos
    if (!enviarTodosSubscritores && (!subscritoresSelecionados || subscritoresSelecionados.length === 0)) {
      alert('Por favor, selecione pelo menos um subscritor ou marque "Enviar para todos os subscritores".');
      return;
    }

    try {
      setLoadingFinalizar(true);
      const cotacaoId = cotacaoSelecionada.idNumerico || cotacaoSelecionada.id;

      const dadosFinalizacao = {
        enviar_todos: enviarTodosSubscritores,
        subscritor_ids: enviarTodosSubscritores ? [] : subscritoresSelecionados
      };

      const result = await cotacaoService.finalizar(cotacaoId, dadosFinalizacao);

      if (result.success) {
        const dataAtual = new Date().toISOString().slice(0, 10);

        const updatedCotacao = {
          ...cotacaoSelecionada,
          encerrado: true,
          finalizada: true,
          status: 'finalizada',
          dataEncerramento: dataAtual,
          estagio: 'Encerrado - Aceite do Cliente',
          ultimaAtualizacao: dataAtual,
          comprovativoEncerramento: uploadedComprovativo
        };

        setCotacoes(prev => prev.map(c => 
          (c.id === cotacaoSelecionada.id || c.idNumerico === cotacaoId) ? updatedCotacao : c
        ));

        // Mostrar resultado dos envios
        if (result.envios && result.envios.length > 0) {
          const sucessos = result.envios.filter(e => e.sucesso).length;
          const falhas = result.envios.filter(e => !e.sucesso).length;
          alert(`✅ Cotação finalizada com sucesso!\n\n📧 Emails enviados:\n- Sucessos: ${sucessos}\n- Falhas: ${falhas}`);
        } else {
          alert('✅ Cotação finalizada com sucesso!');
        }

        setShowEncerramento(false);
        setShowAcompanhamentoModal(false);
        setSelectedCotacao(null);
        setSubscritoresSelecionados([]);
        setEnviarTodosSubscritores(false);
        carregarCotacoes(); // Recarregar lista
      } else {
        alert(`❌ Erro ao finalizar cotação: ${result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao finalizar cotação:", error);
      alert(`❌ Erro ao finalizar cotação: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoadingFinalizar(false);
    }
  };

  const enviarEmailEncerramento = (cotacao) => {
    const emailsAdministracao = [
      'admin@empresa.com',
      'gerencia@empresa.com',
      'comercial@empresa.com',
      'subscricao@empresa.com',
      'financeiro@empresa.com'
    ];

    const emailSubject = `✅ Cotação ${cotacao.id} Finalizada - Cliente Aceitou`;
    
    const emailBody = `
===========================================
🎉 NOTIFICAÇÃO DE FINALIZAÇÃO DE COTAÇÃO
===========================================

✅ COTAÇÃO FINALIZADA COM SUCESSO!
----------------------------------
CÓDIGO: ${cotacao.id}
CLIENTE: ${cotacao.cliente}
AGENTE RESPONSÁVEL: ${cotacao.agente}
DATA DE ACEITAÇÃO: ${cotacao.dataEncerramento}

📋 DADOS DO CLIENTE PARA LOCALIZAÇÃO:
-----------------------------------
🔑 Código da Cotação: ${cotacao.id}
👤 Nome do Cliente: ${cotacao.cliente}
📧 Email: ${cotacao.email}
📞 Telefone: ${cotacao.telefone}
🏢 Tipo de Seguro: ${cotacao.tipo}
💰 Valor Segurado: ${cotacao.valor.toLocaleString('pt-MZ')} MZN

📊 INFORMAÇÕES DA TRANSAÇÃO:
----------------------------
Data de Criação: ${cotacao.dataCriacao}
Data de Finalização: ${cotacao.dataEncerramento}
Agente Inicial: ${cotacao.agenteInicial}
Comprovativo: ${cotacao.comprovativoEncerramento?.nome || 'Documento assinado'}

📈 ESTATÍSTICAS DO PROCESSO:
---------------------------
Etapas Concluídas: ${cotacao.progresso.filter(p => p.status === 'concluida').length}/${cotacao.progresso.length}
Tempo Total: ${Math.ceil((new Date(cotacao.dataEncerramento) - new Date(cotacao.dataCriacao)) / (1000 * 60 * 60 * 24))} dias
Semanas de Acompanhamento: ${cotacao.acompanhamentoSemanas.filter(s => s.status === 'concluida').length}/4

===========================================
🚀 PRÓXIMOS PASSOS:
1. Emitir apólice
2. Enviar documentação ao cliente
3. Agendar visita de entrega
4. Configurar renovação automática

📌 Esta cotação está pronta para seguir para subscrição.
===========================================

Atenciosamente,
Sistema de Gestão de Cotações
    `;

    // Simulação do envio de email
    console.log('📧 Email de finalização enviado para:');
    emailsAdministracao.forEach(email => {
      console.log(`  📤 ${email}`);
    });
    console.log(`\nAssunto: ${emailSubject}`);
    console.log(`\nCorpo do email:\n${emailBody}`);

    alert(`📧 NOTIFICAÇÃO DE FINALIZAÇÃO ENVIADA\n\nEmail enviado para a administração com os dados da cotação finalizada.\n\nCódigo: ${cotacao.id}\nCliente: ${cotacao.cliente}`);
  };

  const handleReencaminharSubscricao = () => {
    if (!cotacaoSelecionada) return;

    const dadosSubscricao = {
      cliente: cotacaoSelecionada.cliente,
      codigoCotacao: cotacaoSelecionada.id,
      tipoSeguro: cotacaoSelecionada.tipo,
      valor: cotacaoSelecionada.valor,
      email: cotacaoSelecionada.email,
      telefone: cotacaoSelecionada.telefone,
      agenteResponsavel: cotacaoSelecionada.agente,
      dataEncerramento: new Date().toISOString().slice(0, 10)
    };

    const newProgress = {
      etapa: 'Enviado para Subscrição',
      data: new Date().toISOString().slice(0, 10),
      status: 'concluida',
      tipo: 'sistema'
    };

    const updatedCotacao = {
      ...cotacaoSelecionada,
      reencaminhadoSubscricao: true,
      dadosSubscricao: dadosSubscricao,
      progresso: [...cotacaoSelecionada.progresso, newProgress]
    };

    setCotacoes(prev => prev.map(c => 
      c.id === cotacaoSelecionada.id ? updatedCotacao : c
    ));

    const emailBody = `
      NOVA APÓLICE PARA EMISSÃO
      =========================
      
      DADOS DO CLIENTE:
      -----------------
      Nome: ${dadosSubscricao.cliente}
      Email: ${dadosSubscricao.email}
      Telefone: ${dadosSubscricao.telefone}
      
      DADOS DA COTAÇÃO:
      -----------------
      Código: ${dadosSubscricao.codigoCotacao}
      Tipo de Seguro: ${dadosSubscricao.tipoSeguro}
      Valor Segurado: ${dadosSubscricao.valor.toLocaleString('pt-MZ')} MZN
      
      RESPONSÁVEL:
      ------------
      Agente: ${dadosSubscricao.agenteResponsavel}
      Data de Aceitação: ${dadosSubscricao.dataEncerramento}
      
      =========================
      Por favor proceder com a emissão da apólice.
    `;

    alert(`✅ ENVIADO PARA SUBSCRIÇÃO\n\n${emailBody}`);
    setShowEncerramento(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileData = {
      nome: file.name,
      tamanho: (file.size / 1024 / 1024).toFixed(2),
      tipo: file.type,
      arquivo: file
    };

    setUploadedFile(fileData);
  };

  const handleComprovativoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileData = {
      nome: file.name,
      tamanho: (file.size / 1024 / 1024).toFixed(2),
      tipo: file.type,
      arquivo: file
    };

    setUploadedComprovativo(fileData);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const removeUploadedComprovativo = () => {
    setUploadedComprovativo(null);
  };

  const filteredCotacoes = cotacoes.filter(cotacao => {
    const matchesSearch = cotacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cotacao.agente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'finalizada' && cotacao.finalizada) ||
                         (filterStatus === 'ativa' && cotacao.status === 'ativa' && !cotacao.finalizada) ||
                         (filterStatus === 'pendente' && cotacao.status === 'pendente') ||
                         (filterStatus === 'recusada' && cotacao.status === 'recusada') ||
                         (filterStatus === 'expirada' && cotacao.status === 'expirada');
    return matchesSearch && matchesFilter;
  });

  // Paginação
  const totalPages = Math.ceil(filteredCotacoes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCotacoes.slice(indexOfFirstItem, indexOfLastItem);

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
          bg: 'bg-emerald-600',
          text: 'text-white',
          border: 'border-emerald-700'
        };
      case 'em_andamento': 
        return { 
          bg: 'bg-amber-600',
          text: 'text-white',
          border: 'border-amber-700'
        };
      case 'pendente': 
        return { 
          bg: 'bg-gray-600',
          text: 'text-white',
          border: 'border-gray-700'
        };
      default: 
        return { 
          bg: 'bg-gray-600',
          text: 'text-white',
          border: 'border-gray-700'
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'em_andamento': return 'Em Andamento';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getCotacaoStatusColor = (status) => {
    switch (status) {
      case 'ativa': return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' };
      case 'finalizada': return { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' };
      case 'pendente': return { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' };
      case 'expirada': return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' };
      case 'recusada': return { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' };
      default: return { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-700' };
    }
  };

  const getCotacaoStatusText = (status) => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'finalizada': return 'Finalizada';
      case 'pendente': return 'Pendente';
      case 'expirada': return 'Expirada';
      case 'recusada': return 'Recusada';
      default: return status;
    }
  };

  const renderProgressBar = () => {
    if (!cotacaoSelecionada) return null;

    const semanas = [0, 1, 2, 3];
    
    return (
      <div className="relative mb-8">
        <div className="absolute top-6 left-0 right-0 flex justify-between px-12">
          {[0, 1, 2].map((lineIndex) => {
            const startWeek = semanas[lineIndex];
            const endWeek = semanas[lineIndex + 1];
            const startSemana = cotacaoSelecionada?.acompanhamentoSemanas[startWeek];
            
            let lineColor = 'bg-gray-300';
            if (startSemana?.status === 'concluida') {
              lineColor = 'bg-emerald-400';
            } else if (startWeek < semanaAtual) {
              lineColor = 'bg-blue-400';
            }
            
            return (
              <div 
                key={lineIndex}
                className={`h-1 ${lineColor} flex-1 mx-2 transition-all duration-300`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between relative z-10">
          {semanas.map((week) => {
            const semanaData = cotacaoSelecionada?.acompanhamentoSemanas[week];
            const isConcluida = semanaData?.status === 'concluida';
            const isCurrent = week === semanaAtual;
            const isBeforeCurrent = week < semanaAtual;
            
            let bgColor = 'bg-gray-300';
            let textColor = 'text-white';
            let borderColor = '';
            
            if (isConcluida) {
              bgColor = 'bg-emerald-500';
              textColor = 'text-white';
              borderColor = 'border-2 border-emerald-300';
            } else if (isCurrent) {
              bgColor = 'bg-blue-500';
              textColor = 'text-white';
              borderColor = 'border-2 border-blue-300';
            } else if (isBeforeCurrent) {
              bgColor = 'bg-blue-400';
              textColor = 'text-white';
              borderColor = 'border-2 border-blue-200';
            }
            
            return (
              <div key={week} className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-lg ${bgColor} ${borderColor}`}
                >
                  {isConcluida ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <span className={`font-bold ${textColor}`}>{week + 1}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? 'text-blue-700' : isConcluida ? 'text-emerald-700' : 'text-gray-500'}`}>
                  Semana {week + 1}
                </span>
                {semanaData?.data && (
                  <span className={`text-xs mt-1 ${isCurrent ? 'text-blue-600' : isConcluida ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {semanaData.data}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Função para renderizar números de página
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

      {/* Modal de Acompanhamento */}
      {showAcompanhamentoModal && cotacaoSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {titulosPorSemana[semanaAtual]}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-blue-100">
                      Cliente: <strong className="text-white">{cotacaoSelecionada.cliente}</strong>
                    </span>
                    <span className="text-blue-100">
                      Código: <strong className="text-white">{cotacaoSelecionada.id}</strong>
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-white">
                      Semana {semanaAtual + 1} de 4
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAcompanhamentoModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                {renderProgressBar()}
              </div>
            </div>

            {/* Corpo do Modal */}
            <div className="p-8">
              {/* Checkboxes de Impasses */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Identificação de Possíveis Impasses
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Selecione os motivos que podem estar impedindo o fechamento do negócio nesta semana:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questoesPorSemana[semanaAtual].map((item) => {
                    const isChecked = cotacaoSelecionada.acompanhamentoSemanas[semanaAtual]?.impasses[item.id] || false;
                    return (
                      <label 
                        key={item.id}
                        className={`flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          isChecked 
                            ? 'bg-blue-50 border-2 border-blue-200' 
                            : 'bg-white border border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center h-5 mr-3 mt-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleImpassesChange(semanaAtual, item.id, e.target.checked)}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <span className={`font-medium ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>
                            {item.label}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        </div>
                        {isChecked && (
                          <Check className="h-5 w-5 text-blue-500 ml-2" />
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Campo Outros */}
                <div className="mt-6">
                  <label className="flex items-start p-4 rounded-lg cursor-pointer border border-gray-200 hover:border-blue-300 bg-white">
                    <div className="flex items-center h-5 mr-3 mt-1">
                      <input
                        type="checkbox"
                        checked={cotacaoSelecionada.acompanhamentoSemanas[semanaAtual]?.impasses.outros || false}
                        onChange={(e) => handleImpassesChange(semanaAtual, 'outros', e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">
                        Outros Motivos
                      </span>
                      {cotacaoSelecionada.acompanhamentoSemanas[semanaAtual]?.impasses.outros && (
                        <textarea
                          value={cotacaoSelecionada.acompanhamentoSemanas[semanaAtual]?.impasses.outrosTexto || ''}
                          onChange={(e) => handleImpassesChange(semanaAtual, 'outrosTexto', e.target.value)}
                          placeholder="Descreva outros motivos específicos..."
                          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="2"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Feedback da Interação */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Feedback da Interação (Opcional)
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">Opcional</span>
                </div>
                <textarea
                  value={cotacaoSelecionada.acompanhamentoSemanas[semanaAtual]?.feedback || ''}
                  onChange={(e) => handleFeedbackChange(semanaAtual, e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Descreva detalhadamente a interação com o cliente..."
                />
              </div>

              {/* Upload de Comprovativo */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Comprovativo da Interação
                  </h3>
                </div>
                
                {uploadedFile ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700">
                          Arquivo Carregado
                        </span>
                      </div>
                      <button
                        onClick={removeUploadedFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-green-600 truncate">
                      {uploadedFile.nome}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {uploadedFile.tamanho} MB
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Arraste arquivos ou clique para fazer upload
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors font-medium"
                    >
                      Selecionar Arquivo
                    </label>
                    <p className="text-xs text-gray-500 mt-4">
                      Formatos aceitos: PDF, JPG, PNG, DOC<br />
                      Tamanho máximo: 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Botão Salvar e Avançar */}
              <div className="mb-8">
                <button
                  onClick={handleUpdateAcompanhamento}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-bold text-lg mb-4"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span>
                    {semanaAtual < 3 ? 'Salvar e Avançar para Semana ' + (semanaAtual + 2) : 'Concluir Acompanhamento'}
                  </span>
                </button>

                {semanaAtual > 0 && (
                  <button
                    onClick={() => setSemanaAtual(prev => prev - 1)}
                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 inline mr-1" />
                    Voltar para Semana {semanaAtual}
                  </button>
                )}
              </div>

              {/* Seção de Recusa da Cotação */}
              {showRecusa ? (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Ban className="h-6 w-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-800">
                      Confirmar Recusa da Cotação
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-red-100">
                      <h4 className="font-semibold text-red-700 mb-4">
                        O cliente recusou a cotação?
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Selecione o motivo principal da recusa:
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {motivosRecusa.map((motivo) => (
                              <label 
                                key={motivo.id}
                                className={`flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                  motivoRecusaSelecionado === motivo.id
                                    ? 'bg-red-50 border-2 border-red-300' 
                                    : 'bg-white border border-gray-200 hover:border-red-300'
                                }`}
                              >
                                <div className="flex items-center h-5 mr-3 mt-0.5">
                                  <input
                                    type="radio"
                                    name="motivoRecusa"
                                    checked={motivoRecusaSelecionado === motivo.id}
                                    onChange={() => setMotivoRecusaSelecionado(motivo.id)}
                                    className="h-5 w-5 text-red-600 focus:ring-red-500"
                                  />
                                </div>
                                <div className="flex-1">
                                  <span className={`font-medium ${motivoRecusaSelecionado === motivo.id ? 'text-red-700' : 'text-gray-700'}`}>
                                    {motivo.label}
                                  </span>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {motivo.description}
                                  </p>
                                </div>
                                {motivoRecusaSelecionado === motivo.id && (
                                  <Ban className="h-5 w-5 text-red-500 ml-2" />
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Outros motivos (se não encontrou acima):
                          </label>
                          <textarea
                            value={outrosMotivosRecusa}
                            onChange={(e) => setOutrosMotivosRecusa(e.target.value)}
                            placeholder="Descreva detalhadamente os motivos da recusa..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows="3"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Esta informação será enviada para a administração para análise
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleRecusarCotacao}
                        disabled={!motivoRecusaSelecionado && !outrosMotivosRecusa.trim()}
                        className={`flex-1 py-4 text-white rounded-xl transition-colors duration-300 shadow-lg font-bold text-lg flex items-center justify-center space-x-2 ${
                          motivoRecusaSelecionado || outrosMotivosRecusa.trim()
                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Ban className="h-6 w-6" />
                        <span>Confirmar Recusa</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowRecusa(false);
                          setMotivoRecusaSelecionado('');
                          setOutrosMotivosRecusa('');
                        }}
                        className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRecusa(true)}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-bold text-lg mb-6"
                >
                  <Ban className="h-6 w-6" />
                  <span>Recusar Cotação (Cliente Não Aceitou)</span>
                </button>
              )}

              {/* Seção de Encerramento */}
              <div className="border-t border-gray-200 pt-6">
                {showEncerramento ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-bold text-green-800">
                        Confirmar Encerramento da Cotação
                      </h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 border border-green-100">
                        <h4 className="font-semibold text-green-700 mb-4">
                          O cliente aceitou os termos e condições?
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Comprovativo de Aceitação (Obrigatório)
                            </label>
                            {uploadedComprovativo ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <FileCheck className="h-5 w-5 text-green-600" />
                                    <div>
                                      <p className="font-medium text-green-700">{uploadedComprovativo.nome}</p>
                                      <p className="text-xs text-green-600">{uploadedComprovativo.tamanho} MB</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={removeUploadedComprovativo}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex space-x-4">
                                <input
                                  type="file"
                                  onChange={handleComprovativoUpload}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  required
                                />
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Upload do documento assinado ou comprovativo de aceitação
                            </p>
                          </div>
                          
                          {/* Seleção de Subscritores */}
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                              📧 Enviar Cotação para Subscritores
                            </h3>
                            
                            <div className="mb-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={enviarTodosSubscritores}
                                  onChange={(e) => {
                                    setEnviarTodosSubscritores(e.target.checked);
                                    if (e.target.checked) {
                                      setSubscritoresSelecionados([]);
                                    }
                                  }}
                                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  Enviar para todos os subscritores
                                </span>
                              </label>
                            </div>

                            {!enviarTodosSubscritores && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Selecionar Subscritores Específicos:
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                                  {subscritores.length > 0 ? (
                                    subscritores.map((subscritor) => (
                                      <label
                                        key={subscritor.id}
                                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={subscritoresSelecionados.includes(subscritor.id)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSubscritoresSelecionados([...subscritoresSelecionados, subscritor.id]);
                                            } else {
                                              setSubscritoresSelecionados(
                                                subscritoresSelecionados.filter(id => id !== subscritor.id)
                                              );
                                            }
                                          }}
                                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                          {subscritor.nome} {subscritor.email ? `(${subscritor.email})` : ''}
                                        </span>
                                      </label>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500">Nenhum subscritor disponível</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={handleEncerrarCotacao}
                          disabled={!uploadedComprovativo || loadingFinalizar || (!enviarTodosSubscritores && subscritoresSelecionados.length === 0)}
                          className={`flex-1 py-4 text-white rounded-xl transition-colors duration-300 shadow-lg font-bold text-lg flex items-center justify-center space-x-2 ${
                            uploadedComprovativo && !loadingFinalizar && (enviarTodosSubscritores || subscritoresSelecionados.length > 0)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {loadingFinalizar ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin" />
                              <span>Finalizando...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-6 w-6" />
                              <span>Finalizar e Enviar para Subscritores</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowEncerramento(false);
                            setSubscritoresSelecionados([]);
                            setEnviarTodosSubscritores(false);
                          }}
                          className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEncerramento(true)}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-bold text-lg"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Encerrar Cotação (Cliente Aceitou)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-3xl font-black mb-2 text-gray-900 tracking-tight">
            {getText("Acompanhamento de Cotações", "Quote Tracking", "Suivi des Devis")}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            {getText("Visualize o andamento e acompanhe o progresso das cotações ativas", "View progress and track active quotes", "Visualisez la progression et suivez les devis actifs")}
          </p>
        </div>

        {/* Filtros */}
        <div className="rounded-xl p-6 bg-white border border-gray-200 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                <input
                  type="text"
                  placeholder={getText("Buscar por cliente, ID ou agente...", "Search by client, ID or agent...", "Rechercher par client, ID ou agent...")}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-emerald-600" />
              <select
                className="px-4 py-3 rounded-lg border border-gray-300 text-gray-900 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-300"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{getText("Todas", "All", "Toutes")}</option>
                <option value="ativa">{getText("Ativas", "Active", "Actives")}</option>
                <option value="finalizada">{getText("Finalizadas", "Completed", "Terminées")}</option>
                <option value="pendente">{getText("Pendentes", "Pending", "En attente")}</option>
                <option value="recusada">{getText("Recusadas", "Rejected", "Refusées")}</option>
                <option value="expirada">{getText("Expiradas", "Expired", "Expirées")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Cotações */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Carregando cotações...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {currentItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Nenhuma cotação encontrada.</p>
              </div>
            ) : (
              currentItems.map((cotacao) => {
            const progressoCompleto = cotacao.progresso.filter(p => p.status === 'concluida').length;
            const totalEtapas = cotacao.progresso.length;
            const progressoPercent = Math.round((progressoCompleto / totalEtapas) * 100);
            const semanasCompletas = cotacao.acompanhamentoSemanas?.filter(s => s.status === 'concluida').length || 0;
            const currentForm = formState[cotacao.id]
              ? { ...buildDefaultForm(cotacao), ...formState[cotacao.id] }
              : buildDefaultForm(cotacao);
            const statusColors = getCotacaoStatusColor(cotacao.status);

            return (
              <div
                key={cotacao.id}
                className="rounded-xl p-6 bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{cotacao.cliente}</h3>
                      <span className="font-mono text-emerald-700 text-sm">{cotacao.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                        {getCotacaoStatusText(cotacao.status)}
                      </span>
                      {cotacao.finalizada && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white border border-green-700">
                          Finalizada
                        </span>
                      )}
                      {cotacao.recusado && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white border border-red-700">
                          Recusada
                        </span>
                      )}
                      {cotacao.reencaminhadoSubscricao && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white border border-blue-700">
                          Enviado para Subscrição
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
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
                    
                    {/* Status do Acompanhamento Semanal */}
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">Acompanhamento Semanal:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {semanasCompletas}/4 semanas completas
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((week) => {
                          const semana = cotacao.acompanhamentoSemanas?.[week-1];
                          return (
                            <div
                              key={week}
                              className={`h-2 flex-1 rounded-full ${
                                semana?.status === 'concluida'
                                  ? 'bg-green-500'
                                  : week <= semanasCompletas + 1
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                              }`}
                              title={`Semana ${week}: ${semana?.status === 'concluida' ? 'Concluída' : 'Pendente'}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!cotacao.encerrado && !cotacao.recusado && (
                      <button
                        onClick={() => handleAcompanhamentoClick(cotacao)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                        title="Iniciar Acompanhamento Semanal"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Acompanhamento</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedCotacao(selectedCotacao === cotacao.id ? null : cotacao.id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso Principal */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-700 font-medium">{cotacao.estagio}</span>
                    <span className="text-sm text-gray-600">{progressoPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressoPercent}%`,
                        background: `linear-gradient(90deg, ${themeConfig.primaryLight || '#4ade80'}, ${themeConfig.primaryDark || '#22c55e'})`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Timeline de Progresso (expandido) */}
                {selectedCotacao === cotacao.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Histórico de Progresso</h4>
                      {cotacao.reencaminhadoSubscricao && (
                        <button
                          onClick={() => {
                            const emailBody = `
                              Dados da Apólice para Emissão:
                              
                              Cliente: ${cotacao.dadosSubscricao.cliente}
                              Código: ${cotacao.dadosSubscricao.codigoCotacao}
                              Tipo: ${cotacao.dadosSubscricao.tipoSeguro}
                              Valor: ${cotacao.dadosSubscricao.valor.toLocaleString('pt-MZ')} MZN
                              Agente: ${cotacao.dadosSubscricao.agenteResponsavel}
                              Data: ${cotacao.dadosSubscricao.dataEncerramento}
                            `;
                            alert(emailBody);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Ver dados para subscrição
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {cotacao.progresso.map((etapa, idx) => {
                        const IconComponent = getStatusIcon(etapa.tipo);
                        const statusColors = getStatusColor(etapa.status);
                        return (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg border ${statusColors.bg} ${statusColors.border}`}>
                              <IconComponent className={`h-4 w-4 ${statusColors.text}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {etapa.etapa}
                                </span>
                                {etapa.data && (
                                  <span className="text-xs text-gray-600">{etapa.data}</span>
                                )}
                              </div>
                              {etapa.tipo && (
                                <span className="text-xs text-gray-600">
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

                    {/* Informação de Recusa */}
                    {cotacao.recusado && (
                      <div className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-700 mb-1">Cotação Recusada pelo Cliente</p>
                            <p className="text-xs text-red-600">
                              Motivo: {cotacao.motivoRecusa}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Data da Recusa: {cotacao.dataRecusa}
                            </p>
                          </div>
                          <Ban className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    )}

                    {/* Botão para reencaminhar para subscrição se encerrado */}
                    {cotacao.encerrado && !cotacao.reencaminhadoSubscricao && !cotacao.recusado && (
                      <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">Cotação Encerrada com Sucesso!</p>
                            <p className="text-xs text-blue-600">
                              Cliente aceitou os termos. Pronto para emissão da apólice.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setCotacaoSelecionada(cotacao);
                              handleReencaminharSubscricao();
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors"
                          >
                            <SendHorizontal className="h-4 w-4 inline mr-1" />
                            Enviar para Subscrição
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Formulário de atualização */}
                    {!cotacao.encerrado && !cotacao.recusado && (
                      <div className="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">Adicionar atualização</h4>
                          <span className="text-[11px] text-gray-600">Registre novas etapas, responsáveis e observações</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={currentForm.etapa}
                            onChange={(e) => updateFormState(cotacao, 'etapa', e.target.value)}
                            placeholder="Etapa / atividade"
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <input
                            type="date"
                            value={currentForm.data}
                            onChange={(e) => updateFormState(cotacao, 'data', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <select
                            value={currentForm.tipo}
                            onChange={(e) => updateFormState(cotacao, 'tipo', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="telefone">Telefone</option>
                            <option value="email">Email</option>
                            <option value="visita">Visita</option>
                            <option value="sistema">Sistema</option>
                          </select>
                          <select
                            value={currentForm.status}
                            onChange={(e) => updateFormState(cotacao, 'status', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          >
                            <option value="concluida">Concluída</option>
                            <option value="em_andamento">Em andamento</option>
                            <option value="pendente">Pendente</option>
                          </select>
                        </div>
                        <textarea
                          rows="3"
                          value={currentForm.observacoes}
                          onChange={(e) => updateFormState(cotacao, 'observacoes', e.target.value)}
                          placeholder="Observações ou notas adicionais"
                          className="w-full mt-3 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => handleAddProgress(cotacao)}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            Guardar atualização
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Botão para expandir */}
                {selectedCotacao !== cotacao.id && (
                  <button
                    onClick={() => setSelectedCotacao(cotacao.id)}
                    className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 transition-colors"
                  >
                    <span>Ver detalhes completos</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
            )}
          </div>
        )}

        {/* Paginação Profissional */}
        {filteredCotacoes.length > itemsPerPage && (
          <div className="mt-8 px-6 py-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {getText("Mostrar:", "Show:", "Afficher:")}
                </span>
                <select
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-300 hover:border-emerald-400"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
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
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={getText("Primeira página", "First page", "Première page")}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>

                  {/* Página anterior */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    title={getText("Próxima página", "Next page", "Page suivante")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Última página */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
        )}
      </div>
    </div>
  );
}

export default Acompanhamento;