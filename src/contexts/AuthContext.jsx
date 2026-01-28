import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { usuarioService } from "../services/api";

export const AuthContext = createContext();

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const verificarAutenticacao = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const usuarioSalvo = localStorage.getItem("user") || localStorage.getItem("usuario");
        
        if (token && usuarioSalvo) {
          try {
            const result = await usuarioService.validateToken(token);
            if (result.valid) {
              setUsuario(JSON.parse(usuarioSalvo));
            } else {
              // Limpar dados inválidos
              localStorage.removeItem("authToken");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("usuario");
              setUsuario(null);
            }
          } catch (tokenError) {
            console.error("Erro ao validar token:", tokenError);
            setUsuario(null);
          }
        } else {
          setUsuario(null);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    };

    verificarAutenticacao();
  }, []);

  const login = async (email, senha) => {
    try {
      setError(null);
      
      const result = await usuarioService.login(email, senha);
      
      if (result.success && result.data) {
        // Salvar no localStorage
        localStorage.setItem("authToken", result.data.token);
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.usuario));
        localStorage.setItem("usuario", JSON.stringify(result.data.usuario));
        
        // Atualizar estado
        setUsuario(result.data.usuario);
        return { 
          success: true, 
          data: result.data 
        };
      } else {
        const errorMsg = result.message || "Credenciais inválidas";
        setError(errorMsg);
        return { 
          success: false, 
          error: errorMsg 
        };
      }
    } catch (error) {
      const errorMsg = error.message || "Erro de conexão com o servidor";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = useCallback(async () => {
    try {
      await usuarioService.logout();
      localStorage.clear(); // Limpar tudo
      setUsuario(null);
      setError(null);
      return { success: true };
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const atualizarUsuario = useCallback(
    (dados) => {
      try {
        if (!usuario) {
          return { success: false, error: "Usuário não autenticado" };
        }

        const usuarioAtualizado = { ...usuario, ...dados };
        
        localStorage.setItem("user", JSON.stringify(usuarioAtualizado));
        localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
        setUsuario(usuarioAtualizado);

        return {
          success: true,
          data: usuarioAtualizado,
        };
      } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return {
          success: false,
          error: "Erro ao atualizar usuário",
        };
      }
    },
    [usuario]
  );

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        error,
        login,
        logout,
        atualizarUsuario,
        isAuthenticated: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};