import React, { useEffect } from 'react';
// helpers live in ./googleTranslateUtils.js; this module focuses on loading/cleanup

// Simple Google Translate integration for client-side apps.
// - Mount <GoogleTranslate /> once (eg. in App layout or main.jsx)
// - Use setGoogleTranslateLanguage('vi'|'en') to switch languages programmatically
//   (this sets the `googtrans` cookie and reloads the page so Google Translate applies)
// - Use getGoogleTranslateLanguage() to read the currently active language

// Default language of your site (change to 'vi' to make Vietnamese the default)
const DEFAULT_SOURCE_LANG = 'vi'; // app default is Vietnamese
const INCLUDED_LANGUAGES = 'vi,en';

function loadGoogleTranslateScript() {
  // return a promise that resolves when the Google Translate script has loaded
  return new Promise((resolve) => {
    if (window.google && window.google.translate) {
      // already available
      window.__GT_INITIALIZED = true;
      resolve();
      return;
    }

    // define the global callback expected by the script
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
        // allow UI to settle a bit
        setTimeout(() => resolve(), 250);
      } catch (err) { void err; window.__GT_INITIALIZED = false; resolve(); }
    };

    // use explicit https to avoid mixed-content issues
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => {
      // onload may fire before the callback runs; we'll wait for the callback to resolve
      // but resolve as a fallback after a short delay if callback doesn't run.
      setTimeout(() => {
        if (window.__GT_INITIALIZED) return;
        // allow callers to try initialization themselves
        resolve();
      }, 700);
    };
    script.onerror = () => {
      // network or CSP error
      window.__GT_INITIALIZED = false;
      // still resolve so app doesn't hang; caller can detect failure
      resolve();
    };
    document.body.appendChild(script);
  });
}

// exported helpers live in `googleTranslateUtils.js` to avoid fast-refresh issues

// getGoogleTranslateLanguage moved to `googleTranslateUtils.js`.

export default function GoogleTranslate() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let cancelled = false;

    // load the script and wait for init (if possible)
    loadGoogleTranslateScript().then(() => {
      if (cancelled) return;
      // If Google Translate didn't auto-init, try a few times to initialize
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
            // start cleanup after a short grace period to allow translation to render
            setTimeout(() => {
              try { removeGoogleTranslateUi(); } catch (e) { void e; };
            }, 1100);
          }
      };
      tryInit();
    });

    return () => { cancelled = true; };
  }, []);

  // The widget element can be hidden; we only need it present for the JS API to work.
  return (
    <div style={{ display: 'none' }}>
      <div id="google_translate_element" />
    </div>
  );
}

// Remove Google Translate injected UI (banner, iframes, floating widgets) proactively.
// Use a MutationObserver to remove nodes when they are added. This is more reliable
// than CSS selectors alone because Google may insert elements dynamically.
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
    // remove matching nodes
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(n => {
          if (n && n.parentNode) n.parentNode.removeChild(n);
        });
    } catch (e) { void e; }
    });

    // Also remove iframes by scanning all iframes
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

    // Reset any body top offset that Google may have set
    try {
      document.body.style.top = '';
      document.documentElement.style.marginTop = '';
    } catch (err) { void err; }

    // Aggressive heuristic: remove any fixed-position element at the very top
    // that contains text hinting it's the translate banner (e.g. "google", "được dịch", "translated").
    try {
      const bodyRect = document.body.getBoundingClientRect();
      const candidates = Array.from(document.querySelectorAll('body *'));
      for (const el of candidates) {
        if (!el || !el.getBoundingClientRect) continue;
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        // only consider visible, fixed/sticky elements near the top
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

  // initial clean
  cleanOnce();

  // observe for new nodes
  const observer = new MutationObserver(() => {
    cleanOnce();
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // also run periodic cleanup for a short time in case observer misses something
  const timeout = setInterval(cleanOnce, 800);
  // run longer because some UIs appear a bit later; 30s max
  setTimeout(() => {
    clearInterval(timeout);
    observer.disconnect();
  }, 30000); // run for 30s after mount

  // Extra pass: remove iframes that are visually at the very top of the page
  // (these are often the translate banner iframes with opaque or empty src)
  function removeTopIframes() {
    try {
      document.querySelectorAll('iframe').forEach(ifr => {
        try {
          const r = ifr.getBoundingClientRect();
          const style = window.getComputedStyle(ifr);
          const top = Math.round(r.top);
          // if it's fixed/sticky/absolute and sitting at the very top and not large, remove it
          if ((style.position === 'fixed' || style.position === 'absolute' || style.position === 'sticky') && top <= 4 && r.height > 0 && r.height <= 160) {
            if (ifr && ifr.parentNode) ifr.parentNode.removeChild(ifr);
          }
        } catch (e) { void e; }
      });
    } catch (e) { void e; }
  }

  // Run extra iframe removal periodically for the same duration
  const iframeInterval = setInterval(removeTopIframes, 1200);
  setTimeout(() => clearInterval(iframeInterval), 30000);
}

// run remover on module load (best-effort) so it also executes after reload
// Do not run cleanup on module load; the component will start cleanup after init.
