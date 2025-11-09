import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCollections } from '../../API/collections'
import '../../Styles/Home/CollectionGallery.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faArrowRight } from '@fortawesome/free-solid-svg-icons'
// displayCategoryName not used for API-driven collections; we'll read category from API
import useDragScroll from '../../hooks/useDragScroll'

const CollectionGallery = () => {
  const { t } = useTranslation();
  const { scrollRef, isDragging, hasMoved, handlers, scrollBy } = useDragScroll()
  const navigate = useNavigate()
  const scroll = (direction) => scrollBy(direction)

  const [collections, setCollections] = useState([])

  // SVG placeholder nhẹ nhắt inline (trả về nếu ảnh không tải được)
  const placeholder = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='280'><rect width='100%' height='100%' fill='%23f3f3f3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'>No image</text></svg>`

  const handleArticleClick = (article) => {
    // Chỉ chuyển trang nếu không phải đang kéo
    if (!hasMoved) {
      const id = article.CollectionID ?? article.id ?? article.CollectionId ?? article.ArticleID
      if (!id) return
      window.scrollTo(0, 0)
      navigate(`/ImageLibrary/${id}`)
    }
  }

  // prefer API-fetched collections; fallback to empty while loading
  const displayArticles = collections.slice(0, 8)

  useEffect(() => {
    let mounted = true
    const ac = new AbortController()
    const load = async () => {
      try {
        const data = await getCollections(ac.signal)
        if (!mounted) return
        setCollections(Array.isArray(data) ? data : [])
      } catch (err) {
        console.warn('Failed to load collections', err)
        if (mounted) setCollections([])
      }
    }
    load()
    return () => { mounted = false; ac.abort() }
  }, [])

  return (
    <section className="collection-gallery-section">
      <div className="collection-gallery-container">
        <div className="collection-gallery-header">
          <h2 className="collection-gallery-title">{t('collection.title')}</h2>
          <p className="collection-gallery-subtitle">{t('collection.subtitle')}</p>
        </div>

        <div className="collection-carousel">
          <button 
            className="carousel-btn carousel-btn-left" 
            onClick={() => scroll('left')}
            aria-label={t('common.prev')}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <div 
            className="collection-scroll" 
            ref={scrollRef}
            onMouseDown={handlers.onMouseDown}
            onMouseLeave={handlers.onMouseLeave}
            onMouseUp={handlers.onMouseUp}
            onMouseMove={handlers.onMouseMove}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {displayArticles.map((article) => (
              <div
                key={article.CollectionID ?? article.id ?? article.CollectionId ?? article.Title}
                className="collection-card"
                role="button"
                tabIndex={0}
                onClick={() => handleArticleClick(article)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleArticleClick(article); }}
              >
                <div className="collection-image-wrapper">
                  <img 
                    src={article.ImagePath || article.image || article.images?.[0]?.FilePath || placeholder} 
                    data-original-src={article.ImagePath || article.image || article.images?.[0]?.FilePath || ''}
                    alt={article.images?.[0]?.AltText || article.Title || article.Name}
                    className="collection-image"
                    draggable="false"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget
                      // Tránh vòng lặp vô hạn nếu placeholder cũng không tải được
                      if (target.dataset.fallbackSet) return
                      // Ghi log URL bị lỗi để kiểm tra (xem console trình duyệt để biết URL nào 404)
                      console.warn('Image failed to load:', target.dataset.originalSrc || target.src)
                      target.dataset.fallbackSet = '1'
                      target.src = placeholder
                    }}
                  />
                  <div className="collection-overlay">
                    <span className="collection-category">{article.Category?.Name || article.categoryName || article.Category?.name || ''}</span>
                  </div>
                </div>
                  <div className="collection-content">
                  <h3 className="collection-title">{article.Title}</h3>
                  <p className="collection-description">{article.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="carousel-btn carousel-btn-right" 
            onClick={() => scroll('right')}
            aria-label={t('common.next')}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="collection-footer">
          <Link to="/ImageLibrary" className="collection-view-more-btn" onClick={() => window.scrollTo(0, 0)}>
            {t('collection.viewAll')}
            <FontAwesomeIcon icon={faArrowRight} className="view-more-icon" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CollectionGallery
