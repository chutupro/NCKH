import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../../Styles/Home/RecentPosts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { displayCategoryName } from '../../util/categoryMap'
import useDragScroll from '../../hooks/useDragScroll'
import { getArticlesPosts } from '../../API/articlesPost'
const BACKEND_BASE = 'http://localhost:3000'

const RecentPosts = () => {
  const { t } = useTranslation();
  const { scrollRef, isDragging, hasMoved, handlers, scrollBy } = useDragScroll()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleCardClick = (e) => {
    if (hasMoved) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    getArticlesPosts(ac.signal)
      .then((data) => {
        if (!Array.isArray(data)) return setPosts([])
        const mapped = data.map(a => {
          // Chuẩn hóa image: chấp nhận một số dạng phổ biến
          let image = a.image || a.Image || ''
          // Kiểm tra mảng images (thường thấy trong schema articles)
          if ((!image || image === '') && Array.isArray(a.images) && a.images.length > 0) {
            image = a.images[0].FilePath || a.images[0].filePath || a.images[0].url || ''
          }
          if ((!image || image === '') && a.thumbnail) image = a.thumbnail

          // Nếu image là đường dẫn tương đối, chuyển thành đường dẫn tuyệt đối kèm base của backend
          if (image && !/^https?:\/\//i.test(image)) {
            if (!image.startsWith('/')) image = '/' + image
            image = `${BACKEND_BASE}${image}`
          }

          const author = a.author?.fullName || a.author?.FullName || a.author?.name || a.author || ''
          const when = a.createdAt || a.CreatedAt ? new Date(a.createdAt || a.CreatedAt).toLocaleString() : (a.when || '')

          return {
            id: a.id || a.ArticleID || a.ArticleId || a.ArticleID,
            author,
            when,
            category: a.category || a.categoryName || '',
            text: a.title || a.content || a.Text || '',
            image,
          }
        })

        const sorted = [...mapped].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 8)
        setPosts(sorted)
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.message === 'canceled') return
        setError(err.message || String(err))
      })
      .finally(() => setLoading(false))

    return () => ac.abort()
  }, [])

  // Sắp xếp posts theo thứ tự mới nhất (ID cao nhất = mới nhất) và lấy 8 bài
  const sortedPosts = posts

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
            {loading ? (
              <div className="recent-post-loading">{t('recentPosts.loading') || 'Loading...'}</div>
            ) : error ? (
              <div className="recent-post-error">{t('recentPosts.error') || 'Error loading posts'}</div>
            ) : (
              sortedPosts.map((post) => {
                // Ngăn không render object trực tiếp (một vài API trả author dưới dạng object)
                const authorName = typeof post.author === 'string'
                  ? post.author
                  : post.author && typeof post.author === 'object'
                    ? (post.author.fullName || post.author.full_name || post.author.name || post.author.username || '')
                    : ''

                return (
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
                      <h3 className="recent-post-author">{authorName || String(post.author || '')}</h3>
                      <p className="recent-post-text">{post.text}</p>
                      <span className="recent-post-time">{post.when}</span>
                    </div>
                  </Link>
                )
              })
            )}
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
