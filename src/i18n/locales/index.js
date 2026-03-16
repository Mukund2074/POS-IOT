import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.json'
const language = localStorage.getItem('language')

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: language || 'en', 
  fallbackLng: 'en', 
  interpolation: {
    escapeValue: false 
  }
});

export default i18n;
