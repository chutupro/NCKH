import "../../Styles/ImageLibrary/ImageLibrary.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCollections, getCategories } from "../../API/collections";
import { CODE_TO_VN } from '../../util/categoryMap'

// NOTE: Replaced local util/mockArticles and categoryMap with a live API call
// to http://localhost:3000/collections as requested. Assumptions:
// - API returns an array of collection objects with fields matching the DB
//   screenshot: CollectionID, Title, Name, Description, ImagePath, ImageDescription, CategoryID, CreatedAt
// - ImagePath is a URL or path usable in an <img> or CSS background-image

const PAGE_SIZE = 9;

// (labelFor moved inside component so it can use fetched categories)

const ImageLibrary = () => {
  // i18n removed: dùng chuỗi tiếng Việt trực tiếp
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("moi_nhat");
  const [page, setPage] = useState(1);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Helper to get a collection's CategoryID from various shapes (CategoryID or Category relation)
  const getCollectionCategoryId = (col) => {
    if (!col) return null;
    return col.CategoryID ?? col.category?.CategoryID ?? col.categoryID ?? col.Category?.CategoryID ?? null;
  };

  // Helper to get a collection's Category name (from relation or from fetched categories)
  const getCollectionCategoryName = (col) => {
    if (!col) return '';
    if (col.category && (col.category.Name || col.category.name)) return col.category.Name ?? col.category.name;
    const id = getCollectionCategoryId(col);
    if (id == null) return '';
    const cat = categories.find(c => String(c.CategoryID) === String(id));
    return cat ? (cat.Name || cat.name || '') : '';
  };

  // Generate category list from fetched collections using CategoryID values
  const categoryCodes = (() => {
    const codes = ['all', ...categories.map(cat => String(cat.CategoryID))];
    // include 'other' if any collection has no CategoryID
    if (collections.some(c => c.CategoryID === undefined || c.CategoryID === null || c.CategoryID === '')) codes.push('other');
    return Array.from(new Set(codes));
  })();

  // label helper that uses fetched categories
  const labelFor = (code) => {
    if (!code) return '';
    if (code === 'all') return 'Tất cả';
    if (code === 'other') return 'Khác';
    const cat = categories.find(cat => String(cat.CategoryID) === String(code));
    return cat ? (cat.Name || cat.Title || `Danh mục ${code}`) : `Danh mục ${code}`;
  }

  // Format a year for display from different possible fields safely
  const formatYear = (item) => {
    if (!item) return '';
    const parse = (val) => {
      if (val == null || val === '') return null;
      if (typeof val === 'number' && Number.isFinite(val)) {
        // If it's a 4-digit year, return it; otherwise try to interpret as timestamp
        return String(val).length === 4 ? val : new Date(val).getFullYear();
      }
      if (typeof val === 'string') {
        const trimmed = val.trim();
        // numeric string like "1995"
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

  // Filter collections (search Title/Name/Description and year)
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

  // Sắp xếp
  const handleSortChange = e => { setSort(e.target.value); setPage(1); };
  if (sort === "cu_nhat") {
    filtered = filtered.slice().sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
  } else {
    filtered = filtered.slice().sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  }

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPage]);

  // Fetch collections from API once on mount (moved to API helpers)
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

  // Fetch categories from API to populate the category select (moved to API helpers)
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

  // Nếu URL có ?query=..., khởi tạo giá trị search từ query param để tự động tìm
  const location = useLocation();
  // read persisted filters from localStorage if URL doesn't provide them
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasAny = params.has('query') || params.has('category') || params.has('sort') || params.has('page');
    if (!hasAny) {
      try {
        const raw = localStorage.getItem('imageLibrary.filters');
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj.query) setSearch(obj.query);
          if (obj.category) setCategory(obj.category);
          if (obj.sort) setSort(obj.sort);
          if (obj.page) setPage(Number(obj.page) || 1);
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // URLSearchParams.get decodes percent-encoding but leaves '+' characters as-is
    // Convert '+' to spaces and trim to normalize user-entered queries that were encoded differently
    const rawQ = params.get('query');
    const q = rawQ != null ? String(rawQ).replace(/\+/g, ' ').trim() : '';
    const c = params.get('category') || '';
    // If the URL explicitly contains the query param (even empty), use it as the source of truth
    if (params.has('query') && q !== search) {
      setSearch(q);
      setPage(1);
    }

    // nếu category có trong query, cố gắng resolve nó sang CategoryID nếu cần
    if (c) {
      // resolve now or after categories are loaded
      const resolveCategory = () => {
        let resolved = c;
        // numeric -> assume CategoryID
        if (/^\d+$/.test(c) || c === 'all' || c === 'other') {
          resolved = c;
        } else {
          // try map code -> Vietnamese name -> find CategoryID in fetched categories
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, categories]);

  // Các handler
  const handleSearch = e => { setSearch(e.target.value); setPage(1); };
  const handleCategory = e => { setCategory(e.target.value); setPage(1); };
  const handlePage = p => setPage(p);

  // Persist current filters/search/sort/page to URL so they survive refreshes
  // Persist current filters/search/sort/page to URL so they survive refreshes
  // Debounce navigate to avoid focus/caret loss while user types
  const savePersistRef = useRef(null);
  const navDebounceRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('query', search);
    if (category && category !== 'all') params.set('category', category);
    if (sort && sort !== 'moi_nhat') params.set('sort', sort);
    if (page && page > 1) params.set('page', String(page));
    const newSearch = params.toString();
    const current = location.search.startsWith('?') ? location.search.slice(1) : location.search;

    // debounce navigate to avoid re-render focus jumps while typing
    if (navDebounceRef.current) clearTimeout(navDebounceRef.current);
    navDebounceRef.current = setTimeout(() => {
      if (newSearch !== current) {
        navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
      }
    }, 450);

    // persist to localStorage as fallback (debounced to reduce writes)
    try {
      if (savePersistRef.current) clearTimeout(savePersistRef.current);
      savePersistRef.current = setTimeout(() => {
        try {
          localStorage.setItem('imageLibrary.filters', JSON.stringify({ query: search, category, sort, page }));
        } catch (e) {
          // ignore storage errors
        }
      }, 400);
    } catch (e) {
      // ignore
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, page]);

  // clear pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (savePersistRef.current) clearTimeout(savePersistRef.current);
      if (navDebounceRef.current) clearTimeout(navDebounceRef.current);
    };
  }, []);

  // When the component unmounts (user navigates away), clear persisted filters
  // and remove querystring so returning to the page starts fresh.
  useEffect(() => {
    return () => {
      try { localStorage.removeItem('imageLibrary.filters'); } catch (e) { /* ignore */ }
      try { window.history.replaceState({}, '', location.pathname); } catch (e) { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="imglib-image-library-container">
      <div className="imglib-filters-bar">
        <input
          type="text"
          placeholder={'Tìm kiếm theo tiêu đề hoặc năm (VD: Chùa, 1995)...'}
          value={search}
          onChange={handleSearch}
          className="imglib-search-input"
        />
        <select value={category} onChange={handleCategory} className="category-select">
          {categoryCodes.map(code => (
            <option key={code} value={code}>{labelFor(code)}</option>
          ))}
        </select>
        <select value={sort} onChange={handleSortChange} className="imglib-category-select">
          <option value="moi_nhat">{'Mới nhất'}</option>
          <option value="cu_nhat">{'Cũ nhất'}</option>
        </select>
  <span className="imglib-result-count">{'Tìm thấy'} {filtered.length} {'bài viết'}</span>
      </div>
      <div className="imglib-articles-grid">
        {loading && <div className="loading">Đang tải bộ sưu tập...</div>}
        {error && <div className="error">Lỗi khi tải: {error}</div>}
        {!loading && !error && paginated.map(item => {
          const mainImage = item.ImagePath || item.image || '';
          return (
            <div
              key={item.CollectionID}
              className="imglib-article-card-link"
            >
              <div className="imglib-article-card">
                <div 
                  className="imglib-card-image" 
                  style={{ backgroundImage: `url(${mainImage})` }}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/ImageLibrary/${item.CollectionID}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/ImageLibrary/${item.CollectionID}`); }}
                >
                  {/* Show Category name inside the image if available, otherwise fallback to CategoryID */}
                  <span className="imglib-card-category">{getCollectionCategoryName(item) || (item.CategoryID ?? item.categoryID ?? item.CategoryId ?? item.categoryId ?? '')}</span>
                </div>
                <div className="imglib-card-content">
                  <h3 className="imglib-card-title">{item.Title || item.Name}</h3>
                  <div className="imglib-card-meta">
                    <span className="imglib-card-date">{formatYear(item) ? `Năm ${formatYear(item)}` : ''}</span>
                    <button 
                      className="imglib-map-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🗺️ [ImageLibrary] Navigating to map with:', {
                          MapLocationID: item.MapLocationID,
                          Title: item.Title,
                          Name: item.Name
                        });
                        // Nếu có MapLocationID, zoom vào location đó; nếu không, search theo tên
                        if (item.MapLocationID) {
                          navigate(`/map?locationId=${item.MapLocationID}`);
                        } else {
                          navigate(`/map?search=${encodeURIComponent(item.Title || item.Name)}`);
                        }
                      }}
                      title="Xem trên bản đồ"
                    >
                      📍 Bản đồ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="imglib-pagination-bar">
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
