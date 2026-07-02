/**
 * Verifica se o utilizador pode apagar uma cotação.
 * Admin e subscritor: qualquer cotação.
 * Agente: apenas cotações próprias.
 */
export function podeApagarCotacao(usuario, cotacao) {
  if (!usuario || !cotacao) return false;

  const role = usuario.role;
  if (role === 'admin' || role === 'subscritor') return true;

  if (role === 'agente') {
    const agenteId = cotacao.agente_id ?? cotacao.agenteId;
    return agenteId != null && Number(agenteId) === Number(usuario.id);
  }

  return false;
}
