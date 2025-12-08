import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Code, 
  Wrench, 
  Zap, 
  CheckCircle, 
  ArrowLeft,
  Building2,
  Rocket,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const departamentos = {
  'subscricao': {
    nome: 'Subscricao',
    descricao: 'Departamento responsável pela subscrição de seguros',
    icon: '🛡️'
  },
  'risco-conformidade': {
    nome: 'Risco e Conformidade',
    descricao: 'Departamento de gestão de riscos e conformidade regulatória',
    icon: '⚠️'
  },
  'controlo-credito': {
    nome: 'Controlo de Credito',
    descricao: 'Departamento de controlo e análise de crédito',
    icon: '💳'
  },
  'juridico': {
    nome: 'Juridico',
    descricao: 'Departamento jurídico e assuntos legais',
    icon: '⚖️'
  },
  'sinistros': {
    nome: 'Sinistros',
    descricao: 'Departamento de gestão e processamento de sinistros',
    icon: '📋'
  },
  'contabilidade': {
    nome: 'Contabilidade',
    descricao: 'Departamento de contabilidade e finanças',
    icon: '💰'
  },
  'comercial': {
    nome: 'Comercial',
    descricao: 'Departamento comercial e vendas',
    icon: '💼'
  }
};

function DepartamentoPlaceholder() {
  const { departamento } = useParams();
  const navigate = useNavigate();
  const { themeConfig, language } = useTheme();

  const deptInfo = departamentos[departamento] || {
    nome: 'Departamento',
    descricao: 'Departamento do sistema',
    icon: '🏢'
  };

  const getText = (pt, en, fr) => {
    switch (language) {
      case 'pt': return pt;
      case 'en': return en;
      case 'fr': return fr;
      default: return pt;
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden transition-all duration-500"
      style={{
        background: themeConfig.background
      }}
    >
      {/* Efeitos de background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-green-500/3 rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Botão voltar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-2 px-4 py-2 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          style={{
            background: themeConfig.hoverBg,
            borderColor: themeConfig.border
          }}
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" style={{ color: themeConfig.primary }} />
          <span className="font-medium" style={{ color: themeConfig.primaryLight }}>{getText("Voltar", "Back", "Retour")}</span>
        </button>

        {/* Card principal */}
        <div 
          className="rounded-3xl p-12 backdrop-blur-xl border shadow-2xl transition-all duration-1000 opacity-100 translate-y-0"
          style={{
            background: themeConfig.cardBg,
            borderColor: themeConfig.border
          }}
        >
          {/* Ícone do departamento */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div 
                className="relative w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-6 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.1))',
                  border: '3px solid rgba(74, 222, 128, 0.3)'
                }}
              >
                {deptInfo.icon}
              </div>
            </div>
            
            <h1 
              className="text-4xl font-black mb-4 bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.primaryLight}, ${themeConfig.primaryDark})`
              }}
            >
              {deptInfo.nome}
            </h1>
            <p className="text-lg" style={{ color: themeConfig.textSecondary }}>
              {deptInfo.descricao}
            </p>
          </div>

          {/* Mensagem principal */}
          <div 
            className="rounded-2xl p-8 mb-8 text-center backdrop-blur-sm border"
            style={{
              background: themeConfig.cardBg,
              borderColor: themeConfig.border
            }}
          >
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Code className="h-16 w-16 animate-pulse" style={{ color: themeConfig.primary }} />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 animate-pulse" style={{ color: themeConfig.primaryLight }} />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4" style={{ color: themeConfig.text }}>
              {getText("Desenvolvimento em Progresso", "Development in Progress", "Développement en Cours")}
            </h2>
            
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: themeConfig.textSecondary }}>
              {getText("O Departamento de", "The", "Le Département")} <strong style={{ color: themeConfig.primary }}>{getText("IT", "IT", "IT")}</strong> {getText("está trabalhando no desenvolvimento desta página.", "department is working on developing this page.", "travaille au développement de cette page.")}
              <br />
              {getText("Em breve terá informações completas e recursos disponíveis.", "Soon you will have complete information and resources available.", "Bientôt vous aurez des informations complètes et des ressources disponibles.")}
            </p>
          </div>

          {/* Cards de funcionalidades futuras */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Wrench, title: 'Recursos Avançados', desc: 'Ferramentas profissionais' },
              { icon: Zap, title: 'Performance', desc: 'Velocidade otimizada' },
              { icon: CheckCircle, title: 'Integração', desc: 'Conectado ao sistema' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl p-6 backdrop-blur-sm border transition-all duration-500 hover:scale-105 hover:shadow-xl opacity-100 translate-y-0"
                  style={{
                    transitionDelay: `${(idx + 1) * 200}ms`,
                    background: themeConfig.cardBg,
                    borderColor: themeConfig.border
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                    style={{
                      background: themeConfig.hoverBg
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: themeConfig.primary }} />
                  </div>
                  <h3 className="font-semibold mb-2 text-center" style={{ color: themeConfig.text }}>{item.title}</h3>
                  <p className="text-sm text-center" style={{ color: themeConfig.textSecondary }}>{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Barra de progresso animada */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-300 text-sm font-medium">Progresso do Desenvolvimento</span>
              <span className="text-emerald-400 text-sm font-bold">Em andamento...</span>
            </div>
            <div 
              className="h-3 rounded-full overflow-hidden backdrop-blur-sm"
              style={{
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.2)'
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{
                  width: '65%',
                  background: 'linear-gradient(90deg, #4ade80, #22c55e, #16a34a)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <p className="text-emerald-400/70 text-xs mt-2 text-center">
              Trabalhando ativamente para entregar o melhor resultado
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default DepartamentoPlaceholder;

