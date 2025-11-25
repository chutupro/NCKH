import React from 'react'
import { useNavigate } from 'react-router-dom'

const PostHeader = ({ post, user, showDeleteButton, onDelete }) => {
  const navigate = useNavigate()

  const handleAvatarClick = () => {
    if (post.authorId) {
      const currentUserId = user?.userId || user?.UserID || user?.sub
      const authorId = parseInt(post.authorId)
      const currentId = parseInt(currentUserId)

      if (currentId && authorId === currentId) {
        navigate('/Personal')
      } else {
        navigate(`/user/${post.authorId}`)
      }
    }
  }

  return (
    <header className="post-header">
      <div 
        className="avatar"
        style={{
          backgroundImage: post.authorAvatar ? `url(${post.authorAvatar})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: post.authorId ? 'pointer' : 'default',
        }}
        onClick={handleAvatarClick}
        title={post.authorId ? `Xem trang cá nhân của ${post.author}` : ''}
      >
        {!post.authorAvatar && (post.author || 'U').slice(0,2).toUpperCase()}
      </div>
      <div className="meta">
        <div 
          className="name"
          style={{ cursor: post.authorId ? 'pointer' : 'default' }}
          onClick={handleAvatarClick}
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
  )
}

export default PostHeader
