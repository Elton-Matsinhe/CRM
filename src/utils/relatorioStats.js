import { STATUS_CORES, STATUS_LABELS } from './relatorioFilters';

const CORES_BALCAO = [
  '#106a37', '#0d9488', '#059669', '#047857', '#065f46',
  '#374151', '#4b5563', '#6b7280', '#166534', '#15803d',
];

export function calcularEstatisticas(cotacoes) {
  const total = cotacoes.length;
  const totalPremio = cotacoes.reduce((s, c) => s + parseFloat(c.total_premio || c.totalPremio || 0), 0);
  const porStatus = agruparPorStatus(cotacoes);
  const porBalcao = agruparPorBalcao(cotacoes);
  const mediaPremio = total > 0 ? totalPremio / total : 0;

  return {
    total,
    totalPremio,
    mediaPremio,
    porStatus,
    porBalcao,
    ativas: cotacoes.filter((c) => c.status === 'ativa').length,
    pendentes: cotacoes.filter((c) => c.status === 'pendente').length,
    finalizadas: cotacoes.filter((c) => c.status === 'finalizada').length,
  };
}

export function agruparPorStatus(cotacoes) {
  const map = {};
  cotacoes.forEach((c) => {
    const s = c.status || 'outro';
    map[s] = (map[s] || 0) + 1;
  });
  return Object.entries(map)
    .map(([key, value]) => ({
      key,
      label: STATUS_LABELS[key] || key,
      value,
      color: STATUS_CORES[key] || '#6b7280',
    }))
    .sort((a, b) => b.value - a.value);
}

export function agruparPorBalcao(cotacoes) {
  const map = {};
  cotacoes.forEach((c) => {
    const b = c.agente_balcao || c.balcao || 'Não definido';
    map[b] = (map[b] || 0) + 1;
  });
  return Object.entries(map)
    .map(([label, value], i) => ({
      label,
      value,
      color: CORES_BALCAO[i % CORES_BALCAO.length],
    }))
    .sort((a, b) => b.value - a.value);
}

export function agruparPorAgente(cotacoes) {
  const map = {};
  cotacoes.forEach((c) => {
    const nome = c.agente_nome || c.agenteNome || 'Não definido';
    if (!map[nome]) map[nome] = { count: 0, valor: 0, balcao: c.agente_balcao || '—' };
    map[nome].count += 1;
    map[nome].valor += parseFloat(c.total_premio || c.totalPremio || 0);
  });
  return Object.entries(map)
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function valorPorStatus(cotacoes) {
  const map = {};
  cotacoes.forEach((c) => {
    const s = c.status || 'outro';
    map[s] = (map[s] || 0) + parseFloat(c.total_premio || c.totalPremio || 0);
  });
  return map;
}

export function valorPorBalcao(cotacoes) {
  const map = {};
  cotacoes.forEach((c) => {
    const b = c.agente_balcao || c.balcao || 'Não definido';
    map[b] = (map[b] || 0) + parseFloat(c.total_premio || c.totalPremio || 0);
  });
  return map;
}

/** Gera gráfico de pizza em SVG */
export function gerarPieChartSVG(items, size = 180) {
  const dados = (items || []).filter((i) => i.value > 0);
  const total = dados.reduce((s, i) => s + i.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  if (total === 0) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#e5e7eb" />
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="#6b7280" font-size="11">Sem dados</text>
    </svg>`;
  }

  let angle = -Math.PI / 2;
  const paths = dados.map((item) => {
    const slice = (item.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += slice;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = slice > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return `<path d="${d}" fill="${item.color}" stroke="#fff" stroke-width="1.5"/>`;
  });

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">
    ${paths.join('')}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="#fff"/>
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#106a37" font-size="16" font-weight="bold">${total}</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#6b7280" font-size="9">Total</text>
  </svg>`;
}

export function gerarLegenda(items) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return items.map((item) => {
    const pct = ((item.value / total) * 100).toFixed(1);
    return `<div class="legenda-item">
      <span class="legenda-cor" style="background:${item.color}"></span>
      <span class="legenda-texto">${item.label}: <strong>${item.value}</strong> (${pct}%)</span>
    </div>`;
  }).join('');
}
