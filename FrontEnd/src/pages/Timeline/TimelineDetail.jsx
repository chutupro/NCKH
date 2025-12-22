// src/pages/Timeline/TimelineDetail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Styles/Timeline/TimelineDetail.css";

const TimelineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mainEvent, setMainEvent] = useState(null);
  const [yearEvents, setYearEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const monthRefs = useRef({});

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

  // Group events by month - CHỈ group timeline CÓ THÁNG, loại bỏ ảnh năm
  const groupByMonth = (events) => {
    const months = {};
    const yearOnlyEvents = []; // Ảnh năm (eventDate = YYYY-01-01)
    
    events.forEach((event) => {
      const dateParts = event.date.split('-'); // [YYYY, MM, DD]
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);
      
      // Nếu là 01-01 → Ảnh năm, KHÔNG group vào tháng
      if (month === 1 && day === 1) {
        yearOnlyEvents.push(event);
      } else {
        // Timeline tháng cụ thể → Group vào tháng
        if (!months[month]) months[month] = [];
        months[month].push(event);
      }
    });
    
    return { months, yearOnlyEvents };
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  // Scroll to month
  const scrollToMonth = (month) => {
    // set active first, then scroll after render (small delay)
    setActiveMonth(month);
    setTimeout(() => {
      if (monthRefs.current[month]) {
        monthRefs.current[month].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 60);
  };

  // Count events per month
  const getMonthEventCount = (month, monthGroups) => {
    return monthGroups[month]?.length || 0;
  };

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
  const { months: monthGroups, yearOnlyEvents } = groupByMonth(yearEvents);
  // only months that actually have events
  const monthsWithEvents = Object.keys(monthGroups).map(Number).sort((a, b) => a - b);

  return (
    <main className="timeline-detail-page">
      <div className="timeline-detail-container">
        {/* Header */}
        

        <div className="timeline-detail-hero hero-grid">
          <div className="hero-left">
            {/* use real img for clearer rendering */}
            <img src={mainEvent.image} alt={mainEvent.title} className="hero-img" />
          </div>
          <div className="hero-right">
            <div className="hero-top-row">
              <span className="hero-year-inline">{year}</span>
              <div className="hero-category-badge">{mainEvent.category}</div>
            </div>
            <h1 className="hero-title">{mainEvent.title}</h1>
            <p className="hero-desc">{mainEvent.desc || 'Không có mô tả'}</p>
          </div>
        </div>

        {/* Month Navigation Bar */}
        <div className="month-navigation-sticky">
          <div className="month-nav-container">
            <h2 className="nav-title">⏳ Chọn tháng trong năm {year}</h2>
            <div className="month-nav-grid">
              {monthsWithEvents.length === 0 ? (
                <div className="no-events">Không có bài viết theo tháng trong năm này.</div>
              ) : (
                monthsWithEvents.map((month) => {
                  const eventCount = getMonthEventCount(month, monthGroups);
                  return (
                    <button
                      key={month}
                      className={`month-nav-btn ${activeMonth === month ? 'active' : ''}`}
                      onClick={() => scrollToMonth(month)}
                    >
                      <span className="month-nav-number">{month}</span>
                      <span className="month-nav-name">{monthNames[month - 1]}</span>
                      {eventCount > 0 && <span className="month-nav-count">{eventCount}</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Timeline by Month */}
        <div className="timeline-monthly">
          {yearEvents.length === 0 ? (
            <p className="no-events">Không có sự kiện nào trong năm này.</p>
          ) : (
            <div className="monthly-timeline">
              {monthsWithEvents.map((month) => {
                const events = monthGroups[month] || [];

                return (
                  <div 
                    key={month} 
                    className="month-block"
                    ref={(el) => monthRefs.current[month] = el}
                  >
                    <div className="month-header">
                      <span className="month-number">{month}</span>
                      <span className="month-name">{monthNames[month - 1]}</span>
                      <span className="month-event-count">{events.length} sự kiện</span>
                    </div>
                    {activeMonth === month ? (
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
                              <span className="event-badge">{mainEvent.category}</span>
                            </div>
                            <div className="event-content">
                              <time className="event-date">
                                {(() => {
                                  const eventDate = new Date(event.date);
                                  const month = eventDate.getMonth() + 1;
                                  const year = eventDate.getFullYear();
                                  const day = eventDate.getDate();
                                  
                                  if (day > 1 || event.desc) {
                                    return `Tháng ${month}/${year}`;
                                  } else {
                                    return `Năm ${year}`;
                                  }
                                })()}
                              </time>
                              <h3 className="event-title">{event.title}</h3>
                              <p className="event-desc">{event.desc || 'Không có mô tả'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        
      </div>
    </main>
  );
};

export default TimelineDetail;