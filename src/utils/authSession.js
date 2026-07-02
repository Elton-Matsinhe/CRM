const SESSION_EXPIRED_KEY = 'sessionExpiredMessage';

const AUTH_KEYS = ['authToken', 'token', 'user', 'usuario'];

let onSessionExpiredCallback = null;

/** Permite ao AuthContext limpar estado React antes do redirect. */
export function registerSessionExpiredHandler(callback) {
  onSessionExpiredCallback = callback;
  return () => {
    if (onSessionExpiredCallback === callback) {
      onSessionExpiredCallback = null;
    }
  };
}

export function isAuthErrorResponse(status, data) {
  if (status === 401) return true;
  if (status !== 403) return false;

  const msg = String(data?.message || '').toLowerCase();
  return (
    msg.includes('token expirado') ||
    msg.includes('token inválido') ||
    msg.includes('token invalido') ||
    msg.includes('não autenticado') ||
    msg.includes('nao autenticado') ||
    msg.includes('token de acesso não fornecido') ||
    msg.includes('token de acesso nao fornecido') ||
    msg.includes('usuário não encontrado ou inativo') ||
    msg.includes('usuario nao encontrado ou inativo')
  );
}

export function clearAuthStorage() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function setSessionExpiredMessage(message) {
  sessionStorage.setItem(
    SESSION_EXPIRED_KEY,
    message || 'A sua sessão expirou. Por favor, efetue login novamente.'
  );
}

export function consumeSessionExpiredMessage() {
  const msg = sessionStorage.getItem(SESSION_EXPIRED_KEY);
  if (msg) sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  return msg;
}

export function handleSessionExpired(message) {
  if (window.location.pathname === '/login') return;

  try {
    onSessionExpiredCallback?.();
  } catch (err) {
    console.warn('Erro ao limpar sessão no contexto:', err);
  }

  clearAuthStorage();
  setSessionExpiredMessage(message);
  window.location.href = '/login';
}
