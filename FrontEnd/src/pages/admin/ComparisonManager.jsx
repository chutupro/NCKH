import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Admin/ComparisonManager.css';

const ComparisonManager = () => {
  const [comparisons, setComparisons] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [showComparisonForm, setShowComparisonForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const [editingComparison, setEditingComparison] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0); // 0 = All
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  // Form states
  const [comparisonForm, setComparisonForm] = useState({
    Title: '',
    Description: '',
    CategoryID: 1,
    Address: '',
  });

  const [imageForm, setImageForm] = useState({
    ImagePath: '',
    Year: '',
    Caption: '',
    DisplayOrder: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
    { id: 1, name: 'Kiến trúc' },
    { id: 2, name: 'Văn hóa' },
    { id: 3, name: 'Du lịch' },
    { id: 4, name: 'Thiên nhiên' },
  ];

  useEffect(() => {
    fetchComparisons();
  }, []);

  // Filter comparisons based on search and category
  const filteredComparisons = comparisons.filter((comp) => {
    const matchSearch = searchText.trim() === '' || 
      comp.Title.toLowerCase().includes(searchText.toLowerCase()) ||
      (comp.Description && comp.Description.toLowerCase().includes(searchText.toLowerCase())) ||
      (comp.Address && comp.Address.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchCategory = selectedCategory === 0 || comp.CategoryID === selectedCategory;
    
    return matchSearch && matchCategory;
  });

  const fetchComparisons = async () => {
    try {
      const response = await axios.get('http://localhost:3000/imagecomparisons');
      setComparisons(response.data);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
      alert('Lỗi khi tải danh sách so sánh');
    }
  };

  const fetchComparisonDetail = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/imagecomparisons/${id}`);
      setSelectedComparison(response.data);
    } catch (error) {
      console.error('Error fetching comparison detail:', error);
      alert('Lỗi khi tải chi tiết so sánh');
    }
  };

  // ========== COMPARISON CRUD ==========
  const handleCreateComparison = () => {
    setEditingComparison(null);
    setComparisonForm({ Title: '', Description: '', CategoryID: 1, Address: '' });
    setShowComparisonForm(true);
  };

  const handleEditComparison = (comparison) => {
    setEditingComparison(comparison);
    setComparisonForm({
      Title: comparison.Title,
      Description: comparison.Description,
      CategoryID: comparison.CategoryID,
      Address: comparison.Location,
    });
    setShowComparisonForm(true);
  };

  const handleSaveComparison = async (e) => {
    e.preventDefault();
    try {
      if (editingComparison) {
        // Update
        await axios.put(
          `http://localhost:3000/imagecomparisons/${editingComparison.ComparisonID}`,
          comparisonForm
        );
        alert('Cập nhật thành công!');
      } else {
        // Create
        await axios.post('http://localhost:3000/imagecomparisons', comparisonForm);
        alert('Tạo mới thành công!');
      }
      setShowComparisonForm(false);
      fetchComparisons();
      if (selectedComparison) {
        fetchComparisonDetail(selectedComparison.ComparisonID);
      }
    } catch (error) {
      console.error('Error saving comparison:', error);
      alert('Lỗi khi lưu so sánh');
    }
  };

  const handleDeleteComparison = async (id) => {
    if (!window.confirm('Xóa so sánh này? Tất cả ảnh liên quan cũng sẽ bị xóa.')) return;
    try {
      await axios.delete(`http://localhost:3000/imagecomparisons/${id}`);
      alert('Xóa thành công!');
      fetchComparisons();
      if (selectedComparison?.ComparisonID === id) {
        setSelectedComparison(null);
      }
    } catch (error) {
      console.error('Error deleting comparison:', error);
      alert('Lỗi khi xóa so sánh');
    }
  };

  // ========== IMAGE CRUD ==========
  const handleCreateImage = () => {
    if (!selectedComparison) {
      alert('Vui lòng chọn một so sánh trước');
      return;
    }
    setEditingImage(null);
    setImageForm({ ImagePath: '', Year: '', Caption: '' });
    setImageFile(null);
    setImagePreview('');
    setShowImageForm(true);
  };

  const handleEditImage = (image) => {
    setEditingImage(image);
    setImageForm({
      ImagePath: image.src,
      Year: image.year,
      Caption: image.caption,
    });
    setImagePreview(image.src);
    setShowImageForm(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async (e) => {
    e.preventDefault();
    try {
      let imagePath = imageForm.ImagePath;

      // Upload file nếu có
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('type', 'post');
        formData.append('category', 'van-hoa'); // Category phải là một trong: van-hoa, du-lich, thien-nhien, kien-truc
        const uploadResponse = await axios.post('http://localhost:3000/upload', formData); // 👈 Gọi backend
        imagePath = uploadResponse.data.filePath || uploadResponse.data.url;
      }

      // Validate: phải có ImagePath
      if (!imagePath || imagePath.trim() === '') {
        alert('Vui lòng upload ảnh!');
        return;
      }

      // Tính DisplayOrder tự động: nếu create thì lấy max + 1, nếu edit thì giữ nguyên
      let displayOrder = editingImage ? editingImage.displayOrder : 0;
      if (!editingImage && selectedComparison.images) {
        const maxOrder = Math.max(...selectedComparison.images.map(img => img.displayOrder || 0), -1);
        displayOrder = maxOrder + 1;
      }

      const imageData = {
        ComparisonID: selectedComparison.ComparisonID,
        ImagePath: imagePath,
        Year: parseInt(imageForm.Year),
        Caption: imageForm.Caption,
        DisplayOrder: displayOrder,
      };

      if (editingImage) {
        // Update
        await axios.put(
          `http://localhost:3000/imagecomparisons/${selectedComparison.ComparisonID}/images/${editingImage.ImageID}`,
          imageData
        );
        alert('Cập nhật ảnh thành công!');
      } else {
        // Create
        await axios.post(
          `http://localhost:3000/imagecomparisons/${selectedComparison.ComparisonID}/images`,
          imageData
        );
        alert('Thêm ảnh thành công!');
      }

      setShowImageForm(false);
      fetchComparisonDetail(selectedComparison.ComparisonID);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Lỗi khi lưu ảnh');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Xóa ảnh này?')) return;
    try {
      await axios.delete(
        `http://localhost:3000/imagecomparisons/${selectedComparison.ComparisonID}/images/${imageId}`
      );
      alert('Xóa ảnh thành công!');
      fetchComparisonDetail(selectedComparison.ComparisonID);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Lỗi khi xóa ảnh');
    }
  };

  return (
    <div className="comparison-manager">
      <div className="cm-header">
        <h1>Quản lý So sánh Xưa - Nay</h1>
        <button className="btn-primary" onClick={handleCreateComparison}>
          + Tạo So sánh Mới
        </button>
      </div>

      <div className="cm-content">
        {/* LEFT: Danh sách Comparisons */}
        <div className="cm-list">
          <h2>Danh sách So sánh ({filteredComparisons.length}/{comparisons.length})</h2>
          
          {/* Search and Filter */}
          <div className="cm-filters">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mô tả, địa chỉ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
              className="category-filter"
            >
              <option value={0}>Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="cm-items">
            {filteredComparisons.length === 0 ? (
              <div className="cm-empty">
                <p>Không tìm thấy so sánh nào</p>
              </div>
            ) : (
              filteredComparisons.map((comp) => (
              <div
                key={comp.ComparisonID}
                className={`cm-item ${selectedComparison?.ComparisonID === comp.ComparisonID ? 'active' : ''}`}
                onClick={() => fetchComparisonDetail(comp.ComparisonID)}
              >
                <div className="cm-item-header">
                  <h3>{comp.Title}</h3>
                  <div className="cm-item-actions">
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditComparison(comp);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComparison(comp.ComparisonID);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="cm-item-location">📍 {comp.Location}</p>
                <div className="cm-item-preview">
                  {comp.firstImage && <img src={comp.firstImage.src} alt="First" />}
                  {comp.lastImage && <img src={comp.lastImage.src} alt="Last" />}
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* RIGHT: Chi tiết + Quản lý Images */}
        <div className="cm-detail">
          {selectedComparison ? (
            <>
              <div className="cm-detail-header">
                <h2>{selectedComparison.Title}</h2>
                <button className="btn-primary" onClick={handleCreateImage}>
                  + Thêm Ảnh
                </button>
              </div>
              <p className="cm-detail-desc">{selectedComparison.Description}</p>
              <p className="cm-detail-location">📍 {selectedComparison.Location}</p>

              <div className="cm-images">
                <div className="cm-images-header">
                  <h3>Danh sách Ảnh ({selectedComparison.images?.length || 0})</h3>
                  <div className="year-filter">
                    <input
                      type="number"
                      placeholder="Từ năm"
                      value={yearFrom}
                      onChange={(e) => setYearFrom(e.target.value)}
                      className="year-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Đến năm"
                      value={yearTo}
                      onChange={(e) => setYearTo(e.target.value)}
                      className="year-input"
                    />
                    {(yearFrom || yearTo) && (
                      <button
                        type="button"
                        onClick={() => { setYearFrom(''); setYearTo(''); }}
                        className="btn-clear"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
                <div className="cm-image-grid">
                  {selectedComparison.images?.filter((img) => {
                    const year = img.year;
                    if (yearFrom && year < parseInt(yearFrom)) return false;
                    if (yearTo && year > parseInt(yearTo)) return false;
                    return true;
                  }).map((img) => (
                    <div key={img.ImageID} className="cm-image-card">
                      <img src={img.src} alt={img.caption} />
                      <div className="cm-image-info">
                        <div className="cm-image-year">{img.year}</div>
                        <p className="cm-image-caption">{img.caption}</p>
                        <div className="cm-image-actions">
                          <button className="btn-edit" onClick={() => handleEditImage(img)}>
                            ✏️ Sửa
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteImage(img.ImageID)}>
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="cm-empty">
              <p>👈 Chọn một so sánh để quản lý ảnh</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Comparison Form */}
      {showComparisonForm && (
        <div className="cm-modal" onClick={() => setShowComparisonForm(false)}>
          <div className="cm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingComparison ? 'Sửa So sánh' : 'Tạo So sánh Mới'}</h2>
            <form onSubmit={handleSaveComparison}>
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={comparisonForm.Title}
                  onChange={(e) => setComparisonForm({ ...comparisonForm, Title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={comparisonForm.Description}
                  onChange={(e) => setComparisonForm({ ...comparisonForm, Description: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  value={comparisonForm.CategoryID}
                  onChange={(e) => setComparisonForm({ ...comparisonForm, CategoryID: parseInt(e.target.value) })}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={comparisonForm.Address}
                  onChange={(e) => setComparisonForm({ ...comparisonForm, Address: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowComparisonForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingComparison ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Image Form */}
      {showImageForm && (
        <div className="cm-modal" onClick={() => setShowImageForm(false)}>
          <div className="cm-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingImage ? 'Sửa Ảnh' : 'Thêm Ảnh Mới'}</h2>
            <form onSubmit={handleSaveImage}>
              <div className="form-group">
                <label>Upload Ảnh</label>
                <input type="file" accept="image/*" onChange={handleImageFileChange} />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Năm *</label>
                <input
                  type="number"
                  value={imageForm.Year}
                  onChange={(e) => setImageForm({ ...imageForm, Year: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả *</label>
                <textarea
                  value={imageForm.Caption}
                  onChange={(e) => setImageForm({ ...imageForm, Caption: e.target.value })}
                  rows="3"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowImageForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingImage ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonManager;
