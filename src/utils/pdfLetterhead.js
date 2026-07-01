import papelTimbradoSrc from '../assets/papel-timbrado.png';

/** Margens estilo documento Imperial (como quitação) — abaixo do logo do timbrado */
export const MARGIN = 20;
export const CONTENT_TOP = 40;
export const CONTENT_BOTTOM = 36;
export const TABLE_GAP = 3;

export const VERDE = [0, 102, 51];
export const PRETO = [17, 24, 39];
export const CINZA = [107, 114, 128];

export const PDF_TABLE_HEAD = {
  fillColor: VERDE,
  textColor: 255,
  fontStyle: 'bold',
  fontSize: 9,
  cellPadding: 3,
  lineWidth: 0.1,
  lineColor: VERDE,
};

export const PDF_TABLE_BODY = {
  fontSize: 8.5,
  cellPadding: 2.5,
  textColor: PRETO,
  lineWidth: 0.1,
  lineColor: [224, 224, 224],
  valign: 'middle',
};

export const PDF_TABLE_ALT = {
  fillColor: [250, 250, 250],
};

function resolveAssetUrl(src) {
  const path = typeof src === 'string' ? src : src?.default || '';
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${path}`;
}

/** Carrega Papel Timbrado.png como data URL para jsPDF.addImage */
export async function loadLetterheadDataUrl() {
  const url = resolveAssetUrl(papelTimbradoSrc);
  if (!url) return null;
  try {
    const blob = await fetch(url).then((r) => r.blob());
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Timbrado não carregado:', e);
    return null;
  }
}

/** Desenha timbrado a cobrir a página A4 inteira (fundo) */
export function drawLetterheadPage(doc, letterheadDataUrl) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  if (letterheadDataUrl) {
    doc.addImage(letterheadDataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'MEDIUM');
  } else {
    doc.setFillColor(236, 247, 240);
    doc.rect(0, 0, pageWidth, 40, 'F');
  }
}

/** Nova página com timbrado */
export function addLetterheadPage(doc, letterheadDataUrl) {
  doc.addPage();
  drawLetterheadPage(doc, letterheadDataUrl);
}

/** Garante espaço vertical; se não couber, nova página com timbrado */
export function ensureSpace(doc, y, neededMm, letterheadDataUrl) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + neededMm > pageHeight - CONTENT_BOTTOM) {
    addLetterheadPage(doc, letterheadDataUrl);
    return CONTENT_TOP;
  }
  return y;
}

/** Título centrado em caixa verde (estilo quitação) */
export function drawReportTitle(doc, title, y) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxW = 90;
  const boxH = 10;
  const boxX = (pageWidth - boxW) / 2;
  doc.setFillColor(...VERDE);
  doc.roundedRect(boxX, y - 4, boxW, boxH, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth / 2, y + 2, { align: 'center' });
  return y + boxH + 3;
}

/** Linha meta cinza centrada */
export function drawMetaLine(doc, text, y) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...CINZA);
  doc.text(text, pageWidth / 2, y, { align: 'center' });
  return y + 3.5;
}

/** Hook willDrawPage para autoTable — timbrado atrás do conteúdo em cada página */
export function letterheadWillDrawPage(letterheadDataUrl) {
  return () => drawLetterheadPage(letterheadDataUrl);
}

export function getContentWidth(doc) {
  return doc.internal.pageSize.getWidth() - MARGIN * 2;
}

export function getPageBottom(doc) {
  return doc.internal.pageSize.getHeight() - CONTENT_BOTTOM;
}

/** Título de secção — barra verde full-width (estilo quitação) */
export function drawSectionTitle(doc, text, y) {
  const w = getContentWidth(doc);
  doc.setFillColor(...VERDE);
  doc.rect(MARGIN, y - 4, w, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(text, MARGIN + 2, y + 0.5);
  return y + 6;
}
