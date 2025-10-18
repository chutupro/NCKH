import React from 'react'
import '../../Styles/community/Community.css'
import posts from '../../util/posts'
import PostCard from '../../Component/Community/PostCard'
import Headers from '../../Component/home/Headers'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons'

const Community = () => {
  return (
    <main className="community-page">
      <Headers />
      <div className="container">
        <div className="topbar hero">
          <div className="hero-avatar" aria-hidden>
            <FontAwesomeIcon icon={faUsers} className="hero-icon" />
          </div>
          <h2 className="hero-title">Cộng đồng Di sản Đà Nẵng</h2>
          <p className="hero-sub">Chia sẻ hình ảnh, kết nối với cộng đồng yêu thích di sản văn hóa</p>
          <Link to='/contribute' className="contribute-primary">
            <FontAwesomeIcon icon={faPlus} />
            Đăng ảnh mới
          </Link>
        </div>

        <div className="posts-list">
          {posts.map((p) => (
            <PostCard post={p} key={p.id} />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Community
