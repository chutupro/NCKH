import React from 'react';
import { useTranslation } from 'react-i18next';
import { getGoogleTranslateLanguage } from '../../Component/common/googleTranslateUtils';
import './LanguageDemo.css';

/**
 * Component demo chức năng đa ngôn ngữ
 * Trang này để test và minh họa cách sử dụng i18n
 */
const LanguageDemo = () => {
  const { t, i18n } = useTranslation();
  const currentLang = typeof window !== 'undefined' ? getGoogleTranslateLanguage() : i18n.language;

  return (
    <div className="language-demo">
      <div className="demo-container">
        <h1 className="demo-title">🌍 {t('demo.title')}</h1>
        <p className="demo-subtitle">{t('demo.subtitle')}</p>
        
        <div className="demo-section">
          <h2>📋 {t('demo.currentLanguage')}</h2>
          <div className="language-info">
            <strong>{currentLang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</strong>
            <p>{t('demo.languageCode')}: <code>{currentLang}</code></p>
          </div>
        </div>

        <div className="demo-section">
          <h2>🎯 {t('demo.examples')}</h2>
          <div className="examples-grid">
            <div className="example-card">
              <h3>{t('nav.home')}</h3>
              <code>t('nav.home')</code>
            </div>
            <div className="example-card">
              <h3>{t('nav.community')}</h3>
              <code>t('nav.community')</code>
            </div>
            <div className="example-card">
              <h3>{t('nav.collection')}</h3>
              <code>t('nav.collection')</code>
            </div>
            <div className="example-card">
              <h3>{t('common.loading')}</h3>
              <code>t('common.loading')</code>
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h2>✨ {t('demo.features')}</h2>
          <ul className="features-list">
            <li>✅ {t('demo.feature1')}</li>
            <li>✅ {t('demo.feature2')}</li>
            <li>✅ {t('demo.feature3')}</li>
            <li>✅ {t('demo.feature4')}</li>
          </ul>
        </div>

        <div className="demo-section">
          <h2>🔧 {t('demo.howToUse')}</h2>
          <div className="code-example">
            <pre>{`import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('yourKey.title')}</h1>
      <p>{t('yourKey.description')}</p>
    </div>
  );
};`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageDemo;
