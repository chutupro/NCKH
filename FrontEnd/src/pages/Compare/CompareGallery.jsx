import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CompareCard from '../../Component/Compare/CompareCard';
import { getImageComparisons } from '../../API/imageComparisons';
import '../../Styles/CompareCard/CompareCard.css';
import '../../App.css';
import { getCodeFromName, labelFor, CODE_TO_VN, KNOWN_CODES } from '../../util/categoryMap';

const CompareGallery = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;
    setLoading(true);
    setError(null);
    getImageComparisons(ac.signal)
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setItems(data);
        else setItems([]);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; ac.abort(); };
  }, []);

  // derive categories from data (keeps in sync with DB)
  const CATEGORIES = useMemo(() => {
    // derive known category codes from data; include 'other' if unknowns exist
    const codes = new Set(['all']);
    (items || []).forEach(c => {
      const code = getCodeFromName(c.category || '');
      if (KNOWN_CODES.includes(code)) codes.add(code); else if (code === 'other') codes.add('other');
    });
    return Array.from(codes);
  }, [items]);

  const filtered = useMemo(() => {
    let list = items || [];
    if (category && category !== 'all') {
      const vn = CODE_TO_VN[category] || null;
      if (vn) list = list.filter((i) => (i.category || '') === vn);
      else list = list.filter((i) => !KNOWN_CODES.includes(getCodeFromName(i.category)));
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }
    return list;
  }, [query, category, items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goPage = (p) => {
    const np = Math.max(1, Math.min(totalPages, p));
    setPage(np);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cc-root">
      {loading && <div className="cc-loading">Loading...</div>}
      {error && <div className="cc-error">{String(error)}</div>}
      <header className="compare-header">
        <h1>{t('compare.title')}</h1>
        <p className="subtitle">{t('compare.subtitle')}</p>
      </header>

      <section className="cc-controls">
        <div className="cc-search-wrap">
          <input
            placeholder={t('compare.searchPlaceholder')}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="cc-search-input"
          />
        </div>

        <div className="cc-filters">
          <label htmlFor="category-select" className="cc-filter-label">{t('compare.category')}:</label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="cc-filter-select"
          >
            {CATEGORIES.map((code) => (
              <option key={code} value={code}>
                {labelFor(code, t)}
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
        <div className="pager-left">{t('compare.showing')} {filtered.length} {t('compare.results')}</div>
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
