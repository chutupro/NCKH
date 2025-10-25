import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import posts from '../../util/posts'
import '../../Styles/Home/RecentPosts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { displayCategoryName } from '../../util/categoryMap'
import useDragScroll from '../../hooks/useDragScroll'

const RecentPosts = () => {
  const { t } = useTranslation();
  const { scrollRef, isDragging, hasMoved, handlers, scrollBy } = useDragScroll()

  const handleCardClick = (e) => {
    if (hasMoved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Sắp xếp posts theo thứ tự mới nhất (ID cao nhất = mới nhất) và lấy 8 bài
  const sortedPosts = [...posts].sort((a, b) => b.id - a.id).slice(0, 8)

  return (
    <section className="recent-posts-section">
      <div className="recent-posts-container">
        <div className="recent-posts-header">
          <h2 className="recent-posts-title">{t('recentPosts.title')}</h2>
          <p className="recent-posts-subtitle">{t('recentPosts.subtitle')}</p>
        </div>

        <div className="recent-posts-carousel">
          <button 
            className="carousel-btn carousel-btn-left" 
            onClick={() => scrollBy('left')}
            aria-label={t('common.prev')}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <div 
            className="recent-posts-scroll" 
            ref={scrollRef}
            {...handlers}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {sortedPosts.map((post) => (
              <Link 
                to={`/community#post-${post.id}`} 
                key={post.id} 
                className="recent-post-card"
                draggable="false"
                onClick={(e) => handleCardClick(e)}
              >
                <div className="recent-post-image-wrapper">
                  <img 
                    src={post.image} 
                    alt={post.text}
                    className="recent-post-image"
                    draggable="false"
                  />
                  <div className="recent-post-overlay">
                    <span className="recent-post-category">{displayCategoryName(post.category, t)}</span>
                  </div>
                </div>
                <div className="recent-post-content">
                  <h3 className="recent-post-author">{post.author}</h3>
                  <p className="recent-post-text">{post.text}</p>
                  <span className="recent-post-time">{post.when}</span>
                </div>
              </Link>
            ))}
          </div>

          <button 
            className="carousel-btn carousel-btn-right" 
            onClick={() => scrollBy('right')}
            aria-label={t('common.next')}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="recent-posts-footer">
          <Link to="/community" className="view-more-btn" onClick={() => window.scrollTo(0, 0)}>
            {t('recentPosts.viewMore')}
            <FontAwesomeIcon icon={faArrowRight} className="view-more-icon" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RecentPosts
