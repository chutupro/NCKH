import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import '../../Styles/community/Community.css'
import { getArticleById } from '../../API/articles'

const PostDetailOverlay = ({ post, onClose }) => {
  const [full, setFull] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // likes/comments removed per UX request

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose() }
    document.addEventListener('keydown', onKey)
    // prevent background scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  useEffect(() => {
    if (!post?.id) {
      setFull(null)
      return
    }
    let mounted = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const a = await getArticleById(post.id)
        if (!mounted) return
        setFull(a)
      } catch (err) {
        if (!mounted) return
        setError(err?.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [post?.id])

  // likes/comments removed per UX request

  if (!post) return null

  // choose title/content from full article when available
  const title = full?.title || full?.ArticleTitle || post.title || post.text || ''
  const content = full?.content || full?.ArticleContent || full?.description || post.text || ''

  return (
    <div
      className="post-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target.classList.contains('post-overlay')) onClose && onClose() }}
    >
      <div className="post-overlay-card">
        <button className="overlay-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); onClose && onClose() }}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <header className="overlay-header">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="avatar" className="overlay-avatar" />
          ) : (
            <div className="avatar" style={{ width:48, height:48 }}>{post.author ? post.author[0] : 'U'}</div>
          )}
          <div style={{ marginLeft: 12 }}>
            <div style={{ fontWeight:700 }}>{post.author}</div>
          </div>
        </header>

        <div className="overlay-body">
          {/* category + time side-by-side */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
            <div style={{ color: '#e8d7b7', fontWeight: 700 }}>{post.category || ''}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{post.when}</div>
          </div>

          {/* title */}
          <h2 style={{ margin: '6px 0 10px 0' }}>{title}</h2>

          {/* loading / error indicator for fetching full content */}
          {loading && <div style={{ color: 'var(--muted)' }}>Đang tải nội dung...</div>}
          {error && <div style={{ color: '#ef4444' }}>Lỗi: {error}</div>}

          {/* content */}
          <section className="overlay-contribution">
            <h4 style={{ margin: '8px 0', color: '#e8d7b7' }}>Nội dung đóng góp</h4>
            <div className="post-text" style={{ color: '#efeaea' }} dangerouslySetInnerHTML={{ __html: content }} />
          </section>

          {post.image && (
            <div className="overlay-image" style={{ marginTop: 12 }}>
              <img src={post.image} alt="post" className="overlay-img" />
            </div>
          )}

          {/* likes and comments removed per UX request */}
        </div>
      </div>
    </div>
  )
}

export default PostDetailOverlay
