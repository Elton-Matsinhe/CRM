import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const themeConfig = {
  branco: {
    name: 'Branco',
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    accent: '#6366f1',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    headerBg: '#ffffff',
    sidebarActive: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    hoverGlow: 'rgba(37, 99, 235, 0.15)',
    ring: '#3b82f6',
  },
  verde: {
    name: 'Verde',
    primary: '#106a37',
    primaryLight: '#16a34a',
    primaryDark: '#0a4f2e',
    accent: '#22c55e',
    text: '#111827',
    textSecondary: '#374151',
    border: '#d1fae5',
    headerBg: '#ffffff',
    sidebarActive: 'linear-gradient(135deg, #106a37, #0a4f2e)',
    hoverGlow: 'rgba(16, 106, 55, 0.2)',
    ring: '#16a34a',
  },
  preto: {
    name: 'Preto',
    primary: '#1a1a1a',
    primaryLight: '#374151',
    primaryDark: '#000000',
    accent: '#6b7280',
    text: '#111827',
    textSecondary: '#4b5563',
    border: '#e5e5e5',
    headerBg: '#ffffff',
    sidebarActive: 'linear-gradient(135deg, #1a1a1a, #000000)',
    hoverGlow: 'rgba(0, 0, 0, 0.12)',
    ring: '#374151',
  },
};

const applyThemeVariables = (theme) => {
  const config = themeConfig[theme] || themeConfig.verde;
  const root = document.documentElement;

  root.setAttribute('data-theme', theme);
  root.style.setProperty('--theme-primary', config.primary);
  root.style.setProperty('--theme-primary-light', config.primaryLight);
  root.style.setProperty('--theme-primary-dark', config.primaryDark);
  root.style.setProperty('--theme-accent', config.accent);
  root.style.setProperty('--theme-text', config.text);
  root.style.setProperty('--theme-text-secondary', config.textSecondary);
  root.style.setProperty('--theme-border', config.border);
  root.style.setProperty('--theme-header-bg', config.headerBg);
  root.style.setProperty('--theme-sidebar-active', config.sidebarActive);
  root.style.setProperty('--theme-hover-glow', config.hoverGlow);
  root.style.setProperty('--theme-ring', config.ring);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    const initial = saved || 'verde';
    applyThemeVariables(initial);
    return initial;
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyThemeVariables(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }, [language]);

  const value = {
    theme,
    setTheme,
    language,
    setLanguage,
    themeConfig: themeConfig[theme] || themeConfig.verde,
    allThemes: themeConfig,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
