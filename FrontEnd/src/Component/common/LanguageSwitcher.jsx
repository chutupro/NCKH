import React from 'react';
import '../../Styles/Home/LanguageSwitcher.css';
import GoogleTranslate from './GoogleTranslate';
import { setGoogleTranslateLanguage, getGoogleTranslateLanguage } from './googleTranslateUtils';

const LanguageSwitcher = () => {

  const current = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : 'vi';

  const changeLanguage = (lng) => {

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
        {}
        <span className="flag-icon">🇻🇳</span>
      </button>
      <button
        className={`lang-btn ${current === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
        aria-label="English"
      >
        {}
        <span className="flag-icon">EN</span>
      </button>
      {}
      <GoogleTranslate />
    </div>
  );
};

export default LanguageSwitcher;
