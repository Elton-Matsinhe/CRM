export const STATUS_APROVACAO_LABELS = {
  nao_requer: "Não Requer Aprovação",
  aguardando: "Aguardando Aprovação",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

export const STATUS_APROVACAO_CORES = {
  nao_requer: "bg-gray-100 text-gray-700",
  aguardando: "bg-amber-100 text-amber-800",
  aprovada: "bg-green-100 text-green-800",
  rejeitada: "bg-red-100 text-red-800",
};

export function getStatusAprovacaoLabel(status) {
  return STATUS_APROVACAO_LABELS[status] || STATUS_APROVACAO_LABELS.nao_requer;
}

export function cotacaoPodePartilhar(statusAprovacao) {
  const status = statusAprovacao || "nao_requer";
  return status === "nao_requer" || status === "aprovada";
}

export function formatarTaxaPercentual(taxaDecimal) {
  const taxa = parseFloat(taxaDecimal);
  if (Number.isNaN(taxa)) return "—";
  return `${(taxa * 100).toFixed(2)}%`;
}

export function getTipoAcaoHistoricoLabel(tipoAcao) {
  const labels = {
    alteracao_taxa: "Alteração de taxa (comercial)",
    aprovacao: "Aprovação sem alteração",
    aprovacao_com_alteracao: "Aprovação com alteração de taxa",
    rejeicao: "Rejeição",
  };
  return labels[tipoAcao] || tipoAcao?.replace(/_/g, " ") || "—";
}

export function formatarMoedaMT(valor) {
  const n = parseFloat(valor);
  if (Number.isNaN(n)) return "—";
  return `MT ${n.toLocaleString("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
