import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import nlTranslations from './locales/nl.json';

// Detecteer browser taal
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const shortLang = browserLang.split('-')[0];
  
  // Ondersteunde talen
  const supportedLanguages = ['en', 'nl'];
  
  return supportedLanguages.includes(shortLang) ? shortLang : 'en';
};

// Haal opgeslagen taal op uit localStorage
const getStoredLanguage = (): string => {
  return localStorage.getItem('language') || '';
};

// Bepaal initiële taal
const getInitialLanguage = (): string => {
  const storedLang = getStoredLanguage();
  if (storedLang) return storedLang;
  
  return getBrowserLanguage();
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      nl: {
        translation: nlTranslations,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Sla taal op in localStorage bij wijziging
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;

