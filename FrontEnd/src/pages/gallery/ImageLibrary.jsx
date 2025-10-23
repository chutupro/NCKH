import "../../Styles/ImageLibrary/ImageLibrary.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import articlesData from "../../util/mockArticles";

const PAGE_SIZE = 9;

const ImageLibrary = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("moi_nhat");
  const [page, setPage] = useState(1);

  const categories = ["Tất cả", ...Array.from(new Set(articlesData.map(a => a.categoryName)))];

  // Filter articles (search against Title and year in CreatedAt)
  let filtered = articlesData.filter(a => {
    const matchTitle = a.Title.toLowerCase().includes(search.toLowerCase());
    const year = a.CreatedAt ? new Date(a.CreatedAt).getFullYear().toString() : "";
    const matchYear = year.includes(search);
    const matchCategory = category === "Tất cả" || a.categoryName === category;
    return (matchTitle || matchYear) && matchCategory;
  });

  // Sort
  const handleSortChange = e => { setSort(e.target.value); setPage(1); };
  if (sort === "yeu_thich_nhat") {
    filtered = filtered.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sort === "cu_nhat") {
    filtered = filtered.slice().sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
  } else {
    filtered = filtered.slice().sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPage]);

  // Handlers
  const handleSearch = e => { setSearch(e.target.value); setPage(1); };
  const handleCategory = e => { setCategory(e.target.value); setPage(1); };
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
        {paginated.map(article => {
          const mainImage = article.images && article.images.length ? article.images[0].FilePath : '';
          return (
            <div
              key={article.ArticleID}
              className="article-card-link"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/ImageLibrary/${article.ArticleID}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/ImageLibrary/${article.ArticleID}`); }}
            >
              <div className="article-card">
                <div className="card-image" style={{ backgroundImage: `url(${mainImage})` }}>
                  <span className="card-category">{article.categoryName}</span>
                  <span className="card-likes">❤️ {article.likes || 0}</span>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{article.Title}</h3>
                  <div className="card-meta">
                    <span className="card-date">📅 Năm {new Date(article.CreatedAt).getFullYear()}</span>
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
