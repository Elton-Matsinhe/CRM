import { clearDraftAttachments } from './cotacaoDraftAttachments';

const DRAFT_PREFIX = 'cotacao_draft_v1';

function getDraftKey(userId) {
  return `${DRAFT_PREFIX}_${userId || 'anon'}`;
}

export function saveCotacaoDraft(userId, draft) {
  try {
    if (!draft) return;
    localStorage.setItem(getDraftKey(userId), JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Não foi possível guardar rascunho da cotação:', err);
  }
}

export function loadCotacaoDraft(userId) {
  try {
    const raw = localStorage.getItem(getDraftKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCotacaoDraft(userId) {
  localStorage.removeItem(getDraftKey(userId));
  clearDraftAttachments(userId).catch((err) => {
    console.warn('Não foi possível limpar anexos do rascunho:', err);
  });
}

export function hasCotacaoDraft(userId) {
  return !!localStorage.getItem(getDraftKey(userId));
}
