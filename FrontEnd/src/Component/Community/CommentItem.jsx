import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

const CommentItem = ({ 
  comment, 
  user, 
  onDelete, 
  onReply, 
  isReply = false 
}) => {
  const u = user || {}
  const isAdmin = Boolean(
    (typeof u.role === 'string' && u.role.toLowerCase() === 'admin') ||
    (typeof u.roleName === 'string' && u.roleName.toLowerCase() === 'admin') ||
    (typeof u.Role === 'string' && u.Role.toLowerCase() === 'admin') ||
    (typeof u.RoleName === 'string' && u.RoleName.toLowerCase() === 'admin') ||
    (Array.isArray(u.roles) && u.roles.some(r => typeof r === 'string' && r.toLowerCase() === 'admin')) ||
    u.isAdmin === true
  )
  const isPrivileged = Boolean(
    isAdmin ||
    (typeof u.role === 'string' && u.role.toLowerCase() === 'moderator') ||
    (typeof u.roleName === 'string' && u.roleName.toLowerCase() === 'moderator') ||
    (typeof u.Role === 'string' && u.Role.toLowerCase() === 'moderator') ||
    (typeof u.RoleName === 'string' && u.RoleName.toLowerCase() === 'moderator') ||
    (Array.isArray(u.roles) && u.roles.some(r => typeof r === 'string' && r.toLowerCase() === 'moderator')) ||
    u.isModerator === true ||
    (typeof u.RoleID === 'number' && (u.RoleID === 1 || u.RoleID === 3))
  )
  // Debugging: print user and moderation state so we can see why icon may not appear
  try {
    // eslint-disable-next-line no-console
    console.debug('[CommentItem] user:', u, 'isAdmin:', isAdmin, 'isPrivileged:', isPrivileged, 'commentModeration:', comment.moderation, 'commentId:', comment.id ?? comment.CommentID)
  } catch (e) {
    // ignore
  }
  return (
    <div className={`comment-item ${isReply ? 'reply-item' : ''}`}>
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
          <span className="comment-author">
            {comment.author?.fullName || 'Người dùng'}
            {isReply && comment.replyToName && (
              <span className="reply-to-text"> trả lời <span className="reply-to-name">{comment.replyToName}</span></span>
            )}
          </span>
          {/* hate flag moved next to delete button for admin users */}
          <span className="comment-time">
            {new Date(comment.createdAt).toLocaleString('vi-VN')}
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            {isPrivileged && (
              (comment.moderation && (
                  (typeof comment.moderation === 'string' && comment.moderation === 'hate') ||
                  (comment.moderation.label && comment.moderation.label === 'hate')
                )) ? (
                  (() => {
                    const commentId = comment.id ?? comment.CommentID ?? comment.commentId
                    const onIconClick = (e) => {
                      e.preventDefault()
                      if (!isPrivileged) return
                      if (window.confirm('Bạn muốn xóa?')) {
                        if (typeof onDelete === 'function') onDelete(commentId)
                      }
                    }
                    const onIconKeyDown = (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onIconClick(e)
                      }
                    }
                    return (
                      <span
                        title="Nội dung có dấu hiệu thù ghét"
                        style={{ color: '#dc2626', marginRight: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                        role="button"
                        tabIndex={0}
                        aria-label="Nội dung có dấu hiệu thù ghét (chỉ quản trị viên nhìn thấy). Nhấn để xóa."
                        onClick={onIconClick}
                        onKeyDown={onIconKeyDown}
                      >
                        <FontAwesomeIcon icon={faExclamationCircle} />
                      </span>
                    )
                  })()
                ) : null
            )}

            {user?.userId === comment.author?.id && (
              <button 
                className="comment-delete"
                onClick={() => onDelete(comment.id)}
                title={isReply ? "Xóa trả lời" : "Xóa bình luận"}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </div>
        <p className="comment-text">{comment.content}</p>
        {!isReply && onReply && (
          <div className="comment-actions">
            <button 
              className="reply-btn"
              onClick={() => onReply(comment.id, comment.author?.fullName)}
            >
              Trả lời
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentItem
