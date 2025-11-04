// src/pages/Timeline/TimelineDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TimelineDetail.css"; // Tạo file CSS để đẹp hơn

const TimelineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`http://localhost:3000/timeline/items/${id}`);
        if (!response.ok) throw new Error("Không tìm thấy sự kiện");
        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải chi tiết sự kiện...</p>
      </div>
    );
  }

  // Error
  if (error || !item) {
    return (
      <main className="article-page error">
        <div className="article-inner">
          <button className="btn back-btn" onClick={() => navigate(-1)}>
            Quay lại
          </button>
          <p className="error-msg">Không tìm thấy sự kiện!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="article-page">
      <div className="article-inner">
        {/* Nút quay lại */}
        <button className="btn back-btn" onClick={() => navigate(-1)}>
          Quay lại
        </button>

        {/* Hero Image */}
        <div
          className="article-hero"
          style={{
            backgroundImage: `url(${item.image || "/placeholder.jpg"})`,
          }}
        >
          <div className="hero-overlay"></div>
          <span className="article-badge">{item.category}</span>
        </div>

        {/* Meta */}
        <div className="article-meta">
          <time dateTime={item.date}>
            {new Date(item.date).getFullYear()}
          </time>
          <span className="category-tag">{item.category}</span>
        </div>

        {/* Tiêu đề */}
        <h1 className="article-title">{item.title}</h1>

        {/* Nội dung chi tiết */}
        <article className="article-body">
          {item.desc ? (
            item.desc.split("\n").map((paragraph, index) => (
              <p key={index} className="paragraph">
                {paragraph.trim() || "\u00A0"}
              </p>
            ))
          ) : (
            <p className="no-desc">Không có mô tả chi tiết.</p>
          )}
        </article>

        {/* Nguồn */}
        {item.sourceUrl && (
          <div className="source-link">
            <strong>Nguồn:</strong>{" "}
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
              Xem chi tiết tại đây
            </a>
          </div>
        )}

        {/* Nút chia sẻ (tùy chọn) */}
        <div className="share-buttons">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Đã sao chép link!");
            }}
            className="btn share-btn"
          >
            Sao chép link
          </button>
        </div>
      </div>
    </main>
  );
};

export default TimelineDetail;