import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../Styles/CompareCard/CompareSliderTimeline.css';

// Build timeline images array from item.images
function buildTimelineImages(item) {
  if (!item || !Array.isArray(item.images) || item.images.length === 0) return [];
  return item.images
    .map((img) => ({
      src: img.src || img.ImagePath || '',
      year: img.year ?? img.Year ?? null,
      caption: img.caption || img.Caption || '',
    }))
    .filter((x) => x.src)
    .sort((a, b) => (a.year || 0) - (b.year || 0));
}

const CompareSlider = ({ item }) => {
  const { t } = useTranslation();
  // Reverse so newest appears first (left) in the timeline viewer
  const images = useMemo(() => buildTimelineImages(item).reverse(), [item]);
  const [index, setIndex] = useState(0); // Mặc định chọn ảnh đầu tiên (index = 0)
  const [dragging, setDragging] = useState(false);
  const cardsRef = useRef([]);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const startXRef = useRef(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    // Chọn ảnh đầu tiên
    setIndex(0);
    
    // Scroll đến ảnh được chọn
    setTimeout(() => {
      const el = cardsRef.current && cardsRef.current[0];
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
    }, 100);
  }, [images]);

  const go = (i) => {
    const idx = Math.max(0, Math.min(images.length - 1, i));
    setIndex(idx);
    const el = cardsRef.current && cardsRef.current[idx];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(images.length - 1);
  };

  // Drag handlers cho chuột
  const handleMouseDown = (e) => {
    setDragging(true);
    startXRef.current = timelineRef.current.scrollLeft + e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const x = e.clientX;
    const walk = startXRef.current - x;
    timelineRef.current.scrollLeft = walk;
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Drag handlers cho touch
  const handleTouchStart = (e) => {
    setDragging(true);
    startXRef.current = timelineRef.current.scrollLeft + e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    const x = e.touches[0].clientX;
    const walk = startXRef.current - x;
    timelineRef.current.scrollLeft = walk;
  };

  const handleTouchEnd = () => {
    setDragging(false);
  };

  const selected = images[index] || {};

  return (
    <div className="cd-timeline-wrapper" tabIndex={0} ref={containerRef} onKeyDown={onKey}>
      <div className="cd-main-row">
        <div className="cd-viewer">
          {selected.src ? (
            <img src={selected.src} alt={selected.caption || item.title || ''} className="cd-main-img" loading="lazy" />
          ) : (
            <div className="cd-no-image">No image available</div>
          )}
        </div>

        <div className="cd-info-panel">
          <div className="cd-info-card">
            <div className="cd-info-year">{selected.year || 'N/A'}</div>
            <div className="cd-desc">{selected.caption || item.description || 'No description'}</div>
          </div>
        </div>
      </div>

      <div className="cd-timeline">
        <div className="cd-line" aria-hidden="true" />
        <div 
          ref={timelineRef}
          className="cd-cards" 
          role="list"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`cd-card ${i === index ? 'active' : ''}`}
              onClick={() => !dragging && go(i)}
              role="listitem"
              aria-selected={i === index}
            >
              <div className="cd-card-img-wrap">
                <img className="cd-card-img" src={img.src} alt={img.caption || ''} loading="lazy" />
              </div>
              <div className="cd-card-body cd-card-year-only">
                <button
                  type="button"
                  className="cd-card-year-link"
                  onClick={(e) => { e.stopPropagation(); !dragging && go(i); }}
                  aria-label={`Chọn năm ${img.year || ''}`}
                >
                  {img.year || ''}
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;