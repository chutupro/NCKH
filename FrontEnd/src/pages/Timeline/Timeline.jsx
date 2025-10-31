import "../../Styles/Timeline/Timeline.css";
import { TIMELINE_ITEMS } from "../../util/constant";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { CODE_TO_VN, KNOWN_CODES, labelFor } from '../../util/categoryMap';

const Timeline = () => {
  const { t } = useTranslation();
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: null,
  });
  const [lineWidth, setLineWidth] = useState(0);

  const categoryCodes = ["all", ...KNOWN_CODES];

  const parsed = (v) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  };

  const filtered = useMemo(() => {
    const f = parsed(fromYear);
    const t = parsed(toYear);
    return TIMELINE_ITEMS.filter((it) => {
      // Filter by year
      const y = parsed(it.date);
      if (y !== null) {
        if (f !== null && y < f) return false;
        if (t !== null && y > t) return false;
      }
      
      // Filter by category (selectedCategory is a code)
      if (selectedCategory !== 'all') {
        const vn = CODE_TO_VN[selectedCategory];
        if (vn) {
          if (it.category !== vn) return false;
        } else {
          // 'other' or unknown: exclude known categories
          if (KNOWN_CODES.includes(it.category)) return false;
        }
      }
      
      return true;
    }).sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));
  }, [fromYear, toYear, selectedCategory]);

  const clearFilters = () => {
    setFromYear("");
    setToYear("");
  setSelectedCategory("all");
  };

  const fromVal = fromYear;
  const toVal = toYear;

  const isInvalidRange = () => {
    const f = parsed(fromYear);
    const t = parsed(toYear);
    return f !== null && t !== null && f > t;
  };

  // Measure timeline content width so the center line matches the content
  useLayoutEffect(() => {
    const measure = () => {
      const listEl = listRef.current;
      const containerEl = containerRef.current;
      if (!listEl || !containerEl) return;
      const w = Math.max(listEl.scrollWidth || 0, containerEl.clientWidth || 0);
      setLineWidth(w);
    };
    // Use rAF to ensure layout has settled
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
    // re-measure when the filtered items count changes
  }, [filtered.length]);

  // Pointer-based drag-to-scroll handlers
  const onPointerDown = (e) => {
    const el = containerRef.current;
    if (!el) return;
    // If the pointerdown started on an interactive element (link, button, input, etc.),
    // don't start the timeline drag. This allows <Link> clicks to work normally.
    try {
      const target = e.target;
      if (target && typeof target.closest === 'function') {
        const interactive = target.closest('a, button, input, textarea, select, label');
        if (interactive) return;
      }
    } catch (err) { void err; }

    dragRef.current.isDown = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.scrollLeft = el.scrollLeft;
    dragRef.current.pointerId = e.pointerId;
    try {
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
    } catch {
      /* noop: pointer capture may not be supported */
    }
    el.classList.add("is-dragging");
  };

  const onPointerMove = (e) => {
    const el = containerRef.current;
    if (!el || !dragRef.current.isDown) return;
    const dx = e.clientX - dragRef.current.startX;
    el.scrollLeft = dragRef.current.scrollLeft - dx;
    // Prevent text/image drag while panning
    if (typeof e.preventDefault === "function") e.preventDefault();
  };

  const endDrag = () => {
    const el = containerRef.current;
    dragRef.current.isDown = false;
    if (el && dragRef.current.pointerId != null) {
      try {
        el.releasePointerCapture && el.releasePointerCapture(dragRef.current.pointerId);
      } catch {
        /* noop: safe to ignore */
      }
      el.classList.remove("is-dragging");
    }
    dragRef.current.pointerId = null;
  };

  return (
    <div>

      <main className="timeline-wrapper">
        <header className="timeline-header">
          <h1 className="timeline-main-title">{t('timeline.title')}</h1>
          <div className="timeline-search">
            <div className="search-field">
              <label> {t('timeline.fromYear')} </label>
              <input
                type="number"
                placeholder="1890"
                value={fromVal}
                onChange={(e) => setFromYear(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label> {t('timeline.toYear')} </label>
              <input
                type="number"
                placeholder="2025"
                value={toVal}
                onChange={(e) => setToYear(e.target.value)}
              />
            </div>
            <div className="search-actions">
              <button className="btn" onClick={clearFilters} type="button">{t('timeline.reset')}</button>
            </div>
          </div>
          {isInvalidRange() && <div className="timeline-error">{t('timeline.invalidRange')}</div>}
        </header>

        <div className="timeline-content-wrapper">
          <aside className="timeline-sidebar">
            <h3 className="sidebar-title">{t('footer.categories')}</h3>
            <ul className="category-list">
              {categoryCodes.map((code) => (
                <li 
                  key={code}
                  className={`category-item ${selectedCategory === code ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(code)}
                >
                  {labelFor(code, t)}
                </li>
              ))}
            </ul>
          </aside>

          <section
            className="timeline-container"
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
          <ul className="timeline-list" ref={listRef}>
            {filtered.map((item, idx) => (
              <li className="timeline-item" key={item.id || idx}>
                {/* Link to article detail */}
                <Link to={`/timeline/${item.id}`} className="timeline-card-link" style={{textDecoration: 'none'}}>
                  <div className="timeline-card">
                    <div className="timeline-card-image" style={{backgroundImage: `url(${item.image})`}}>
                      {/* category badge inside image */}
                      {item.category && (
                        <span className="timeline-badge">{item.category}</span>
                      )}
                    </div>
                    <div className="timeline-card-body">
                      <time className="timeline-date">{item.date}</time>
                      <h3 className="timeline-title">{item.title}</h3>
                      <p className="timeline-desc">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="timeline-line" style={lineWidth ? { width: `${lineWidth}px` } : undefined} />
        </section>
        </div>
      </main>
    </div>
  );
}

export default Timeline;
