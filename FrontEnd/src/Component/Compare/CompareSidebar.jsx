import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEye } from '@fortawesome/free-solid-svg-icons';

const CompareSidebar = ({ item }) => {
  const [liked, setLiked] = useState(false);
  const { t } = useTranslation();

  const handleLike = () => {
    setLiked(!liked);
  };

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

      <div className="cd-action-card">
        <button 
          className={`cd-like-btn ${liked ? 'cd-liked' : ''}`}
          onClick={handleLike}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>{liked ? t('compareDetail.liked') : t('compareDetail.like')}</span>
        </button>
        <div className="cd-stats">
          <div className="cd-stat-item">
            <FontAwesomeIcon icon={faHeart} />
            <span>{item.likes + (liked ? 1 : 0)}</span>
          </div>
          <div className="cd-stat-item">
            <FontAwesomeIcon icon={faEye} />
            <span>{item.views || 0}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CompareSidebar;
