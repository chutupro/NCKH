import "../Styles/ImageLibrary/ImageLibrary.css";
import { useState, useEffect } from "react";
import articlesData from "../util/mockArticles";

const PAGE_SIZE = 9;

const categories = ["Tất cả", ...Array.from(new Set(articlesData.map(a => a.category)))];

const ImageLibrary = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("moi_nhat");
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Filter articles
  let filtered = articlesData.filter(a => {
    const matchTitle = a.title.toLowerCase().includes(search.toLowerCase());
    const matchAuthor = a.author.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Tất cả" || a.category === category;
    return (matchTitle || matchAuthor) && matchCategory;
  });

  // Sort
  const handleSortChange = e => { setSort(e.target.value); setPage(1); };
  if(sort === "luot_xem_cao_nhat"){
    filtered = filtered.slice().sort((a,b) => b.views - a.views);
  } else if(sort === "yeu_thich_nhat"){
    filtered = filtered.slice().sort((a,b) => b.likes - a.likes);
  } else {
    // newest (fallback) - assume data order is newest first
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

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedArticle(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Prevent background scroll when modal open
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedArticle]);

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
          placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
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
          <option value="luot_xem_cao_nhat">Lượt xem cao nhất</option>
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
            onClick={() => setSelectedArticle(article)}
            onKeyDown={(e) => { if (e.key === 'Enter') setSelectedArticle(article); }}
          >
            <div className="article-card">
              <div className="card-image" style={{backgroundImage: `url(${article.image})`}}>
                <span className="card-category">{article.category}</span>
                <span className="card-likes">❤️ {article.likes}</span>
              </div>
              <div className="card-content">
                <h3 className="card-title">{article.title}</h3>
                <div className="card-meta">
                  <span className="card-author">{article.author}</span>
                  <span className="card-date">{article.date}</span>
                  <span className="card-views">👁️ {article.views}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal overlay for article detail */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedArticle(null)}>✕</button>
            <div className="detail-card">
              <div className="detail-image" style={{ backgroundImage: `url(${selectedArticle.image})` }} />
              <div className="detail-content">
                <h1 className="detail-title">{selectedArticle.title}</h1>
                <div className="detail-meta">{selectedArticle.author} • {selectedArticle.date} • {selectedArticle.category}</div>
                <div className="detail-stats">👁️ {selectedArticle.views} &nbsp; ❤️ {selectedArticle.likes}</div>
                <p className="detail-description">{selectedArticle.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
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