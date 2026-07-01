import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';
import zh from './locales/zh-CN.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';
import ru from './locales/ru.json';

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null;

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
    de: { translation: de },
    it: { translation: it },
    'zh-CN': { translation: zh },
    ja: { translation: ja },
    ar: { translation: ar },
    ru: { translation: ru },
  },
  lng: savedLang || 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
});

export default i18n;
