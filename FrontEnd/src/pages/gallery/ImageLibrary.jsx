import "../../Styles/ImageLibrary/ImageLibrary.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCollections, getCategories } from "../../API/collections";
import { CODE_TO_VN } from '../../util/categoryMap'

const PAGE_SIZE = 9;

const ImageLibrary = () => {

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("moi_nhat");
  const [page, setPage] = useState(1);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const getCollectionCategoryId = (col) => {
    if (!col) return null;
    return col.CategoryID ?? col.category?.CategoryID ?? col.categoryID ?? col.Category?.CategoryID ?? null;
  };

  const getCollectionCategoryName = (col) => {
    if (!col) return '';
    if (col.category && (col.category.Name || col.category.name)) return col.category.Name ?? col.category.name;
    const id = getCollectionCategoryId(col);
    if (id == null) return '';
    const cat = categories.find(c => String(c.CategoryID) === String(id));
    return cat ? (cat.Name || cat.name || '') : '';
  };

  const categoryCodes = (() => {
    const codes = ['all', ...categories.map(cat => String(cat.CategoryID))];

    if (collections.some(c => c.CategoryID === undefined || c.CategoryID === null || c.CategoryID === '')) codes.push('other');
    return Array.from(new Set(codes));
  })();

  const labelFor = (code) => {
    if (!code) return '';
    if (code === 'all') return 'Tất cả';
    if (code === 'other') return 'Khác';
    const cat = categories.find(cat => String(cat.CategoryID) === String(code));
    return cat ? (cat.Name || cat.Title || `Danh mục ${code}`) : `Danh mục ${code}`;
  }

  let filtered = collections.filter(c => {
    const title = (c.Title || '') + ' ' + (c.Name || '');
    const matchTitle = title.toLowerCase().includes(search.toLowerCase());
    const desc = c.Description || '';
    const year = c.CreatedAt ? new Date(c.CreatedAt).getFullYear().toString() : "";
    const matchYear = year.includes(search);
    const matchDesc = desc.toLowerCase().includes(search.toLowerCase());
    let matchCategory = true;
    if (category && category !== 'all') {
      const colCatId = getCollectionCategoryId(c);
      if (category === 'other') {
        matchCategory = colCatId === undefined || colCatId === null || colCatId === '';
      } else {
        matchCategory = String(colCatId) === String(category);
      }
    }
    return (matchTitle || matchYear || matchDesc) && matchCategory;
  });

  const handleSortChange = e => { setSort(e.target.value); setPage(1); };
  if (sort === "cu_nhat") {
    filtered = filtered.slice().sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
  } else {
    filtered = filtered.slice().sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);

  }, [clampedPage]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCollections();
        if (mounted) setCollections(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCats = async () => {
      try {
        const data = await getCategories();
        if (mounted) setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCats();
    return () => { mounted = false; };
  }, []);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query') || '';
    const c = params.get('category') || '';
    if (q && q !== search) {
      setSearch(q);
      setPage(1);
    }

    if (c) {

      const resolveCategory = () => {
        let resolved = c;

        if (/^\d+$/.test(c) || c === 'all' || c === 'other') {
          resolved = c;
        } else {

          const vnName = CODE_TO_VN?.[c] || labelFor(c);
          if (vnName && categories.length) {
            const match = categories.find(cat => (cat.Name || cat.name) === vnName);
            if (match) {
              resolved = String(match.CategoryID ?? match.id ?? match.CategoryId ?? match.ID);
            }
          }
        }
        if (resolved !== category) {
          setCategory(resolved);
          setPage(1);
        }
      };

      resolveCategory();
    }

  }, [location.search, categories]);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };
  const handleCategory = e => { setCategory(e.target.value); setPage(1); };
  const handlePage = p => setPage(p);

  return (
    <div className="image-library-container">
      <div className="filters-bar">
        <input
          type="text"
          placeholder={'Tìm kiếm theo tiêu đề hoặc năm (VD: Chùa, 1995)...'}
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
        <select value={category} onChange={handleCategory} className="category-select">
          {categoryCodes.map(code => (
            <option key={code} value={code}>{labelFor(code)}</option>
          ))}
        </select>
        <select value={sort} onChange={handleSortChange} className="category-select">
          <option value="moi_nhat">{'Mới nhất'}</option>
          <option value="cu_nhat">{'Cũ nhất'}</option>
        </select>
  <span className="result-count">{'Tìm thấy'} {filtered.length} {'bài viết'}</span>
      </div>

      <div className="articles-grid">
        {loading && <div className="loading">Đang tải bộ sưu tập...</div>}
        {error && <div className="error">Lỗi khi tải: {error}</div>}
        {!loading && !error && paginated.map(item => {
          const mainImage = item.ImagePath || item.image || '';
          return (
            <div
              key={item.CollectionID}
              className="article-card-link"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/ImageLibrary/${item.CollectionID}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/ImageLibrary/${item.CollectionID}`); }}
            >
              <div className="article-card">
                <div className="card-image" style={{ backgroundImage: `url(${mainImage})` }}>
                  {}
                  <span className="card-category">{getCollectionCategoryName(item) || (item.CategoryID ?? item.categoryID ?? item.CategoryId ?? item.categoryId ?? '')}</span>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{item.Title || item.Name}</h3>
                  <div className="card-meta">
                    <span className="card-date">📅 {'Năm'} {item.CreatedAt ? new Date(item.CreatedAt).getFullYear() : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pagination-bar">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={page === i + 1 ? "active" : ""}
            onClick={() => handlePage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageLibrary;
