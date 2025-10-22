import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/CompareCard/CompareCard.css';
import { useAppContext } from '../../context/useAppContext';

const CompareCard = ({ item }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50); // percentage
  const [dragging, setDragging] = useState(false);
  const { registerCompare, unregisterCompare, startCompareDrag, stopCompareDrag } = useAppContext();

  useEffect(() => {
    const id = item?.id;
    if (!id) return;

    const handlers = {
      onMove: (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let p = ((clientX - rect.left) / rect.width) * 100;
        if (p < 0) p = 0;
        if (p > 100) p = 100;
        setPos(p);
      },
      onUp: () => {
        setDragging(false);
        stopCompareDrag();
      },
    };

    registerCompare(id, handlers);
    return () => unregisterCompare(id);
  }, [item?.id, registerCompare, unregisterCompare, stopCompareDrag]);

  const startDrag = (e) => {
    e.preventDefault();
    if (item?.id) startCompareDrag(item.id);
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
      if (typeof stopCompareDrag === 'function') stopCompareDrag();
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

  const handleCardClick = (e) => {
    // Don't navigate if user is dragging the slider
    if (!dragging && e.target.closest('.cc-divider') === null) {
      navigate(`/compare/${item.id}`);
    }
  };

  return (
    <div className="cc-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="cc-media" ref={containerRef}>
        <img src={item.oldSrc} alt={`${item.title} xưa`} className="cc-img cc-img-old" />
        <div className="cc-img-wrap-new" style={{ width: `${pos}%` }}>
          <img src={item.newSrc} alt={`${item.title} nay`} className="cc-img cc-img-new" />
        </div>

        <div
          className={`cc-divider ${dragging ? 'cc-dragging' : ''}`}
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
          <div className="cc-handle" />
        </div>
      </div>

      <div className="cc-body">
        <div className="cc-tags">
          <span className="cc-tag cc-old">Xưa</span>
          <span className="cc-tag cc-new">Nay</span>
        </div>
        <h3 className="cc-title">{item.title}</h3>
        <p className="cc-post">Bài viết: {item.post}</p>
        <div className="cc-meta">
          <span className="cc-drag-tip">← Kéo để so sánh →</span>
          <div className="cc-likes">❤ {item.likes}</div>
        </div>
      </div>
    </div>
  );
};

export default CompareCard;
