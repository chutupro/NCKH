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
    return !hasTimeline;
  });
  
  console.log('📊 [Timeline Debug]');
  console.log('Total images:', images.length);
  console.log('Total timelines:', timelines.length);
  console.log('Pending images:', pendingImages.length);
  
  // Debug: Hiển thị thông tin chi tiết của ảnh chờ duyệt
  if (pendingImages.length > 0) {
    console.log('📷 Pending Images Detail:');
    pendingImages.forEach(img => {
      console.log(`  ImageID=${img.ImageID}:`);
      console.log(`    - AltText: "${img.AltText || 'NULL'}"`);
      console.log(`    - Title: "${img.Title || 'NULL'}"`);
      console.log(`    - CategoryID: ${img.CategoryID}`);
      console.log(`    - CollectionID: ${img.CollectionID || 'NULL'}`);
      console.log(`    - Collection: `, img.collection);
      if (img.collection) {
        console.log(`      * Name: "${img.collection.Name || 'NULL'}"`);
        console.log(`      * Title: "${img.collection.Title || 'NULL'}"`);
      }
    });
  }

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

  // STATE MỚI: Modal chọn Timeline để thêm ảnh
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [selectedImageToAttach, setSelectedImageToAttach] = useState(null);
  const [attachMode, setAttachMode] = useState('existing'); // 'existing' | 'new'
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedExistingTimeline, setSelectedExistingTimeline] = useState(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);

  // Mở modal để chọn tháng và ảnh để đăng vào Timeline
  const handleAttachToEvent = (imageId) => {
    console.log('🟢 [FUNCTION START] handleAttachToEvent called with ImageID:', imageId);
    
    const image = images.find(i => i.ImageID === imageId);
    console.log('🟢 [IMAGE FOUND]:', image ? 'YES' : 'NO', image);
    
    if (!image) {
      console.error('❌ Image not found!');
      alert('Không tìm thấy ảnh!');
      return;
    }

    // Lấy năm từ Collection của ảnh (nếu có)
    const imageYear = image.collection?.Year ? image.collection.Year.toString() : '';
    
    console.log('🔍 [Modal Debug] Opening attach modal for ImageID:', imageId);
    console.log('🔍 [Modal Debug] Collection Year:', imageYear || 'NOT SET');
    console.log('🔍 [Modal Debug] Collection:', image.collection);
    console.log('🔍 [Modal Debug] Setting showAttachModal to TRUE');

    // Reset trạng thái và mở modal (cho phép nhập năm nếu chưa có)
    setSelectedImageToAttach(image); // ⚠️ QUAN TRỌNG: Phải set image để modal hiện
    setSelectedYear(imageYear); // Có thể để trống nếu chưa có
    setSelectedMonth('');
    setSelectedGalleryImage(null);
    setShowAttachModal(true);
    
    console.log('🟢 [STATE UPDATED] Modal should open now!');
    
    setTimelineForm({
      title: '',
      description: '',
      eventDate: '',
      ImageID: null,
      LocationID: null,
      sourceUrl: '',
    });
  };

  // Lấy danh sách năm duy nhất từ timelines
  const getAvailableYears = () => {
    const years = timelines
      .map(t => t.eventDate ? parseInt(t.eventDate.split('-')[0]) : null)
      .filter(y => y !== null);
    return [...new Set(years)].sort((a, b) => b - a);
  };

  // Lấy Timeline theo năm/tháng đã chọn
  const getTimelinesForYearMonth = () => {
    if (!selectedYear) return [];
    
    return timelines.filter(t => {
      if (!t.eventDate) return false;
      const [year, month] = t.eventDate.split('-');
      const matchYear = parseInt(year) === parseInt(selectedYear);
      const matchMonth = !selectedMonth || month === selectedMonth;
      return matchYear && matchMonth;
    });
  };

  // Xử lý đăng ảnh vào Timeline
  const handleAttachToExisting = async () => {
    if (!selectedGalleryImage?.file) {
      alert('Vui lòng chọn ảnh từ máy tính!');
      return;
    }

    if (!selectedYear || !selectedMonth) {
      alert('Vui lòng chọn tháng!');
      return;
    }

    if (!timelineForm.title || timelineForm.title.trim() === '') {
      alert('Vui lòng nhập tiêu đề sự kiện!');
      return;
    }

    try {
      console.log('📤 Upload ảnh và tạo Image record...');
      
      // Upload file + metadata cùng lúc qua /gallery endpoint
      const formData = new FormData();
      formData.append('file', selectedGalleryImage.file);
      formData.append('categoryId', '4'); // 4 = Sự kiện
      formData.append('title', timelineForm.title);
      formData.append('description', timelineForm.description || '');
      
      const uploadResponse = await axios.post('http://localhost:3000/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newImageID = uploadResponse.data.ImageID;
      console.log('✅ Đã upload và tạo Image với ID:', newImageID);
      console.log('✅ Image data:', uploadResponse.data);

      // Tạo Timeline entry
      console.log('🗓️ Tạo Timeline entry...');
      const eventDate = `${selectedYear}-${selectedMonth}-15`;
      
      const timelineData = {
        title: timelineForm.title,
        eventDate: eventDate,
        description: timelineForm.description || '',
        ImageID: newImageID,
        LocationID: null,
        sourceUrl: '',
        status: 'approved',
      };

      await axios.post('http://localhost:3000/timeline', timelineData);

      alert(`✅ Đã đăng ảnh vào tháng ${parseInt(selectedMonth)}/${selectedYear} thành công!`);
      
      setShowAttachModal(false);
      setSelectedGalleryImage(null);
      fetchTimelines();
      fetchImages();
    } catch (error) {
      console.error('❌ Lỗi:', error);
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  // LOGIC CŨ: Tạo timeline mới (giữ nguyên)
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
      
      // Xóa khỏi state trực tiếp (không reload) để giữ nguyên tab hiện tại
      setTimelines(prev => prev.filter(t => t.timelineID !== id));
      
      // ✅ QUAN TRỌNG: Refresh lại danh sách ảnh vì backend đã xóa Image
      // Khi xóa Timeline, backend cũng xóa Image tương ứng
      // → Cần fetch lại để loại bỏ ảnh đã xóa khỏi "Ảnh chờ duyệt"
      await fetchImages();
      
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
              <th style={{width: '100px'}}>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th style={{width: '100px'}}>Năm</th>
              <th style={{width: '400px'}}>Mô tả</th>
              <th style={{width: '150px'}}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedTimelines.map((timeline) => {
              const image = images.find(i => i.ImageID === timeline.ImageID);
              
              // Lấy năm từ collection của ảnh
              const yearFromImage = image?.collection?.Year;
              // Hoặc từ eventDate nếu có
              const yearFromEvent = timeline.eventDate ? new Date(timeline.eventDate).getFullYear() : null;
              const displayYear = yearFromImage || yearFromEvent || 'N/A';
              
              // Lấy MÔ TẢ từ ảnh gallery (ImageDescription hoặc Description từ collection)
              const imageDescription = image?.collection?.ImageDescription || image?.collection?.Description || image?.AltText || 'Chưa có mô tả';
              
              return (
                <tr key={timeline.timelineID} className={selectedTimeline?.timelineID === timeline.timelineID ? 'selected' : ''}>
                  <td>
                    {image ? (
                      <img 
                        src={image.FilePath.startsWith('http') ? image.FilePath : `http://localhost:3001/${image.FilePath}`}
                        alt={timeline.title}
                        className="timeline-thumbnail"
                        onClick={() => fetchTimelineDetail(timeline.timelineID)}
                      />
                    ) : (
                      <div className="no-image">Chưa có</div>
                    )}
                  </td>
                  <td className="timeline-title">{timeline.title || imageDescription}</td>
                  <td className="timeline-date">{displayYear}</td>
                  <td className="timeline-desc">
                    {imageDescription?.substring(0, 200)}
                    {imageDescription?.length > 200 ? '...' : ''}
                  </td>
                  <td className="timeline-actions">
                    <button 
                      className="btn-view"
                      onClick={() => fetchTimelineDetail(timeline.timelineID)}
                    >
                      Xem
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
                    src={image.FilePath.startsWith('http') ? image.FilePath : `http://localhost:3001/${image.FilePath}`}
                    alt={image.AltText || `Ảnh #${image.ImageID}`}
                  />
                </div>
                <div className="card-info">
                  <h4 className="image-title">
                    {(() => {
                      // Hiển thị TÊN BỘ SƯU TẬP (Name) trước, sau đó mới tới Title
                      if (image.collection?.Name) return image.collection.Name;
                      if (image.collection?.Title) return image.collection.Title;
                      
                      // Fallback về tên danh mục
                      if (image.CategoryID === 1) return '🏛️ Di sản';
                      if (image.CategoryID === 2) return '🎉 Văn hóa';
                      if (image.CategoryID === 3) return '🌳 Thiên nhiên';
                      if (image.CategoryID === 4) return '🎪 Sự kiện';
                      return '📷 Không phân loại';
                    })()}
                  </h4>
                  <p className="image-note">{image.AltText || image.Title || 'Chưa có tiêu đề'}</p>
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
                    onClick={() => {
                      console.log('🔴 BUTTON CLICKED! ImageID:', image.ImageID);
                      handleAttachToEvent(image.ImageID);
                    }}
                    title="Đăng ảnh vào Timeline theo tháng"
                  >
                    📅 Gắn vào Sự kiện
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Form Modal - REMOVED: Không cho tạo/sửa thủ công */}
      {false && showForm && (
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

      {/* MODAL MỚI: Gắn ảnh vào Timeline */}
      {showAttachModal && selectedImageToAttach && (
        <div className="modal-overlay" onClick={() => setShowAttachModal(false)}>
          <div className="modal-content attach-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Gắn Ảnh vào Sự kiện</h2>
              <button className="btn-close" onClick={() => setShowAttachModal(false)}>×</button>
            </div>

            <div className="attach-modal-body">
              {/* Preview ảnh sẽ gắn */}
              <div className="image-to-attach">
                <img src={selectedImageToAttach.FilePath} alt={selectedImageToAttach.AltText} />
                <p><strong>{selectedImageToAttach.AltText || `Ảnh #${selectedImageToAttach.ImageID}`}</strong></p>
              </div>

              {/* Banner thông tin năm */}
              {selectedYear ? (
                <div className="modal-info" style={{background: '#fff3cd', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '2px solid #ffc107'}}>
                  <h3 style={{margin: '0 0 0.5rem 0', color: '#856404', fontSize: '18px'}}>📅 Năm: {selectedYear}</h3>
                  <p style={{fontSize: '0.95rem', color: '#856404', margin: 0, lineHeight: '1.6'}}>
                    👉 Chọn tháng → Chọn ảnh → Nhập thông tin sự kiện
                  </p>
                </div>
              ) : (
                <div className="modal-info" style={{background: 'linear-gradient(135deg, #ffe0e0 0%, #ffc9c9 100%)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '2px solid #dc3545'}}>
                  <h3 style={{margin: '0 0 0.5rem 0', color: '#721c24', fontSize: '18px'}}>⚠️ Ảnh chưa có năm</h3>
                  <p style={{fontSize: '0.95rem', color: '#721c24', margin: 0, lineHeight: '1.6'}}>
                    👇 Vui lòng nhập năm trước
                  </p>
                </div>
              )}

              {/* Form gắn ảnh */}
              <div className="attach-form">
                {/* Bước 0: Nhập Năm (nếu chưa có) */}
                {!selectedYear && (
                  <div style={{marginBottom: '2rem'}}>
                    <h3 style={{fontSize: '20px', marginBottom: '1rem', color: '#2c3e50'}}>📅 Nhập Năm *</h3>
                    <input 
                      type="number"
                      placeholder="VD: 1993, 2000, 2024..."
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      min="1800"
                      max="2100"
                      style={{width: '100%', padding: '1rem', border: '2px solid #dc3545', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', background: 'white'}}
                    />
                    <small style={{display: 'block', marginTop: '0.5rem', color: '#6c757d'}}>
                      💡 Nhập năm của ảnh này (VD: 1993, 2000...)
                    </small>
                  </div>
                )}

                {/* Bước 1: Chọn Tháng */}
                {selectedYear && (
                  <div style={{marginBottom: '2rem'}}>
                    <h3 style={{fontSize: '20px', marginBottom: '1rem', color: '#2c3e50'}}>🗓️ Bước 1: Chọn Tháng</h3>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setSelectedGalleryImage(null); // Reset ảnh khi đổi tháng
                      }}
                      style={{width: '100%', padding: '1rem', border: '2px solid #667eea', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', background: 'white'}}
                    >
                      <option value="">-- Chọn tháng để đăng ảnh --</option>
                    <option value="01">Tháng 1</option>
                    <option value="02">Tháng 2</option>
                    <option value="03">Tháng 3</option>
                    <option value="04">Tháng 4</option>
                    <option value="05">Tháng 5</option>
                    <option value="06">Tháng 6</option>
                    <option value="07">Tháng 7</option>
                    <option value="08">Tháng 8</option>
                    <option value="09">Tháng 9</option>
                    <option value="10">Tháng 10</option>
                    <option value="11">Tháng 11</option>
                    <option value="12">Tháng 12</option>
                  </select>
                  </div>
                )}

                {/* Bước 2: Upload Ảnh từ máy tính */}
                {selectedYear && selectedMonth && (
                  <div style={{marginBottom: '2rem'}}>
                    <h3 style={{fontSize: '20px', marginBottom: '1rem', color: '#2c3e50'}}>
                      📤 Bước 2: Chọn Ảnh từ máy tính
                    </h3>
                    
                    <div style={{background: '#f8f9fa', padding: '2rem', borderRadius: '12px', border: '2px dashed #667eea', textAlign: 'center'}}>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedGalleryImage({file: file, preview: URL.createObjectURL(file)});
                          }
                        }}
                        style={{display: 'none'}}
                        id="timeline-image-upload"
                      />
                      <label 
                        htmlFor="timeline-image-upload"
                        style={{
                          display: 'inline-block',
                          padding: '1rem 2rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '1.1rem',
                          transition: 'all 0.3s',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        📁 Chọn File Ảnh
                      </label>
                      
                      {selectedGalleryImage?.preview && (
                        <div style={{marginTop: '1.5rem'}}>
                          <img 
                            src={selectedGalleryImage.preview} 
                            alt="Preview"
                            style={{maxWidth: '300px', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'}}
                          />
                          <p style={{marginTop: '0.5rem', color: '#28a745', fontWeight: '600'}}>✓ Đã chọn: {selectedGalleryImage.file.name}</p>
                        </div>
                      )}
                      
                      {!selectedGalleryImage && (
                        <p style={{marginTop: '1rem', color: '#6c757d', fontSize: '0.95rem'}}>
                          Hỗ trợ: JPG, PNG, GIF, WEBP... (Tối đa 10MB)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Bước 3: Nhập thông tin sự kiện */}
                {selectedYear && selectedMonth && selectedGalleryImage?.file && (
                  <div style={{marginBottom: '2rem'}}>
                    <h3 style={{fontSize: '20px', marginBottom: '1rem', color: '#2c3e50'}}>📝 Bước 3: Nhập thông tin sự kiện</h3>
                    
                    {/* Hiển thị ảnh đã chọn */}
                    <div style={{background: '#e7f3ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'}}>
                      <p style={{margin: '0 0 0.5rem 0', fontWeight: '600', color: '#0056b3'}}>Ảnh đã chọn:</p>
                      <img 
                        src={selectedGalleryImage.preview}
                        alt="Preview"
                        style={{maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'}}
                      />
                      <p style={{margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6c757d'}}>{selectedGalleryImage.file.name}</p>
                    </div>

                    <div style={{marginBottom: '1.5rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'}}>
                        Tiêu đề sự kiện trong tháng {parseInt(selectedMonth)}/{selectedYear} *
                      </label>
                      <input 
                        type="text"
                        value={timelineForm.title}
                        onChange={(e) => setTimelineForm({...timelineForm, title: e.target.value})}
                        placeholder="VD: Khai trương chùa Bà, Lễ hội truyền thống..."
                        style={{
                          width: '100%', 
                          padding: '0.75rem', 
                          border: '2px solid #dee2e6', 
                          borderRadius: '8px', 
                          fontSize: '1rem'
                        }}
                        required
                      />
                      <small style={{color: '#6c757d', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block'}}>
                        💡 Đây là tiêu đề sự kiện lịch sử xảy ra trong tháng này
                      </small>
                    </div>

                    <div style={{marginBottom: '1.5rem'}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#495057'}}>
                        Mô tả sự kiện (tuỳ chọn)
                      </label>
                      <textarea 
                        value={timelineForm.description}
                        onChange={(e) => setTimelineForm({...timelineForm, description: e.target.value})}
                        placeholder="Nhập mô tả chi tiết về sự kiện xảy ra trong tháng này..."
                        rows="4"
                        style={{
                          width: '100%', 
                          padding: '0.75rem', 
                          border: '1px solid #dee2e6', 
                          borderRadius: '8px', 
                          fontSize: '1rem',
                          resize: 'vertical'
                        }}
                      />
                      <small style={{color: '#6c757d', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block'}}>
                        💡 Mô tả về sự kiện lịch sử diễn ra trong tháng {parseInt(selectedMonth)}/{selectedYear}
                      </small>
                    </div>

                    <button 
                      onClick={handleAttachToExisting}
                      style={{
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
                        color: 'white',
                        padding: '1rem 2.5rem',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)',
                        transition: 'all 0.3s ease',
                        width: '100%'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      ✅ Đăng Ảnh vào Tháng {parseInt(selectedMonth)}/{selectedYear}
                    </button>
                  </div>
                )}

                {selectedYear && selectedMonth && !selectedGalleryImage?.file && (
                  <div style={{background: '#f8f9fa', padding: '2rem', borderRadius: '12px', border: '2px dashed #dee2e6', textAlign: 'center', marginTop: '1rem'}}>
                    <p style={{fontSize: '1.1rem', color: '#6c757d', margin: 0}}>
                      👆 Vui lòng chọn file ảnh từ máy tính
                    </p>
                  </div>
                )}

                {selectedYear && !selectedMonth && (
                  <div style={{background: '#f8f9fa', padding: '2rem', borderRadius: '12px', border: '2px dashed #dee2e6', textAlign: 'center', marginTop: '1rem'}}>
                    <p style={{fontSize: '1.1rem', color: '#6c757d', margin: 0}}>
                      👆 Vui lòng chọn tháng ở trên trước
                    </p>
                  </div>
                )}
              </div>
            </div>
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
