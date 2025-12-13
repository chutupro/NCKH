import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

/**
 * Modal chọn ảnh từ thư viện cho admin quản lý địa điểm
 * Admin quản lý địa điểm KHÔNG upload ảnh mà chỉ chọn ảnh có sẵn
 */
const ImageSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories] = useState([
    { slug: '', name: 'Tất cả' },
    { slug: 'van-hoa', name: 'Văn hóa' },
    { slug: 'thien-nhien', name: 'Thiên nhiên' },
    { slug: 'di-san', name: 'Di sản' },
    { slug: 'su-kien', name: 'Sự kiện' },
    { slug: 'kien-truc', name: 'Kiến trúc' },
    { slug: 'du-lich', name: 'Du lịch' },
  ]);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, selectedCategory, page]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const res = await axios.get(`${BASE_URL}/location-images/available-images?${params}`);
      setImages(res.data.images || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải danh sách ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (image) => {
    onSelect(image);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
              🖼️ Chọn ảnh từ thư viện
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
              Chọn ảnh có sẵn để gắn vào địa điểm
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          >
            ✕
          </button>
        </div>

        {/* Filter */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            background: '#f9fafb',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setPage(1);
              }}
              style={{
                padding: '8px 16px',
                border: selectedCategory === cat.slug ? '2px solid #667eea' : '1px solid #d1d5db',
                borderRadius: '8px',
                background: selectedCategory === cat.slug ? '#667eea' : 'white',
                color: selectedCategory === cat.slug ? 'white' : '#374151',
                fontWeight: selectedCategory === cat.slug ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Đang tải ảnh...
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Không có ảnh nào
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {images.map((img) => (
                <div
                  key={img.ImageID}
                  onClick={() => handleSelectImage(img)}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '2px solid transparent',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102,126,234,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      background: '#f3f4f6',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={img.FilePath}
                      alt={img.AltText || 'Ảnh'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '12px', background: 'white' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {img.AltText || `Ảnh #${img.ImageID}`}
                    </p>
                    {img.category && (
                      <p
                        style={{
                          margin: '4px 0 0',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        {img.category.Name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              background: '#f9fafb',
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: page === 1 ? '#f3f4f6' : 'white',
                color: page === 1 ? '#9ca3af' : '#374151',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}
            >
              ← Trước
            </button>
            <span
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                color: '#374151',
                fontWeight: 500,
              }}
            >
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: page === totalPages ? '#f3f4f6' : 'white',
                color: page === totalPages ? '#9ca3af' : '#374151',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSelectionModal;
