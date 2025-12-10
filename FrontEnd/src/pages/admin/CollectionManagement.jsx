import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import { toast } from 'react-toastify';
import { getCollections, getCategories } from '../../API/collections';
import { apiClient } from '../../services/api';
import '../../Styles/Admin/AdminDashboard.css';

const CollectionManagement = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    CategoryID: '',
    imagePath: '',
    imageDescription: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // ⛔ Moderator không được xem trang này
    const isModerator = user?.role === 'Moderator' || user?.Role === 'Moderator';
    if (isModerator) {
      navigate('/admin/contributions', { replace: true });
      return;
    }

    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    filterCollections();
  }, [collections, searchTerm, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [collectionsData, categoriesData] = await Promise.all([
        getCollections(),
        getCategories(),
      ]);
      setCollections(collectionsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('❌ Không thể tải dữ liệu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterCollections = () => {
    let filtered = collections;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (col) =>
          col.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          col.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          col.Description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (col) => col.CategoryID === parseInt(selectedCategory)
      );
    }

    setFilteredCollections(filtered);
  };

  const handleOpenModal = (collection = null) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.Name || '',
        title: collection.Title || '',
        description: collection.Description || '',
        CategoryID: collection.CategoryID || '',
        imagePath: collection.ImagePath || '',
        imageDescription: collection.ImageDescription || '',
      });
      setPreviewImage(collection.ImagePath || null);
    } else {
      setEditingCollection(null);
      setFormData({
        name: '',
        title: '',
        description: '',
        CategoryID: '',
        imagePath: '',
        imageDescription: '',
      });
      setPreviewImage(null);
    }
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCollection(null);
    setFormData({
      name: '',
      title: '',
      description: '',
      CategoryID: '',
      imagePath: '',
      imageDescription: '',
    });
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('❌ Vui lòng nhập tên bộ sưu tập');
      return;
    }

    if (!formData.CategoryID) {
      toast.error('❌ Vui lòng chọn danh mục');
      return;
    }

    try {
      let imagePath = formData.imagePath;

      // Upload image if selected
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedImage);
        imageFormData.append('type', 'post');
        imageFormData.append('category', 'van-hoa');

        // Get token from cookie
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };

        const token = getCookie('access_token') || 'dummy-token-for-testing';

        try {
          const uploadResponse = await fetch('http://localhost:3000/upload', { // 👈 Gọi backend
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: imageFormData,
          });
          
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            imagePath = uploadData.url || uploadData.path;
            toast.success('✅ Đã tải ảnh lên');
          } else {
            const errorData = await uploadResponse.json().catch(() => ({}));
            console.error('Upload failed:', errorData);
            toast.warning('⚠️ Không thể tải ảnh lên: ' + (errorData.message || 'Lỗi không xác định'));
            imagePath = '';
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.warning('⚠️ Media service không khả dụng, tiếp tục tạo bộ sưu tập không có ảnh');
          imagePath = '';
        }
      }

      const payload = {
        Name: formData.name,
        Title: formData.title || null,
        Description: formData.description || null,
        CategoryID: formData.CategoryID ? parseInt(formData.CategoryID) : null,
        ImagePath: imagePath || null,
        ImageDescription: formData.imageDescription || null,
      };

      if (editingCollection) {
        // Update
        await apiClient.put(
          `/collections/${editingCollection.CollectionID}`,
          payload
        );
        toast.success('✅ Đã cập nhật bộ sưu tập');
      } else {
        // Create
        await apiClient.post('/collections', payload);
        toast.success('✅ Đã tạo bộ sưu tập mới');
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(
        `❌ ${editingCollection ? 'Cập nhật' : 'Tạo'} bộ sưu tập thất bại`
      );
      console.error(error);
    }
  };

  const handleDelete = async (collectionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bộ sưu tập này?')) return;

    try {
      await apiClient.delete(`/collections/${collectionId}`);
      toast.success('✅ Đã xóa bộ sưu tập');
      fetchData();
    } catch (error) {
      toast.error('❌ Không thể xóa bộ sưu tập');
      console.error(error);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.CategoryID === categoryId);
    return category?.Name || 'N/A';
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
          📚 Quản lý bộ sưu tập
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Tạo và quản lý các bộ sưu tập bài viết theo danh mục
        </p>
      </div>

      {/* Header Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon primary">📚</div>
          </div>
          <div className="stats-card-title">Tổng bộ sưu tập</div>
          <div className="stats-card-value">{collections.length}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon success">📁</div>
          </div>
          <div className="stats-card-title">Danh mục</div>
          <div className="stats-card-value">{categories.length}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon warning">🔍</div>
          </div>
          <div className="stats-card-title">Kết quả lọc</div>
          <div className="stats-card-value">{filteredCollections.length}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="data-table-container" style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="🔍 Tìm kiếm bộ sưu tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1 1 300px',
              padding: '0.75rem 1rem',
              border: '1px solid var(--admin-border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--admin-border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              minWidth: '200px',
            }}
          >
            <option value="all">📁 Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.CategoryID} value={cat.CategoryID}>
                {cat.Name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
            style={{ marginLeft: 'auto' }}
          >
            ➕ Tạo bộ sưu tập
          </button>
        </div>
      </div>

      {/* Collections Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h2 className="table-title">Danh sách bộ sưu tập</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <div style={{ marginTop: '1rem', color: '#6b7280' }}>
              Đang tải...
            </div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            📭 Không tìm thấy bộ sưu tập nào
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>Danh mục</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection.CollectionID}>
                  <td>{collection.CollectionID}</td>
                  <td>
                    <strong style={{ color: '#1f2937', fontSize: '0.875rem' }}>
                      {collection.Name}
                    </strong>
                  </td>
                  <td>
                    <div style={{ color: '#374151', fontSize: '0.875rem' }}>
                      {collection.Title || '-'}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                      }}
                    >
                      {collection.Description || 'Chưa có mô tả'}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        background: '#f3f4f6',
                        color: '#1f2937',
                        fontWeight: '500',
                      }}
                    >
                      {getCategoryName(collection.CategoryID)}
                    </span>
                  </td>
                  <td>
                    {collection.CreatedAt
                      ? new Date(collection.CreatedAt).toLocaleDateString(
                          'vi-VN'
                        )
                      : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenModal(collection)}
                        title="Chỉnh sửa"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(collection.CollectionID)}
                        title="Xóa"
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              // Ensure modal content can scroll when viewport is small
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              {editingCollection ? '✏️ Chỉnh sửa bộ sưu tập' : '➕ Tạo bộ sưu tập mới'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Tên bộ sưu tập *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên bộ sưu tập (slug)"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Tiêu đề
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề hiển thị"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả (tùy chọn)"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Ảnh bộ sưu tập
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                />
                {previewImage && (
                  <div style={{ marginTop: '1rem' }}>
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Mô tả ảnh
                </label>
                <input
                  type="text"
                  name="imageDescription"
                  value={formData.imageDescription}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả ảnh (alt text)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151',
                  }}
                >
                  Danh mục *
                </label>
                <select
                  name="CategoryID"
                  value={formData.CategoryID}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>
                      {cat.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCollection ? '💾 Cập nhật' : '➕ Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionManagement;
