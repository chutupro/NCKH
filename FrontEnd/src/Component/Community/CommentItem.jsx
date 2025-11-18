import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const CommentItem = ({ 
  comment, 
  user, 
  onDelete, 
  onReply, 
  isReply = false 
}) => {
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
          <span className="comment-time">
            {new Date(comment.createdAt).toLocaleString('vi-VN')}
          </span>
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
