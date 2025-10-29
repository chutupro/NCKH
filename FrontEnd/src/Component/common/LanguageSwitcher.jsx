import React from 'react';
import '../../Styles/Home/LanguageSwitcher.css';
import GoogleTranslate from './GoogleTranslate';
import { setGoogleTranslateLanguage, getGoogleTranslateLanguage } from './googleTranslateUtils';

const LanguageSwitcher = () => {
  // getGoogleTranslateLanguage reads the `googtrans` cookie (or falls back to default)
  // default site language is Vietnamese ('vi')
  const current = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : 'vi';

  const changeLanguage = (lng) => {
    // persist choice and trigger reload via helper
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
