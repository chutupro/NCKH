import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Admin/TimelineManagement.css';

const TimelineManagement = () => {
  const [timelines, setTimelines] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  
  // NEW: Tab quản lý
  const [activeTab, setActiveTab] = useState('timelines'); // 'timelines' | 'pending-images'
  
  // Data from other pillars
  const [locations, setLocations] = useState([]); // From Map pillar
  const [images, setImages] = useState([]);       // From Gallery pillar
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  // Form states - THEO LOGIC MỚI
  const [timelineForm, setTimelineForm] = useState({
    title: '',
    eventDate: '',
    description: '',
    ImageID: null,      // Chọn từ Gallery (bắt buộc)
    LocationID: null,   // Chọn từ Map (bắt buộc)
    sourceUrl: '',
  });

  const [selectedImagePreview, setSelectedImagePreview] = useState('');

  useEffect(() => {
    fetchTimelines();
    fetchLocations();  // Lấy danh sách địa điểm từ Map
    fetchImages();     // Lấy danh sách ảnh từ Gallery
  }, []);

  // Fetch locations from Map pillar
  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/map-locations');
      setLocations(response.data || []);
    } catch (error) {
      console.error('Lỗi fetch locations:', error);
    }
  };

  // Fetch images from Gallery pillar (tất cả ảnh trong Images table)
  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/gallery?take=1000');
      // Backend trả về { data: [...], total: number }
      setImages(response.data?.data || []);
      console.log('[Timeline] Fetched images:', response.data?.data?.length);
    } catch (error) {
      console.error('Lỗi fetch images:', error);
      setImages([]); // Đảm bảo luôn là array
    }
  };

  // LOGIC MỚI: Lọc ảnh chưa có trong Timeline (ảnh chờ duyệt)
  const pendingImages = images.filter(img => {
    // Kiểm tra xem ImageID có trong timelines chưa
    const hasTimeline = timelines.some(t => t.ImageID === img.ImageID);
    console.log(`Image ${img.ImageID} (${img.AltText}): hasTimeline = ${hasTimeline}`);
    return !hasTimeline;
  });
  
  console.log('📊 [Timeline Debug]');
  console.log('Total images:', images.length);
  console.log('Total timelines:', timelines.length);
  console.log('Pending images:', pendingImages.length);
  console.log('Images:', images.map(i => ({ ImageID: i.ImageID, AltText: i.AltText })));
  console.log('Timeline ImageIDs:', timelines.map(t => t.ImageID));

  // LOGIC MỚI: Duyệt nhanh ảnh (tạo timeline với status = approved, không cần điền form)
  const handleQuickApprove = async (imageId) => {
    const image = images.find(i => i.ImageID === imageId);
    if (!image) {
      alert('Không tìm thấy ảnh!');
      return;
    }

    const defaultTitle = image.AltText || `Sự kiện ${new Date().getFullYear()}`;
    const defaultDate = new Date().toISOString().split('T')[0];

    if (!window.confirm(`Duyệt ảnh "${image.AltText || 'Ảnh #' + imageId}" lên Timeline công khai?\n\nHệ thống sẽ tự động tạo timeline với tiêu đề: "${defaultTitle}"`)) {
      return;
    }

    try {
      await axios.post('http://localhost:3000/timeline', {
        ImageID: imageId,
        LocationID: null, // Không bắt buộc địa điểm
        title: defaultTitle,
        eventDate: defaultDate,
        description: image.AltText || '',
        status: 'approved', // Duyệt luôn
      });

      alert('Duyệt ảnh thành công! Timeline đã được tạo.');
      fetchTimelines();
      fetchImages();
    } catch (error) {
      console.error('Error quick approve:', error);
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  // LOGIC MỚI: Tạo timeline chi tiết cho ảnh (mở form điền đầy đủ)
  const handleCreateDetailedTimeline = (imageId) => {
    const image = images.find(i => i.ImageID === imageId);
    if (!image) {
      alert('Không tìm thấy ảnh!');
      return;
    }

    setTimelineForm({
      title: image.AltText || '',
      eventDate: new Date().toISOString().split('T')[0],
      description: '',
      ImageID: imageId,
      LocationID: null,
      sourceUrl: '',
    });

    setSelectedImagePreview(`http://localhost:3001/${image.FilePath}`);
    setEditingTimeline(null);
    setShowForm(true);
  };


  // Filter timelines - THEO LOGIC MỚI
  const filteredTimelines = timelines.filter((timeline) => {
    const matchSearch = searchText.trim() === '' || 
      timeline.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      timeline.description?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchLocation = selectedLocation === '' || timeline.LocationID === parseInt(selectedLocation);
    
    const timelineYear = timeline.eventDate ? parseInt(timeline.eventDate.split('-')[0]) : null;
    const matchYearFrom = yearFrom === '' || (timelineYear && timelineYear >= parseInt(yearFrom));
    const matchYearTo = yearTo === '' || (timelineYear && timelineYear <= parseInt(yearTo));
    
    return matchSearch && matchLocation && matchYearFrom && matchYearTo;
  });

  // Sort by eventDate (newest first)
  const sortedTimelines = [...filteredTimelines].sort((a, b) => {
    return (b.eventDate || '').localeCompare(a.eventDate || '');
  });

  const fetchTimelines = async () => {
    try {
      const response = await axios.get('http://localhost:3000/timeline');
      setTimelines(response.data);
    } catch (error) {
      console.error('Error fetching timelines:', error);
      alert('Lỗi khi tải danh sách timeline');
    }
  };

  const fetchTimelineDetail = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/timeline/${id}`);
      setSelectedTimeline(response.data);
    } catch (error) {
      console.error('Error fetching timeline detail:', error);
      alert('Lỗi khi tải chi tiết timeline');
    }
  };

  // ========== TIMELINE CRUD ==========
  const handleCreate = () => {
    setEditingTimeline(null);
    setTimelineForm({
      title: '',
      eventDate: '',
      description: '',
      ImageID: null,
      LocationID: null,
      sourceUrl: '',
    });
    setSelectedImagePreview('');
    setShowForm(true);
  };

  const handleEdit = (timeline) => {
    setEditingTimeline(timeline);
    setTimelineForm({
      title: timeline.title || '',
      eventDate: timeline.eventDate || '',
      description: timeline.description || '',
      ImageID: timeline.ImageID || null,
      LocationID: timeline.LocationID || null,
      sourceUrl: timeline.sourceUrl || '',
    });
    
    // Load image preview if ImageID exists
    if (timeline.ImageID) {
      const img = images.find(i => i.ImageID === timeline.ImageID);
      setSelectedImagePreview(img ? `http://localhost:3001/${img.FilePath}` : '');
    } else {
      setSelectedImagePreview('');
    }
    
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // VALIDATION: Chỉ cần ảnh + tiêu đề + ngày
    if (!timelineForm.title || !timelineForm.eventDate) {
      alert('Vui lòng nhập tiêu đề và ngày sự kiện');
      return;
    }
    
    if (!timelineForm.ImageID) {
      alert('Vui lòng chọn ảnh từ Thư viện (Gallery)');
      return;
    }
    
    // LocationID không bắt buộc - có thể null

    try {
      const payload = {
        title: timelineForm.title,
        eventDate: timelineForm.eventDate,
        description: timelineForm.description,
        ImageID: timelineForm.ImageID,
        LocationID: timelineForm.LocationID,
        sourceUrl: timelineForm.sourceUrl,
      };

      if (editingTimeline) {
        // Update existing timeline
        await axios.put(`http://localhost:3000/timeline/${editingTimeline.timelineID}`, payload);
        alert('Cập nhật timeline thành công!');
      } else {
        // Create new timeline
        await axios.post('http://localhost:3000/timeline', payload);
        alert('Tạo timeline mới thành công!');
      }

      setShowForm(false);
      setSelectedImagePreview('');
      fetchTimelines();
    } catch (error) {
      console.error('Error saving timeline:', error);
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa timeline này?')) return;

    try {
      await axios.delete(`http://localhost:3000/timeline/${id}`);
      alert('Xóa timeline thành công!');
      fetchTimelines();
      if (selectedTimeline?.timelineID === id) {
        setSelectedTimeline(null);
      }
    } catch (error) {
      console.error('Error deleting timeline:', error);
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Format YYYY-MM-DD to DD/MM/YYYY
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="timeline-management">
      <div className="timeline-header">
        <h1>Quản lý Timeline</h1>
        <button className="btn-create" onClick={handleCreate}>
          + Tạo Timeline Mới
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="timeline-tabs">
        <button 
          className={`tab-btn ${activeTab === 'timelines' ? 'active' : ''}`}
          onClick={() => setActiveTab('timelines')}
        >
          Timeline đã tạo ({timelines.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pending-images' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending-images')}
        >
          Ảnh chờ duyệt ({pendingImages.length})
        </button>
      </div>

      {/* TAB 1: TIMELINE ĐÃ TẠO */}
      {activeTab === 'timelines' && (
        <>
          {/* Filters */}
          <div className="timeline-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề, mô tả..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả địa điểm</option>
          {locations.map((loc) => (
            <option key={loc.LocationID} value={loc.LocationID}>
              {loc.Name} ({loc.Address})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Từ năm"
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value)}
          className="year-input"
          min="1000"
          max="2100"
        />

        <input
          type="number"
          placeholder="Đến năm"
          value={yearTo}
          onChange={(e) => setYearTo(e.target.value)}
          className="year-input"
          min="1000"
          max="2100"
        />

        <button 
          className="btn-clear-filter"
          onClick={() => {
            setSearchText('');
            setSelectedLocation('');
            setYearFrom('');
            setYearTo('');
          }}
        >
          Xóa bộ lọc
        </button>

        <div className="filter-result-count">
          Tìm thấy: {sortedTimelines.length} / {timelines.length}
        </div>
      </div>

      {/* Timeline List */}
      <div className="timeline-list">
        <table className="timeline-table">
          <thead>
            <tr>
              <th style={{width: '80px'}}>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th style={{width: '120px'}}>Ngày</th>
              <th style={{width: '180px'}}>Địa điểm</th>
              <th style={{width: '350px'}}>Mô tả</th>
              <th style={{width: '150px'}}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedTimelines.map((timeline) => {
              const location = locations.find(l => l.LocationID === timeline.LocationID);
              const image = images.find(i => i.ImageID === timeline.ImageID);
              
              return (
                <tr key={timeline.timelineID} className={selectedTimeline?.timelineID === timeline.timelineID ? 'selected' : ''}>
                  <td>
                    {image ? (
                      <img 
                        src={`http://localhost:3001/${image.FilePath}`}
                        alt={timeline.title}
                        className="timeline-thumbnail"
                        onClick={() => fetchTimelineDetail(timeline.timelineID)}
                      />
                    ) : (
                      <div className="no-image">Chưa có</div>
                    )}
                  </td>
                  <td className="timeline-title">{timeline.title}</td>
                  <td className="timeline-date">{formatDate(timeline.eventDate)}</td>
                  <td className="timeline-location">
                    {location ? location.Name : 'Chưa gắn'}
                  </td>
                  <td className="timeline-desc">
                    {timeline.description?.substring(0, 150)}
                    {timeline.description?.length > 150 ? '...' : ''}
                  </td>
                  <td className="timeline-actions">
                    <button 
                      className="btn-view"
                      onClick={() => fetchTimelineDetail(timeline.timelineID)}
                    >
                      Xem
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(timeline)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(timeline.timelineID)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedTimelines.length === 0 && (
          <div className="no-data">Không tìm thấy timeline nào</div>
        )}
      </div>
      </>
      )}

      {/* TAB 2: ẢNH CHỜ DUYỆT TỪ GALLERY */}
      {activeTab === 'pending-images' && (
        <div className="pending-images-section">
          <div className="section-info">
            <h3>📸 Ảnh từ Thư viện (thông tin gốc - không sửa)</h3>
            <p>Các ảnh này đã có <strong>tiêu đề ảnh, mô tả ảnh, thể loại</strong> từ Thư viện. Timeline sẽ:</p>
            <ul>
              <li>📌 <strong>Giữ nguyên</strong> thông tin ảnh gốc</li>
              <li>📅 <strong>Thêm</strong> thông tin sự kiện lịch sử (năm, tiêu đề sự kiện, mô tả sự kiện)</li>
              <li>♻️ <strong>1 ảnh</strong> có thể xuất hiện trong <strong>nhiều timeline</strong> (nhiều mốc thời gian khác nhau)</li>
            </ul>
          </div>

          {pendingImages.length === 0 && (
            <div className="no-data">Tất cả ảnh trong Thư viện đã có Timeline!</div>
          )}

          <div className="pending-images-grid">
            {pendingImages.map((image) => (
              <div key={image.ImageID} className="pending-image-card">
                <div className="card-image">
                  <img 
                    src={image.FilePath} 
                    alt={image.AltText || `Ảnh #${image.ImageID}`}
                  />
                </div>
                <div className="card-info">
                  <h4 className="image-title">{image.AltText || `Ảnh #${image.ImageID}`}</h4>
                  <p className="image-meta">
                    <span className="badge-id">ID: {image.ImageID}</span>
                    {image.CategoryID && (
                      <span className="badge-category">
                        {image.CategoryID === 1 ? '🏛️ Di sản' : 
                         image.CategoryID === 2 ? '🎉 Văn hóa' :
                         image.CategoryID === 3 ? '🌳 Thiên nhiên' : '🎪 Sự kiện'}
                      </span>
                    )}
                  </p>
                  <p className="image-note">📌 Thông tin ảnh này không sửa được trong Timeline</p>
                </div>
                <div className="card-actions">
                  <button 
                    className="btn-approve"
                    onClick={() => handleQuickApprove(image.ImageID)}
                    title="Duyệt nhanh lên Timeline công khai"
                  >
                    ✓ Duyệt nhanh
                  </button>
                  <button 
                    className="btn-create-detailed"
                    onClick={() => handleCreateDetailedTimeline(image.ImageID)}
                    title="Gắn ảnh này vào sự kiện lịch sử"
                  >
                    📅 Gắn vào Sự kiện
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTimeline ? 'Chỉnh sửa Sự kiện Lịch sử' : '📅 Tạo Sự kiện Lịch sử'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSave} className="timeline-form">
              <div className="form-section-title">
                <h3>📝 Thông tin Sự kiện Lịch sử</h3>
                <p className="form-note">(Thông tin ảnh giữ nguyên từ Thư viện, không sửa tại đây)</p>
              </div>
              <div className="form-group">
                <label>Tiêu đề Sự kiện *</label>
                <input
                  type="text"
                  value={timelineForm.title}
                  onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                  required
                  maxLength={150}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày sự kiện *</label>
                  <input
                    type="date"
                    value={timelineForm.eventDate}
                    onChange={(e) => setTimelineForm({ ...timelineForm, eventDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nguồn tham khảo</label>
                  <input
                    type="url"
                    value={timelineForm.sourceUrl}
                    onChange={(e) => setTimelineForm({ ...timelineForm, sourceUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* CHỌN ẢNH TỪ GALLERY */}
              <div className="form-section-title">
                <h3>🖼️ Ảnh Liên kết</h3>
              </div>
              <div className="form-group">
                <label>Chọn ảnh từ Thư viện <span className="required">*</span></label>
                <select
                  value={timelineForm.ImageID || ''}
                  onChange={(e) => {
                    const imageId = parseInt(e.target.value);
                    setTimelineForm({ ...timelineForm, ImageID: imageId });
                    const img = images.find(i => i.ImageID === imageId);
                    setSelectedImagePreview(img?.FilePath || '');
                  }}
                  required
                >
                  <option value="">-- Chọn ảnh --</option>
                  {images.map((img) => (
                    <option key={img.ImageID} value={img.ImageID}>
                      {img.AltText || `Ảnh #${img.ImageID}`} 
                      {img.CategoryID && ` (
                        ${img.CategoryID === 1 ? 'Di sản' : 
                          img.CategoryID === 2 ? 'Văn hóa' :
                          img.CategoryID === 3 ? 'Thiên nhiên' : 'Sự kiện'})`}
                    </option>
                  ))}
                </select>
                {selectedImagePreview && timelineForm.ImageID && (
                  <div className="selected-image-info">
                    <div className="image-preview-box">
                      <img src={selectedImagePreview} alt="Preview" />
                    </div>
                    <div className="image-original-info">
                      <p className="info-label">📌 Thông tin ảnh gốc (từ Thư viện - không sửa):</p>
                      <p><strong>Tiêu đề ảnh:</strong> {images.find(i => i.ImageID === timelineForm.ImageID)?.AltText || 'Chưa có'}</p>
                      <p><strong>Thể loại:</strong> {
                        images.find(i => i.ImageID === timelineForm.ImageID)?.CategoryID === 1 ? 'Di sản' :
                        images.find(i => i.ImageID === timelineForm.ImageID)?.CategoryID === 2 ? 'Văn hóa' :
                        images.find(i => i.ImageID === timelineForm.ImageID)?.CategoryID === 3 ? 'Thiên nhiên' : 'Sự kiện'
                      }</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CHỌN TỪ MAP */}
              <div className="form-group">
                <label>Địa điểm <span className="required">*</span></label>
                <select
                  value={timelineForm.LocationID || ''}
                  onChange={(e) => setTimelineForm({ ...timelineForm, LocationID: parseInt(e.target.value) })}
                  required
                >
                  <option value="">-- Chọn địa điểm --</option>
                  {locations.map((loc) => (
                    <option key={loc.LocationID} value={loc.LocationID}>
                      {loc.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  value={timelineForm.description}
                  onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label>URL nguồn</label>
                <input
                  type="url"
                  value={timelineForm.sourceUrl}
                  onChange={(e) => setTimelineForm({ ...timelineForm, sourceUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  {editingTimeline ? 'Cập nhật Timeline' : 'Tạo Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Detail Modal */}
      {selectedTimeline && (
        <div className="modal-overlay" onClick={() => setSelectedTimeline(null)}>
          <div className="modal-content timeline-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết Timeline #{selectedTimeline.timelineID}</h2>
              <button className="btn-close" onClick={() => setSelectedTimeline(null)}>×</button>
            </div>

            <div className="detail-content">
              {(() => {
                const image = images.find(i => i.ImageID === selectedTimeline.ImageID);
                const location = locations.find(l => l.LocationID === selectedTimeline.LocationID);
                
                return (
                  <>
                    {image && (
                      <div className="detail-image">
                        <img src={`http://localhost:3001/${image.FilePath}`} alt={selectedTimeline.title} />
                      </div>
                    )}

                    <div className="detail-info">
                      <h3>{selectedTimeline.title}</h3>
                      <p className="detail-date">
                        <strong>Ngày sự kiện:</strong> {formatDate(selectedTimeline.eventDate)}
                      </p>
                      <p className="detail-location">
                        <strong>Địa điểm:</strong> {location ? location.Name : 'Chưa gắn'}
                      </p>
                      {selectedTimeline.description && (
                        <div className="detail-description">
                          <strong>Mô tả:</strong>
                          <p>{selectedTimeline.description}</p>
                        </div>
                      )}
                      {selectedTimeline.sourceUrl && (
                        <p className="detail-source">
                          <strong>Nguồn:</strong> 
                          <a href={selectedTimeline.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {selectedTimeline.sourceUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}

              <div className="detail-actions">
                <button className="btn-edit" onClick={() => {
                  setSelectedTimeline(null);
                  handleEdit(selectedTimeline);
                }}>
                  Chỉnh sửa
                </button>
                <button className="btn-delete" onClick={() => {
                  setSelectedTimeline(null);
                  handleDelete(selectedTimeline.timelineID);
                }}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineManagement;
