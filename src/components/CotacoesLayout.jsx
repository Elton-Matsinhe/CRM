// src/components/CotacoesLayout.jsx
import React from 'react';

function CotacoesLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-700 text-lg">{subtitle}</p>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 bg-white rounded-lg pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default CotacoesLayout;