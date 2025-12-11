import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/Admin/GalleryManagement.css';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form state
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: '',
    categoryId: 1, // Default: Di sản
    collectionId: '', // Bộ sưu tập (tùy chọn)
  });
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
    fetchCategories();
    fetchCollections();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/gallery');
      setImages(response.data?.data || []);
      console.log('[Gallery] Fetched images:', response.data?.data?.length);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Không thể tải danh sách ảnh');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/categories');
      setCategories(response.data || []);
      console.log('[Gallery] Fetched categories:', response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/collections');
      setCollections(response.data || []);
      console.log('[Gallery] Fetched collections:', response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    if (!uploadForm.title) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('categoryId', uploadForm.categoryId);
      if (uploadForm.collectionId) {
        formData.append('collectionId', uploadForm.collectionId);
      }

      const response = await axios.post('http://localhost:3000/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[Gallery Upload] Success:', response.data);
      alert('Upload ảnh thành công!');
      
      // Reset form
      setUploadForm({ file: null, title: '', categoryId: 1, collectionId: '' });
      setPreviewUrl('');
      setShowUploadModal(false);
      
      // Refresh danh sách
      fetchImages();
    } catch (error) {
      console.error('[Gallery Upload] Error:', error);
      alert(`Lỗi upload: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      await axios.delete(`http://localhost:3000/gallery/${imageId}`);
      alert('Xóa ảnh thành công!');
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(`Lỗi xóa ảnh: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="gallery-management">
      <div className="gallery-header">
        <h1>📚 Quản lý Thư viện Ảnh</h1>
        <button 
          className="btn-upload" 
          onClick={() => setShowUploadModal(true)}
        >
          + Upload Ảnh Mới
        </button>
      </div>

      {/* Statistics */}
      <div className="gallery-stats">
        <div className="stat-card">
          <h3>{images.length}</h3>
          <p>Tổng số ảnh</p>
        </div>
        {categories.map((cat) => {
          const count = images.filter(img => img.CategoryID === cat.CategoryID).length;
          return (
            <div key={cat.CategoryID} className="stat-card">
              <h3>{count}</h3>
              <p>{cat.Name}</p>
            </div>
          );
        })}
      </div>

      {/* Image Grid */}
      <div className="gallery-grid">
        {images.map((image) => {
          const category = categories.find(c => c.CategoryID === image.CategoryID);
          
          return (
            <div key={image.ImageID} className="gallery-item">
              <div className="image-wrapper">
                <img 
                  src={`http://localhost:3001/${image.FilePath}`}
                  alt={image.AltText || 'Gallery image'}
                  loading="lazy"
                />
                <div className="image-overlay">
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(image.ImageID)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
              <div className="image-info">
                <h4>{image.AltText || `Ảnh #${image.ImageID}`}</h4>
                <span className="category-badge">
                  {category?.Name || 'Khác'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {images.length === 0 && (
        <div className="no-data">
          <p>Chưa có ảnh nào trong thư viện</p>
          <button onClick={() => setShowUploadModal(true)}>
            Upload ảnh đầu tiên
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Ảnh Mới</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label>Chọn ảnh *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  required
                  disabled={uploading}
                />
                {previewUrl && (
                  <div className="preview-box">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề cho ảnh..."
                  required
                  disabled={uploading}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  value={uploadForm.categoryId}
                  onChange={(e) => setUploadForm({ ...uploadForm, categoryId: parseInt(e.target.value) })}
                  required
                  disabled={uploading}
                >
                  {categories.map((cat) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>
                      {cat.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bộ sưu tập (tùy chọn)</label>
                <select
                  value={uploadForm.collectionId}
                  onChange={(e) => setUploadForm({ ...uploadForm, collectionId: e.target.value })}
                  disabled={uploading}
                >
                  <option value="">-- Không chọn bộ sưu tập --</option>
                  {collections.map((col) => (
                    <option key={col.CollectionID} value={col.CollectionID}>
                      {col.Title || col.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={uploading}
                >
                  {uploading ? '⏳ Đang upload...' : '✓ Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
