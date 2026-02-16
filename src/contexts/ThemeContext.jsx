import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Carregar tema do localStorage ou usar 'verde' como padrão
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'verde';
  });

  // Carregar idioma do localStorage ou usar 'pt' como padrão
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'pt';
  });

  // Salvar tema no localStorage e aplicar estilos
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Salvar idioma no localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Configurações de temas
  const themeConfig = {
    verde: {
      name: 'Verde',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #151515 50%, #0f0f0f 100%)',
      primary: '#4ade80',
      primaryLight: '#22c55e',
      primaryDark: '#16a34a',
      text: '#ffffff',
      textSecondary: '#a7f3d0',
      border: 'rgba(74, 222, 128, 0.2)',
      cardBg: 'rgba(74, 222, 128, 0.05)',
      hoverBg: 'rgba(74, 222, 128, 0.1)',
      headerBg: 'linear-gradient(135deg, #10b981, #059669)',
      sidebarBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
      footerBg: 'linear-gradient(135deg, #10b981, #059669)',
    },
    vermelho: {
      name: 'Vermelho',
      background: 'linear-gradient(135deg, #1a0a0a 0%, #2a1515 50%, #1f0f0f 100%)',
      primary: '#ef4444',
      primaryLight: '#f87171',
      primaryDark: '#dc2626',
      text: '#ffffff',
      textSecondary: '#fecaca',
      border: 'rgba(239, 68, 68, 0.2)',
      cardBg: 'rgba(239, 68, 68, 0.05)',
      hoverBg: 'rgba(239, 68, 68, 0.1)',
      headerBg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      sidebarBg: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #ffffff 100%)',
      footerBg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    },
    preto: {
      name: 'Preto',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #151515 50%, #0f0f0f 100%)',
      primary: '#000000',
      primaryLight: '#1a1a1a',
      primaryDark: '#000000',
      text: '#ffffff',
      textSecondary: '#d1d5db',
      border: 'rgba(0, 0, 0, 0.3)',
      cardBg: 'rgba(0, 0, 0, 0.08)',
      hoverBg: 'rgba(0, 0, 0, 0.15)',
      headerBg: 'linear-gradient(135deg, #1a1a1a, #000000)',
      sidebarBg: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #ffffff 100%)',
      footerBg: 'linear-gradient(135deg, #1a1a1a, #000000)',
    }
  };

  const value = {
    theme,
    setTheme,
    language,
    setLanguage,
    themeConfig: themeConfig[theme],
    allThemes: themeConfig,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

