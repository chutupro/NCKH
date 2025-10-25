import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const CompareSlider = ({ item }) => {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const { t } = useTranslation();

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);

    const tempMove = (ev) => {
      const rect = containerRef.current && containerRef.current.getBoundingClientRect();
      if (!rect) return;
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      let p = ((clientX - rect.left) / rect.width) * 100;
      if (p < 0) p = 0;
      if (p > 100) p = 100;
      setPos(p);
    };

    const tempUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', tempMove);
      window.removeEventListener('mouseup', tempUp);
      window.removeEventListener('touchmove', tempMove);
      window.removeEventListener('touchend', tempUp);
    };

    window.addEventListener('mousemove', tempMove);
    window.addEventListener('mouseup', tempUp);
    window.addEventListener('touchmove', tempMove);
    window.addEventListener('touchend', tempUp);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
    if (e.key === 'Home') setPos(0);
    if (e.key === 'End') setPos(100);
  };

  return (
    <div className="cd-compare-section">
      <div className="cd-compare-header">
        <h2>{t('compareDetail.compareTitle')}</h2>
        <div className="cd-year-labels">
          <span className="cd-year-old">
            <FontAwesomeIcon icon={faClock} /> {item.yearOld || t('compareCommon.oldShort')}
          </span>
          <span className="cd-year-new">
            <FontAwesomeIcon icon={faClock} /> {item.yearNew || t('compareCommon.newShort')}
          </span>
        </div>
      </div>

      <div className="cd-compare-container" ref={containerRef}>
        <img src={item.oldSrc} alt={`${item.title} ${t('compareCommon.altOld')}`} className="cd-img cd-img-old" />
        <div className="cd-img-wrap-new" style={{ width: `${pos}%` }}>
          <img src={item.newSrc} alt={`${item.title} ${t('compareCommon.altNew')}`} className="cd-img cd-img-new" />
        </div>

        <div
          className={`cd-divider ${dragging ? 'cd-dragging' : ''}`}
          style={{ left: `${pos}%` }}
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onKeyDown={onKey}
        >
          <div className="cd-handle">
            <div className="cd-handle-line"></div>
            <div className="cd-handle-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 19l7-7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="cd-handle-line"></div>
          </div>
        </div>

        <div className="cd-labels">
          <span className="cd-label cd-label-old">{t('compareCommon.oldLabel')}</span>
          <span className="cd-label cd-label-new">{t('compareCommon.newLabel')}</span>
        </div>
      </div>

      <p className="cd-drag-tip">← {t('compareCommon.dragTip')} →</p>
    </div>
  );
};

export default CompareSlider;
