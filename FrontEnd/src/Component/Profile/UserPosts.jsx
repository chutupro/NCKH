import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../context/useAppContext';
import PostCard from '../Community/PostCard';
import { getArticlesPosts } from '../../API/articlesPost';

const BACKEND_BASE = 'http://localhost:3000';

const UserPosts = ({ onStatsUpdate, userId }) => {
  const { user } = useAppContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const data = await getArticlesPosts();
        
        const targetUserId = userId || user?.userId || user?.UserID || user?.sub;
        
        const userPosts = data.filter(article => {
          return parseInt(article.author?.id) === parseInt(targetUserId);
        });

        // Normalize avatar URL
        const normalizeUrl = (url) => {
          if (!url) return '/img/default-avatar.png';
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          if (url.startsWith('/')) return `${BACKEND_BASE}${url}`;
          return `${BACKEND_BASE}/${url}`;
        };

        const mapped = userPosts.map(a => ({
          id: a.id,
          author: a.author?.fullName || a.author?.username || 'Người dùng',
          authorId: a.author?.id,
          authorAvatar: normalizeUrl(a.author?.avatar),
          when: a.createdAt ? new Date(a.createdAt).toLocaleString('vi-VN') : '',
          category: a.category || '',
          text: a.title || a.content || '',
          image: a.image || '',
          likes: a.likeCount || 0,
          commentCount: a.commentCount || 0,
        }));
        
        setPosts(mapped);
        
        // Tính toán stats và gửi lên parent
        if (onStatsUpdate) {
          const totalPosts = mapped.length;
          const totalLikes = mapped.reduce((sum, post) => sum + (post.likes || 0), 0);
          onStatsUpdate({ totalPosts, totalLikes });
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
        // Không hiển thị toast error
      } finally {
        setLoading(false);
      }
    };

    if (userId || user) {
      fetchUserPosts();
    }
  }, [user, userId, onStatsUpdate, refreshKey]); // ✅ Thêm userId vào dependencies

  // ✅ Listen for profile update event
  useEffect(() => {
    const handleProfileUpdate = () => {
      setRefreshKey(prev => prev + 1); // Trigger re-fetch
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa bài viết này?');
    if (!confirmed) return;

    try {
      const { deleteArticlePost } = await import('../../API/articlesPost');
      await deleteArticlePost(id);
      
      setPosts(posts.filter(p => p.id !== id));
      toast.success('Đã xóa bài viết thành công', {
        position: 'top-right',
      });
      
      // Cập nhật stats sau khi xóa
      if (onStatsUpdate) {
        const newPosts = posts.filter(p => p.id !== id);
        const totalPosts = newPosts.length;
        const totalLikes = newPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
        onStatsUpdate({ totalPosts, totalLikes });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Không thể xóa bài viết', {
        position: 'top-right',
      });
    }
  };

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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <h3 style={{ color: '#f5e6d3', marginBottom: '8px' }}>Chưa có bài viết nào</h3>
        <p style={{ color: 'rgba(245, 230, 211, 0.6)' }}>Bạn chưa đăng bài viết nào. Hãy chia sẻ suy nghĩ của bạn!</p>
      </div>
    );
  }

  // Kiểm tra xem có phải trang cá nhân của chính mình không
  const currentUserId = user?.userId || user?.UserID || user?.sub;
  const isOwnProfile = !userId || parseInt(userId) === parseInt(currentUserId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDelete={isOwnProfile ? handleDelete : undefined}
          showDeleteButton={isOwnProfile}
        />
      ))}
    </div>
  );
};

export default UserPosts;
