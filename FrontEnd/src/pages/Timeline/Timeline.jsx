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
          `http://localhost:3000/timeline/items?${params}`
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

  const filtered = useMemo(() => timelineData, [timelineData]);

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

  if (loading) return <div className="timeline-loading">Đang tải...</div>;
  if (error) return <div className="timeline-error">Lỗi: {error}</div>;

  return (
    <main className="timeline-wrapper">
      <header className="timeline-header">
        <h1 className="timeline-main-title">Dòng thời gian lịch sử Đà Nẵng</h1>
        <div className="timeline-search">
          <div className="search-field">
            <label>Từ năm</label>
            <input
              type="number"
              placeholder="1890"
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
            />
          </div>
          <div className="search-field">
            <label>Đến năm</label>
            <input
              type="number"
              placeholder="2025"
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
            />
          </div>
          <button className="btn" onClick={clearFilters}>
            Reset
          </button>
        </div>
        {isInvalidRange() && (
          <div className="timeline-error">Năm không hợp lệ</div>
        )}
      </header>

      <div className="timeline-content-wrapper">
        <aside className="timeline-sidebar">
          <h3 className="sidebar-title">Danh mục</h3>
          <ul className="category-list">
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-item ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "Tất cả" : cat}
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
            {filtered.length === 0 ? (
              <li className="timeline-empty">Không có sự kiện phù hợp.</li>
            ) : (
              filtered.map((item) => (
                <li className="timeline-item" key={item.id}>
                  <Link
                    to={`/timeline/${item.id}`}
                    className="timeline-card-link"
                  >
                    <div className="timeline-card">
                      <div
                        className="timeline-card-image"
                        style={{ backgroundImage: `url(${item.image})` }}
                      >
                        <span className="timeline-badge">{item.category}</span>
                      </div>
                      <div className="timeline-card-body">
                        <time className="timeline-date">
                          {item.date.slice(0, 4)}
                        </time>
                        <h3 className="timeline-title">{item.title}</h3>
                        <p className="timeline-desc">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="timeline-line" style={{ width: `${lineWidth}px` }} />
        </section>
      </div>
    </main>
  );
};

export default Timeline;
