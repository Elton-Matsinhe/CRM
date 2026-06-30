import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getTituloRelatorio, getResumoFiltros } from './relatorioFilters';
import {
  calcularEstatisticas,
  agruparPorAgente,
  valorPorStatus,
  valorPorBalcao,
} from './relatorioStats';
import {
  loadLetterheadDataUrl,
  drawLetterheadPage,
  addLetterheadPage,
  drawReportTitle,
  drawMetaLine,
  drawSectionTitle,
  MARGIN,
  CONTENT_TOP,
  CONTENT_BOTTOM,
  TABLE_GAP,
  PDF_TABLE_HEAD,
  PDF_TABLE_BODY,
  PDF_TABLE_ALT,
  getContentWidth,
  getPageBottom,
  VERDE,
  CINZA,
} from './pdfLetterhead';

const STATUS_DESC = {
  ativa: 'Cotação activa e válida no sistema',
  pendente: 'Cotação aguarda conclusão ou aprovação',
  finalizada: 'Cotação concluída com sucesso',
  aprovada: 'Cotação aprovada internamente',
  expirada: 'Cotação expirou o prazo de validade',
  cancelada: 'Cotação cancelada ou anulada',
};

function fmtMoeda(n) {
  return parseFloat(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtData(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('pt-MZ'); } catch { return '—'; }
}

function pieChartDataUrl(items, size = 90) {
  if (typeof document === 'undefined') return null;
  const dados = (items || []).filter((i) => i.value > 0);
  const total = dados.reduce((s, i) => s + i.value, 0);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  if (total === 0) {
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL('image/png');
  }
  let angle = -Math.PI / 2;
  dados.forEach((item) => {
    const slice = (item.value / total) * Math.PI * 2;
    ctx.fillStyle = item.color || '#106a37';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    angle += slice;
  });
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#106a37';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(total), cx, cy);
  return canvas.toDataURL('image/png');
}

/**
 * Escritor contínuo — timbrado uma vez por página; conteúdo flui de cima para baixo.
 */
class RelatorioPdfWriter {
  constructor(doc, letterhead) {
    this.doc = doc;
    this.letterhead = letterhead;
    this.y = CONTENT_TOP;
    /** Evita redesenhar timbrado na mesma página (tapava tabelas anteriores) */
    this.letterheadPages = new Set();
  }

  currentPage() {
    return this.doc.internal.getCurrentPageInfo().pageNumber;
  }

  /** Timbrado só 1× por página — fundo, nunca por cima do conteúdo já desenhado */
  ensureLetterhead(pageNumber) {
    if (this.letterheadPages.has(pageNumber)) return;
    this.doc.setPage(pageNumber);
    drawLetterheadPage(this.doc, this.letterhead);
    this.letterheadPages.add(pageNumber);
  }

  newPage() {
    addLetterheadPage(this.doc, this.letterhead);
    this.letterheadPages.add(this.currentPage());
    this.y = CONTENT_TOP;
  }

  ensureY(neededMm) {
    if (this.y + neededMm > getPageBottom(this.doc)) {
      this.newPage();
    }
  }

  drawDocumentHeader(tituloExport, geradoEm, resumoFiltros) {
    this.ensureLetterhead(1);
    this.y = CONTENT_TOP;
    this.y = drawReportTitle(this.doc, 'Relatório de Cotações', this.y);
    this.y = drawMetaLine(this.doc, `Exportação: ${tituloExport}`, this.y);
    this.y = drawMetaLine(this.doc, `Gerado em: ${geradoEm}`, this.y);
    if (resumoFiltros && resumoFiltros !== 'Todos os registos') {
      this.y = drawMetaLine(this.doc, `Filtros: ${resumoFiltros}`, this.y);
    }
    this.y += 2;
  }

  section(title) {
    this.ensureY(14);
    this.y = drawSectionTitle(this.doc, title, this.y);
  }

  table(opts) {
    this.ensureY(12);

    autoTable(this.doc, {
      startY: this.y,
      margin: { left: MARGIN, right: MARGIN, top: CONTENT_TOP, bottom: CONTENT_BOTTOM },
      tableWidth: getContentWidth(this.doc),
      theme: 'grid',
      styles: PDF_TABLE_BODY,
      headStyles: PDF_TABLE_HEAD,
      alternateRowStyles: PDF_TABLE_ALT,
      willDrawPage: (data) => {
        this.ensureLetterhead(data.pageNumber);
      },
      ...opts,
    });

    this.y = this.doc.lastAutoTable.finalY + TABLE_GAP;
    return this.y;
  }

  charts(pieStatus, pieBalcao) {
    this.ensureY(52);
    this.section('Análise Gráfica');
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const half = getContentWidth(this.doc) / 2;
    this.doc.setFontSize(8);
    this.doc.setTextColor(...CINZA);
    if (pieStatus) {
      this.doc.text('Por Status', MARGIN + half / 2, this.y, { align: 'center' });
      this.doc.addImage(pieStatus, 'PNG', MARGIN + half / 2 - 20, this.y + 2, 40, 40);
    }
    if (pieBalcao) {
      this.doc.text('Por Balcão', MARGIN + half + half / 2, this.y, { align: 'center' });
      this.doc.addImage(pieBalcao, 'PNG', MARGIN + half + half / 2 - 20, this.y + 2, 40, 40);
    }
    this.y += 48;
  }
}

async function buildRelatorioDoc(cotacoes, filtros, meta = {}) {
  const stats = calcularEstatisticas(cotacoes);
  const porAgente = agruparPorAgente(cotacoes);
  const vStatus = valorPorStatus(cotacoes);
  const vBalcao = valorPorBalcao(cotacoes);
  const tituloExport = getTituloRelatorio(filtros);
  const resumoFiltros = getResumoFiltros(filtros, meta.agentes || [], meta.balcoes || []);
  const geradoEm = new Date().toLocaleString('pt-MZ');
  const letterhead = await loadLetterheadDataUrl();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = new RelatorioPdfWriter(doc, letterhead);

  w.drawDocumentHeader(tituloExport, geradoEm, resumoFiltros);

  /* 1. Informações do relatório */
  w.section('Informações do Relatório');
  w.table({
    head: [['Campo', 'Valor']],
    body: [
      ['Tipo de documento', 'Relatório de Cotações'],
      ['Período / Exportação', tituloExport],
      ['Filtros aplicados', resumoFiltros || 'Todos os registos'],
      ['Data de geração', geradoEm],
      ['Total de registos', String(stats.total)],
    ],
  });

  /* 2. Indicadores gerais */
  w.section('Indicadores Gerais');
  w.table({
    head: [['Indicador', 'Valor']],
    body: [
      ['Total de Cotações', String(stats.total)],
      ['Cotações Activas', String(stats.ativas)],
      ['Cotações Pendentes', String(stats.pendentes)],
      ['Cotações Finalizadas', String(stats.finalizadas)],
      ['Cotações Expiradas', String(cotacoes.filter((c) => c.status === 'expirada').length)],
      ['Cotações Canceladas', String(cotacoes.filter((c) => c.status === 'cancelada').length)],
    ],
  });

  /* 3. Resumo financeiro */
  w.section('Resumo Financeiro');
  w.table({
    head: [['Indicador', 'Valor (MT)']],
    body: [
      ['Valor Total', fmtMoeda(stats.totalPremio)],
      ['Média por Cotação', fmtMoeda(stats.mediaPremio)],
      ['Maior Cotação', cotacoes.length ? fmtMoeda(Math.max(...cotacoes.map((c) => parseFloat(c.total_premio || 0)))) : '0,00'],
      ['Menor Cotação', cotacoes.length ? fmtMoeda(Math.min(...cotacoes.map((c) => parseFloat(c.total_premio || 0)))) : '0,00'],
    ],
  });

  /* 4. Status — descrição */
  w.section('Status das Cotações');
  w.table({
    head: [['Status', 'Descrição']],
    body: stats.porStatus.length
      ? stats.porStatus.map((s) => [s.label, STATUS_DESC[s.key] || `Cotações com status «${s.label}»`])
      : [['—', 'Sem dados']],
  });

  /* 5. Resumo por status (qtd + % + valor) */
  w.section('Resumo por Status');
  w.table({
    head: [['Status', 'Quantidade', 'Percentagem', 'Valor (MT)']],
    body: stats.porStatus.length
      ? stats.porStatus.map((s) => {
          const pct = stats.total ? ((s.value / stats.total) * 100).toFixed(1) : '0.0';
          return [s.label, String(s.value), `${pct}%`, fmtMoeda(vStatus[s.key] || 0)];
        })
      : [['—', '0', '0%', '0,00']],
  });

  /* 6. Resumo por balcão */
  w.section('Resumo por Balcão');
  w.table({
    head: [['Balcão', 'Quantidade', 'Percentagem', 'Valor (MT)']],
    body: stats.porBalcao.length
      ? stats.porBalcao.map((b) => {
          const pct = stats.total ? ((b.value / stats.total) * 100).toFixed(1) : '0.0';
          return [b.label, String(b.value), `${pct}%`, fmtMoeda(vBalcao[b.label] || 0)];
        })
      : [['—', '0', '0%', '0,00']],
  });

  /* 7. Resumo por agente */
  w.section('Resumo por Agente');
  w.table({
    head: [['Agente', 'Balcão', 'Cotações', 'Valor Total (MT)']],
    body: porAgente.length
      ? porAgente.map((a) => [a.label, a.balcao, String(a.count), fmtMoeda(a.valor)])
      : [['—', '—', '0', '0,00']],
  });

  /* 8. Lista detalhada — flui página a página até encher */
  w.section('Lista Detalhada de Cotações');
  const detalheBody = cotacoes.length
    ? cotacoes.map((c) => [
        c.numero_cotacao || String(c.id),
        `${c.primeiro_nome || ''} ${c.sobrenome || ''}`.trim() || '—',
        c.cliente_email || '—',
        (c.status || '—').toUpperCase(),
        c.agente_nome || '—',
        c.agente_balcao || '—',
        fmtData(c.data_criacao || c.created_at),
        fmtMoeda(c.total_premio),
      ])
    : [['—', '—', '—', '—', '—', '—', '—', '—']];

  w.table({
    head: [[
      'Nº Cotação', 'Cliente', 'Email', 'Status',
      'Agente', 'Balcão', 'Data', 'Valor (MT)',
    ]],
    body: detalheBody,
    foot: cotacoes.length
      ? [[
          { content: 'TOTAL GERAL', colSpan: 7, styles: { fillColor: VERDE, textColor: 255, fontStyle: 'bold' } },
          { content: fmtMoeda(stats.totalPremio), styles: { fillColor: VERDE, textColor: 255, fontStyle: 'bold', halign: 'right' } },
        ]]
      : undefined,
    styles: { ...PDF_TABLE_BODY, fontSize: 7.5, overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 24 }, 7: { halign: 'right' } },
  });

  /* 9. Gráficos — só no final, nova página se necessário */
  const pieSt = pieChartDataUrl(stats.porStatus);
  const pieBal = pieChartDataUrl(stats.porBalcao.slice(0, 8));
  if (pieSt || pieBal) {
    w.charts(pieSt, pieBal);
    w.table({
      head: [['Balcão', 'Cotações', '% do Total', 'Valor (MT)']],
      body: stats.porBalcao.slice(0, 15).map((b) => {
        const pct = stats.total ? ((b.value / stats.total) * 100).toFixed(1) : '0.0';
        return [b.label, String(b.value), `${pct}%`, fmtMoeda(vBalcao[b.label] || 0)];
      }),
    });
  }

  return doc;
}

export async function baixarRelatorioPDF(cotacoes, filtros, meta = {}) {
  const doc = await buildRelatorioDoc(cotacoes, filtros, meta);
  doc.save(`relatorio_cotacoes_${Date.now()}.pdf`);
  return { success: true };
}

export async function gerarRelatorioPDFBlob(cotacoes, filtros, meta = {}) {
  const doc = await buildRelatorioDoc(cotacoes, filtros, meta);
  return URL.createObjectURL(doc.output('blob'));
}

export default baixarRelatorioPDF;
