import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faComment, faShareNodes } from '@fortawesome/free-solid-svg-icons'

const PostActions = ({ 
  liked, 
  likes, 
  commentCount, 
  loading, 
  showComments,
  onToggleLike, 
  onToggleComments,
  postId 
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/community?post=${postId}`
      await navigator.clipboard.writeText(url)
      toast.success('Đã sao chép link!')
      setShowShareMenu(false)
    } catch {
      // Fallback nếu clipboard API không hoạt động
      const textArea = document.createElement('textarea')
      textArea.value = `${window.location.origin}/community?post=${postId}`
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        toast.success('Đã sao chép link!')
      } catch {
        toast.error('Không thể sao chép link')
      }
      document.body.removeChild(textArea)
      setShowShareMenu(false)
    }
  }

  return (
    <div>
      <div className="actions">
        <button
          className={`like-btn${liked ? ' liked' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(e); }}
          disabled={loading}
          aria-pressed={liked}
        >
          <FontAwesomeIcon icon={faHeart} /> {liked ? 'Đã thích' : 'Thích'}
        </button>
        <button 
          className={`comment-btn${showComments ? ' active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleComments && onToggleComments(e); }}
        >
          <FontAwesomeIcon icon={faComment} /> Bình luận
        </button>
        <div style={{ position: 'relative' }}>
          <button 
            className="share-btn"
            onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
          >
            <FontAwesomeIcon icon={faShareNodes} /> Chia sẻ
          </button>
          {showShareMenu && (
            <div className="share-menu" onClick={(e) => e.stopPropagation()}>
              <button className="share-option" onClick={(e) => { e.stopPropagation(); handleShare(); }}>
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
  )
}

export default PostActions
