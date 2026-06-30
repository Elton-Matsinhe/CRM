import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSearchIndex } from '../utils/searchRoutes';
import { useTheme } from '../contexts/ThemeContext';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { themeConfig } = useTheme();
  const { t } = useTranslation();

  const fuse = useMemo(
    () =>
      new Fuse(getSearchIndex(), {
        keys: ['label', 'category', 'keywords', 'path'],
        threshold: 0.4,
        includeScore: true,
      }),
    []
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim()).slice(0, 8).map((r) => r.item);
  }, [query, fuse]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (path) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[highlightedIndex]) {
      e.preventDefault();
      navigateTo(results[highlightedIndex].path);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="relative flex-shrink min-w-0 z-[90]">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <Search
            className="h-4 w-4 transition-colors duration-300"
            style={{ color: query ? themeConfig.primary : '#9ca3af' }}
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('header.searchPlaceholder')}
          className="pl-9 pr-8 py-2 w-36 sm:w-44 lg:w-48 rounded-xl text-sm transition-all duration-200 border focus:outline-none focus:ring-1 bg-white/90"
          style={{
            borderColor: query ? themeConfig.primaryLight : '#e5e7eb',
            color: '#111827',
            '--tw-ring-color': themeConfig.ring,
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {query && (
          <motion.div
            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
            style={{ background: `linear-gradient(90deg, ${themeConfig.primary}, ${themeConfig.accent})` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 mt-2 w-80 lg:w-96 rounded-2xl shadow-2xl border overflow-hidden z-[200] bg-white/95 backdrop-blur-xl"
            style={{ borderColor: themeConfig.border }}
          >
            {results.length === 0 ? (
              <div className="p-6 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Nenhum resultado para &quot;{query}&quot;</p>
              </div>
            ) : (
              <ul className="py-2 max-h-80 overflow-y-auto">
                {results.map((item, index) => {
                  const Icon = item.icon;
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <li key={`${item.path}-${item.id}`}>
                      <button
                        onClick={() => navigateTo(item.path)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200"
                        style={{
                          background: isHighlighted ? themeConfig.hoverGlow : 'transparent',
                        }}
                      >
                        {Icon && (
                          <div
                            className="p-2 rounded-xl flex-shrink-0"
                            style={{
                              background: isHighlighted
                                ? `linear-gradient(135deg, ${themeConfig.primary}, ${themeConfig.primaryDark})`
                                : '#f3f4f6',
                            }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: isHighlighted ? '#fff' : themeConfig.primary }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                          <p className="text-xs text-gray-500 truncate">{item.category}</p>
                        </div>
                        <ArrowRight
                          className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                          style={{
                            color: themeConfig.primary,
                            transform: isHighlighted ? 'translateX(4px)' : 'none',
                          }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div
              className="px-4 py-2 border-t text-xs text-gray-400 flex items-center gap-3"
              style={{ borderColor: themeConfig.border }}
            >
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border text-gray-500">↑↓</kbd>
              <span>navegar</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border text-gray-500">Enter</kbd>
              <span>abrir</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
