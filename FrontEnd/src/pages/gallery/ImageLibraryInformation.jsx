import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// compareList removed: not used in collection detail
import { getCollectionById } from '../../API/collections';
import '../../Styles/ImageLibrary/ImageLibraryInformation.css';
// displayCategoryName removed; using category from collection response

const ImageLibraryInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // i18n removed: dùng chuỗi tiếng Việt trực tiếp
  const collectionId = Number(id);
  const [collection, setCollection] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const c = await getCollectionById(collectionId);
        if (mounted) setCollection(c);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [collectionId]);

  if (loading) return <div className="lib-info-container"><div className="loading">Đang tải...</div></div>;
  if (error) return <div className="lib-info-container"><div className="error">Lỗi: {error}</div></div>;
  if (!collection) return (
    <div className="lib-info-container">
      <div className="not-found">
        <h2>{'Bộ sưu tập không tìm thấy'}</h2>
        <Link to="/ImageLibrary" className="back-btn">← {'Quay lại thư viện'}</Link>
      </div>
    </div>
  );

  const mainImage = collection.ImagePath || collection.image || '';
  const relatedCompares = [];

  return (
    <div className="lib-info-container">
      <div className="lib-info-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <span>←</span> {'Quay lại'}
        </button>
        <div className="breadcrumb">
          <Link to="/">{'Trang chủ'}</Link>
          <span>/</span>
          <Link to="/ImageLibrary">{'Thư viện ảnh'}</Link>
          <span>/</span>
          <span>{collection.Title || collection.Name || `#${collection.CollectionID || collection.id}`}</span>
        </div>
      </div>

      <div className="lib-info-hero">
        <div className="hero-image" style={{ backgroundImage: `url(${mainImage})` }}>
          <div className="hero-overlay">
            <span className="hero-category">{collection.Category?.Name || (`ID:${collection.CategoryID ?? collection.CategoryId ?? ''}`)}</span>
          </div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">{collection.Title || collection.Name}</h1>
          <div className="hero-meta">
            <span className="meta-item">📅 {'Năm'} {collection.CreatedAt ? new Date(collection.CreatedAt).getFullYear() : ''}</span>
            {/* Likes removed per request */}
          </div>
          <p className="hero-description">{collection.Description || collection.description || collection.Content}</p>
        </div>
      </div>

      {relatedCompares.length > 0 && (
        <div className="related-section">
          <h2 className="section-title">{'Ảnh Xưa và Nay'}</h2>
          <p className="section-subtitle">{'Khám phá sự thay đổi qua thời gian'}</p>
          <div className="compare-grid">
            {relatedCompares.map(compare => (
              <div
                key={compare.ComparisonID ?? compare.id}
                className="compare-item"
                onClick={() => navigate(`/compare/${compare.id ?? compare.ComparisonID}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/compare/${compare.id ?? compare.ComparisonID}`); }}
              >
                <div className="compare-images">
                  <div className="compare-old">
                    <img src={compare.oldSrc} alt={`${compare.title} - ${'xưa'}`} />
                    <div className="compare-label old-label">{'XƯA'} ({compare.yearOld})</div>
                  </div>
                  <div className="compare-divider">→</div>
                  <div className="compare-new">
                    <img src={compare.newSrc} alt={`${compare.title} - ${'nay'}`} />
                    <div className="compare-label new-label">{'NAY'} ({compare.yearNew})</div>
                  </div>
                </div>
                <div className="compare-info">
                  <h3 className="compare-title">{compare.title}</h3>
                  <p className="compare-description">{compare.description}</p>
                  <div className="compare-stats">
                    <span>📍 {compare.location}</span>
                    {/* Likes removed per request */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cta-section">
  <h3>{'Khám phá thêm'}</h3>
        <div className="cta-buttons">
          <Link to="/ImageLibrary" className="cta-btn primary">{'Xem thêm bài viết'}</Link>
          <Link to="/compare" className="cta-btn secondary">{'So sánh xưa - nay'}</Link>
        </div>
      </div>
    </div>
  );
};

export default ImageLibraryInformation;
