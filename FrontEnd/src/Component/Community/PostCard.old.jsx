import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAppContext from '../../context/useAppContext'
import { likeArticle, unlikeArticle, listLikes, getArticleLikesList } from '../../API/likes'
import { getCommentsByArticle, createComment, deleteComment, createReply } from '../../API/comments'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faComment, faShareNodes, faTrash, faReply } from '@fortawesome/free-solid-svg-icons'
import '../../Styles/community/Community.css'

const PostCard = ({ post, onDelete, showDeleteButton = false }) => {
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading, accessToken, user } = useAppContext()

  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post?.likes || 0)
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0)
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const overrideRef = useRef({})

  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (isAuthLoading) return

      try {
        const res = await getArticleLikesList(post.id, accessToken)
        if (!mounted) return
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
  }, [post?.id, post?.likes, isAuthLoading, isAuthenticated, accessToken, user])

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập để bày tỏ cảm xúc. Đến trang đăng nhập?')) {
        navigate('/login')
      }
      return
    }

    setLoading(true)
    const willLike = !liked

    setLiked(willLike)
    setLikes((n) => Math.max(0, n + (willLike ? 1 : -1)))

    try {
      if (willLike) {
        const res = await likeArticle(post.id, accessToken)
        if (res && typeof res.liked === 'boolean') setLiked(res.liked)
        if (res && typeof res.likesCount === 'number') setLikes(res.likesCount)
        overrideRef.current[post.id] = { liked: true, expires: Date.now() + 4000 }
      } else {
        const res = await unlikeArticle(post.id, accessToken)
        if (res && typeof res.liked === 'boolean') setLiked(res.liked)
        if (res && typeof res.likesCount === 'number') setLikes(res.likesCount)
        overrideRef.current[post.id] = { liked: false, expires: Date.now() + 4000 }
      }
    } catch (err) {

      setLiked((prev) => !prev)
      setLikes((n) => Math.max(0, n + (willLike ? -1 : 1)))
      toast.error(err?.message || 'Đã có lỗi. Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentCountChange = (delta) => {
    setCommentCount((prev) => Math.max(0, prev + delta))
  }

  return (
    <article className="post-card" id={`post-${post.id}`}>
      <PostHeader 
        post={post}
        user={user}
        showDeleteButton={showDeleteButton}
        onDelete={onDelete}
      />

      <div className="post-body">
        <p className="post-text">{post.text}</p>
        {post.image && <img className="post-image" src={post.image} alt="post" />}
      </div>

      <footer className="post-footer">
        <PostActions
          liked={liked}
          likes={likes}
          commentCount={commentCount}
          loading={loading}
          showComments={showComments}
          onToggleLike={handleToggleLike}
          onToggleComments={() => setShowComments(!showComments)}
          postId={post.id}
        />

        {showComments && (
          <CommentsSection
            postId={post.id}
            user={user}
            isAuthenticated={isAuthenticated}
            onCommentCountChange={handleCommentCountChange}
          />
        )}
      </footer>
    </article>
  )
}

export default PostCard