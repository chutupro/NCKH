import React, { useState } from 'react';
import '../../Styles/Admin/ComparisonImageUpload.css';

const ComparisonImageUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    oldYear: '',
    newYear: '',
    category: 'kien-truc',
    oldImageFile: null,
    newImageFile: null,
  });

  const [oldImagePreview, setOldImagePreview] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    { value: 'kien-truc', label: '🏛️ Kiến trúc' },
    { value: 'van-hoa', label: '🎭 Văn hóa' },
    { value: 'du-lich', label: '✈️ Du lịch' },
    { value: 'thien-nhien', label: '🌳 Thiên nhiên' },
  ];

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
    if (!formData.title || !formData.location) {
      alert('Vui lòng điền đầy đủ tiêu đề và địa điểm!');
      return;
    }

    if (!formData.oldImageFile || !formData.newImageFile) {
      alert('Vui lòng chọn cả ảnh xưa và ảnh nay!');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('location', formData.location);
      uploadData.append('description', formData.description);
      uploadData.append('oldYear', formData.oldYear);
      uploadData.append('newYear', formData.newYear);
      uploadData.append('category', formData.category);
      uploadData.append('oldImage', formData.oldImageFile);
      uploadData.append('newImage', formData.newImageFile);

      // TODO: Replace with actual API endpoint
      // const response = await axios.post('http://localhost:3000/image-comparisons/upload', uploadData);

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Upload thành công!');
      
      // Reset form
      setFormData({
        title: '',
        location: '',
        description: '',
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
      alert('Upload thất bại! Vui lòng thử lại.');
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
            <label htmlFor="title">
              Tiêu đề <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: Cầu Rồng Đà Nẵng"
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

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả về sự thay đổi..."
              rows="4"
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
              <label htmlFor="oldYear">Năm (Ảnh xưa)</label>
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
              <label htmlFor="newYear">Năm (Ảnh nay)</label>
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
          <h2>🖼️ Upload Ảnh</h2>
          
          <div className="images-grid">
            {/* Old Image */}
            <div className="image-upload-box">
              <h3>📷 Ảnh Xưa</h3>
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
                  >
                    ✕
                  </button>
                  <div className="image-info">
                    {formData.oldImageFile?.name}
                  </div>
                </div>
              )}
            </div>

            {/* New Image */}
            <div className="image-upload-box">
              <h3>📷 Ảnh Nay</h3>
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
                  >
                    ✕
                  </button>
                  <div className="image-info">
                    {formData.newImageFile?.name}
                  </div>
                </div>
              )}
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
