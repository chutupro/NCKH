import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../../Styles/community/Community.css'
import ImageModal from '../common/ImageModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faComment, faShareNodes, faPaperPlane } from '@fortawesome/free-solid-svg-icons'


const PostCard = ({ post }) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSrc, setModalSrc] = useState(null)

  const toggleLike = () => {
    setLiked((s) => !s)
    setLikes((n) => (liked ? n - 1 : n + 1))
  }

  const toggleComments = () => {
    setShowComments((s) => !s)
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
          author: t('postCard.user'),
        text: commentText,
          when: t('postCard.justNow')
      }
      setComments([...comments, newComment])
      setCommentText('')
    }
  }

  const handleShare = (platform) => {
    const shareUrl = window.location.href
      const shareText = `${t('postCard.viewPost')} ${post.author}: ${post.text}`
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
          alert(t('postCard.linkCopied'))
        break
      default:
        break
    }
    setShowShareMenu(false)
  }

  const avatarText = (() => {
    try {
      return post.author.split(' ').map(n => n[0]).slice(0,2).join('')
    } catch {
      return post.author?.slice(0,2) || 'U'
    }
  })()

  return (
    <article className="post-card" id={`post-${post.id}`}>
      <header className="post-header">
        <div className="avatar">{avatarText}</div>
        <div className="meta">
          <div className="name">{post.author}</div>
          <div className="sub">{post.when} · {post.category}</div>
        </div>
        <div className="spacer" />
      </header>

      <div className="post-body">
        <p className="post-text">{post.text}</p>
        <div className="post-image-wrap">
          <img
            className="post-image crisper"
            src={post.image}
            alt={`Ảnh bài đăng của ${post.author}`}
            style={{cursor: 'zoom-in'}}
            onClick={() => { setModalSrc(post.image); setModalOpen(true) }}
            role="button"
          />
        </div>
      </div>

      <footer className="post-footer">
        <div className="actions">
          <button
            aria-pressed={liked}
            className={"like-btn" + (liked ? ' liked' : '')}
            onClick={toggleLike}
          >
            <FontAwesomeIcon icon={faHeart} className="like-icon" />
              {liked ? t('postCard.liked') : t('postCard.like')}
          </button>
          <button
            className="comment-btn"
            onClick={toggleComments}
          >
            <FontAwesomeIcon icon={faComment} className="comment-icon" />
              {t('postCard.comment')}
          </button>
          <div className="share-container">
            <button
              className="share-btn"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <FontAwesomeIcon icon={faShareNodes} className="share-icon" />
                {t('postCard.share')}
            </button>
            {showShareMenu && (
              <div className="share-menu">
                <button onClick={() => handleShare('facebook')}>Facebook</button>
                <button onClick={() => handleShare('twitter')}>Twitter</button>
                  <button onClick={() => handleShare('copy')}>{t('postCard.copyLink')}</button>
              </div>
            )}
          </div>
        </div>
        <div className="counts">
            <span className="likes-count">{likes.toLocaleString()} {t('postCard.likesCount')}</span>
          {comments.length > 0 && (
              <span className="comments-count"> · {comments.length} {t('postCard.commentsCount')}</span>
          )}
        </div>
      </footer>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">{comment.author[0]}</div>
                <div className="comment-content">
                  <div className="comment-author">{comment.author}</div>
                  <div className="comment-text">{comment.text}</div>
                  <div className="comment-time">{comment.when}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="comment-input-wrapper">
            <input
              type="text"
              className="comment-input"
                placeholder={t('postCard.writeComment')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button className="comment-submit" onClick={handleAddComment}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <ImageModal
          src={modalSrc}
          alt={`Ảnh lớn của ${post.author}`}
          caption={post.text}
          onClose={() => setModalOpen(false)}
        />
      )}
    </article>
  )
}

export default PostCard
