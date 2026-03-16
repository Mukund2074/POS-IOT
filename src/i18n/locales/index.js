import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.json'
import da from './da/translation.json';
const language = localStorage.getItem('language')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    da: { translation: da }
  },
  lng: language || 'da', 
  fallbackLng: 'en', 
  interpolation: {
    escapeValue: false 
  }
});

export default i18n;
