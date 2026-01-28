// src/services/api.js
const API_BASE_URL = "http://localhost:5000/api";

// Serviço de usuários (login)
export const usuarioService = {
  login: async (email, password) => {
    try {
      console.log("Tentando login com:", { email, password });
      
      // Simulação de delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificação de credenciais de exemplo
      if ((email === "admin@imperialinsurance-mz.com" || email === "admin") && password === "Senha@123") {
        return {
          success: true,
          data: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzM2ODc1MjAwfQ.Ks6XeD1RtH-Cw5gFzLQZzQmQkLJp5nHwv4B6L2S3T4g",
            usuario: {
              id: 1,
              username: "admin",
              email: "admin@imperialinsurance-mz.com",
              nome: "Administrador",
              role: "admin",
              departamento: "Administração"
            }
          }
        };
      } else if ((email === "tecnico@imperialinsurance-mz.com" || email === "tecnico") && password === "Senha@123") {
        return {
          success: true,
          data: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlY25pY28iLCJpYXQiOjE3MzY4NzUyMDB9.abcdefghijklmnopqrstuvwxyz123456",
            usuario: {
              id: 2,
              username: "tecnico",
              email: "tecnico@imperialinsurance-mz.com",
              nome: "Técnico de TI",
              role: "tecnico",
              departamento: "Tecnologia de Informação"
            }
          }
        };
      } else if (email === "admin" && password === "admin123") {
        return {
          success: true,
          data: {
            token: "mock-jwt-token-admin",
            usuario: {
              id: 1,
              username: "admin",
              email: "admin@imperialinsurance-mz.com",
              nome: "Administrador",
              role: "admin",
              departamento: "Administração"
            }
          }
        };
      } else if (email === "user" && password === "user123") {
        return {
          success: true,
          data: {
            token: "mock-jwt-token-user",
            usuario: {
              id: 2,
              username: "user",
              email: "user@imperialinsurance-mz.com",
              nome: "Usuário Comum",
              role: "user",
              departamento: "Comercial"
            }
          }
        };
      } else {
        return {
          success: false,
          message: "Credenciais inválidas. Use 'admin/Senha@123' ou 'tecnico/Senha@123'"
        };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        message: "Erro de conexão com o servidor"
      };
    }
  },

  logout: async () => {
    // Limpar token do localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    return { success: true };
  },

  validateToken: async (token) => {
    try {
      // Simulação de validação de token
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (token && (token.includes("mock-jwt-token") || token.includes("eyJhbGciOiJ"))) {
        const user = localStorage.getItem("user") || localStorage.getItem("usuario");
        return {
          valid: true,
          user: user ? JSON.parse(user) : null
        };
      }
      return { valid: false };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  // Alias para compatibilidade
  verificarToken: async (token) => {
    return usuarioService.validateToken(token);
  },

  getUserInfo: async () => {
    try {
      const user = localStorage.getItem("user") || localStorage.getItem("usuario");
      if (user) {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      return null;
    }
  }
};

// Serviço para cotações
export const cotacaoService = {
  listar: async () => {
    // Implementar chamada real para API
    return [];
  },
  
  criar: async (cotacaoData) => {
    // Implementar chamada real para API
    return { success: true, id: Date.now() };
  },
  
  editar: async (id, cotacaoData) => {
    // Implementar chamada real para API
    return { success: true };
  },
  
  excluir: async (id) => {
    // Implementar chamada real para API
    return { success: true };
  }
};

// Função para fazer requisições HTTP genéricas
export const apiRequest = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };

  const config = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) })
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || "Erro na requisição");
    }
    
    return responseData;
  } catch (error) {
    console.error(`Erro na requisição ${method} ${endpoint}:`, error);
    throw error;
  }
};

export default {
  usuarioService,
  cotacaoService,
  apiRequest
};