import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useAppContext from '../../context/useAppContext'
import { likeArticle, unlikeArticle, listLikes, getArticleLikesList } from '../../API/likes'
import PostHeader from './PostHeader'
import PostActions from './PostActions'
import CommentsSection from './CommentsSection'
import '../../Styles/community/Community.css'

const PostCard = (props) => {
  const { post, onDelete, showDeleteButton = false, onOpen } = props
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading, accessToken, user } = useAppContext()

  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post?.likes || 0)
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0)
  const [loading, setLoading] = useState(false)
  // `showComments` is controlled by parent when provided via props
  // if not provided, fallback to local state for backward compatibility
  const [localShowComments, setLocalShowComments] = useState(false)
  const showComments = typeof props?.showComments !== 'undefined' ? props.showComments : localShowComments

  const overrideRef = useRef({})

  // Fetch likes state
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

    // Optimistic update
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
      // Rollback on error
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

  const articleRef = useRef(null)

  // Close comments when clicking outside this PostCard
  useEffect(() => {
    if (!showComments) return
    const onDocClick = (e) => {
      const el = articleRef.current
      if (!el) return
      if (!el.contains(e.target)) {
        // If parent provided onToggleComments, call it; otherwise use local setter
        if (typeof props.onToggleComments === 'function') props.onToggleComments(false)
        else setLocalShowComments(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showComments])

  return (
    <article className="post-card" id={`post-${post.id}`} ref={articleRef}>
      <PostHeader 
        post={post}
        user={user}
        showDeleteButton={showDeleteButton}
        onDelete={onDelete}
      />

      <div className="post-body">
        <p className="post-text">{post.text}</p>
        {post.image && (
          <img
            className="post-image"
            src={post.image}
            alt="post"
            onClick={(e) => { e.stopPropagation(); onOpen && onOpen(post) }}
            style={{ cursor: onOpen ? 'pointer' : 'default' }}
          />
        )}
      </div>

      <footer className="post-footer">
        <PostActions
          liked={liked}
          likes={likes}
          commentCount={commentCount}
          loading={loading}
          showComments={showComments}
          onToggleLike={handleToggleLike}
          onToggleComments={(e) => {
            if (e === false) {
              // explicit close
              if (typeof props.onToggleComments === 'function') props.onToggleComments()
              else setLocalShowComments(false)
              return
            }
            // toggle: prefer parent handler if provided
            if (typeof props.onToggleComments === 'function') props.onToggleComments()
            else setLocalShowComments(prev => !prev)
          }}
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
