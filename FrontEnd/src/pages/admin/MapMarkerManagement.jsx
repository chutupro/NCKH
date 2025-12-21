// src/pages/admin/MapMarkerManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Admin/MapMarkerManagement.css';

const BASE_URL = 'http://localhost:3000';

/**
 * QUẢN LÝ MARKER TRÊN MAP
 * Xem và xóa các địa điểm đã đăng
 */
const MapMarkerManagement = () => {
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchMarkers();
  }, []);

  useEffect(() => {
    filterMarkers();
  }, [markers, selectedCategory, searchText]);

  // Lấy danh mục
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  };

  // Lấy danh sách marker
  const fetchMarkers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/map-locations`);
      setMarkers(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách marker:', err);
      alert('Không thể tải danh sách marker');
    } finally {
      setLoading(false);
    }
  };

  // Lọc marker
  const filterMarkers = () => {
    let filtered = [...markers];

    // Lọc theo category
    if (selectedCategory) {
      filtered = filtered.filter(m => m.CategoryID === parseInt(selectedCategory));
    }

    // Lọc theo search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(m => 
        m.Name?.toLowerCase().includes(search) ||
        m.Address?.toLowerCase().includes(search) ||
        m.CategoryName?.toLowerCase().includes(search)
      );
    }

    setFilteredMarkers(filtered);
  };

  // Xóa marker
  const handleDelete = async (marker) => {
    if (!window.confirm(`⚠️ XÓA CỨNG địa điểm "${marker.Name}"?\n\n🗑️ MARKER sẽ bị xóa khỏi bản đồ\n💥 ẢNH sẽ bị XÓA VĨNH VIỄN (nếu không còn marker nào khác dùng)\n\n❌ KHÔNG THỂ KHÔI PHỤC!\n\nBạn có chắc chắn?`)) {
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/map-locations/${marker.LocationID}`);
      
      // Đóng modal nếu đang mở
      if (selectedMarker?.LocationID === marker.LocationID) {
        setSelectedMarker(null);
      }
      
      // Xóa marker khỏi state ngay lập tức (không cần reload)
      setMarkers(prev => prev.filter(m => m.LocationID !== marker.LocationID));
      
      // Không dùng alert để tránh trigger browser behavior - chỉ log
      console.log(`✅ Đã xóa marker "${marker.Name}" thành công!`);
    } catch (err) {
      console.error('Lỗi xóa marker:', err);
      alert(`❌ Lỗi xóa marker: ${err.response?.data?.message || err.message}`);
    }
  };

  // Xem chi tiết
  const handleViewDetail = (marker) => {
    setSelectedMarker(marker);
  };

  // Đóng chi tiết
  const handleCloseDetail = () => {
    setSelectedMarker(null);
  };

  return (
    <div className="map-marker-management">
      {/* Thanh lọc */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>🔍 Tìm kiếm:</label>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>📂 Danh mục:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.CategoryID} value={cat.CategoryID}>
                {cat.Name}
              </option>
            ))}
          </select>
        </div>

        <div className="stats">
          <span className="stat-item">
            Tổng: <strong>{markers.length}</strong>
          </span>
          <span className="stat-item">
            Hiển thị: <strong>{filteredMarkers.length}</strong>
          </span>
        </div>
      </div>

      {/* Danh sách marker */}
      {loading ? (
        <div className="loading">⏳ Đang tải...</div>
      ) : filteredMarkers.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</div>
          <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>
            {markers.length === 0 ? 'Chưa có marker nào' : 'Không tìm thấy marker'}
          </h3>
          <p style={{ color: '#999', fontSize: '1rem' }}>
            {markers.length === 0 
              ? 'Hãy tạo marker mới ở tab "Quản lý Địa điểm"' 
              : 'Thử thay đổi bộ lọc hoặc tìm kiếm'}
          </p>
        </div>
      ) : (
        <div className="markers-grid">
          {filteredMarkers.map(marker => (
            <div key={marker.LocationID} className="marker-card">
              {/* Ảnh */}
              <div className="marker-images">
                <div className="image-wrapper modern">
                  <img 
                    src={marker.Image || '/placeholder.png'} 
                    alt="Ảnh hiện đại"
                    onError={(e) => e.target.src = '/placeholder.png'}
                  />
                  <span className="image-label">Hiện đại ({marker.ImageYear || 'N/A'})</span>
                </div>
                <div className="image-wrapper old">
                  <img 
                    src={marker.OldImage || '/placeholder.png'} 
                    alt="Ảnh xưa"
                    onError={(e) => e.target.src = '/placeholder.png'}
                  />
                  <span className="image-label">Xưa ({marker.OldImageYear || 'N/A'})</span>
                </div>
              </div>

              {/* Thông tin */}
              <div className="marker-info">
                <h3 className="marker-title">{marker.Name}</h3>
                
                <div className="info-row">
                  <span className="label">📍 Địa chỉ:</span>
                  <span className="value">{marker.Address || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <span className="label">📂 Danh mục:</span>
                  <span className="category-badge">{marker.CategoryName || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <span className="label">Tọa độ:</span>
                  <span className="value">
                    {marker.Latitude?.toFixed(5)}, {marker.Longitude?.toFixed(5)}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">📝 Mô tả:</span>
                  <span className="value desc">{marker.description || 'Không có'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="marker-actions">
                <button 
                  className="btn-view"
                  onClick={() => handleViewDetail(marker)}
                >
                  👁️ Chi tiết
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(marker)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedMarker && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseDetail}>✕</button>
            
            <h2>📍 Chi tiết Marker</h2>
            
            <div className="detail-section">
              <h3>{selectedMarker.Name}</h3>
              
              <div className="detail-images">
                <div className="detail-image">
                  <h4>Ảnh hiện đại ({selectedMarker.ImageYear || 'N/A'})</h4>
                  <img src={selectedMarker.Image} alt="Hiện đại" />
                </div>
                <div className="detail-image">
                  <h4>Ảnh xưa ({selectedMarker.OldImageYear || 'N/A'})</h4>
                  <img src={selectedMarker.OldImage} alt="Xưa" />
                </div>
              </div>

              <div className="detail-info">
                <p><strong>Địa chỉ:</strong> {selectedMarker.Address}</p>
                <p><strong>Danh mục:</strong> {selectedMarker.CategoryName}</p>
                <p><strong>Tọa độ:</strong> [{selectedMarker.Latitude}, {selectedMarker.Longitude}]</p>
                <p><strong>Mô tả ngắn:</strong> {selectedMarker.description}</p>
                <p><strong>Mô tả đầy đủ:</strong> {selectedMarker.fullDescription}</p>
              </div>

              <div className="detail-actions">
                <a 
                  href={`https://www.google.com/maps?q=${selectedMarker.Latitude},${selectedMarker.Longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-map"
                >
                  🗺️ Xem trên Google Maps
                </a>
                <button 
                  className="btn-delete-modal"
                  onClick={() => handleDelete(selectedMarker)}
                >
                  🗑️ Xóa Marker này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapMarkerManagement;
