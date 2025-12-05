import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCategories } from '../../API/collections';
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
  
  const navDebounce = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
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

  // Initialize from URL params (?query=, ?category=)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawQ = params.get('query');
    const q = rawQ != null ? String(rawQ).replace(/\+/g, ' ').trim() : '';
    const c = params.get('category') || 'all';
    if (q !== query) setQuery(q);
    if (c !== category) setCategory(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Sync query/category back to URL (debounced)
  useEffect(() => {
    if (navDebounce.current) clearTimeout(navDebounce.current);
    navDebounce.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (category && category !== 'all') params.set('category', category);
      const newSearch = params.toString();
      const current = location.search.startsWith('?') ? location.search.slice(1) : location.search;
      if (newSearch !== current) {
        navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
      }
    }, 350);
    return () => { if (navDebounce.current) clearTimeout(navDebounce.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);


  // load categories from API (use Vietnamese names as option values)
  const [apiCategories, setApiCategories] = useState([]);
  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    getCategories(ac.signal)
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setApiCategories(data.map(c => c.Name || c.name || String(c)));
        else setApiCategories([]);
      })
      .catch((err) => {
        console.warn('Failed to load categories', err);
      });
    return () => { mounted = false; ac.abort(); };
  }, []);

  // Build category options: 'all' + API category names + optional 'other'
  const CATEGORIES = useMemo(() => {
    const list = ['all'];
    if (apiCategories && apiCategories.length) {
      apiCategories.forEach(n => { if (n && !list.includes(n)) list.push(n); });
    } else {
      (items || []).forEach(i => { const name = i.category || ''; if (name && !list.includes(name)) list.push(name); });
    }
    const hasOther = (items || []).some(i => getCodeFromName(i.category) === 'other');
    if (hasOther && !list.includes('other')) list.push('other');
    return list;
  }, [apiCategories, items]);

  const filtered = useMemo(() => {
    let list = items || [];
    if (category && category !== 'all') {
      if (category === 'other') {
        list = list.filter((i) => getCodeFromName(i.category) === 'other');
      } else {
        // category is expected to be VN name from API
        list = list.filter((i) => (i.category || '') === category);
      }
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
            {CATEGORIES.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'Tất cả' : opt === 'other' ? 'Khác' : opt}
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
