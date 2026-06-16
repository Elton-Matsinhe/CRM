import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Search,
  Edit3,
  Download,
  Send,
  Printer,
  Eye,
  X,
  Plus,
  Trash2,
  Loader2,
  FileText,
  ChevronRight,
} from "lucide-react";
import CotacoesLayout from "../components/CotacoesLayout";
import { gerarPDFPersonalizado } from "../components/GeradorPDFPersonalizado";
import { cotacaoService } from "../services/api";

function EditarCotacao() {
  const [cotacaoId, setCotacaoId] = useState("");
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mostrarOpcoesPartilha, setMostrarOpcoesPartilha] = useState(false);
  const [processandoEmail, setProcessandoEmail] = useState(false);
  const [listaCotacoes, setListaCotacoes] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [filtroLista, setFiltroLista] = useState("");

  // Configurações das coberturas (mesmas do CriarCliente)
  const configCoberturas = {
    DP_NORMAL: {
      nome: "DP NORMAL - Danos Próprios com Franquia",
      taxas: {
        Ligeiro: 0.035,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 5000000,
        morteInvalidez: 100000,
        despesasMedicas: 20000,
        despesasFuneral: 5000,
        perdaChaves: 35000,
        remocaoSalvados: 52500,
      },
    },
    DP_SEM_FRANQUIA: {
      nome: "DP SEM FRANQUIA - Danos Próprios sem Franquia",
      taxas: {
        Ligeiro: 0.035,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 10000000,
        morteInvalidez: 250000,
        despesasMedicas: 85000,
        despesasFuneral: 25000,
        perdaChaves: 55000,
        remocaoSalvados: 65000,
      },
    },
    RC_NORMAL: {
      nome: "RC NORMAL - Apenas Responsabilidade Civil",
      taxas: {
        Ligeiro: 0.045,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 4000000,
        morteInvalidez: 0,
        despesasMedicas: 0,
        despesasFuneral: 0,
      },
    },
    RC_OCUPANTES: {
      nome: "RC & OCUPANTES - RC + Cobertura para Ocupantes",
      taxas: {
        Ligeiro: 0.035,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 4000000,
        morteInvalidez: 100000,
        despesasMedicas: 20000,
        despesasFuneral: 5000,
      },
    },
  };

  const mapearCotacaoParaForm = (cotacao) => ({
    id: cotacao.id,
    numero_cotacao: cotacao.numero_cotacao,
    cliente_id: cotacao.cliente_id,
    cliente: {
      tipo: cotacao.cliente?.tipo || 'Particular',
      primeiroNome: cotacao.primeiro_nome || cotacao.cliente?.primeiro_nome || '',
      sobrenome: cotacao.sobrenome || cotacao.cliente?.sobrenome || '',
      email: cotacao.cliente_email || cotacao.cliente?.email || '',
      telefone: cotacao.cliente_telefone || cotacao.cliente?.telefone || '',
      numeroDocumento: cotacao.cliente?.numero_documento || '',
      dataNascimento: cotacao.cliente?.data_nascimento || '',
      nomeEmpresa: cotacao.cliente?.nome_empresa || '',
      numeroReferenciaFiscal: cotacao.cliente?.numero_referencia_fiscal || '',
      nacionalidade: cotacao.cliente?.nacionalidade || 'MZ',
      tituloContato: cotacao.cliente?.titulo_contato || ''
    },
    veiculos: (cotacao.veiculos || []).map((veiculo) => ({
      id: veiculo.id || Date.now() + Math.random(),
      marca: veiculo.marca || '',
      modelo: veiculo.modelo || '',
      marcaModelo: veiculo.marca_modelo || `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim(),
      matricula: veiculo.matricula || '',
      matriculaCompleta: veiculo.matricula_completa || veiculo.matricula || '',
      ano: veiculo.ano || '',
      motor: veiculo.numero_motor || '',
      chassis: veiculo.numero_chassi || '',
      lotacao: veiculo.lotacao || '',
      tipoViatura: veiculo.tipo_viatura || 'Ligeiro',
      capitalSeguro: veiculo.capital_seguro || '',
      taxa: veiculo.taxa || '',
      premioAnnual: veiculo.premio_anual || '',
      premioSemestral: veiculo.premio_semestral || '',
      premioTrimestral: veiculo.premio_trimestral || '',
      premioMensal: veiculo.premio_mensal || '',
      tipoCobertura: veiculo.tipo_cobertura || 'DP_NORMAL',
    })),
    totalPremio: parseFloat(cotacao.total_premio) || 0,
    status: cotacao.status || 'pendente',
    dataCriacao: cotacao.data_criacao || cotacao.created_at,
    dataValidade: cotacao.data_validade,
    observacoes: cotacao.proxima_acao || ''
  });

  const carregarListaCotacoes = useCallback(async () => {
    try {
      setLoadingLista(true);
      const result = await cotacaoService.listar({ limit: 500 });
      if (result.success) {
        setListaCotacoes(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar lista de cotações:', error);
    } finally {
      setLoadingLista(false);
    }
  }, []);

  useEffect(() => {
    carregarListaCotacoes();
  }, [carregarListaCotacoes]);

  const carregarCotacaoPorId = async (id) => {
    setIsLoading(true);
    try {
      const result = await cotacaoService.buscarPorId(id);
      if (result.success && result.data) {
        setFormData(mapearCotacaoParaForm(result.data));
        setCotacaoId(result.data.numero_cotacao || String(result.data.id));
      } else {
        alert(`❌ ${result.message || 'Cotação não encontrada!'}`);
        setFormData(null);
      }
    } catch (error) {
      console.error('Erro ao carregar cotação:', error);
      alert(`❌ Erro ao carregar cotação: ${error.response?.data?.message || error.message}`);
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selecionarCotacao = (cotacao) => {
    carregarCotacaoPorId(cotacao.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Buscar cotação por ID ou número
  const buscarCotacao = async () => {
    if (!cotacaoId) {
      alert("Por favor, digite o ID ou número da cotação.");
      return;
    }

    setIsLoading(true);

    try {
      // Tentar buscar por ID numérico primeiro
      let cotacaoIdNumero = parseInt(cotacaoId);
      let result;

      if (!isNaN(cotacaoIdNumero)) {
        // Se for um número, buscar por ID
        result = await cotacaoService.buscarPorId(cotacaoIdNumero);
      } else {
        // Se não for número, buscar por número de cotação
        // Primeiro listar todas e filtrar
        const listResult = await cotacaoService.listar({ limit: 1000, search: cotacaoId });
        if (listResult.success && listResult.data.length > 0) {
          const cotacaoEncontrada = listResult.data.find(
            c => c.numero_cotacao === cotacaoId || c.numero_cotacao?.toUpperCase() === cotacaoId.toUpperCase()
          );
          if (cotacaoEncontrada) {
            result = await cotacaoService.buscarPorId(cotacaoEncontrada.id);
          } else {
            result = { success: false, message: "Cotação não encontrada" };
          }
        } else {
          result = { success: false, message: "Cotação não encontrada" };
        }
      }

      if (result.success && result.data) {
        setFormData(mapearCotacaoParaForm(result.data));
      } else {
        alert(`❌ ${result.message || "Cotação não encontrada!"}`);
        setFormData(null);
      }
    } catch (error) {
      console.error("Erro ao buscar cotação:", error);
      alert(`❌ Erro ao buscar cotação: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para calcular prémio
  const calcularPremio = (veiculo) => {
    const config = configCoberturas[veiculo.tipoCobertura];
    if (!config || !veiculo.tipoViatura || !veiculo.capitalSeguro) {
      return "0.00";
    }

    const capital = parseFloat(veiculo.capitalSeguro) || 0;
    const taxa = config.taxas[veiculo.tipoViatura] || 0;

    if (capital === 0 || taxa === 0) return "0.00";

    const premioCalculado = capital * taxa;
    return premioCalculado.toFixed(2);
  };

  const recalcularVeiculos = (veiculos) => {
    const atualizados = veiculos.map((veiculo) => ({
      ...veiculo,
      premioAnnual: calcularPremio(veiculo),
      taxa: configCoberturas[veiculo.tipoCobertura]?.taxas[veiculo.tipoViatura] || 0,
    }));
    const totalPremio = atualizados.reduce(
      (total, v) => total + (parseFloat(v.premioAnnual) || 0),
      0
    );
    return { veiculos: atualizados, totalPremio };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData?.id) return;

    try {
      setSalvando(true);

      const payload = {
        total_premio: formData.totalPremio,
        status: formData.status,
        observacoes: formData.observacoes || '',
        cliente: {
          tipo: formData.cliente.tipo,
          primeiro_nome: formData.cliente.primeiroNome,
          sobrenome: formData.cliente.sobrenome,
          email: formData.cliente.email,
          telefone: formData.cliente.telefone,
          numero_documento: formData.cliente.numeroDocumento,
          data_nascimento: formData.cliente.dataNascimento || null,
          nacionalidade: formData.cliente.nacionalidade,
          titulo_contato: formData.cliente.tituloContato || null,
          nome_empresa: formData.cliente.nomeEmpresa || null,
          numero_referencia_fiscal: formData.cliente.numeroReferenciaFiscal || null,
        },
        veiculos: formData.veiculos.map((v) => ({
          marca: v.marca || (v.marcaModelo && v.marcaModelo.split(' ')[0]),
          modelo: v.modelo || (v.marcaModelo && v.marcaModelo.split(' ').slice(1).join(' ')),
          marca_modelo: v.marcaModelo,
          matricula: v.matricula,
          matricula_completa: v.matriculaCompleta || v.matricula,
          ano: v.ano || null,
          motor: v.motor,
          chassis: v.chassis,
          lotacao: v.lotacao || null,
          tipo_viatura: v.tipoViatura,
          tipo_cobertura: v.tipoCobertura,
          capital_seguro: parseFloat(v.capitalSeguro) || 0,
          taxa: parseFloat(v.taxa) || 0,
          premio_anual: parseFloat(v.premioAnnual) || 0,
          premio_semestral: parseFloat(v.premioSemestral) || null,
          premio_trimestral: parseFloat(v.premioTrimestral) || null,
          premio_mensal: parseFloat(v.premioMensal) || null,
        })),
      };

      const result = await cotacaoService.editar(formData.id, payload);

      if (result.success) {
        alert('✅ Cotação atualizada com sucesso!');
        setMostrarOpcoesPartilha(true);
        carregarListaCotacoes();
        window.dispatchEvent(new CustomEvent('cotacaoCriada'));
      } else {
        alert(`❌ ${result.message || 'Erro ao atualizar cotação'}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar cotação:', error);
      alert(`❌ Erro ao atualizar: ${error.response?.data?.message || error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  // Funções para manipular veículos
  const adicionarVeiculo = () => {
    const novoVeiculo = {
      id: Date.now() + Math.random(),
      marcaModelo: "",
      matricula: "",
      ano: "",
      motor: "",
      chassis: "",
      lotacao: "",
      tipoViatura: "Ligeiro",
      capitalSeguro: "",
      taxa: 0,
      premioAnnual: "0.00",
      tipoCobertura: "DP_NORMAL",
    };

    setFormData((prev) => {
      const veiculos = [...prev.veiculos, novoVeiculo];
      const { veiculos: v, totalPremio } = recalcularVeiculos(veiculos);
      return { ...prev, veiculos: v, totalPremio };
    });
  };

  const removerVeiculo = (id) => {
    setFormData((prev) => {
      const veiculos = prev.veiculos.filter((v) => v.id !== id);
      const { veiculos: v, totalPremio } = recalcularVeiculos(veiculos);
      return { ...prev, veiculos: v, totalPremio };
    });
  };

  const atualizarVeiculo = (id, campo, valor) => {
    setFormData((prev) => {
      const veiculos = prev.veiculos.map((veiculo) =>
        veiculo.id === id ? { ...veiculo, [campo]: valor } : veiculo
      );
      const { veiculos: v, totalPremio } = recalcularVeiculos(veiculos);
      return { ...prev, veiculos: v, totalPremio };
    });
  };

  // Template único: GeradorPDFPersonalizado
  const cotacaoParaPDF = () => {
    if (!formData) return null;
    return {
      id: formData.id || formData.numero_cotacao,
      dataCriacao: formData.data_criacao || formData.updated_at || new Date().toISOString(),
      cliente: formData.cliente || {},
      veiculos: (formData.veiculos || []).map((v) => ({
        ...v,
        marca: v.marca || (v.marcaModelo && v.marcaModelo.split(" ")[0]),
        modelo: v.modelo || (v.marcaModelo && v.marcaModelo.split(" ").slice(1).join(" ")),
      })),
      totalPremio: formData.totalPremio,
      debitoDireto: formData.debitoDireto,
    };
  };

  const gerarPDF = () => {
    const cotacao = cotacaoParaPDF();
    if (cotacao) gerarPDFPersonalizado(cotacao, "download");
  };

  const visualizarPDF = () => {
    const cotacao = cotacaoParaPDF();
    if (cotacao) gerarPDFPersonalizado(cotacao, "visualizar");
  };

  const imprimirCotacao = () => {
    const cotacao = cotacaoParaPDF();
    if (cotacao) gerarPDFPersonalizado(cotacao, "imprimir");
  };

  // Função para enviar email
  const enviarEmail = async () => {
    if (!formData) return;

    if (!formData.cliente?.email) {
      alert("❌ O cliente não tem email cadastrado.");
      return;
    }

    const confirmarEnvio = window.confirm(
      `Deseja enviar a cotação ${formData.numero_cotacao || formData.id} por email para ${formData.cliente.email}?`
    );
    
    if (!confirmarEnvio) {
      return;
    }

    try {
      setProcessandoEmail(true);

      const result = await cotacaoService.enviarEmail(formData.id);
      
      if (result.success) {
        alert(`✅ Email enviado com sucesso para ${formData.cliente.email}!`);
        setMostrarOpcoesPartilha(false);
      } else {
        alert(`❌ Erro ao enviar email: ${result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      alert(`❌ Erro ao enviar email: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
    } finally {
      setProcessandoEmail(false);
    }
  };

  const cotacoesFiltradas = listaCotacoes.filter((c) => {
    if (!filtroLista.trim()) return true;
    const termo = filtroLista.toLowerCase();
    const cliente = `${c.primeiro_nome || ''} ${c.sobrenome || ''}`.toLowerCase();
    return (
      c.numero_cotacao?.toLowerCase().includes(termo) ||
      cliente.includes(termo) ||
      String(c.id).includes(termo) ||
      (c.cliente_email || '').toLowerCase().includes(termo)
    );
  });

  const statusLabel = (status) => {
    const map = {
      pendente: 'Pendente',
      ativa: 'Ativa',
      aprovada: 'Aprovada',
      finalizada: 'Finalizada',
      expirada: 'Expirada',
      cancelada: 'Cancelada',
    };
    return map[status] || status;
  };

  return (
    <CotacoesLayout
      title="Editar Cotação"
      subtitle="Selecione uma cotação da lista ou busque pelo número para editar"
    >
      <div className="p-3 sm:p-6 bg-white min-h-screen page-container">
        {/* Lista de cotações disponíveis */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-emerald-600 mr-3 shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Cotações Disponíveis
                </h3>
                <p className="text-sm text-gray-500">
                  {loadingLista ? 'A carregar...' : `${cotacoesFiltradas.length} cotação(ões)`}
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar por número, cliente ou email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={filtroLista}
                onChange={(e) => setFiltroLista(e.target.value)}
              />
            </div>
          </div>

          {loadingLista ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
              Carregando cotações...
            </div>
          ) : cotacoesFiltradas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma cotação encontrada.
            </div>
          ) : (
            <div className="table-responsive -mx-2 sm:mx-0">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-3 px-3 font-semibold">Número</th>
                    <th className="py-3 px-3 font-semibold">Cliente</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold">Total</th>
                    <th className="py-3 px-3 font-semibold">Data</th>
                    <th className="py-3 px-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cotacoesFiltradas.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-emerald-50/60 transition-colors ${
                        formData?.id === c.id ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-emerald-700 font-medium">
                        {c.numero_cotacao}
                      </td>
                      <td className="py-3 px-3 text-gray-800">
                        {`${c.primeiro_nome || ''} ${c.sobrenome || ''}`.trim() || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {statusLabel(c.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-800">
                        MT {parseFloat(c.total_premio || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {c.data_criacao ? new Date(c.data_criacao).toLocaleDateString('pt-MZ') : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => selecionarCotacao(c)}
                          disabled={isLoading && formData?.id === c.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Editar
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Busca rápida por número */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center mb-3">
            <Search className="h-5 w-5 text-emerald-600 mr-2" />
            <h3 className="text-base font-semibold text-gray-900">Busca rápida</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Número da cotação (ex: CT-2026-000001)"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={cotacaoId}
              onChange={(e) => setCotacaoId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && buscarCotacao()}
            />
            <button
              type="button"
              onClick={buscarCotacao}
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
            </button>
          </div>
        </div>

        {/* Formulário de Edição */}
        {formData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Edit3 className="h-6 w-6 text-emerald-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Editando: {formData.numero_cotacao || formData.id}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium border border-emerald-200">
                  {formData.status}
                </span>
              </div>

              {/* Dados do Cliente */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Dados do Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Primeiro Nome *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.primeiroNome}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            primeiroNome: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.sobrenome}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            sobrenome: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            email: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.telefone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            telefone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Nº Documento *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.numeroDocumento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            numeroDocumento: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Tipo de Cliente
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.tipo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            tipo: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="Particular">Particular</option>
                      <option value="Empresarial">Empresarial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados dos Veículos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Veículos Segurados
                  </h4>
                  <button
                    type="button"
                    onClick={adicionarVeiculo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Veículo</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.veiculos.map((veiculo, index) => (
                    <div
                      key={veiculo.id}
                      className="p-6 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-gray-800">
                          Viatura {index + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removerVeiculo(veiculo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Remover veículo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Marca/Modelo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Marca/Modelo *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.marcaModelo}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "marcaModelo",
                                e.target.value
                              )
                            }
                            placeholder="Ex: Toyota Corolla"
                          />
                        </div>

                        {/* Matrícula */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Matrícula
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.matricula}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "matricula",
                                e.target.value
                              )
                            }
                            placeholder="Ex: AB-123-CD"
                          />
                        </div>

                        {/* Ano */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Ano
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.ano}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "ano",
                                e.target.value
                              )
                            }
                            placeholder="Ex: 2023"
                          />
                        </div>

                        {/* Motor */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Motor
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.motor}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "motor",
                                e.target.value
                              )
                            }
                            placeholder="Ex: 1.6L"
                          />
                        </div>

                        {/* Chassis */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Chassis
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.chassis}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "chassis",
                                e.target.value
                              )
                            }
                            placeholder="Número do chassis"
                          />
                        </div>

                        {/* Lotação */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Lotação
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.lotacao}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "lotacao",
                                e.target.value
                              )
                            }
                            placeholder="Nº de passageiros"
                          />
                        </div>

                        {/* Tipo de Viatura */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Tipo de Viatura *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.tipoViatura}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "tipoViatura",
                                e.target.value
                              )
                            }
                          >
                            <option value="Ligeiro">Ligeiro</option>
                            <option value="Pesado">Pesado</option>
                          </select>
                        </div>

                        {/* Tipo de Cobertura */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Tipo de Cobertura *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.tipoCobertura}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "tipoCobertura",
                                e.target.value
                              )
                            }
                          >
                            <option value="DP_NORMAL">
                              DP NORMAL - Danos Próprios com Franquia
                            </option>
                            <option value="DP_SEM_FRANQUIA">
                              DP SEM FRANQUIA - Danos Próprios sem Franquia
                            </option>
                            <option value="RC_NORMAL">
                              RC NORMAL - Apenas Responsabilidade Civil
                            </option>
                            <option value="RC_OCUPANTES">
                              RC & OCUPANTES - RC + Cobertura para Ocupantes
                            </option>
                          </select>
                        </div>

                        {/* Capital Seguro */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Capital Seguro (MT) *
                          </label>
                          <input
                            type="number"
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.capitalSeguro}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "capitalSeguro",
                                e.target.value
                              )
                            }
                            placeholder="Valor em MT"
                          />
                        </div>

                        {/* Taxa (readonly) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Taxa Aplicada
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-800 font-semibold"
                            value={
                              veiculo.taxa
                                ? `${(veiculo.taxa * 100).toFixed(1)}%`
                                : "0%"
                            }
                          />
                        </div>

                        {/* Prémio Annual (readonly) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Prémio Annual (MT)
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-800 font-semibold"
                            value={
                              veiculo.premioAnnual
                                ? `MT ${parseFloat(
                                    veiculo.premioAnnual
                                  ).toLocaleString("pt-MZ", {
                                    minimumFractionDigits: 2,
                                  })}`
                                : "MT 0.00"
                            }
                          />
                        </div>
                      </div>

                      {/* Resumo da Cobertura */}
                      {veiculo.tipoCobertura && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm text-blue-800 font-semibold mb-2">
                            {configCoberturas[veiculo.tipoCobertura]?.nome}
                          </div>
                          <div className="text-xs text-gray-600">
                            Taxa {veiculo.tipoViatura}:{" "}
                            {(
                              configCoberturas[veiculo.tipoCobertura]?.taxas[
                                veiculo.tipoViatura
                              ] * 100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    Total: MT{" "}
                    {parseFloat(formData.totalPremio).toLocaleString("pt-MZ", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formData.veiculos.length} veículo(s) | Atualizado em{" "}
                    {new Date().toLocaleDateString("pt-MZ")}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Observações
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                  value={formData.observacoes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Adicione observações sobre a cotação..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
              >
                {salvando ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{salvando ? 'A guardar...' : 'Atualizar Cotação'}</span>
              </button>
            </div>
          </form>
        )}

        {/* MODAL DE PARTILHA APÓS EDIÇÃO */}
        {mostrarOpcoesPartilha && formData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Partilhar Cotação Atualizada
                </h3>
                <button
                  onClick={() => setMostrarOpcoesPartilha(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-800 font-semibold">
                    Cotação: {formData.numero_cotacao || formData.id}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Cliente: {formData.cliente.primeiroNome}{" "}
                    {formData.cliente.sobrenome}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Total: MT{" "}
                    {parseFloat(formData.totalPremio).toLocaleString("pt-MZ", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-emerald-600 text-sm font-semibold">
                    ✓ Atualizada em {new Date().toLocaleDateString("pt-MZ")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={visualizarPDF}
                    className="p-4 rounded-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2"
                  >
                    <Eye className="h-6 w-6" />
                    <span className="font-semibold">Visualizar PDF</span>
                    <span className="text-xs text-gray-600">Ver cotação</span>
                  </button>

                  <button
                    onClick={gerarPDF}
                    className="p-4 rounded-lg border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2"
                  >
                    <Download className="h-6 w-6" />
                    <span className="font-semibold">Download PDF</span>
                    <span className="text-xs text-gray-600">
                      Baixar cotação
                    </span>
                  </button>

                  <button
                    onClick={imprimirCotacao}
                    className="p-4 rounded-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2"
                  >
                    <Printer className="h-6 w-6" />
                    <span className="font-semibold">Imprimir</span>
                    <span className="text-xs text-gray-600">
                      Imprimir cotação
                    </span>
                  </button>

                  <button
                    onClick={enviarEmail}
                    disabled={processandoEmail}
                    className="p-4 rounded-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processandoEmail ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                    <span className="font-semibold">
                      {processandoEmail ? "Enviando..." : "Enviar Email"}
                    </span>
                    <span className="text-xs text-gray-600">
                      Para administradores
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setMostrarOpcoesPartilha(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CotacoesLayout>
  );
}

export default EditarCotacao;