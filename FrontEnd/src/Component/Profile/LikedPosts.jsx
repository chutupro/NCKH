import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import PostCard from '../Community/PostCard';
import { getArticlesPosts } from '../../API/articlesPost';
import { listLikes } from '../../API/likes';

const LikedPosts = () => {
  const { user } = useAppContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        // Lấy tất cả likes từ API
        const allLikes = await listLikes();
        
        // Lấy tất cả bài viết
        const allArticles = await getArticlesPosts();
        
        // Filter likes của user hiện tại
        const userId = user?.userId || user?.UserID || user?.sub;
        const userLikes = allLikes.filter(like => 
          like.UserID === userId
        );
        
        // Lấy ArticleID của các bài viết đã like
        const likedArticleIds = userLikes.map(like => like.ArticleID);
        
        // Filter các bài viết đã like
        const likedArticles = allArticles.filter(article => 
          likedArticleIds.includes(article.id)
        );

        // Map sang format của PostCard
        const mapped = likedArticles.map(a => ({
          id: a.id,
          author: a.author?.fullName || 'Người dùng',
          when: a.createdAt ? new Date(a.createdAt).toLocaleString('vi-VN') : '',
          category: a.category || '',
          text: a.title || a.content || '',
          image: a.image || '',
          likes: a.likeCount || 0,
        }));
        
        setPosts(mapped);
      } catch (error) {
        console.error('Error fetching liked posts:', error);
        // Không hiển thị toast error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLikedPosts();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
        <h3 style={{ color: '#f5e6d3', marginBottom: '8px' }}>Chưa có bài viết yêu thích</h3>
        <p style={{ color: 'rgba(245, 230, 211, 0.6)' }}>Bạn chưa thích bài viết nào. Hãy khám phá và lưu lại những bài viết hay!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post}
          showActions={false}
        />
      ))}
    </div>
  );
};

export default LikedPosts;
