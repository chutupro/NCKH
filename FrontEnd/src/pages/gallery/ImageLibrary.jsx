import "../../Styles/ImageLibrary/ImageLibrary.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import articlesData from "../../util/mockArticles";

const PAGE_SIZE = 9;

const categories = ["Tất cả", ...Array.from(new Set(articlesData.map(a => a.category)))];

const ImageLibrary = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("moi_nhat");
  const [page, setPage] = useState(1);

  // Filter articles
  let filtered = articlesData.filter(a => {
    const matchTitle = a.title.toLowerCase().includes(search.toLowerCase());
    const matchYear = a.date.includes(search);
    const matchCategory = category === "Tất cả" || a.category === category;
    return (matchTitle || matchYear) && matchCategory;
  });

  // Sort
  const handleSortChange = e => { setSort(e.target.value); setPage(1); };
  if(sort === "yeu_thich_nhat"){
    filtered = filtered.slice().sort((a,b) => b.likes - a.likes);
  } else if(sort === "cu_nhat"){
    filtered = filtered.slice().sort((a,b) => parseInt(a.date) - parseInt(b.date));
  } else {
    // newest (fallback) - sort by year descending
    filtered = filtered.slice().sort((a,b) => parseInt(b.date) - parseInt(a.date));
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Ensure current page is within bounds. Use a clamped page for slicing so
  // we never render more than PAGE_SIZE items even if `page` was stale.
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  // Keep UI state in sync: if `page` is out of range (e.g. after filtering), update it.
  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPage]);

  // Handlers
  const handleSearch = e => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleCategory = e => {
    setCategory(e.target.value);
    setPage(1);
  };
  const handlePage = p => setPage(p);

  return (
    <div className="image-library-container">
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề hoặc năm (VD: Chùa, 1995)..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
        <select value={category} onChange={handleCategory} className="category-select">
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={sort} onChange={handleSortChange} className="category-select">
          <option value="moi_nhat">Mới nhất</option>
          <option value="cu_nhat">Cũ nhất</option>
          <option value="yeu_thich_nhat">Yêu thích nhất</option>
        </select>
        <span className="result-count">Tìm thấy {filtered.length} bài viết</span>
      </div>
      <div className="articles-grid">
        {paginated.map(article => (
          <div
            key={article.id}
            className="article-card-link"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/ImageLibrary/${article.id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/ImageLibrary/${article.id}`); }}
          >
            <div className="article-card">
              <div className="card-image" style={{backgroundImage: `url(${article.image})`}}>
                <span className="card-category">{article.category}</span>
                <span className="card-likes">❤️ {article.likes}</span>
              </div>
              <div className="card-content">
                <h3 className="card-title">{article.title}</h3>
                <div className="card-meta">
                  <span className="card-date">📅 Năm {article.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-bar">
        {Array.from({length: totalPages}, (_, i) => (
          <button
            key={i+1}
            className={page === i+1 ? "active" : ""}
            onClick={() => handlePage(i+1)}
          >
            {i+1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageLibrary;
