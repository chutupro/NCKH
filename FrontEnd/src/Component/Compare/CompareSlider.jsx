import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../Styles/CompareCard/CompareSliderTimeline.css';

// Build images array (prefer item.images, fallback to old/new)
function buildImages(item) {
  if (!item) return [];
  if (Array.isArray(item.images) && item.images.length) {
    return item.images
      .map((it) => ({
        src: it.src || it.image || it.url || it.path || '',
        year: it.year ?? it.Year ?? null,
        caption: it.caption || it.title || it.note || '',
      }))
      .filter((x) => x.src);
  }
  const out = [];
  if (item.oldSrc) out.push({ src: item.oldSrc, year: item.yearOld ?? item.YearOld ?? null, caption: item.oldCaption || '' });
  if (item.newSrc) out.push({ src: item.newSrc, year: item.yearNew ?? item.YearNew ?? null, caption: item.newCaption || '' });
  return out;
}

const CompareSlider = ({ item }) => {
  const { t } = useTranslation();
  const images = useMemo(() => buildImages(item).sort((a, b) => (a.year || 0) - (b.year || 0)), [item]);
  const [index, setIndex] = useState(0);
  const cardsRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length === 0) return;
    setIndex((i) => Math.min(i, images.length - 1));
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

  const selected = images[index] || {};

  return (
    <div className="cd-timeline-wrapper" tabIndex={0} ref={containerRef} onKeyDown={onKey}>
      <div className="cd-compare-header">
        <h2>{t('compareDetail.compareTitle') || 'So sánh xưa - nay'}</h2>
        <div className="cd-year-labels">
          {/* Selected year shown in info panel; hide debug/label here to avoid duplication */}
        </div>
      </div>

      <div className="cd-main-row">
        <div className="cd-viewer">
          {selected.src ? (
            <img src={selected.src} alt={selected.caption || item.title || ''} className="cd-main-img" loading="lazy" />
          ) : (
            <div className="cd-no-image">{t('compareDetail.noImages') || 'No image'}</div>
          )}
        </div>

        <div className="cd-info-panel">
          <div className="cd-info-card">
            <h3>{item.title}</h3>
            <div className="muted">{t('compareDetail.info') || 'Thông tin'}</div>
            <div className="cd-desc">{selected.caption || item.description || ''}</div>
          </div>
        </div>
      </div>

      <div className="cd-timeline">
        <div className="cd-line" aria-hidden="true" />
        <div className="cd-cards" role="list">
          {images.map((img, i) => (
            <button
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`cd-card ${i === index ? 'active' : ''}`}
              onClick={() => go(i)}
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
                  onClick={(e) => { e.stopPropagation(); go(i); }}
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