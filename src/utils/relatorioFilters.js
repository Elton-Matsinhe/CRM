export const MESES = [
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
  { value: 12, label: 'Dezembro' },
];

export const STATUS_CORES = {
  ativa: '#16a34a',
  pendente: '#f59e0b',
  finalizada: '#059669',
  aprovada: '#0d9488',
  expirada: '#ea580c',
  cancelada: '#dc2626',
};

export const STATUS_LABELS = {
  ativa: 'Ativa',
  pendente: 'Pendente',
  finalizada: 'Finalizada',
  aprovada: 'Aprovada',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
};

/** Filtra cotações conforme os filtros do relatório */
export function filtrarCotacoes(cotacoes, filtros = {}) {
  if (!Array.isArray(cotacoes)) return [];

  let resultado = [...cotacoes];
  const modo = filtros.modo || 'mensal';

  if (modo === 'mensal' && filtros.mes && filtros.ano) {
    resultado = resultado.filter((c) => {
      const data = new Date(c.data_criacao || c.created_at || c.dataCriacao);
      return data.getMonth() + 1 === Number(filtros.mes) && data.getFullYear() === Number(filtros.ano);
    });
  }

  if (filtros.data_inicio) {
    const inicio = new Date(filtros.data_inicio);
    resultado = resultado.filter((c) => {
      const data = new Date(c.data_criacao || c.created_at || c.dataCriacao);
      return data >= inicio;
    });
  }

  if (filtros.data_fim) {
    const fim = new Date(filtros.data_fim);
    fim.setHours(23, 59, 59, 999);
    resultado = resultado.filter((c) => {
      const data = new Date(c.data_criacao || c.created_at || c.dataCriacao);
      return data <= fim;
    });
  }

  if (filtros.status) {
    resultado = resultado.filter((c) => c.status === filtros.status);
  }

  if (filtros.agente_id) {
    resultado = resultado.filter((c) => String(c.agente_id) === String(filtros.agente_id));
  }

  if (filtros.balcao) {
    resultado = resultado.filter((c) => (c.agente_balcao || c.balcao || '') === filtros.balcao);
  }

  return resultado;
}

export function getTituloRelatorio(filtros) {
  const modo = filtros.modo || 'mensal';
  if (modo === 'personalizado' && (filtros.data_inicio || filtros.data_fim)) {
    const ini = filtros.data_inicio
      ? new Date(filtros.data_inicio).toLocaleDateString('pt-MZ')
      : '—';
    const fim = filtros.data_fim
      ? new Date(filtros.data_fim).toLocaleDateString('pt-MZ')
      : '—';
    return `Relatório Personalizado (${ini} — ${fim})`;
  }
  const mesLabel = MESES.find((m) => m.value === Number(filtros.mes))?.label || filtros.mes;
  return `Relatório Mensal — ${mesLabel} ${filtros.ano || new Date().getFullYear()}`;
}

export function getResumoFiltros(filtros, agentes = [], balcoes = []) {
  const partes = [];
  if (filtros.status) partes.push(`Status: ${STATUS_LABELS[filtros.status] || filtros.status}`);
  if (filtros.agente_id) {
    const ag = agentes.find((a) => String(a.id) === String(filtros.agente_id));
    partes.push(`Agente: ${ag?.nome || filtros.agente_id}`);
  }
  if (filtros.balcao) partes.push(`Balcão: ${filtros.balcao}`);
  return partes.length ? partes.join(' · ') : 'Todos os registos';
}
