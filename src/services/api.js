import axios from 'axios';

// 🔁 ALTERAÇÃO: URL do backend em produção
const API_BASE_URL = "https://api.portal-imp.com/api/";

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'   // útil mesmo em produção
  }
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('❌ [API] Erro na resposta:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('❌ [API] Erro na requisição (sem resposta):', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message
      });
    } else {
      console.error('❌ [API] Erro ao configurar requisição:', error.message);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("usuario");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// SERVIÇO DE AUTENTICAÇÃO
// ============================================
export const usuarioService = {
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro de conexão com o servidor"
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("usuario");
    return { success: true };
  },
  validateToken: async (token) => {
    try {
      const response = await api.get('/auth/verify');
      return { valid: true, user: response.data.data.user };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },
  verificarToken: async (token) => usuarioService.validateToken(token),
  getUserInfo: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      return null;
    }
  },
  findAll: async () => {
    try {
      const response = await api.get('/auth/users');
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  }
};

// ============================================
// SERVIÇO DE COTAÇÕES
// ============================================
export const cotacaoService = {
  enviarEmail: async (id) => {
    try {
      console.log('📧 Enviando email para cotação:', id);
      const response = await api.post(`/cotacoes/${id}/enviar-email`);
      console.log('✅ Resposta do servidor:', response.data);
      if (response.data && response.data.success !== undefined) return response.data;
      return {
        success: true,
        message: response.data.message || 'Email enviado com sucesso',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro ao enviar email',
        error: error.response?.data?.error || error.message
      };
    }
  },
  listar: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      const url = `/cotacoes?${params.toString()}`;
      console.log('🌐 [API] Requisição GET:', url);
      const response = await api.get(url);
      console.log('📥 [API] Resposta recebida:', {
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        pagination: response.data.pagination
      });
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error("Erro ao listar cotações:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        message: error.response?.data?.message || "Erro ao buscar cotações"
      };
    }
  },
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/cotacoes/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Erro ao buscar cotação:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao buscar cotação"
      };
    }
  },
  criar: async (cotacaoData) => {
    try {
      const response = await api.post('/cotacoes', cotacaoData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Erro ao criar cotação:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao criar cotação"
      };
    }
  },
  editar: async (id, cotacaoData) => {
    try {
      const response = await api.put(`/cotacoes/${id}`, cotacaoData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Erro ao editar cotação:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao editar cotação"
      };
    }
  },
  excluir: async (id) => {
    try {
      await api.delete(`/cotacoes/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir cotação:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao excluir cotação"
      };
    }
  },
  finalizar: async (id, dados) => {
    try {
      const response = await api.post(`/cotacoes/${id}/finalizar`, dados);
      return { success: true, data: response.data.data, envios: response.data.envios };
    } catch (error) {
      console.error("Erro ao finalizar cotação:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao finalizar cotação"
      };
    }
  }
};

// ============================================
// SERVIÇO DE FOLLOW-UPS (mantido igual)
// ============================================
export const followUpService = {
  listar: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.cotacao_id) params.append('cotacao_id', filters.cotacao_id);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      const response = await api.get(`/followups?${params.toString()}`);
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error("Erro ao listar follow-ups:", error);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        message: error.response?.data?.message || "Erro ao buscar follow-ups"
      };
    }
  },
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/followups/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Erro ao buscar follow-up:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao buscar follow-up"
      };
    }
  },
  criar: async (followUpData) => {
    try {
      const response = await api.post('/followups', followUpData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Erro ao criar follow-up:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao criar follow-up"
      };
    }
  },
  editar: async (id, followUpData) => {
    try {
      const response = await api.put(`/followups/${id}`, followUpData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Erro ao editar follow-up:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao editar follow-up"
      };
    }
  },
  excluir: async (id) => {
    try {
      await api.delete(`/followups/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir follow-up:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao excluir follow-up"
      };
    }
  }
};

// ============================================
// SERVIÇO DE ESTATÍSTICAS (mantido igual)
// ============================================
export const estatisticasService = {
  buscarMetricas: async () => {
    try {
      const result = await cotacaoService.listar({ limit: 10000 });
      if (result.success && result.data) {
        const cotacoes = result.data;
        const totalQuotes = cotacoes.length;
        const pendingApproval = cotacoes.filter(c => c.status === 'pendente' || c.status === 'ativa').length;
        const policiesIssued = cotacoes.filter(c => c.status === 'aprovada').length;
        const activeAgents = new Set(cotacoes.map(c => c.agente_id).filter(Boolean)).size;
        const conversionRate = totalQuotes > 0 ? ((policiesIssued / totalQuotes) * 100).toFixed(0) + '%' : '0%';
        const revenue = cotacoes.reduce((sum, c) => sum + (parseFloat(c.total_premio) || 0), 0);
        const revenueFormatted = revenue >= 1000000 ? `MT ${(revenue / 1000000).toFixed(1)}M` : `MT ${(revenue / 1000).toFixed(0)}K`;
        return { success: true, data: { totalQuotes, pendingApproval, policiesIssued, activeAgents, conversionRate, revenue: revenueFormatted } };
      }
      return {
        success: false,
        data: { totalQuotes: 0, pendingApproval: 0, policiesIssued: 0, activeAgents: 0, conversionRate: '0%', revenue: 'MT 0' }
      };
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
      return {
        success: false,
        data: { totalQuotes: 0, pendingApproval: 0, policiesIssued: 0, activeAgents: 0, conversionRate: '0%', revenue: 'MT 0' }
      };
    }
  },
  buscarNotificacoes: async () => {
    try {
      const result = await cotacaoService.listar({ limit: 50, status: 'ativa' });
      if (result.success && result.data) {
        const cotacoes = result.data;
        const notifications = [];
        const aprovadas = cotacoes.filter(c => c.status === 'aprovada');
        if (aprovadas.length > 0) {
          notifications.push({ id: 1, text: `Nova cotação aprovada - Aguardando emissão de apólice`, time: "2 min atrás", unread: true, type: "approval", priority: "high" });
        }
        const hoje = new Date();
        const expirando = cotacoes.filter(c => {
          if (!c.data_validade) return false;
          const dataValidade = new Date(c.data_validade);
          const diffDays = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
          return diffDays <= 2 && diffDays > 0;
        });
        if (expirando.length > 0) {
          notifications.push({
            id: 2,
            text: `Cotação #${expirando[0].numero_cotacao} expira em ${Math.ceil((new Date(expirando[0].data_validade) - hoje) / (1000 * 60 * 60 * 24))} dias`,
            time: "15 min atrás",
            unread: true,
            type: "expiry",
            priority: "medium"
          });
        }
        const hojeStr = hoje.toISOString().split('T')[0];
        const novasHoje = cotacoes.filter(c => c.data_criacao && c.data_criacao.startsWith(hojeStr));
        if (novasHoje.length > 0) {
          notifications.push({
            id: 3,
            text: `${novasHoje.length} nova${novasHoje.length > 1 ? 's' : ''} cotação${novasHoje.length > 1 ? 'ções' : ''} criada${novasHoje.length > 1 ? 's' : ''} hoje`,
            time: "1 hora atrás",
            unread: false,
            type: "achievement",
            priority: "low"
          });
        }
        return { success: true, data: notifications };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      return { success: true, data: [] };
    }
  },
  buscarMensagens: async () => {
    try {
      const result = await cotacaoService.listar({ limit: 20 });
      if (result.success && result.data) {
        const cotacoes = result.data;
        const messages = [];
        const apolices = cotacoes.filter(c => c.status === 'aprovada');
        if (apolices.length > 0) {
          messages.push({
            id: 1,
            text: `Subscritor: Nova apólice emitida #${apolices[0].numero_cotacao}`,
            time: "5 min atrás",
            unread: true,
            type: "policy",
            priority: "high"
          });
        }
        return { success: true, data: messages };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return { success: true, data: [] };
    }
  }
};

// ============================================
// FUNÇÃO GENÉRICA E SERVIÇO DE RELATÓRIOS (mantidos)
// ============================================
export const apiRequest = async (endpoint, method = "GET", data = null) => {
  try {
    const config = { method, url: endpoint, ...(data && { data }) };
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error(`Erro na requisição ${method} ${endpoint}:`, error);
    throw error;
  }
};

export const relatorioService = {
  baixarPDF: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.mes) params.append('mes', filtros.mes);
      if (filtros.ano) params.append('ano', filtros.ano);
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.agente_id) params.append('agente_id', filtros.agente_id);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      const response = await api.get(`/relatorios/pdf?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_cotacoes_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      console.error('Erro ao baixar relatório PDF:', error);
      return { success: false, message: error.response?.data?.message || 'Erro ao baixar relatório PDF' };
    }
  },
  baixarExcel: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.mes) params.append('mes', filtros.mes);
      if (filtros.ano) params.append('ano', filtros.ano);
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.agente_id) params.append('agente_id', filtros.agente_id);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      const response = await api.get(`/relatorios/excel?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_cotacoes_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      console.error('Erro ao baixar relatório Excel:', error);
      return { success: false, message: error.response?.data?.message || 'Erro ao baixar relatório Excel' };
    }
  }
};

export default {
  usuarioService,
  cotacaoService,
  followUpService,
  estatisticasService,
  relatorioService,
  apiRequest,
  api
};