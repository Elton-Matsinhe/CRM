// src/components/CotacoesLayout.jsx
import React from 'react';

function CotacoesLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-300 text-lg">{subtitle}</p>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default CotacoesLayout;