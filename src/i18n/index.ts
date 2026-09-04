import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';

const STORAGE_KEY = 'legacy-texture-converter-language';

function initialLanguage(): 'ja' | 'en' {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'ja' || stored === 'en') return stored;
  } catch {
    // Storage can be unavailable in hardened or private browser contexts.
  }
  return window.navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ja: { translation: ja } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (language) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, language.startsWith('ja') ? 'ja' : 'en');
  } catch {
    // Language switching still works for the current page without storage.
  }
  window.document.documentElement.lang = language.startsWith('ja') ? 'ja' : 'en';
});

window.document.documentElement.lang = i18n.language.startsWith('ja') ? 'ja' : 'en';

export default i18n;
