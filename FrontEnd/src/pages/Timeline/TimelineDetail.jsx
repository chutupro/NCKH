// src/pages/Timeline/TimelineDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Styles/Timeline/TimelineDetail.css";

const TimelineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mainEvent, setMainEvent] = useState(null);
  const [yearEvents, setYearEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy sự kiện chính
        const mainRes = await fetch(`http://localhost:3000/timeline/${id}`);
        if (!mainRes.ok) throw new Error("Không tìm thấy sự kiện");
        const mainData = await mainRes.json();
        setMainEvent(mainData);

        // Lấy năm từ sự kiện chính
        const year = mainData.date.slice(0, 4);

        // Lấy tất cả sự kiện trong năm đó
        const eventsRes = await fetch(
          `http://localhost:3000/timeline?fromYear=${year}&toYear=${year}`
        );
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          // Sắp xếp theo tháng
          const sorted = eventsData.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
          });
          setYearEvents(sorted);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Group events by month
  const groupByMonth = (events) => {
    const months = {};
    events.forEach((event) => {
      const date = new Date(event.date);
      const month = date.getMonth() + 1; // 1-12
      if (!months[month]) months[month] = [];
      months[month].push(event);
    });
    return months;
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  if (loading) {
    return (
      <div className="timeline-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải timeline...</p>
      </div>
    );
  }

  if (error || !mainEvent) {
    return (
      <main className="timeline-detail-page">
        <div className="timeline-detail-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <p className="error-msg">Không tìm thấy sự kiện!</p>
        </div>
      </main>
    );
  }

  const year = mainEvent.date.slice(0, 4);
  const monthGroups = groupByMonth(yearEvents);

  return (
    <main className="timeline-detail-page">
      <div className="timeline-detail-container">
        {/* Header */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        <div className="timeline-detail-hero">
          <div className="hero-image" style={{ backgroundImage: `url(${mainEvent.image})` }}>
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <span className="hero-year">{year}</span>
            <h1 className="hero-title">{mainEvent.title}</h1>
            <p className="hero-category">📚 {mainEvent.category}</p>
          </div>
        </div>

        {/* Timeline by Month */}
        <div className="timeline-monthly">
          <h2 className="section-title">⏳ Các sự kiện trong năm {year}</h2>
          
          {yearEvents.length === 0 ? (
            <p className="no-events">Không có sự kiện nào trong năm này.</p>
          ) : (
            <div className="monthly-timeline">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                const events = monthGroups[month] || [];
                if (events.length === 0) return null;

                return (
                  <div key={month} className="month-block">
                    <div className="month-header">
                      <span className="month-number">{month}</span>
                      <span className="month-name">{monthNames[month - 1]}</span>
                    </div>
                    <div className="month-events">
                      {events.map((event) => (
                        <div 
                          key={event.id} 
                          className={`event-card ${event.id === parseInt(id) ? 'active' : ''}`}
                          onClick={() => {
                            if (event.id !== parseInt(id)) {
                              navigate(`/timeline/${event.id}`);
                            }
                          }}
                        >
                          <div className="event-image" style={{ backgroundImage: `url(${event.image})` }}>
                            <span className="event-badge">{event.category}</span>
                          </div>
                          <div className="event-content">
                            <time className="event-date">
                              {new Date(event.date).toLocaleDateString('vi-VN')}
                            </time>
                            <h3 className="event-title">{event.title}</h3>
                            <p className="event-desc">{event.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Event Detail */}
        <div className="main-event-detail">
          <h2 className="section-title">📖 Chi tiết sự kiện</h2>
          <div className="detail-content">
            <div className="detail-image">
              <img src={mainEvent.image} alt={mainEvent.title} />
            </div>
            <div className="detail-text">
              <h3>{mainEvent.title}</h3>
              <time>{new Date(mainEvent.date).toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</time>
              <div className="description">
                {mainEvent.desc ? (
                  mainEvent.desc.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))
                ) : (
                  <p>Không có mô tả chi tiết.</p>
                )}
              </div>
              {mainEvent.sourceUrl && (
                <a href={mainEvent.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                  🔗 Xem nguồn gốc
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TimelineDetail;