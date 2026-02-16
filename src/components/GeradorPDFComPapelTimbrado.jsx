// src/components/GeradorPDFComPapelTimbrado.jsx
// Utiliza o template único GeradorPDFPersonalizado em todo o sistema.
import React, { useState } from 'react';
import { gerarPDFPersonalizado } from './GeradorPDFPersonalizado';

function GeradorPDFComPapelTimbrado({ cotacao }) {
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const handleGerarPDF = async (acao = 'download') => {
    if (!cotacao) return;
    setGerandoPDF(true);
    try {
      await gerarPDFPersonalizado(cotacao, acao);
    } finally {
      setTimeout(() => setGerandoPDF(false), 1500);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => handleGerarPDF('download')}
        disabled={gerandoPDF}
        style={{
          backgroundColor: '#166534',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {gerandoPDF ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Gerando PDF...
          </>
        ) : (
          '📄 Gerar Cotação PDF'
        )}
      </button>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GeradorPDFComPapelTimbrado;
