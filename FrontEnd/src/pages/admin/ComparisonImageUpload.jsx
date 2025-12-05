import React, { useState, useEffect } from 'react';
import { getCollections } from '../../API/collections';
import '../../Styles/Admin/ComparisonImageUpload.css';

const ComparisonImageUpload = () => {
  const [formData, setFormData] = useState({
    collectionName: '',
    title: '',
    location: '',
    oldImageDescription: '',
    newImageDescription: '',
    oldYear: '',
    newYear: '',
    category: 'kien-truc',
    oldImageFile: null,
    newImageFile: null,
  });

  const [collections, setCollections] = useState([]);
  const [oldImagePreview, setOldImagePreview] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { value: 'kien-truc', label: '🏛️ Kiến trúc' },
    { value: 'van-hoa', label: '🎭 Văn hóa' },
    { value: 'du-lich', label: '✈️ Du lịch' },
    { value: 'thien-nhien', label: '🌳 Thiên nhiên' },
  ];

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      if (type === 'old') {
        setFormData(prev => ({ ...prev, oldImageFile: file }));
        setOldImagePreview(URL.createObjectURL(file));
      } else {
        setFormData(prev => ({ ...prev, newImageFile: file }));
        setNewImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'old') {
      setFormData(prev => ({ ...prev, oldImageFile: null }));
      setOldImagePreview(null);
    } else {
      setFormData(prev => ({ ...prev, newImageFile: null }));
      setNewImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.collectionName || !formData.title || !formData.location) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    if (!formData.oldImageFile || !formData.newImageFile) {
      alert('Vui lòng chọn cả ảnh xưa và ảnh nay!');
      return;
    }

    if (!formData.oldImageDescription || !formData.newImageDescription) {
      alert('Vui lòng điền mô tả cho cả hai ảnh!');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for upload
      const uploadData = new FormData();
      uploadData.append('collectionName', formData.collectionName);
      uploadData.append('title', formData.title);
      uploadData.append('location', formData.location);
      uploadData.append('oldImageDescription', formData.oldImageDescription);
      uploadData.append('newImageDescription', formData.newImageDescription);
      uploadData.append('oldYear', formData.oldYear);
      uploadData.append('newYear', formData.newYear);
      uploadData.append('category', formData.category);
      uploadData.append('oldImage', formData.oldImageFile);
      uploadData.append('newImage', formData.newImageFile);

      // TODO: Replace with actual API endpoint
      // const response = await axios.post('http://localhost:3000/image-comparisons/upload', uploadData);

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('✅ Upload thành công!');
      
      // Reset form
      setFormData({
        collectionName: '',
        title: '',
        location: '',
        oldImageDescription: '',
        newImageDescription: '',
        oldYear: '',
        newYear: '',
        category: 'kien-truc',
        oldImageFile: null,
        newImageFile: null,
      });
      setOldImagePreview(null);
      setNewImagePreview(null);

    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload thất bại! Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="comparison-upload-container">
      <div className="upload-header">
        <h1>📸 Upload Ảnh So Sánh Xưa - Nay</h1>
        <p>Thêm cặp ảnh so sánh để hiển thị sự thay đổi qua thời gian</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>📝 Thông tin cơ bản</h2>
          
          <div className="form-group">
            <label htmlFor="collectionName">
              Tên bộ sưu tập <span className="required">*</span>
            </label>
            <input
              type="text"
              id="collectionName"
              name="collectionName"
              value={formData.collectionName}
              onChange={handleInputChange}
              placeholder="VD: Cầu Rồng qua các thời kỳ"
              required
              list="collections-list"
            />
            <datalist id="collections-list">
              {collections.map(col => (
                <option key={col.collection_id} value={col.name} />
              ))}
            </datalist>
            <small className="form-hint">Nhập tên mới hoặc chọn từ danh sách có sẵn</small>
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Tiêu đề so sánh <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: Cầu Rồng - Sự thay đổi sau 10 năm"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Địa điểm <span className="required">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="VD: Đà Nẵng, Việt Nam"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="oldYear">Năm chụp (Ảnh xưa)</label>
              <input
                type="text"
                id="oldYear"
                name="oldYear"
                value={formData.oldYear}
                onChange={handleInputChange}
                placeholder="VD: 1990"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newYear">Năm chụp (Ảnh nay)</label>
              <input
                type="text"
                id="newYear"
                name="newYear"
                value={formData.newYear}
                onChange={handleInputChange}
                placeholder="VD: 2024"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="form-section">
          <h2>🖼️ Upload và Mô tả Ảnh</h2>
          
          <div className="images-grid">
            {/* Old Image */}
            <div className="image-upload-box">
              <div className="image-header">
                <h3>📷 Ảnh Xưa</h3>
                {formData.oldYear && <span className="year-badge">{formData.oldYear}</span>}
              </div>
              
              {!oldImagePreview ? (
                <label className="upload-area" htmlFor="oldImage">
                  <div className="upload-placeholder">
                    <div className="upload-icon">📁</div>
                    <p>Click để chọn ảnh xưa</p>
                    <span className="upload-hint">JPG, PNG, GIF (tối đa 5MB)</span>
                  </div>
                  <input
                    type="file"
                    id="oldImage"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'old')}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div className="image-preview">
                  <img src={oldImagePreview} alt="Old preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage('old')}
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                  <div className="image-info">
                    {formData.oldImageFile?.name}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="oldImageDescription">
                  Mô tả ảnh xưa <span className="required">*</span>
                </label>
                <textarea
                  id="oldImageDescription"
                  name="oldImageDescription"
                  value={formData.oldImageDescription}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về ảnh xưa, bối cảnh lịch sử..."
                  rows="4"
                  required
                />
              </div>
            </div>

            {/* New Image */}
            <div className="image-upload-box">
              <div className="image-header">
                <h3>📷 Ảnh Nay</h3>
                {formData.newYear && <span className="year-badge year-badge-new">{formData.newYear}</span>}
              </div>
              
              {!newImagePreview ? (
                <label className="upload-area" htmlFor="newImage">
                  <div className="upload-placeholder">
                    <div className="upload-icon">📁</div>
                    <p>Click để chọn ảnh nay</p>
                    <span className="upload-hint">JPG, PNG, GIF (tối đa 5MB)</span>
                  </div>
                  <input
                    type="file"
                    id="newImage"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'new')}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div className="image-preview">
                  <img src={newImagePreview} alt="New preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage('new')}
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                  <div className="image-info">
                    {formData.newImageFile?.name}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="newImageDescription">
                  Mô tả ảnh nay <span className="required">*</span>
                </label>
                <textarea
                  id="newImageDescription"
                  name="newImageDescription"
                  value={formData.newImageDescription}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về ảnh hiện tại, sự thay đổi..."
                  rows="4"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner"></span>
                Đang upload...
              </>
            ) : (
              <>
                <span>✓</span>
                Upload ảnh so sánh
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComparisonImageUpload;
