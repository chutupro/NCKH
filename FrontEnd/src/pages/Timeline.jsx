import "../Styles/Timeline/Timeline.css";
import { TIMELINE_ITEMS } from "../util/constant";
import Headers from "../Component/home/Headers";
import Footer from "../Component/home/Footer";
import React, { useMemo, useState } from "react";

const Timeline = () => {
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");

  const parsed = (v) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  };

  const filtered = useMemo(() => {
    const f = parsed(fromYear);
    const t = parsed(toYear);
    return TIMELINE_ITEMS.filter((it) => {
      const y = parsed(it.date);
      if (y === null) return true;
      if (f !== null && y < f) return false;
      if (t !== null && y > t) return false;
      return true;
    }).sort((a, b) => parseInt(a.date, 10) - parseInt(b.date, 10));
  }, [fromYear, toYear]);

  const clearFilters = () => {
    setFromYear("");
    setToYear("");
  };

  const fromVal = fromYear;
  const toVal = toYear;

  const isInvalidRange = () => {
    const f = parsed(fromYear);
    const t = parsed(toYear);
    return f !== null && t !== null && f > t;
  };

  return (
    <div>
      <Headers />

      <main className="timeline-wrapper">
        <header className="timeline-header">
          <h1 className="timeline-main-title">Dòng thời gian</h1>
          <div className="timeline-search">
            <div className="search-field">
              <label> Từ năm </label>
              <input
                type="number"
                placeholder="1890"
                value={fromVal}
                onChange={(e) => setFromYear(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label> Đến năm </label>
              <input
                type="number"
                placeholder="2025"
                value={toVal}
                onChange={(e) => setToYear(e.target.value)}
              />
            </div>
            <div className="search-actions">
              <button className="btn" onClick={clearFilters} type="button">Reset</button>
            </div>
          </div>
          {isInvalidRange() && <div className="timeline-error">Khoảng năm không hợp lệ (từ {'>'} đến)</div>}
        </header>

        <section className="timeline-container">
          <div className="timeline-line" />
          <ul className="timeline-list">
            {filtered.map((item, idx) => (
              <li className="timeline-item" key={item.id || idx}>
                <div className="timeline-badge" aria-hidden />
                <div className="timeline-card">
                  <div className="timeline-card-image" style={{backgroundImage: `url(${item.image})`}} />
                  <div className="timeline-card-body">
                    <time className="timeline-date">{item.date}</time>
                    <h3 className="timeline-title">{item.title}</h3>
                    <p className="timeline-desc">{item.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Timeline;
