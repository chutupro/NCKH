import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../../Styles/community/Community.css'
import posts from '../../util/posts'
import PostCard from '../../Component/Community/PostCard'
import CommunitySidebar from '../../Component/Community/CommunitySidebar'
import Headers from '../../Component/home/Headers'
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons'

const Community = () => {
  const { t } = useTranslation();
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Nếu URL có query param ?query=..., dùng nó làm searchQuery ban đầu
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('query') || ''
    if (q) setSearchQuery(q)
  }, [location.search])

  useEffect(() => {
    // Scroll đến bài viết cụ thể nếu có hash trong URL
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Thêm hiệu ứng highlight
          element.style.transition = 'all 0.3s ease'
          element.style.transform = 'scale(1.02)'
          element.style.boxShadow = '0 8px 30px rgba(232, 215, 183, 0.4)'
          setTimeout(() => {
            element.style.transform = 'scale(1)'
            element.style.boxShadow = ''
          }, 1000)
        }
      }, 300)
    }
  }, [location])

  // Lọc bài viết theo category và search query
  const filteredPosts = posts.filter(post => {
    // Lọc theo category
    const matchCategory = activeFilter === 'all' || post.category.toLowerCase() === activeFilter.toLowerCase()
    
    // Lọc theo search query
    const matchSearch = searchQuery === '' || 
      post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchCategory && matchSearch
  })

  return (
    <main className="community-page">
      <Headers />
      <div className="container">
        <div className="topbar hero">
          <div className="hero-avatar" aria-hidden>
            <FontAwesomeIcon icon={faUsers} className="hero-icon" />
          </div>
          <h2 className="hero-title">{t('community.title')}</h2>
          <p className="hero-sub">{t('community.subtitle')}</p>
          <Link to='/contribute' className="contribute-primary">
            <FontAwesomeIcon icon={faPlus} />
            {t('community.createPost')}
          </Link>
        </div>

        <div className="community-content">
            <div className="posts-list">
              {/* search indicator removed (handled via UI elsewhere or not shown) */}
            {filteredPosts.length > 0 ? (
              filteredPosts.map((p) => (
                <PostCard post={p} key={p.id} />
              ))
            ) : (
              <div className="no-posts">
                <p>{t('community.noPosts')}</p>
              </div>
            )}
          </div>
          
          <CommunitySidebar 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>
    </main>
  )
}

export default Community
