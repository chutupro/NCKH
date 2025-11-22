import React, { useEffect } from 'react';

const DEFAULT_SOURCE_LANG = 'vi'; // mặc định app là tiếng Việt
const INCLUDED_LANGUAGES = 'vi,en';

function loadGoogleTranslateScript() {

  return new Promise((resolve) => {
    if (window.google && window.google.translate) {

      window.__GT_INITIALIZED = true;
      resolve();
      return;
    }

    window.googleTranslateElementInit = function googleTranslateElementInit() {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: DEFAULT_SOURCE_LANG,
            includedLanguages: INCLUDED_LANGUAGES,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
        window.__GT_INITIALIZED = true;

        setTimeout(() => resolve(), 250);
      } catch (err) { void err; window.__GT_INITIALIZED = false; resolve(); }
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => {

      setTimeout(() => {
        if (window.__GT_INITIALIZED) return;

        resolve();
      }, 700);
    };
    script.onerror = () => {

      window.__GT_INITIALIZED = false;

      resolve();
    };
    document.body.appendChild(script);
  });
}

export default function GoogleTranslate() {
  useEffect(() => {

    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let cancelled = false;

    loadGoogleTranslateScript().then(() => {
      if (cancelled) return;

      const attempts = 6;
      let i = 0;
      const tryInit = () => {
        try {
          if (window.google && window.google.translate && !window.__GT_INITIALIZED) {
            try {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: DEFAULT_SOURCE_LANG,
                  includedLanguages: INCLUDED_LANGUAGES,
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                'google_translate_element'
              );
              window.__GT_INITIALIZED = true;
            } catch (err) { void err; }
          }
        } catch (e) { void e; }
        i += 1;
        if (!window.__GT_INITIALIZED && i < attempts) {
          setTimeout(tryInit, 700);
          } else {

            setTimeout(() => {
              try { removeGoogleTranslateUi(); } catch (e) { void e; };
            }, 1100);
          }
      };
      tryInit();
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <div id="google_translate_element" />
    </div>
  );
}

function removeGoogleTranslateUi() {
  if (typeof document === 'undefined') return;

  const selectors = [
    '.goog-te-banner-frame',
    '.goog-te-banner-frame.skiptranslate',
    'iframe[src*="translate.google" ]',
    'iframe[src*="translate.goog" ]',
    '.goog-te-balloon-frame',
    '.goog-te-gadget',
    '#goog-gt-tt',
    '.goog-popup',
    '.goog-te-menu-frame'
  ];

  function cleanOnce() {

    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(n => {
          if (n && n.parentNode) n.parentNode.removeChild(n);
        });
    } catch (e) { void e; }
    });

    document.querySelectorAll('iframe').forEach(ifr => {
      try {
        const src = (ifr.getAttribute('src') || '') + ' ' + (ifr.getAttribute('name') || '') + ' ' + (ifr.getAttribute('title') || '');
        const s = src.toLowerCase();
        if (s.includes('translate.google') || s.includes('translate.goog') || s.includes('goog') || s.includes('google')) {
          if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
          return;
        }
      } catch (e) { void e; }
    });

    try {
      document.body.style.top = '';
      document.documentElement.style.marginTop = '';
    } catch (err) { void err; }

    try {
      const bodyRect = document.body.getBoundingClientRect();
      const candidates = Array.from(document.querySelectorAll('body *'));
      for (const el of candidates) {
        if (!el || !el.getBoundingClientRect) continue;
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        if (style && (style.position === 'fixed' || style.position === 'sticky')) {
          if (r.top <= 10 && r.height > 0 && r.width > 0 && r.bottom <= (bodyRect.height / 2)) {
            const text = (el.innerText || '').toLowerCase();
            if (text.includes('google') || text.includes('được dịch') || text.includes('translated') || text.includes('dịch sang')) {
              if (el && el.parentNode) el.parentNode.removeChild(el);
            }
          }
        }
      }
    } catch (e) { void e; }
  }

  cleanOnce();

  const observer = new MutationObserver(() => {
    cleanOnce();
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

  const timeout = setInterval(cleanOnce, 800);

  setTimeout(() => {
    clearInterval(timeout);
    observer.disconnect();
  }, 30000); // run for 30s after mount

  function removeTopIframes() {
    try {
      document.querySelectorAll('iframe').forEach(ifr => {
        try {
          const r = ifr.getBoundingClientRect();
          const style = window.getComputedStyle(ifr);
          const top = Math.round(r.top);

          if ((style.position === 'fixed' || style.position === 'absolute' || style.position === 'sticky') && top <= 4 && r.height > 0 && r.height <= 160) {
            if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
          }
        } catch (e) { void e; }
      });
    } catch (e) { void e; }
  }

  const iframeInterval = setInterval(removeTopIframes, 1200);
  setTimeout(() => clearInterval(iframeInterval), 30000);
}

