import React, { useEffect } from 'react';
// Các helper nằm ở ./googleTranslateUtils.js; module này tập trung vào tải script và dọn dẹp

// Tích hợp Google Translate đơn giản cho ứng dụng chạy phía client.
// - Mount <GoogleTranslate /> một lần (ví dụ trong layout App hoặc main.jsx)
// - Dùng setGoogleTranslateLanguage('vi'|'en') để chuyển ngôn ngữ bằng mã
//   (hàm này đặt cookie `googtrans` và reload trang để Google Translate áp dụng)
// - Dùng getGoogleTranslateLanguage() để đọc ngôn ngữ đang hoạt động

// Ngôn ngữ mặc định của site (thay thành 'vi' để mặc định tiếng Việt)
const DEFAULT_SOURCE_LANG = 'vi'; // mặc định app là tiếng Việt
const INCLUDED_LANGUAGES = 'vi,en';

function loadGoogleTranslateScript() {
    // Trả về một Promise resolve khi script Google Translate đã tải xong
  return new Promise((resolve) => {
    if (window.google && window.google.translate) {
      // Đã có sẵn
      window.__GT_INITIALIZED = true;
      resolve();
      return;
    }

    // Định nghĩa callback toàn cục mà script yêu cầu
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
        // Cho UI ổn định một chút
        setTimeout(() => resolve(), 250);
      } catch (err) { void err; window.__GT_INITIALIZED = false; resolve(); }
    };

    // use explicit https to avoid mixed-content issues
    // Dùng HTTPS rõ ràng để tránh lỗi mixed-content
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => {
      // onload có thể xảy ra trước khi callback chạy; ta chờ callback resolve
      // nhưng resolve như fallback sau một khoảng ngắn nếu callback không chạy
      setTimeout(() => {
        if (window.__GT_INITIALIZED) return;
        // allow callers to try initialization themselves
        resolve();
      }, 700);
    };
    script.onerror = () => {
      // Lỗi mạng hoặc CSP
      window.__GT_INITIALIZED = false;
      // Vẫn resolve để app không bị treo; caller có thể phát hiện thất bại
      resolve();
    };
    document.body.appendChild(script);
  });
}

// exported helpers live in `googleTranslateUtils.js` to avoid fast-refresh issues

// getGoogleTranslateLanguage moved to `googleTranslateUtils.js`.

export default function GoogleTranslate() {
  useEffect(() => {
    // Chỉ chạy trên trình duyệt
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let cancelled = false;

  // Tải script và chờ init (nếu có thể)
    loadGoogleTranslateScript().then(() => {
      if (cancelled) return;
  // Nếu Google Translate không tự khởi tạo, thử một vài lần để khởi tạo
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
            // Bắt đầu dọn dẹp sau một khoảng chờ ngắn để bản dịch có thể hiển thị
            setTimeout(() => {
              try { removeGoogleTranslateUi(); } catch (e) { void e; };
            }, 1100);
          }
      };
      tryInit();
    });

    return () => { cancelled = true; };
  }, []);

  // Phần tử widget có thể ẩn; chúng ta chỉ cần nó tồn tại để API JS hoạt động.
  return (
    <div style={{ display: 'none' }}>
      <div id="google_translate_element" />
    </div>
  );
}

// Chủ động xoá UI do Google Translate chèn (banner, iframe, widget nổi).
// Dùng MutationObserver để xoá node khi chúng được thêm. Cách này đáng tin cậy hơn
// so với chỉ dùng selector CSS vì Google có thể chèn phần tử động.
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
    // Xoá các node phù hợp
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(n => {
          if (n && n.parentNode) n.parentNode.removeChild(n);
        });
    } catch (e) { void e; }
    });

  // Cũng xoá iframe bằng cách quét tất cả iframe
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

    // Reset bất kỳ offset trên body mà Google có thể đã đặt
    try {
      document.body.style.top = '';
      document.documentElement.style.marginTop = '';
    } catch (err) { void err; }

    // Heuristic mạnh: loại bỏ phần tử fixed-position nằm ở very top
    // có chứa từ khóa gợi ý banner dịch (ví dụ "google", "được dịch", "translated").
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

  // chạy dọn dẹp ban đầu
  cleanOnce();

  // quan sát các node mới được thêm
  const observer = new MutationObserver(() => {
    cleanOnce();
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // cũng chạy dọn dẹp định kỳ trong thời gian ngắn phòng khi observer bỏ lỡ
  const timeout = setInterval(cleanOnce, 800);
  // run longer because some UIs appear a bit later; 30s max
  setTimeout(() => {
    clearInterval(timeout);
    observer.disconnect();
  }, 30000); // run for 30s after mount

  // Bước bổ sung: loại bỏ iframe nằm ở very top của trang
  // (thường là các iframe banner dịch với src trống hoặc opaque)
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

  // Chạy thêm việc loại bỏ iframe định kỳ trong cùng khoảng thời gian
  const iframeInterval = setInterval(removeTopIframes, 1200);
  setTimeout(() => clearInterval(iframeInterval), 30000);
}

// run remover on module load (best-effort) so it also executes after reload
// Do not run cleanup on module load; the component will start cleanup after init.
