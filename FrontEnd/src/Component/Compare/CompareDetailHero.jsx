import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faMapMarkerAlt, faCalendar } from '@fortawesome/free-solid-svg-icons';

const CompareDetailHero = ({ item }) => {
  return (
    <div className="cd-hero">
      <div className="cd-hero-content">
        <span className="cd-category-badge">{item.category}</span>
        <h1 className="cd-title">{item.title}</h1>
        <div className="cd-meta-info">
          <div className="cd-meta-item">
            <FontAwesomeIcon icon={faCalendar} />
            <span>{item.date || 'Không rõ'}</span>
          </div>
          <div className="cd-meta-item">
            <FontAwesomeIcon icon={faEye} />
            <span>{item.views || 0} lượt xem</span>
          </div>
          <div className="cd-meta-item">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{item.location || 'Đà Nẵng'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareDetailHero;
