import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getCommentsByArticle, createComment, deleteComment, createReply } from '../../API/comments'
import CommentInput from './CommentInput'
import CommentThread from './CommentThread'

const CommentsSection = ({ postId, user, isAuthenticated, onCommentCountChange }) => {
  const navigate = useNavigate()
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    loadComments()

  }, [postId])

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      const data = await getCommentsByArticle(postId)
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
      await createComment(postId, commentText.trim())
      await loadComments()
      onCommentCountChange(1)
      setCommentText('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể thêm bình luận')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return

    const countCommentsToDelete = (comments, targetId) => {
      for (const comment of comments) {
        if (comment.id === targetId) {

          return 1 + (comment.replies?.length || 0)
        }

        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            if (reply.id === targetId) {
              return 1 // Chỉ xóa 1 reply
            }
          }
        }
      }
      return 1
    }

    const deleteCount = countCommentsToDelete(comments, commentId)

    try {
      await deleteComment(commentId)
      await loadComments()
      onCommentCountChange(-deleteCount)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể xóa bình luận')
    }
  }

  const handleReply = (commentId, authorName) => {
    setReplyingTo({ id: commentId, name: authorName })
    setReplyText('')
  }

  const handleAddReply = async () => {
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập để trả lời. Đến trang đăng nhập?')) {
        navigate('/login')
      }
      return
    }

    if (!replyText.trim() || !replyingTo) return

    try {
      await createReply(postId, replyingTo.id, replyText.trim(), replyingTo.name)
      await loadComments()
      onCommentCountChange(1)
      setReplyText('')
      setReplyingTo(null)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể thêm trả lời')
    }
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setReplyText('')
  }

  return (
    <div className="comments-section">
      <CommentInput 
        user={user}
        value={commentText}
        onChange={setCommentText}
        onSubmit={handleAddComment}
      />

      {replyingTo && (
        <div className="reply-input-wrapper">
          <div className="reply-to-header">
            <span>Trả lời {replyingTo.name}</span>
            <button className="cancel-reply-btn" onClick={cancelReply}>✕</button>
          </div>
          <div className="reply-input-content">
            <CommentInput 
              user={user}
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleAddReply}
              placeholder={`Trả lời ${replyingTo.name}...`}
            />
          </div>
        </div>
      )}

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
            <CommentThread
              key={comment.id}
              comment={comment}
              user={user}
              onDelete={handleDeleteComment}
              onReply={handleReply}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CommentsSection
