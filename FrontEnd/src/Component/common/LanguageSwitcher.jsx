import React from 'react';
import '../../Styles/Home/LanguageSwitcher.css';
import GoogleTranslate from './GoogleTranslate';
import { setGoogleTranslateLanguage, getGoogleTranslateLanguage } from './googleTranslateUtils';

const LanguageSwitcher = () => {
  // getGoogleTranslateLanguage đọc cookie `googtrans` (hoặc mặc định)
  // ngôn ngữ mặc định của site là tiếng Việt ('vi')
  const current = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : 'vi';

  const changeLanguage = (lng) => {
    // Lưu lựa chọn và gọi helper để reload
    localStorage.setItem('language', lng);
    setGoogleTranslateLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${current === 'vi' ? 'active' : ''}`}
        onClick={() => changeLanguage('vi')}
        title="Tiếng Việt"
        aria-label="Tiếng Việt"
      >
        {/* Vietnamese flag emoji */}
        <span className="flag-icon">🇻🇳</span>
      </button>
      <button
        className={`lang-btn ${current === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
        aria-label="English"
      >
        {/* UK flag emoji */}
        <span className="flag-icon">EN</span>
      </button>
      {/* ensure widget script exists; hidden component is fine */}
      <GoogleTranslate />
    </div>
  );
};

export default LanguageSwitcher;
