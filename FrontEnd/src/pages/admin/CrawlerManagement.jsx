import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/api";
import "../../Styles/Admin/CrawlerManagement.css";

const CrawlerManagement = () => {
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState(null);

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/timeline");
      setTimelines(response.data || []);
    } catch (error) {
      console.error("Error fetching timelines:", error);
      setTimelines([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimelines = timelines.filter((timeline) => {
    const matchesSearch =
      timeline.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timeline.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timeline.fullDesc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "with-image" && timeline.image) ||
      (filter === "no-image" && !timeline.image);
    return matchesSearch && matchesFilter;
  });

  const handleView = (timeline) => {
    setSelectedTimeline(timeline);
  };

  const handleClose = () => {
    setSelectedTimeline(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa timeline này?")) return;

    try {
      await apiClient.delete(`/timeline/${id}`);
      setTimelines(timelines.filter((t) => t.id !== id));
      alert("Đã xóa thành công!");
    } catch (error) {
      console.error("Error deleting timeline:", error);
      alert("Lỗi khi xóa timeline!");
    }
  };

  return (
    <div className="crawler-management">
      <div className="crawler-header">
        <div>
          <h1>🕷️ Crawler Management</h1>
          <p>Quản lý dữ liệu timeline đã crawl từ các nguồn</p>
        </div>
        <button className="btn-refresh" onClick={fetchTimelines}>
          🔄 Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="crawler-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tất cả ({timelines.length})
          </button>
          <button
            className={filter === "with-image" ? "active" : ""}
            onClick={() => setFilter("with-image")}
          >
            Có ảnh ({timelines.filter((t) => t.Image).length})
          </button>
          <button
            className={filter === "no-image" ? "active" : ""}
            onClick={() => setFilter("no-image")}
          >
            Không có ảnh ({timelines.filter((t) => !t.Image).length})
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="timeline-grid">
          {filteredTimelines.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <h3>Không có dữ liệu</h3>
              <p>Chưa có timeline nào được crawl</p>
            </div>
          ) : (
            filteredTimelines.map((timeline) => (
              <div key={timeline.id} className="timeline-card">
                {timeline.image && (
                  <div className="timeline-image">
                    <img
                      src={
                        timeline.image.startsWith("http")
                          ? timeline.image
                          : `http://localhost:3000${timeline.image}`
                      }
                      alt={timeline.title}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="timeline-content">
                  <h3>{timeline.title || "Không có tiêu đề"}</h3>
                  <p className="timeline-date">
                    📅 {timeline.date || "Chưa rõ"}
                  </p>
                  <p className="timeline-description">
                    {timeline.desc?.substring(0, 150)}
                    {timeline.desc?.length > 150 && "..."}
                  </p>

                  <div className="timeline-meta">
                    <span className="meta-item">
                      🏷️ {timeline.category || "Chưa phân loại"}
                    </span>
                    {timeline.sourceUrl && (
                      <span className="meta-item">
                        🔗 {new URL(timeline.sourceUrl).hostname}
                      </span>
                    )}
                  </div>

                  <div className="timeline-actions">
                    <button
                      className="btn-view"
                      onClick={() => handleView(timeline)}
                    >
                      👁️ Xem
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(timeline.id)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTimeline && (
        <div className="timeline-modal" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClose}>
              ×
            </button>

            <h2>{selectedTimeline.title}</h2>

            {selectedTimeline.image && (
              <img
                src={
                  selectedTimeline.image.startsWith("http")
                    ? selectedTimeline.image
                    : `http://localhost:3000${selectedTimeline.image}`
                }
                alt={selectedTimeline.title}
                className="modal-image"
              />
            )}

            <div className="modal-info">
              <div className="info-row">
                <strong>📅 Thời gian:</strong>
                <span>{selectedTimeline.date || "Chưa rõ"}</span>
              </div>

              <div className="info-row">
                <strong>🏷️ Danh mục:</strong>
                <span>{selectedTimeline.category || "Chưa phân loại"}</span>
              </div>

              {selectedTimeline.sourceUrl && (
                <div className="info-row">
                  <strong>🔗 Nguồn:</strong>
                  <a
                    href={selectedTimeline.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedTimeline.sourceUrl}
                  </a>
                </div>
              )}

              <div className="info-row full-width">
                <strong>📝 Mô tả:</strong>
                <p>{selectedTimeline.fullDesc || selectedTimeline.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrawlerManagement;
