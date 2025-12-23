// src/pages/Timeline/Timeline.jsx
import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import "../../Styles/Timeline/Timeline.css";

const Timeline = () => {
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timelineData, setTimelineData] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const dragRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: null,
  });
  const [lineWidth, setLineWidth] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((r) => r.json())
      .then((data) => setCategories(["all", ...data.map((c) => c.Name)]))
      .catch(() => setCategories(["all"]));
  }, []);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (fromYear) params.append("fromYear", fromYear);
        if (toYear) params.append("toYear", toYear);
        if (selectedCategory !== "all")
          params.append("categories", selectedCategory);

        const res = await fetch(
          `http://localhost:3000/timeline?${params}`
        );
        if (!res.ok) throw new Error("Không tải dữ liệu");
        const data = await res.json();
        setTimelineData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [fromYear, toYear, selectedCategory]);

  // Build a list of representative items — one per YEAR — but only for years
  // that have at least one event dated on January 1st (YYYY-01-01).
  const filtered = useMemo(() => {
   

    // Group items by year
    const yearMap = new Map();
    timelineData.forEach((item) => {
      const year = item.collectionYear || (item.date ? String(item.date).split('-')[0] : null);
      if (!year) return;
      if (!yearMap.has(year)) yearMap.set(year, []);
      yearMap.get(year).push(item);
    });

    // Keep only years that have at least one item with date YYYY-01-01
    const reps = [];
    for (const [year, items] of yearMap.entries()) {
      const hasJanFirst = items.some(it => {
        if (!it.date) return false;
        const parts = String(it.date).split('-');
        return parts[1] === '01' && parts[2] === '01';
      });

      if (!hasJanFirst) continue; // skip years without Jan 1st events

      // Prefer the item that has the exact YYYY-01-01 date as representative
      const janItem = items.find(it => it.date && String(it.date).split('-')[1] === '01' && String(it.date).split('-')[2] === '01');
      reps.push(janItem || items[0]);
    }

    // Sort descending by year
    reps.sort((a, b) => {
      const ya = parseInt(a.collectionYear || (a.date ? a.date.split('-')[0] : '0'));
      const yb = parseInt(b.collectionYear || (b.date ? b.date.split('-')[0] : '0'));
      return yb - ya;
    });

    
    return reps;
  }, [timelineData]);

  const clearFilters = () => {
    setFromYear("");
    setToYear("");
    setSelectedCategory("all");
  };

  const isInvalidRange = () =>
    parseInt(fromYear) > parseInt(toYear) && fromYear && toYear;

  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const container = containerRef.current;
      if (list && container)
        setLineWidth(Math.max(list.scrollWidth, container.clientWidth));
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [filtered.length]);

  const onPointerDown = (e) => {
    const el = containerRef.current;
    if (!el || e.target.closest("a,button,input")) return;
    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    el.classList.add("is-dragging");
  };

  const onPointerMove = (e) => {
    const el = containerRef.current;
    if (!el || !dragRef.current.isDown) return;
    el.scrollLeft =
      dragRef.current.scrollLeft - (e.clientX - dragRef.current.startX);
    e.preventDefault();
  };

  const endDrag = () => {
    const el = containerRef.current;
    dragRef.current.isDown = false;
    if (el && dragRef.current.pointerId != null) {
      try {
        el.releasePointerCapture(dragRef.current.pointerId);
      } catch {}
      el.classList.remove("is-dragging");
    }
  };

  if (loading) return <div className="tln-timeline-loading">Đang tải...</div>;
  if (error) return <div className="tln-timeline-error">Lỗi: {error}</div>;

  return (
    <main className="tln-timeline-wrapper">
      <header className="tln-timeline-header">
        <h1 className="tln-timeline-main-title">Dòng thời gian lịch sử Đà Nẵng</h1>
        <div className="tln-timeline-search">
          <div className="tln-search-field">
            <label>Từ năm</label>
            <input
              type="number"
              placeholder="1890"
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
            />
          </div>
          <div className="tln-search-field">
            <label>Đến năm</label>
            <input
              type="number"
              placeholder="2025"
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
            />
          </div>
          <button className="tln-reset-btn" onClick={clearFilters}>
            Reset
          </button>
        </div>
        {isInvalidRange() && (
          <div className="tln-timeline-error">Năm không hợp lệ</div>
        )}
      </header>

      <div className="tln-timeline-content-wrapper">
        <aside className="tln-timeline-sidebar">
          <h3 className="tln-sidebar-title">Danh mục</h3>
          <ul className="tln-category-list">
            {categories.map((cat) => (
              <li
                key={cat}
                className={`tln-category-item ${
                  selectedCategory === cat ? "tln-active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "Tất cả" : cat}
              </li>
            ))}
          </ul>
        </aside>

        <section
          className="tln-timeline-container"
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <ul className="tln-timeline-list" ref={listRef}>
            {filtered.length === 0 ? (
              <li className="tln-timeline-empty">Không có sự kiện phù hợp.</li>
            ) : (
              filtered.map((item) => (
                <li className="tln-timeline-item" key={item.id}>
                  <Link
                    to={`/timeline/${item.id}`}
                    className="tln-timeline-card-link"
                  >
                    <div className="tln-timeline-card">
                      <div
                        className="tln-timeline-card-image"
                        style={{ backgroundImage: `url(${item.image})` }}
                      >
                        
                      </div>
                      <div className="tln-timeline-card-body">
                        <time className="tln-timeline-date">
                          {(() => {
                            const year =
                              item.collectionYear || (item.date ? item.date.split("-")[0] : "");
                            return `Năm ${year}`;
                          })()}
                        </time>
                        
                        {/* Title under the year */}
                        {item.title && (
                          <div className="tln-timeline-event-title">{item.title}</div>
                        )}

                        
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="tln-timeline-line" style={{ width: `${lineWidth}px` }} />
        </section>
      </div>
    </main>
  );
};

export default Timeline;
