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
    },
    cinza: {
      name: 'Cinza',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1f1f1f 100%)',
      primary: '#6b7280',
      primaryLight: '#9ca3af',
      primaryDark: '#4b5563',
      text: '#ffffff',
      textSecondary: '#d1d5db',
      border: 'rgba(107, 114, 128, 0.3)',
      cardBg: 'rgba(107, 114, 128, 0.08)',
      hoverBg: 'rgba(107, 114, 128, 0.15)',
    },
    branco: {
      name: 'Branco',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      primary: '#059669',
      primaryLight: '#10b981',
      primaryDark: '#047857',
      text: '#0f172a',
      textSecondary: '#334155',
      border: 'rgba(5, 150, 105, 0.2)',
      cardBg: 'rgba(5, 150, 105, 0.05)',
      hoverBg: 'rgba(5, 150, 105, 0.1)',
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

