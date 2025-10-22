import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faEye } from '@fortawesome/free-solid-svg-icons';

const CompareSidebar = ({ item }) => {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <aside className="cd-sidebar">
      <div className="cd-info-card">
        <h4>Thông tin</h4>
        <div className="cd-info-item">
          <span className="cd-info-label">Danh mục:</span>
          <span className="cd-info-value">{item.category}</span>
        </div>
        <div className="cd-info-item">
          <span className="cd-info-label">Địa điểm:</span>
          <span className="cd-info-value">{item.location || 'Đà Nẵng'}</span>
        </div>
        <div className="cd-info-item">
          <span className="cd-info-label">Năm xưa:</span>
          <span className="cd-info-value">{item.yearOld || 'Không rõ'}</span>
        </div>
        <div className="cd-info-item">
          <span className="cd-info-label">Năm nay:</span>
          <span className="cd-info-value">{item.yearNew || '2024'}</span>
        </div>
      </div>

      <div className="cd-action-card">
        <button 
          className={`cd-like-btn ${liked ? 'cd-liked' : ''}`}
          onClick={handleLike}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>{liked ? 'Đã thích' : 'Yêu thích'}</span>
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
