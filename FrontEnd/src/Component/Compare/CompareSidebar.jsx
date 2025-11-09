import React from 'react';
import { useTranslation } from 'react-i18next';

const CompareSidebar = ({ item }) => {
  const { t } = useTranslation();

  return (
    <aside className="cd-sidebar">
      <div className="cd-info-card">
        <h4>{t('compareDetail.info')}</h4>
        <div className="cd-info-item">
          <span className="cd-info-label">{t('compareDetail.category')}:</span>
          <span className="cd-info-value">{item.category}</span>
        </div>
        <div className="cd-info-item">
          <span className="cd-info-label">{t('compareDetail.location')}:</span>
          <span className="cd-info-value">{item.location || t('compareDetail.defaultLocation')}</span>
        </div>
        <div className="cd-info-item">
          <span className="cd-info-label">{t('compareDetail.oldYear')}:</span>
          <span className="cd-info-value">{item.yearOld || t('compareDetail.unknown')}</span>
        </div>
        <div className="cd-info-item">
          <span className="cd-info-label">{t('compareDetail.newYear')}:</span>
          <span className="cd-info-value">{item.yearNew || '2024'}</span>
        </div>
      </div>
    </aside>
  );
};

export default CompareSidebar;
