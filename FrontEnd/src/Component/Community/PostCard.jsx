import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAppContext from '../../context/useAppContext'
import { likeArticle, unlikeArticle, listLikes, getArticleLikesList } from '../../API/likes'
import { getCommentsByArticle, createComment, deleteComment } from '../../API/comments'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faComment, faShareNodes, faTrash } from '@fortawesome/free-solid-svg-icons'
import '../../Styles/community/Community.css'

// Minimal, robust PostCard component rewritten from scratch.
// Behavior:
// - Waits for auth restore (isAuthLoading) before fetching server state
// - Uses accessToken from context when present to authenticate requests
// - Optimistic UI on toggle, applies authoritative server response when available
// - Reads like state from server on load (no localStorage persistence)
// - Does NOT auto-clear liked on logout (keeps visual state until user toggles)

const PostCard = ({ post, onDelete, showDeleteButton = false }) => {
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading, accessToken, user } = useAppContext()

  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post?.likes || 0)
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0)
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)

  // short-lived override to prevent immediate GET from clobbering a recent toggle
  const overrideRef = useRef({})

  // fetch authoritative state (called after auth restore)
  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (isAuthLoading) return

      // Always fetch the per-article likes list (userIds + count) from the
      // backend. This endpoint (`/articles_post/:id/likes`) is public and
      // returns the list of user IDs who liked the article. Using it avoids
      // relying on the Authorization timing for `GET /articles_post/:id/like`.
      try {
        const res = await getArticleLikesList(post.id, accessToken)
        if (!mounted) return
        // res expected { count, userIds }
        const count = res?.count ?? (Array.isArray(res?.userIds) ? res.userIds.length : 0)
        const userIds = Array.isArray(res?.userIds) ? res.userIds : []
        setLikes(count)
        if (user?.userId != null) {
          const found = userIds.some((id) => Number(id) === Number(user.userId))
          setLiked(!!found)
        } else {
          setLiked(false)
        }
      } catch (err) {
        void err
        // fallback: try the generic /likes list and compute similarly
        try {
          const all = await listLikes()
          if (!mounted) return
          const articleLikes = (Array.isArray(all) ? all.filter((l) => Number(l.ArticleID) === Number(post.id)) : [])
          setLikes(articleLikes.length)
          if (user?.userId != null) {
            const userLiked = articleLikes.some((l) => Number(l.UserID) === Number(user.userId))
            setLiked(!!userLiked)
          } else {
            setLiked(false)
          }
        } catch (err) { void err }
      }
    }

    run()
    return () => { mounted = false }
    // intentionally include accessToken and user so we re-run when they change
  }, [post?.id, post?.likes, isAuthLoading, isAuthenticated, accessToken, user])

  // Load comments khi mở phần comment
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments()
    }
  }, [showComments])

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      const data = await getCommentsByArticle(post.id)
      setComments(data || [])
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập để bình luận. Đến trang đăng nhập?')) {
        navigate('/login')
      }
      return
    }

    if (!commentText.trim()) return

    try {
      const newComment = await createComment(post.id, commentText.trim())
      setComments([...comments, newComment])
      setCommentCount(prev => prev + 1)
      setCommentText('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể thêm bình luận')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return

    try {
      await deleteComment(commentId)
      setComments(comments.filter(c => c.id !== commentId))
      setCommentCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể xóa bình luận')
    }
  }

  const handleToggle = async () => {
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập để bày tỏ cảm xúc. Đến trang đăng nhập?')) {
        navigate('/login')
      }
      return
    }

    setLoading(true)
    const willLike = !liked

    // optimistic
    setLiked(willLike)
    setLikes((n) => Math.max(0, n + (willLike ? 1 : -1)))

    try {
      if (willLike) {
        const res = await likeArticle(post.id, accessToken)
        if (res && typeof res.liked === 'boolean') setLiked(res.liked)
        if (res && typeof res.likesCount === 'number') setLikes(res.likesCount)

        // set short override so immediate GET doesn't overwrite
        overrideRef.current[post.id] = { liked: true, expires: Date.now() + 4000 }
      } else {
        const res = await unlikeArticle(post.id, accessToken)
        if (res && typeof res.liked === 'boolean') setLiked(res.liked)
        if (res && typeof res.likesCount === 'number') setLikes(res.likesCount)

        overrideRef.current[post.id] = { liked: false, expires: Date.now() + 4000 }
      }

      // no local persistence: server is the source of truth

    } catch (err) {
      // rollback on error
      setLiked((prev) => !prev)
      setLikes((n) => Math.max(0, n + (willLike ? -1 : 1)))
      toast.error(err?.message || 'Đã có lỗi. Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="post-card" id={`post-${post.id}`}>
      <header className="post-header">
        <div 
          className="avatar"
          style={{
            backgroundImage: post.authorAvatar ? `url(${post.authorAvatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: post.authorId ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (post.authorId) {
              const currentUserId = user?.userId || user?.UserID || user?.sub;
              const authorId = parseInt(post.authorId);
              const currentId = parseInt(currentUserId);
              
              if (currentId && authorId === currentId) {
                navigate('/Personal');
              } else {
                navigate(`/user/${post.authorId}`);
              }
            }
          }}
          title={post.authorId ? `Xem trang cá nhân của ${post.author}` : ''}
        >
          {!post.authorAvatar && (post.author || 'U').slice(0,2).toUpperCase()}
        </div>
        <div className="meta">
          <div 
            className="name"
            style={{ cursor: post.authorId ? 'pointer' : 'default' }}
            onClick={() => {
              if (post.authorId) {
                const currentUserId = user?.userId || user?.UserID || user?.sub;
                const authorId = parseInt(post.authorId);
                const currentId = parseInt(currentUserId);
                
                if (currentId && authorId === currentId) {
                  navigate('/Personal');
                } else {
                  navigate(`/user/${post.authorId}`);
                }
              }
            }}
            title={post.authorId ? `Xem trang cá nhân của ${post.author}` : ''}
          >
            {post.author}
          </div>
          <div className="sub">{post.when} · {post.category}</div>
        </div>
        <div className="spacer" />
        {showDeleteButton && onDelete && (
          <button 
            className="delete-btn-personal" 
            onClick={() => onDelete(post.id)}
            title="Xóa bài viết"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        )}
      </header>

      <div className="post-body">
        <p className="post-text">{post.text}</p>
        {post.image && <img className="post-image" src={post.image} alt="post" />}
      </div>

      <footer className="post-footer">
        <div>
          <div className="actions">
            <button
              className={`like-btn${liked ? ' liked' : ''}`}
              onClick={handleToggle}
              disabled={loading}
              aria-pressed={liked}
            >
              <FontAwesomeIcon icon={faHeart} /> {liked ? 'Đã thích' : 'Thích'}
            </button>
            <button 
              className={`comment-btn${showComments ? ' active' : ''}`}
              onClick={() => setShowComments(!showComments)}
            >
              <FontAwesomeIcon icon={faComment} /> Bình luận
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                className="share-btn"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <FontAwesomeIcon icon={faShareNodes} /> Chia sẻ
              </button>
              {/* Share Menu */}
              {showShareMenu && (
                <div className="share-menu">
                  <button 
                    className="share-option"
                    onClick={async () => {
                      try {
                        const url = `${window.location.origin}/community?post=${post.id}`;
                        await navigator.clipboard.writeText(url);
                        toast.success('Đã sao chép link!');
                        setShowShareMenu(false);
                      } catch {
                        // Fallback nếu clipboard API không hoạt động
                        const textArea = document.createElement('textarea');
                        textArea.value = `${window.location.origin}/community?post=${post.id}`;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        try {
                          document.execCommand('copy');
                          toast.success('Đã sao chép link!');
                        } catch {
                          toast.error('Không thể sao chép link');
                        }
                        document.body.removeChild(textArea);
                        setShowShareMenu(false);
                      }
                    }}
                  >
                    📋 Sao chép link
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="counts">
            <span>{likes.toLocaleString()} lượt thích</span>
            <span style={{ margin: '0 8px', color: 'var(--muted)' }}>•</span>
            <span>{commentCount} bình luận</span>
          </div>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="comments-section">
            <div className="comment-input-wrapper">
              <div 
                className="comment-avatar"
                style={{
                  backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!user?.avatar && (user?.fullName || 'U').slice(0,2).toUpperCase()}
              </div>
              <input
                type="text"
                className="comment-input"
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    handleAddComment();
                  }
                }}
              />
              <button 
                className="comment-submit"
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Gửi
              </button>
            </div>
            <div className="comments-list">
              {loadingComments ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  Đang tải bình luận...
                </p>
              ) : comments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div 
                      className="comment-avatar"
                      style={{
                        backgroundImage: comment.author?.avatar ? `url(${comment.author.avatar})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!comment.author?.avatar && (comment.author?.fullName || 'U').slice(0,2).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author?.fullName || 'Người dùng'}</span>
                        <span className="comment-time">
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </span>
                        {user?.userId === comment.author?.id && (
                          <button 
                            className="comment-delete"
                            onClick={() => handleDeleteComment(comment.id)}
                            title="Xóa bình luận"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </footer>
    </article>
  )
}

export default PostCard