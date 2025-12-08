import React, { useEffect, useState } from 'react';
import { Loader2, FileText, Sparkles } from 'lucide-react';

function PageLoader({ onComplete, title = "Carregando...", subtitle = "Preparando informações" }) {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animação de progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Após 2 segundos, mostra conteúdo
    const contentTimeout = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    // Após completar, chama onComplete
    const completeTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(contentTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(21, 21, 21, 0.95) 50%, rgba(15, 15, 15, 0.95) 100%)'
      }}
    >
      {/* Efeitos de background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Ícone animado */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-ping"></div>
          <div 
            className="relative w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(34, 197, 94, 0.1))',
              border: '2px solid rgba(74, 222, 128, 0.3)'
            }}
          >
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Título */}
        <h2 
          className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent"
        >
          {title}
        </h2>
        
        {/* Subtítulo */}
        <p className="text-emerald-200/80 text-sm mb-8">
          {subtitle}
        </p>

        {/* Barra de progresso */}
        <div className="mb-6">
          <div 
            className="h-2 rounded-full overflow-hidden backdrop-blur-sm"
            style={{
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.2)'
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #4ade80, #22c55e, #16a34a)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <p className="text-emerald-400 text-xs mt-2 font-mono">
            {progress}%
          </p>
        </div>

        {/* Conteúdo animado */}
        {showContent && (
          <div className="space-y-4 animate-fadeIn">
            <div 
              className="rounded-xl p-4 backdrop-blur-sm border"
              style={{
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.02))',
                borderColor: 'rgba(74, 222, 128, 0.1)'
              }}
            >
              <div className="flex items-center justify-center space-x-2 text-emerald-300">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Gerando relatório...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default PageLoader;

