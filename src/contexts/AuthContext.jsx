import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { usuarioService } from "../services/api";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const lerUsuarioLocal = () => {
  const usuarioSalvo = localStorage.getItem("user") || localStorage.getItem("usuario");
  if (!usuarioSalvo) return null;
  try {
    return JSON.parse(usuarioSalvo);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => lerUsuarioLocal());
  const [carregando, setCarregando] = useState(() => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    return !!(token && !lerUsuarioLocal());
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    const usuarioLocal = lerUsuarioLocal();

    if (!token) {
      setUsuario(null);
      setCarregando(false);
      return;
    }

    if (usuarioLocal) {
      setUsuario(usuarioLocal);
      setCarregando(false);
    }

    usuarioService.validateToken(token).then((result) => {
      if (result.valid && result.user) {
        setUsuario(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("usuario", JSON.stringify(result.user));
      } else if (!usuarioLocal) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("usuario");
        setUsuario(null);
      }
    }).catch(() => {
      if (!usuarioLocal) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        setUsuario(null);
      }
    }).finally(() => {
      setCarregando(false);
    });
  }, []);

  const login = async (email, senha) => {
    try {
      setError(null);
      
      const result = await usuarioService.login(email, senha);
      
      if (result.success && result.data) {
        localStorage.setItem("authToken", result.data.token);
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.usuario));
        localStorage.setItem("usuario", JSON.stringify(result.data.usuario));
        
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
      const errorMsg = error.response?.data?.message || error.message || "Erro de conexão com o servidor";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = useCallback(async () => {
    try {
      await usuarioService.logout();
      localStorage.clear();
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
