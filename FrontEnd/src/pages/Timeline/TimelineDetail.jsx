import React, { useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { TIMELINE_ITEMS, getTimelineArticleContent } from "../../util/constant";
import mockArticles from "../../util/mockArticles";
import "../../Styles/Timeline/TimelineDetail.css";

const TimelineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const itemId = Number(id);
  const item = useMemo(() => TIMELINE_ITEMS.find((it) => Number(it.id) === itemId), [itemId]);

  const related = useMemo(() => {
    if (!item) return [];
    const year = String(item.date).trim();
    // liên quan từ các mục timeline (cùng danh mục + cùng năm)
    const fromTimeline = TIMELINE_ITEMS
      .filter((it) => String(it.date).trim() === year && Number(it.id) !== itemId)
      .map((it) => ({
        source: 'timeline',
        id: it.id,
        title: it.title,
        image: it.image,
        date: it.date,
        link: `/timeline/${it.id}`,
      }));

    // liên quan từ thư viện ảnh / bài viết (so sánh năm từ CreatedAt hoặc trường dạng date)
    const fromArticles = (mockArticles || [])
      .filter((a) => {
        // try CreatedAt (ISO) then fall back to a 'date' or year field
        const created = a.CreatedAt || a.date || a.Created || '';
        const y = (created && String(created).slice(0,4)) || String(a.date || '').slice(0,4);
        return y === year;
      })
      .map((a) => ({
        source: 'article',
        id: a.ArticleID,
        title: a.Title,
        image: (a.images && a.images[0] && a.images[0].FilePath) || '',
        date: (a.CreatedAt && String(a.CreatedAt).slice(0,4)) || String(a.date || '').slice(0,4),
        link: `/ImageLibrary/${a.ArticleID}`,
      }));

    // Gộp và trả về (mục timeline trước, sau đó là articles). Loại bỏ trùng lặp theo link
    const combined = [...fromTimeline, ...fromArticles];
    const seen = new Set();
    return combined.filter((c) => {
      if (seen.has(c.link)) return false;
      seen.add(c.link);
      return true;
    });
  }, [item, itemId]);

  // Simple pointer drag for related list
  const carouselRef = useRef(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, pointerId: null });

  const onPointerDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    // Nếu bấm vào phần tử tương tác (link/button), không khởi động drag
    try {
      const target = e.target;
      if (target && typeof target.closest === 'function') {
        const interactive = target.closest('a, button, input, textarea, select, label');
        if (interactive) return;
      }
    } catch (err) { void err; }

    dragRef.current.isDown = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.scrollLeft = el.scrollLeft;
    dragRef.current.pointerId = e.pointerId;
  try { el.setPointerCapture && el.setPointerCapture(e.pointerId); } catch (e) { void e; }
    el.classList.add("is-dragging");
  };

  const onPointerMove = (e) => {
    const el = carouselRef.current;
    if (!el || !dragRef.current.isDown) return;
    const dx = e.clientX - dragRef.current.startX;
    el.scrollLeft = dragRef.current.scrollLeft - dx;
    if (typeof e.preventDefault === 'function') e.preventDefault();
  };

  const endDrag = () => {
    const el = carouselRef.current;
    dragRef.current.isDown = false;
    if (el && dragRef.current.pointerId != null) {
  try { el.releasePointerCapture && el.releasePointerCapture(dragRef.current.pointerId); } catch (e) { void e; }
      el.classList.remove("is-dragging");
    }
    dragRef.current.pointerId = null;
  };

  if (!item) {
    return (
      <main className="article-page not-found">
        <div className="article-inner">
          <p>Không tìm thấy bài viết.</p>
          <div>
            <button className="btn" onClick={() => navigate(-1)}>Quay lại</button>
            <Link to="/timeline" className="btn">Về Timeline</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="article-page">
      <div className="article-inner">
        <div className="article-top">
          <div>
            <button className="btn" onClick={() => navigate(-1)}>← Quay lại</button>
          </div>
        </div>
        <div className="article-hero" style={{backgroundImage: `url(${item.image})`}}>
          <span className="article-badge">{item.category}</span>
        </div>
        <div className="article-meta">
          <div className="meta-top">
            <time className="article-year">{item.date}</time>
            <span className="article-category">{item.category}</span>
          </div>
          <h1 className="article-title">{item.title}</h1>
        </div>
        <article className="article-body">
          {/* Use helper to generate article-like content when item.content missing */}
          {getTimelineArticleContent(item).split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        <section className="related-section">
          <h3>Bài viết cùng bộ sưu tập</h3>
          <div
            className="related-carousel"
            ref={carouselRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            {related.length === 0 && (
              <div className="no-related">Không có bài cùng năm</div>
            )}
            {related.map((r) => (
              <Link to={r.link} className="related-card" key={`${r.source}-${r.id}`}>
                <div className="related-image" style={{backgroundImage: `url(${r.image})`}} />
                <div className="related-info">
                  <div className="related-date">{r.date}</div>
                  <div className="related-title">{r.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default TimelineDetail;
