import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// compareList removed: not used in collection detail
import { getCollectionById } from '../../API/collections';
import { getImageComparisons } from '../../API/imageComparisons';
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
  const [relatedCompares, setRelatedCompares] = React.useState([]);

  // Format a year for display from different possible fields safely
  const formatYear = (item) => {
    if (!item) return '';
    const parse = (val) => {
      if (val == null || val === '') return null;
      if (typeof val === 'number' && Number.isFinite(val)) {
        return String(val).length === 4 ? val : new Date(val).getFullYear();
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (/^\d{4}$/.test(trimmed)) return Number(trimmed);
        const asNum = Number(trimmed);
        if (!Number.isNaN(asNum) && String(asNum).length === 4) return asNum;
        const d = new Date(trimmed);
        if (!isNaN(d)) return d.getFullYear();
      }
      return null;
    };

    return (parse(item.Year) ?? parse(item.year) ?? parse(item.CreatedAt) ?? parse(item.createdAt) ?? '') || '';
  };

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

  // Fetch comparisons and compute related items when collection loads
  React.useEffect(() => {
    if (!collection) return;
    const ac = new AbortController();
    let mounted = true;
    (async () => {
      try {
        const all = await getImageComparisons(ac.signal);
        if (!mounted) return;
        const title = (collection.Title || collection.Name || '').toLowerCase();
        const location = (collection.Address || collection.Location || collection.DiaDiem || collection.LocationName || '').toLowerCase();
        const category = (collection.Category && (collection.Category.Name || collection.Category.name)) || '';

        const related = all.filter(item => {
          const t = (item.title || item.Title || '').toLowerCase();
          const d = (item.description || item.Description || '').toLowerCase();
          const loc = (item.location || item.Location || '').toLowerCase();
          const cat = (item.category || (item.Category && (item.Category.Name || item.Category.name)) || '').toLowerCase();

          // heuristics: title match, description match, location match, or same category
          if (title && (t.includes(title) || d.includes(title))) return true;
          if (location && loc && loc.includes(location)) return true;
          if (category && cat && cat === category.toLowerCase()) return true;
          return false;
        });

        // limit to a few items
        setRelatedCompares(related.slice(0, 6));
      } catch (err) {
        // keep a minimal log for debugging
        // (do not break page if comparisons fail)
        console.warn('related comparisons load failed', err);
      }
    })();

    return () => { mounted = false; ac.abort(); };
  }, [collection]);

  if (loading) return <div className="ilinfo-container"><div className="loading">Đang tải...</div></div>;
  if (error) return <div className="ilinfo-container"><div className="error">Lỗi: {error}</div></div>;
  if (!collection) return (
    <div className="ilinfo-container">
      <div className="not-found">
        <h2>{'Bộ sưu tập không tìm thấy'}</h2>
        <Link to="/ImageLibrary" className="ilinfo-back">← {'Quay lại thư viện'}</Link>
      </div>
    </div>
  );

  const mainImage = collection.ImagePath || collection.image || '';

  return (
    <div className="ilinfo-container">
      <div className="ilinfo-header">
        <button onClick={() => navigate(-1)} className="ilinfo-back">
          <span>←</span> {'Quay lại'}
        </button>
        <div className="ilinfo-breadcrumb">
          <Link to="/">{'Trang chủ'}</Link>
          <span>/</span>
          <Link to="/ImageLibrary">{'Thư viện ảnh'}</Link>
          <span>/</span>
          <span>{collection.Title || collection.Name || `#${collection.CollectionID || collection.id}`}</span>
        </div>
      </div>
      <div className="ilinfo-hero">
        <div className="ilinfo-heroImage" style={{ backgroundImage: `url(${mainImage})` }}>
          <div className="ilinfo-heroOverlay">
            <span className="ilinfo-category">{collection.Category?.Name || (`ID:${collection.CategoryID ?? collection.CategoryId ?? ''}`)}</span>
          </div>
        </div>

        <div className="ilinfo-content">
          <h1 className="ilinfo-title">{collection.Title || collection.Name}</h1>
          <div className="ilinfo-meta">
            <span className="ilinfo-metaItem">📅 {formatYear(collection) ? `Năm ${formatYear(collection)}` : ''}</span>
            {/* Likes removed per request */}
          </div>
          <p className="ilinfo-description">{collection.Description || collection.description || collection.Content}</p>
        </div>
      </div>



      <div className="ilinfo-cta">
        <h3>{'Khám phá thêm'}</h3>
        <div className="ilinfo-ctaButtons">
          <Link to="/ImageLibrary" className="ilinfo-ctaBtn primary">{'Xem thêm bài viết'}</Link>
          <Link to="/compare" className="ilinfo-ctaBtn secondary">{'So sánh xưa - nay'}</Link>
        </div>
      </div>
    </div>
  );
};

export default ImageLibraryInformation;
