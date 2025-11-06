import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../../Styles/community/CommunitySidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCamera, 
  faFire, 
  faHeart, 
  faTrophy, 
  faFilter,
  faArrowRight,
  faSearch
} from '@fortawesome/free-solid-svg-icons'
import { getArticlesPosts } from '../../API/articlesPost'
import { getCodeFromName, CODE_TO_VN, KNOWN_CODES } from '../../util/categoryMap'

const CommunitySidebar = ({ activeFilter, onFilterChange, onSearchChange }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('')

  const [posts, setPosts] = useState([])

  const filters = [
    { id: 'all', label: t('sidebar.all'), icon: null },
    { id: 'văn hóa', label: t('sidebar.culture'), icon: null },
    { id: 'kiến trúc', label: t('sidebar.architecture'), icon: null },
    { id: 'du lịch', label: t('sidebar.tourism'), icon: null },
    { id: 'thiên nhiên', label: t('sidebar.nature'), icon: null }
  ]

  // Compute trending topics from fetched posts (count by category)
  const trendingTopics = (() => {
    const counts = {};
    // initialize counts for known codes
    KNOWN_CODES.forEach(c => (counts[c] = 0));
    posts.forEach(p => {
      const catName = p.category || p.categoryName || p.category_en || p.category_vi || '';
      const code = getCodeFromName(catName);
      if (KNOWN_CODES.includes(code)) counts[code] = (counts[code] || 0) + 1;
    });
    return Object.keys(counts)
      .map(code => ({ code, count: counts[code] }))
      .sort((a, b) => b.count - a.count);
  })();

  // Load articles from backend and keep in state
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getArticlesPosts()
        if (!mounted) return
        // API returns array of articles (service maps fields)
        setPosts(Array.isArray(data) ? data : (data.items || []))
      } catch (err) {
        console.error('Failed to load articles for sidebar:', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // Lọc top posts theo category đang chọn
  const getTopPosts = () => {
    let filteredPosts = activeFilter === 'all'
      ? posts
      : posts.filter(post => String(post.category || '').toLowerCase() === activeFilter.toLowerCase())

    // Sắp xếp theo likeCount (fallback to 0) và lấy top 3
    return filteredPosts
      .sort((a, b) => (b.likeCount || b.likeCount === 0 ? b.likeCount : b.likes || 0) - (a.likeCount || a.likeCount === 0 ? a.likeCount : a.likes || 0))
      .slice(0, 3)
      .map(post => ({
        id: post.id,
        image: post.image || post.imagePath || '/uploads/default.png',
        title: (post.title || '').substring(0, 60) + ((post.title || '').length > 60 ? '...' : ''),
        likes: post.likeCount ?? post.likes ?? 0,
        category: post.category || ''
      }))
  }

  const topPosts = getTopPosts()

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearchChange(value)
  }

  // Derive top contributors from posts
  const topContributors = (() => {
    const counts = {}
    posts.forEach(p => {
      const author = p.author || {}
      const id = author.id || p.authorId || p.userId || 'anon'
      const name = author.fullName || author.FullName || 'Người dùng'
      if (!counts[id]) counts[id] = { id, name, posts: 0 }
      counts[id].posts += 1
    })
    return Object.values(counts).sort((a, b) => b.posts - a.posts).slice(0, 5)
  })()

  return (
    <aside className="community-sidebar">
      {/* Tìm kiếm */}
      <div className="sidebar-card search-card">
        <h3 className="sidebar-card-title">
          <FontAwesomeIcon icon={faSearch} />
            {t('sidebar.search')}
        </h3>
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="search-input"
              placeholder={t('sidebar.searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="sidebar-card filter-card">
        <h3 className="sidebar-card-title">
          <FontAwesomeIcon icon={faFilter} />
            {t('sidebar.filters')}
        </h3>
        <div className="filter-buttons">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="sidebar-card trending-card">
        <h3 className="sidebar-card-title">
          <FontAwesomeIcon icon={faFire} />
            {t('sidebar.trending')}
        </h3>
        <div className="trending-list">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="trending-item">
              <span className="trending-tag">#{t(`sidebar.${topic.code}`)}</span>
                <span className="trending-count">{topic.count} {t('sidebar.posts')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Posts */}
      <div className="sidebar-card top-posts-card">
        <h3 className="sidebar-card-title">
          <FontAwesomeIcon icon={faHeart} />
            {t('sidebar.mostLiked')}
          {activeFilter !== 'all' && <span className="filter-badge">{activeFilter}</span>}
        </h3>
        <div className="top-posts-list">
          {topPosts.length > 0 ? (
            topPosts.map(post => (
              <Link to={`/community#post-${post.id}`} key={post.id} className="top-post-item">
                <img src={post.image} alt={post.title} className="top-post-image" />
                <div className="top-post-info">
                  <p className="top-post-title">{post.title}</p>
                  <span className="top-post-likes">
                    <FontAwesomeIcon icon={faHeart} />
                    {post.likes}
                  </span>
                </div>
              </Link>
            ))
          ) : (
              <p className="no-top-posts">{t('sidebar.noPostsYet')}</p>
          )}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="sidebar-card contributors-card">
        <h3 className="sidebar-card-title">
          <FontAwesomeIcon icon={faTrophy} />
            {t('sidebar.topContributors')}
        </h3>
        <div className="contributors-list">
          {topContributors.map((user, index) => (
            <div key={index} className="contributor-item">
              <div className="contributor-rank">{index + 1}</div>
              <div className="contributor-avatar">{user.avatar}</div>
              <div className="contributor-info">
                <p className="contributor-name">{user.name}</p>
                  <span className="contributor-posts">{user.posts} {t('sidebar.photos')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Sticky Card */}
      <div className="sidebar-card cta-card sticky-card">
        <div className="cta-icon">
          <FontAwesomeIcon icon={faCamera} />
        </div>
          <h3 className="cta-title">{t('sidebar.havePhotos')}</h3>
          <p className="cta-description">{t('sidebar.sharePhotos')}</p>
        <Link to="/contribute" className="cta-button">
            {t('sidebar.contributeNow')}
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </aside>
  )
}

export default CommunitySidebar
