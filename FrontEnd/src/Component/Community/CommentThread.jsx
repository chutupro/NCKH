import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReply } from '@fortawesome/free-solid-svg-icons'
import CommentItem from './CommentItem'

const CommentThread = ({ comment, user, onDelete, onReply }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="comment-thread">
      <CommentItem 
        comment={comment}
        user={user}
        onDelete={onDelete}
        onReply={onReply}
      />
      
      {/* Show replies toggle button */}
      {comment.replies && comment.replies.length > 0 && (
        <button 
          className="view-replies-btn"
          onClick={() => setExpanded(!expanded)}
        >
          <FontAwesomeIcon icon={faReply} />
          {expanded 
            ? `Ẩn ${comment.replies.length} bình luận`
            : `Xem ${comment.replies.length} bình luận`
          }
        </button>
      )}
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && expanded && (
        <div className="replies-list">
          {comment.replies.map((reply) => (
            <CommentItem 
              key={reply.id}
              comment={reply}
              user={user}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentThread
