import React, { useState } from 'react'
import '../../Styles/community/Community.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'


const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes || 0)

  const toggleLike = () => {
    setLiked((s) => !s)
    setLikes((n) => (liked ? n - 1 : n + 1))
  }

  const avatarText = (() => {
    try {
      return post.author.split(' ').map(n => n[0]).slice(0,2).join('')
    } catch {
      return post.author?.slice(0,2) || 'U'
    }
  })()

  return (
    <article className="post-card">
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
            {liked ? 'Đã thích' : 'Thích'}
          </button>
        </div>
        <div className="counts">
          <span className="likes-count">{likes.toLocaleString()} lượt thích</span>
        </div>
      </footer>
    </article>
  )
}

export default PostCard
