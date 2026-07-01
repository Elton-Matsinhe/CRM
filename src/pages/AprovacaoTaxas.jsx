import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  History,
  Percent,
  FileText,
  User,
  Car,
  Shield,
  Edit3,
} from "lucide-react";
import CotacoesLayout from "../components/CotacoesLayout";
import { cotacaoService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getStatusAprovacaoLabel,
  STATUS_APROVACAO_CORES,
  formatarTaxaPercentual,
  getTipoAcaoHistoricoLabel,
  formatarMoedaMT,
} from "../utils/statusAprovacao";
import {
  getTaxaPadrao,
  listarCoberturasProduto,
  exigeCapitalSeguro,
  calcularPremioComTaxaCustom,
  configCoberturas,
} from "../utils/cotacaoCoberturas";

const FILTROS = [
  { id: "aguardando", label: "Aguardando Aprovação" },
  { id: "aprovada", label: "Aprovadas" },
  { id: "rejeitada", label: "Rejeitadas" },
];

const TOLERANCIA_TAXA = 0.00001;

function taxasDiferem(a, b) {
  return Math.abs((parseFloat(a) || 0) - (parseFloat(b) || 0)) > TOLERANCIA_TAXA;
}

function AprovacaoTaxas() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("aguardando");
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [cotacaoDetalhe, setCotacaoDetalhe] = useState(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [modalRejeicao, setModalRejeicao] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [comentarioAprovacao, setComentarioAprovacao] = useState("");
  const [taxasEditadas, setTaxasEditadas] = useState({});

  const isAprovador = usuario?.role === "admin" || usuario?.role === "subscritor";

  const carregar = useCallback(async () => {
    if (!isAprovador) return;
    try {
      setLoading(true);
      const result = await cotacaoService.listarPendentesAprovacao({
        status_aprovacao: filtro,
        limit: 100,
      });
      if (result.success) {
        setCotacoes(result.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar aprovações:", error);
    } finally {
      setLoading(false);
    }
  }, [filtro, isAprovador]);

  useEffect(() => {
    if (!isAprovador) {
      navigate("/dashboard");
      return;
    }
    carregar();
  }, [carregar, isAprovador, navigate]);

  const abrirDetalhe = async (cotacao) => {
    setCarregandoDetalhe(true);
    setComentarioAprovacao("");
    setTaxasEditadas({});

    const [detalhe, hist] = await Promise.all([
      cotacaoService.buscarPorId(cotacao.id),
      cotacaoService.historicoAprovacao(cotacao.id),
    ]);

    if (detalhe.success) {
      const c = detalhe.data;
      setCotacaoDetalhe(c);
      const iniciais = {};
      (c.veiculos || []).forEach((v) => {
        const taxa = parseFloat(v.taxa) || 0;
        iniciais[v.id] = (taxa * 100).toFixed(2);
      });
      setTaxasEditadas(iniciais);
    } else {
      setCotacaoDetalhe(cotacao);
    }

    if (hist.success) setHistorico(hist.data || []);
    setCarregandoDetalhe(false);
  };

  const veiculosDetalhe = cotacaoDetalhe?.veiculos || [];
  const debitoDireto = cotacaoDetalhe?.debito_direto === 1 || cotacaoDetalhe?.debito_direto === true;
  const cliente = cotacaoDetalhe?.cliente || {};

  const taxasForamAlteradas = veiculosDetalhe.some((v) => {
    const editada = parseFloat(taxasEditadas[v.id]);
    const original = parseFloat(v.taxa) || 0;
    if (Number.isNaN(editada)) return false;
    return taxasDiferem(editada / 100, original);
  });

  const validarTaxasEditadas = () => {
    for (const v of veiculosDetalhe) {
      if (!exigeCapitalSeguro(v.tipo_cobertura)) continue;
      const pct = parseFloat(taxasEditadas[v.id]);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        return `Taxa inválida para o veículo ${v.marca_modelo || v.marca}. Use um valor entre 0% e 100%.`;
      }
    }
    return null;
  };

  const montarPayloadTaxas = () =>
    veiculosDetalhe
      .filter((v) => exigeCapitalSeguro(v.tipo_cobertura))
      .map((v) => ({
        veiculo_id: v.id,
        taxa: parseFloat(taxasEditadas[v.id]) / 100,
      }));

  const aprovarSemAlterar = async () => {
    if (!cotacaoDetalhe) return;
    if (!window.confirm(`Aprovar a taxa da cotação ${cotacaoDetalhe.numero_cotacao} sem alterações?`)) return;

    setProcessando(cotacaoDetalhe.id);
    const result = await cotacaoService.aprovarTaxa(cotacaoDetalhe.id, comentarioAprovacao);
    setProcessando(null);

    if (result.success) {
      alert("✅ Taxa aprovada mantendo o valor solicitado. O agente foi notificado.");
      setCotacaoDetalhe(null);
      carregar();
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const aprovarComAlteracao = async () => {
    if (!cotacaoDetalhe) return;
    const erroValidacao = validarTaxasEditadas();
    if (erroValidacao) {
      alert(erroValidacao);
      return;
    }
    if (!taxasForamAlteradas) {
      alert("Nenhuma taxa foi alterada. Use «Aprovar sem alterar» ou edite a taxa antes de aprovar.");
      return;
    }

    if (
      !window.confirm(
        `Aprovar a cotação ${cotacaoDetalhe.numero_cotacao} com a(s) taxa(s) alterada(s) pelo administrador?`
      )
    ) {
      return;
    }

    setProcessando(cotacaoDetalhe.id);
    const result = await cotacaoService.aprovarTaxa(
      cotacaoDetalhe.id,
      comentarioAprovacao,
      montarPayloadTaxas()
    );
    setProcessando(null);

    if (result.success) {
      alert("✅ Taxa alterada e aprovada. O agente foi notificado.");
      setCotacaoDetalhe(null);
      carregar();
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const confirmarRejeicao = async () => {
    if (!modalRejeicao) return;
    if (!motivoRejeicao.trim()) {
      alert("Informe o motivo da rejeição.");
      return;
    }
    setProcessando(modalRejeicao.id);
    const result = await cotacaoService.rejeitarTaxa(modalRejeicao.id, motivoRejeicao.trim());
    setProcessando(null);
    if (result.success) {
      alert("Cotação rejeitada. O agente foi notificado.");
      setModalRejeicao(null);
      setMotivoRejeicao("");
      setCotacaoDetalhe(null);
      carregar();
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const atualizarTaxaVeiculo = (veiculoId, valorPercentual) => {
    setTaxasEditadas((prev) => ({ ...prev, [veiculoId]: valorPercentual }));
  };

  const calcularPremioPreview = (veiculo) => {
    const pct = parseFloat(taxasEditadas[veiculo.id]);
    if (Number.isNaN(pct)) return null;
    return calcularPremioComTaxaCustom({
      capitalSeguro: veiculo.capital_seguro,
      tipoCobertura: veiculo.tipo_cobertura,
      classificacao: veiculo.classificacao,
      taxaCustom: pct / 100,
      debitoDiretoAtivo: debitoDireto,
    });
  };

  if (!isAprovador) return null;

  return (
    <CotacoesLayout title="Aprovação de Taxas">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Percent className="h-7 w-7 text-emerald-600" />
            Aprovação de Taxas
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Analise solicitações de taxa alterada, aprove mantendo o valor solicitado, ajuste a taxa antes de aprovar ou rejeite com motivo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === f.id
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : cotacoes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma cotação em «{getStatusAprovacaoLabel(filtro)}».</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Cotação</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Agente</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Prémio</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status operacional</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Aprovação</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cotacoes.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.numero_cotacao}</td>
                    <td className="px-4 py-3 text-sm">
                      {c.primeiro_nome} {c.sobrenome}
                    </td>
                    <td className="px-4 py-3 text-sm">{c.agente_nome || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      MT {parseFloat(c.total_premio || 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{c.status}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_APROVACAO_CORES[c.status_aprovacao] || ""}`}>
                        {getStatusAprovacaoLabel(c.status_aprovacao)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => abrirDetalhe(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                        Analisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cotacaoDetalhe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                <h3 className="text-lg font-bold text-gray-900">
                  {cotacaoDetalhe.numero_cotacao} — Análise de taxas
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Solicitada em{" "}
                  {new Date(cotacaoDetalhe.created_at || cotacaoDetalhe.data_criacao).toLocaleString("pt-MZ")}
                </p>
              </div>

              {carregandoDetalhe ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Resumo cotação e cliente */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                        <User className="h-4 w-4" /> Cliente
                      </h4>
                      <dl className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Nome</dt>
                          <dd className="font-medium">
                            {cliente.primeiro_nome || cotacaoDetalhe.primeiro_nome}{" "}
                            {cliente.sobrenome || cotacaoDetalhe.sobrenome}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Tipo</dt>
                          <dd>{cliente.tipo || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Contacto</dt>
                          <dd>{cliente.telefone || cliente.email || "—"}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4" /> Cotação
                      </h4>
                      <dl className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Comercial</dt>
                          <dd className="font-medium">{cotacaoDetalhe.agente_nome || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Prémio total</dt>
                          <dd className="font-semibold text-emerald-700">
                            {formatarMoedaMT(cotacaoDetalhe.total_premio)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Débito direto</dt>
                          <dd>{debitoDireto ? "Sim (+15%)" : "Não"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Status aprovação</dt>
                          <dd>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_APROVACAO_CORES[cotacaoDetalhe.status_aprovacao] || ""}`}>
                              {getStatusAprovacaoLabel(cotacaoDetalhe.status_aprovacao)}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Veículos */}
                  {veiculosDetalhe.map((v, idx) => {
                    const taxaPadrao = getTaxaPadrao(v.tipo_cobertura, v.classificacao);
                    const taxaSolicitada = parseFloat(v.taxa) || 0;
                    const taxaEditadaPct = parseFloat(taxasEditadas[v.id]);
                    const taxaEditadaDecimal = Number.isNaN(taxaEditadaPct) ? taxaSolicitada : taxaEditadaPct / 100;
                    const alteradaVsPadrao = taxasDiferem(taxaSolicitada, taxaPadrao);
                    const alteradaPeloAdmin = taxasDiferem(taxaEditadaDecimal, taxaSolicitada);
                    const diffPadrao = ((taxaSolicitada - taxaPadrao) * 100).toFixed(2);
                    const coberturas = listarCoberturasProduto(v.tipo_cobertura);
                    const premioPreview = calcularPremioPreview(v);
                    const produtoNome = configCoberturas[v.tipo_cobertura]?.nome || v.tipo_cobertura;

                    return (
                      <div key={v.id || idx} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            {v.marca_modelo || `${v.marca || ""} ${v.modelo || ""}`.trim() || `Veículo ${idx + 1}`}
                          </span>
                          {v.matricula_completa || v.matricula ? (
                            <span className="text-sm text-gray-500">• {v.matricula_completa || v.matricula}</span>
                          ) : null}
                        </div>

                        <div className="p-4 grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div><span className="text-gray-500">Tipo de seguro:</span> <strong>{produtoNome}</strong></div>
                            <div><span className="text-gray-500">Classificação:</span> {v.classificacao || "—"}</div>
                            {exigeCapitalSeguro(v.tipo_cobertura) && (
                              <div>
                                <span className="text-gray-500">Valor segurado:</span>{" "}
                                <strong>{formatarMoedaMT(v.capital_seguro)}</strong>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Prémio anual:</span>{" "}
                              <strong>{formatarMoedaMT(v.premio_anual)}</strong>
                              {premioPreview && alteradaPeloAdmin && (
                                <span className="ml-2 text-emerald-700">
                                  → {formatarMoedaMT(premioPreview.premioAnnual)} (preview)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500">Taxa padrão:</span>{" "}
                              <strong>{taxaPadrao > 0 ? formatarTaxaPercentual(taxaPadrao) : "Taxa fixa"}</strong>
                            </div>
                            <div className={alteradaVsPadrao ? "text-amber-800" : ""}>
                              <span className="text-gray-500">Taxa solicitada:</span>{" "}
                              <strong>{formatarTaxaPercentual(taxaSolicitada)}</strong>
                            </div>
                            <div>
                              <span className="text-gray-500">Diferença vs padrão:</span>{" "}
                              <strong className={parseFloat(diffPadrao) > 0 ? "text-amber-700" : parseFloat(diffPadrao) < 0 ? "text-blue-700" : ""}>
                                {taxaPadrao > 0 ? `${parseFloat(diffPadrao) >= 0 ? "+" : ""}${diffPadrao}%` : "—"}
                              </strong>
                            </div>

                            {cotacaoDetalhe.status_aprovacao === "aguardando" && exigeCapitalSeguro(v.tipo_cobertura) && (
                              <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                  <Edit3 className="h-3 w-3" /> Taxa a aprovar (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  className={`w-full border rounded-lg px-3 py-2 text-sm ${
                                    alteradaPeloAdmin ? "border-emerald-500 bg-emerald-50" : "border-gray-300"
                                  }`}
                                  value={taxasEditadas[v.id] ?? ""}
                                  onChange={(e) => atualizarTaxaVeiculo(v.id, e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {coberturas.length > 0 && (
                          <div className="px-4 pb-4">
                            <h5 className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-2">
                              <Shield className="h-3 w-3" /> Coberturas do produto
                            </h5>
                            <div className="grid sm:grid-cols-2 gap-1 text-xs">
                              {coberturas.map((c) => (
                                <div key={c.label} className="flex justify-between bg-gray-50 px-2 py-1 rounded">
                                  <span className="text-gray-600">{c.label}</span>
                                  <span className="font-medium">{c.valor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {cotacaoDetalhe.status_aprovacao === "aguardando" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comentário (opcional, enviado ao agente na aprovação)
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                        rows={2}
                        value={comentarioAprovacao}
                        onChange={(e) => setComentarioAprovacao(e.target.value)}
                        placeholder="Comentário para o agente..."
                      />
                    </div>
                  )}

                  {historico.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-1 mb-2">
                        <History className="h-4 w-4" /> Histórico de auditoria
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {historico.map((h) => (
                          <div key={h.id} className="text-xs p-3 bg-gray-50 rounded-lg border">
                            <div className="font-medium">{getTipoAcaoHistoricoLabel(h.tipo_acao)}</div>
                            {h.taxa_padrao != null && h.taxa_aplicada != null && (
                              <div>
                                {h.tipo_acao === "aprovacao_com_alteracao" ? (
                                  <>Taxa solicitada: {formatarTaxaPercentual(h.taxa_padrao)} → Aprovada: {formatarTaxaPercentual(h.taxa_aplicada)}</>
                                ) : (
                                  <>Taxa: {formatarTaxaPercentual(h.taxa_padrao)} → {formatarTaxaPercentual(h.taxa_aplicada)}</>
                                )}
                              </div>
                            )}
                            {h.usuario_alteracao_nome && <div>Alterado por: {h.usuario_alteracao_nome}</div>}
                            {h.usuario_aprovacao_nome && <div>Decisão por: {h.usuario_aprovacao_nome}</div>}
                            {h.comentario && <div className="text-gray-600 italic mt-1">{h.comentario}</div>}
                            <div className="text-gray-400 mt-1">
                              {new Date(h.data_aprovacao || h.data_alteracao || h.created_at).toLocaleString("pt-MZ")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => setCotacaoDetalhe(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Fechar
                </button>
                {cotacaoDetalhe.status_aprovacao === "aguardando" && !carregandoDetalhe && (
                  <>
                    <button
                      onClick={() => {
                        setModalRejeicao(cotacaoDetalhe);
                        setMotivoRejeicao("");
                      }}
                      disabled={processando === cotacaoDetalhe.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" /> Rejeitar
                    </button>
                    <button
                      onClick={aprovarSemAlterar}
                      disabled={processando === cotacaoDetalhe.id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      {processando === cotacaoDetalhe.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Aprovar sem alterar
                    </button>
                    <button
                      onClick={aprovarComAlteracao}
                      disabled={processando === cotacaoDetalhe.id || !taxasForamAlteradas}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!taxasForamAlteradas ? "Edite a taxa para activar esta opção" : ""}
                    >
                      <Edit3 className="h-4 w-4" />
                      Alterar taxa e aprovar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {modalRejeicao && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="font-bold text-gray-900 mb-2">Motivo da rejeição</h3>
              <p className="text-sm text-gray-600 mb-3">
                Cotação {modalRejeicao.numero_cotacao} — o motivo será registado no histórico e enviado ao agente.
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4"
                rows={4}
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalRejeicao(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarRejeicao}
                  disabled={processando === modalRejeicao.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Confirmar rejeição
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CotacoesLayout>
  );
}

export default AprovacaoTaxas;
