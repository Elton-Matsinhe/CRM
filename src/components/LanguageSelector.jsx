import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';
import { useTheme } from '../contexts/ThemeContext';
import FlagIcon from './FlagIcon';

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const { i18n, t } = useTranslation();
  const { setLanguage, themeConfig, language } = useTheme();

  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang) => {
    setLanguage(lang.code);
    i18n.changeLanguage(lang.code);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative flex-shrink-0 z-[90]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all duration-200 bg-white/80 backdrop-blur-sm"
        style={{ borderColor: isOpen ? themeConfig.primary : '#e5e7eb' }}
        title={t('header.language')}
      >
        <Globe className="h-3.5 w-3.5 flex-shrink-0" style={{ color: themeConfig.primary }} />
        <FlagIcon countryCode={activeLang.countryCode} size={16} />
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-56 rounded-xl shadow-xl border overflow-hidden z-[200] bg-white"
            style={{ borderColor: themeConfig.border }}
          >
            <div className="px-3 py-2 border-b text-xs font-semibold uppercase tracking-wide" style={{ color: themeConfig.primary, borderColor: themeConfig.border }}>
              {t('header.language')}
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  style={{ background: language === lang.code ? themeConfig.hoverGlow : undefined }}
                >
                  <FlagIcon countryCode={lang.countryCode} size={20} />
                  <span className="flex-1 text-sm text-gray-800">{lang.name}</span>
                  {language === lang.code && (
                    <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: themeConfig.primary }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
