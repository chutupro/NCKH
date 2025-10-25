import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import articles from '../../util/mockArticles'
import '../../Styles/Home/CollectionGallery.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { displayCategoryName } from '../../util/categoryMap'
import useDragScroll from '../../hooks/useDragScroll'

const CollectionGallery = () => {
  const { t } = useTranslation();
  const { scrollRef, isDragging, hasMoved, handlers, scrollBy } = useDragScroll()
  const navigate = useNavigate()
  const scroll = (direction) => scrollBy(direction)

  const handleArticleClick = (articleId) => {
    // Chỉ chuyển trang nếu không phải đang kéo
    if (!hasMoved) {
      window.scrollTo(0, 0)
      navigate(`/ImageLibrary/${articleId}`)
    }
  }

  const displayArticles = articles.slice(0, 8)

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
                key={article.ArticleID}
                className="collection-card"
                onClick={() => handleArticleClick(article.ArticleID)}
              >
                <div className="collection-image-wrapper">
                  <img 
                    src={article.images[0]?.FilePath} 
                    alt={article.images[0]?.AltText || article.Title}
                    className="collection-image"
                    draggable="false"
                  />
                  <div className="collection-overlay">
                    <span className="collection-category">{displayCategoryName(article.categoryName, t)}</span>
                  </div>
                </div>
                <div className="collection-content">
                  <h3 className="collection-title">{article.Title}</h3>
                  <p className="collection-description">{article.description}</p>
                  <span className="collection-likes">❤️ {article.likes} lượt thích</span>
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
