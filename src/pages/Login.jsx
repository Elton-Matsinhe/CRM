import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLogIn,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAtSign,
  FiKey,
  FiShield,
  FiCheckCircle,
  FiZap,
  FiGlobe,
  FiServer,
  FiBarChart2,
  FiBell,
  FiCpu,
  FiDatabase,
  FiCloud,
  FiUsers,
  FiActivity,
  FiShield as FiSecurity,
  FiGlobe as FiNetwork,
  FiTrendingUp,
  FiSettings,
  FiLayers
} from "react-icons/fi";
import { AuthContext } from "../contexts/AuthContext";
import logo from "../assets/logo.png";

// Uma imagem de fundo (evita carregar 13 imagens pesadas)
import slide1 from "../assets/slide1.jpg";

const Login = () => {
  const { login, isAuthenticated, carregando } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Características do sistema
  const features = [
    { icon: FiCheckCircle, text: "Segurança máxima" },
    { icon: FiZap, text: "Alta performance" },
    { icon: FiGlobe, text: "Acesso global" },
    { icon: FiServer, text: "99.9% uptime" }
  ];

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!carregando && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, carregando, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    if (!formData.email || !formData.senha) {
      setErro("Por favor, preencha todos os campos");
      setLoading(false);
      return;
    }

    try {
      const resultado = await login(formData.email, formData.senha);

      if (resultado.success) {
        navigate("/", { replace: true });
      } else {
        setErro(resultado.error || "Email ou senha incorretos");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setErro("Erro ao conectar com o servidor. Verifique sua conexão.");
      setLoading(false);
    }
  };

  const preencherTeste = (tipo) => {
    if (tipo === "tecnico") {
      setFormData({
        email: "tecnico@imperialinsurance-mz.com",
        senha: "Senha@123",
      });
    } else if (tipo === "admin") {
      setFormData({
        email: "admin@imperialinsurance-mz.com",
        senha: "Senha@123",
      });
    }
    setErro("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      
      {/* Fundo estático — uma imagem em vez de slideshow com 13 camadas */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${slide1})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/40" />
      </div>

      {/* TELA DE LOGIN PRINCIPAL */}
      <div className="w-full max-w-lg z-30 relative">
        
        {/* Efeito de brilho atrás do card */}
        <div className="absolute -inset-4 bg-gradient-to-r from-gray-100/50 via-gray-50/50 to-gray-100/50 rounded-3xl blur-2xl opacity-70 animate-pulse-slow"></div>
        
        {/* Card principal */}
        <div className="relative bg-white backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Header — logo e subtítulo em coluna, sem sobreposição */}
          <div className="relative bg-white px-6 py-8 sm:py-10 border-b border-gray-100">
            <div className="flex flex-col items-center text-center gap-4">
              <img
                src={logo}
                alt="Imperial Insurance"
                className="h-20 sm:h-24 w-auto max-w-[260px] object-contain drop-shadow-md"
              />
              <p className="text-[#106a37] text-sm sm:text-base font-semibold leading-relaxed max-w-xs sm:max-w-sm">
                Sistema de Gestão do Relacionamento com o Cliente
              </p>
            </div>
          </div>

          {/* Conteúdo do formulário */}
          <div className="p-5 sm:p-8">
            
            {/* Características do sistema */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100/70 px-3 py-2 rounded-xl border border-green-200/50 group hover:border-[#106a37]/40 transition-all duration-300"
                  >
                    <div className="p-1.5 bg-gradient-to-br from-green-100 to-green-200 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="text-[#106a37] text-sm" />
                    </div>
                    <span className="text-xs font-medium text-green-800">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Campo Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-[#000] mb-3 flex items-center gap-2">
                  <FiAtSign className="text-[#000]" />
                  <span>Email Institucional</span>
                </label>

                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 pl-12 bg-white border-2 border-green-200 rounded-xl
                               focus:border-[#106a37] focus:ring-4 focus:ring-green-100
                               transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="admin@imperialinsurance-mz.com"
                    disabled={loading}
                  />
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#106a37]" />

                  {formData.email && (
                    <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-[#106a37]" />
                  )}
                </div>
              </div>

              {/* Campo Senha */}
              <div className="group">
                <label className="block text-sm font-semibold text-[#000] mb-3 flex items-center gap-2">
                  <FiKey className="text-[#000]" />
                  <span>Senha de Acesso</span>
                </label>

                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 pl-12 pr-12 bg-white border-2 border-green-200 rounded-xl
                               focus:border-[#106a37] focus:ring-4 focus:ring-green-100
                               transition-all duration-300 text-gray-800 placeholder-gray-400"
                    placeholder="••••••••"
                    disabled={loading}
                  />

                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#106a37]" />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#106a37]/70 hover:text-[#106a37] transition-colors"
                    disabled={loading}
                  >
                    {mostrarSenha ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {erro && (
                <div className="bg-green-50 border-l-4 border-[#106a37] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <FiShield className="text-[#106a37]" />
                    <div>
                      <span className="font-semibold text-[#106a37] block">{erro}</span>
                      <span className="text-sm text-green-700">
                        Verifique suas credenciais e tente novamente
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão Login com gradiente imperial e efeito 3D */}
              <div className="relative perspective-1000 transform-style-3d hover:scale-105 transition-transform duration-300">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#0a5529] via-[#106a37] to-[#1a7d46]
                             text-white font-bold rounded-xl
                             hover:bg-gradient-to-r hover:from-[#1a7d46] hover:via-[#106a37] hover:to-[#0a5529]
                             transition-all duration-500 shadow-2xl hover:shadow-green-800/50
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                             flex items-center justify-center gap-3 relative overflow-hidden group
                             transform-gpu"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Efeito de brilho animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  {/* Sombra 3D para efeito de profundidade */}
                  <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent opacity-50 rounded-xl"></div>
                  
                  {/* Efeito de borda brilhante */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-300/50 transition-all duration-300"></div>
                  
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent relative z-10"></div>
                      <span className="relative z-10">Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <FiLogIn className="text-xl relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                      <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">
                        Acessar Sistema
                      </span>
                    </>
                  )}
                </button>
                
                {/* Efeito de reflexo 3D (lado de trás) */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-800/40 via-green-700/30 to-green-900/40 
                              rounded-xl blur-sm -z-10 transform translate-z-[-10px] group-hover:translate-z-[-15px] 
                              transition-transform duration-500"></div>
              </div>

              {/* Rodapé */}
              <div className="text-center pt-4">
                <p className="text-gray-500 text-sm">
                  © Desenvolvido pelo Departamento de Tecnologia de Informação
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">Sistema online</span>
                  </div>
                  <span className="text-[#106a37]-300 text-[#106a37]">•</span>
                  <span className="text-xs text-gray-400">v3.5.2</span>
                  <span className="text-[#106a37]-300 text-[#106a37]">•</span>
                  <span className="text-xs text-gray-400">SSL/TLS</span>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes particle-float {
          0% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
            transform: translateY(-15px) translateX(5px) scale(1.2);
          }
          100% {
            transform: translateY(-30px) translateX(10px) scale(1);
            opacity: 0;
          }
        }
        
        /* Novas animações para partículas finas */
        @keyframes particle-fine {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 0.3;
          }
          80% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100px) translateX(20px) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes shimmer-image {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes check-in {
          0% {
            transform: translateY(-50%) scale(0);
            opacity: 0;
          }
          70% {
            transform: translateY(-50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-50%) scale(1);
            opacity: 1;
          }
        }
        
        /* Animações 3D */
        @keyframes cube-rotate {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(360deg);
          }
        }
        
        @keyframes float-3d {
          0%, 100% {
            transform: translateZ(0) rotateX(0);
          }
          50% {
            transform: translateZ(20px) rotateX(5deg);
          }
        }
        
        @keyframes shimmer-3d {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-particle-float {
          animation: particle-float 1.5s ease-out infinite;
        }
        
        .animate-particle-fine {
          animation: particle-fine 10s ease-in-out infinite;
        }
        
        .animate-shimmer-image {
          animation: shimmer-image 8s infinite linear;
          background-size: 200% 100%;
        }
        
        .animate-check-in {
          animation: check-in 0.4s ease-out forwards;
        }
        
        .animate-cube-rotate {
          animation: cube-rotate 3s linear infinite;
        }
        
        .animate-float-3d {
          animation: float-3d 2s ease-in-out infinite;
        }
        
        .animate-shimmer-3d {
          animation: shimmer-3d 2s infinite linear;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
        }
        
        /* Classes 3D */
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .transform-gpu {
          transform: translateZ(0);
        }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset,
            0 0 40px rgba(147, 51, 234, 0.1);
        }
        
        /* Efeito 3D no hover */
        .group:hover .button-3d-effect {
          transform: rotateX(15deg) translateY(-5px);
          box-shadow: 
            0 20px 40px rgba(16, 106, 55, 0.4),
            0 0 60px rgba(16, 106, 55, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        
        /* Transições mais suaves para slides */
        .duration-1500 {
          transition-duration: 1500ms;
        }
      `}</style>
    </div>
  );
};

export default Login;