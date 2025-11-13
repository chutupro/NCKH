import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../../Styles/community/Community.css'
// fetch posts from backend
import { getArticlesPosts } from '../../API/articlesPost'
import postsMock from '../../util/posts'
const BACKEND_BASE = 'http://localhost:3000'
import PostCard from '../../Component/Community/PostCard'
import CommunitySidebar from '../../Component/Community/CommunitySidebar'
import Headers from '../../Component/home/Headers'
import { Link, useLocation } from 'react-router-dom';
import ProtectedLink from '../../Component/common/ProtectedLink'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons'

const Community = () => {
  const { t } = useTranslation();
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    const matchCategory = activeFilter === 'all' || (post.category || '').toLowerCase() === activeFilter.toLowerCase()

    // Lọc theo search query
    const text = (post.text || '').toString()
    const author = (post.author || '').toString()
    const category = (post.category || '').toString()
    const matchSearch = searchQuery === '' || 
      text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())

    return matchCategory && matchSearch
  })

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getArticlesPosts(controller.signal)
        const mapped = data.map(a => {
          // normalize image URL: backend may return '/uploads/xxx.jpg' (relative to backend)
          let image = a.image || ''
          if (image && !/^https?:\/\//i.test(image)) {
            // ensure leading slash
            if (!image.startsWith('/')) image = '/' + image
            image = `${BACKEND_BASE}${image}`
          }
          return {
            id: a.id,
            author: a.author?.fullName || a.author?.FullName || 'Người dùng',
            when: a.createdAt ? new Date(a.createdAt).toLocaleString() : '',
            category: a.category || '',
            text: a.title || a.content || '',
            image,
            likes: a.likeCount || 0,
          }
        })
        setPosts(mapped)
      } catch (err) {
        // ignore abort/cancel errors (these happen when user navigates away or request is cancelled)
        const isAxiosCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || /canceled/i.test(err?.message || '')
        if (isAxiosCanceled) return
        if (err.name !== 'AbortError') {
          const msg = err.message || String(err)
          // If it's a network error (backend down / CORS / connection), fall back to local mock so UI remains usable
          const isNetwork = /network error/i.test(msg) || err.cause === undefined || err.message === 'Network Error'
          if (isNetwork) {
            // map local mock posts to same shape
            const mappedMock = postsMock.map(p => ({
              id: p.id,
              author: p.author || 'Người dùng',
              when: p.when || '',
              category: p.category || '',
              text: p.text || '',
              image: p.image || '',
              likes: p.likes || 0,
            }))
            setPosts(mappedMock)
            setError((t('community.apiFallback') || 'Đã xảy ra lỗi mạng — hiển thị dữ liệu cục bộ'))
            console.warn('articles_post API failed, using local mock posts. Original error:', err)
          } else {
            setError(msg)
            console.error('Failed to load articles_post:', err)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [t])

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
          <ProtectedLink to='/contribute' className="contribute-primary">
            <FontAwesomeIcon icon={faPlus} />
            {t('community.createPost')}
          </ProtectedLink>
        </div>

        <div className="community-content">
            <div className="posts-list">
              {/* search indicator removed (handled via UI elsewhere or not shown) */}
            {loading ? (
              <div className="loading">{t('common.loading') || 'Đang tải...'}</div>
            ) : error ? (
              <div className="error">{t('common.error') || 'Lỗi: '}{error}</div>
            ) : filteredPosts.length > 0 ? (
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
