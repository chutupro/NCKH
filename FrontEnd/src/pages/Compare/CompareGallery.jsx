import React, { useMemo, useState } from 'react';
import CompareCard from '../../Component/Compare/CompareCard';
import compareList from '../../util/compareList';
import '../../Styles/CompareCard/CompareCard.css';
import '../../App.css';

const CompareGallery = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  // derive categories from data (keeps in sync with DB)
  const CATEGORIES = useMemo(() => {
    const cats = Array.from(new Set(compareList.map(c => c.category || 'Khác')));
    return ['Tất cả', ...cats];
  }, []);

  const filtered = useMemo(() => {
    let list = compareList;
    if (category && category !== 'Tất cả') {
      list = list.filter((i) => (i.category || 'Khác') === category);
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }
    return list;
  }, [query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goPage = (p) => {
    const np = Math.max(1, Math.min(totalPages, p));
    setPage(np);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cc-root">
      <header className="compare-header">
        <h1>Hình ảnh xưa - nay nổi bật</h1>
        <p className="subtitle">So sánh thay đổi qua thời gian — dữ liệu liên kết với Articles / Images</p>
      </header>

      <section className="cc-controls">
        <div className="cc-search-wrap">
          <input
            placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="cc-search-input"
          />
        </div>

        <div className="cc-filters">
          <label htmlFor="category-select" className="cc-filter-label">Danh mục:</label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="cc-filter-select"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="cc-grid">
        {pageItems.map((it) => (
          <CompareCard key={it.ComparisonID ?? it.id} item={it} />
        ))}
      </main>

      <footer className="cc-pager">
        <div className="pager-left">Hiển thị {filtered.length} kết quả</div>
        <div className="cc-pager-controls">
          <button onClick={() => goPage(page - 1)} disabled={page === 1} className="cc-page-btn">‹</button>
          <span className="cc-page-num">{page} / {totalPages}</span>
          <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="cc-page-btn">›</button>
        </div>
      </footer>
    </div>
  );
};

export default CompareGallery;
