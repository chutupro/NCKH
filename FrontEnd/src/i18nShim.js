import vi from './locales/vi.json';
import en from './locales/en.json';

// Simple shim to replace react-i18next for this project.
// - Provides useTranslation() hook that returns { t, i18n }
// - t(key) returns the string from the selected locale (supports nested keys with dot notation)
// - language selection prefers Google Translate cookie `googtrans`, then localStorage 'language', then default 'vi'

function readGoogleTranslateCookie() {
  if (typeof document === 'undefined') return null;
  const re = new RegExp('(?:^|; )googtrans=(?:/[^/]+/)?([^;]*)');
  const m = document.cookie.match(re);
  return m && m[1] ? m[1] : null;
}

function currentLang() {
  if (typeof window === 'undefined') return 'vi';
  const g = readGoogleTranslateCookie();
  if (g) return g;
  const ls = localStorage.getItem('language');
  if (ls) return ls;
  return 'vi';
}

const resources = { vi, en };

function get(obj, key) {
  if (!obj || !key) return undefined;
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur[p] === undefined) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function t(key, fallback) {
  const lang = currentLang();
  const resObj = resources[lang] || resources['vi'];
  const val = get(resObj, key.replace(/^\./, ''));
  if (val !== undefined) return val;
  // fallback: try english
  const valEn = get(resources['en'], key.replace(/^\./, ''));
  if (valEn !== undefined) return valEn;
  return fallback || key;
}

export const i18n = {
  language: typeof window !== 'undefined' ? currentLang() : 'vi',
  changeLanguage: (lng) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lng);
      i18n.language = lng;
    }
  }
};

export function useTranslation() {
  return { t, i18n };
}

export default { useTranslation, t, i18n };
