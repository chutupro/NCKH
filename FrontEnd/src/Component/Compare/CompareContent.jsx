import React from 'react';
import { useTranslation } from 'react-i18next';

const CompareContent = ({ item }) => {
  const { t } = useTranslation();
  return (
    <div className="cd-main-content">
      <section className="cd-section">
        <h3>{t('compareDetail.description')}</h3>
        <p>{item.description || t('compareDetail.noDescription')}</p>
      </section>

      {item.historicalNote && (
        <section className="cd-section">
          <h3>{t('compareDetail.history')}</h3>
          <p>{item.historicalNote}</p>
        </section>
      )}

      {item.culturalValue && (
        <section className="cd-section">
          <h3>{t('compareDetail.culturalValue')}</h3>
          <p>{item.culturalValue}</p>
        </section>
      )}
    </div>
  );
};

export default CompareContent;
