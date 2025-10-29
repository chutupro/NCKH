// Utility helpers for Google Translate integration
// Exports: setGoogleTranslateLanguage(targetLang), getGoogleTranslateLanguage()

const DEFAULT_SOURCE_LANG = 'vi';

export function setGoogleTranslateLanguage(targetLang) {
  if (!targetLang) return;

  const from = DEFAULT_SOURCE_LANG;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  function setCookie(value, domain) {
    try {
      const secure = location.protocol === 'https:' ? ';SameSite=None; Secure' : '';
      const d = domain ? `;domain=${domain}` : '';
      document.cookie = `googtrans=${value};expires=${expires.toUTCString()};path=/${d}${secure}`;
    } catch (err) {
      void err;
    }
  }

  if (targetLang === from) {
    try { document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`; } catch (err) { void err; }
    try {
      const hostParts = location.hostname.split('.');
      if (hostParts.length > 1) {
        const topDomain = `.${hostParts.slice(-2).join('.')}`;
        document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${topDomain}`;
      }
    } catch (err) { void err; }
    window.location.reload();
    return;
  }

  const cookieValue = `/${from}/${targetLang}`;
  setCookie(cookieValue, '');
  try {
    const hostParts = location.hostname.split('.');
    if (hostParts.length > 1) {
      const topDomain = `.${hostParts.slice(-2).join('.')}`;
      setCookie(cookieValue, topDomain);
    }
  } catch (err) { void err; }

  window.location.reload();
}

export function getGoogleTranslateLanguage() {
  try {
    const m = document.cookie.match(/(?:^|; )googtrans=(?:\/[^/]+\/)?([^;]*)/);
    const lang = m && m[1] ? m[1] : DEFAULT_SOURCE_LANG;
    return lang || DEFAULT_SOURCE_LANG;
  } catch (err) {
    void err;
    return DEFAULT_SOURCE_LANG;
  }
}
