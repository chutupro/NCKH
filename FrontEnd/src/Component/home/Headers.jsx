import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import "../../Styles/Home/Header.css";

const Headers = () => {
  const { t } = useTranslation();

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-links">
          <span className="font-handwriting">DynaVault</span>
          <Link to="/" className="nav-link">{t('nav.home')}</Link>
          <Link to="/map" className="nav-link">{t('nav.map')}</Link>
          <Link to="/timeline" className="nav-link">{t('nav.timeline')}</Link>
          <Link to="/community" className="nav-link">{t('nav.community')}</Link>
          <Link to="/ImageLibrary" className="nav-link">{t('nav.collection')}</Link>
        </div>
        <div className="nav-buttons">
          <LanguageSwitcher />
          <Link to="/community" className="nav-buttonDongGop">{t('nav.join')}</Link>
          <Link to="/login" className="nav-buttonThamGia">{t('nav.login')}</Link>
        </div>
      </nav>
    </header>
  );
};

export default Headers;