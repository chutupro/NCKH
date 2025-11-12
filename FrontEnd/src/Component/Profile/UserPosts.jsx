import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../../context/useAppContext';
import PostCard from '../Community/PostCard';
import { getArticlesPosts } from '../../API/articlesPost';

const UserPosts = () => {
  const { user } = useAppContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        // Lấy tất cả bài viết từ API
        const data = await getArticlesPosts();
        
        // Filter bài viết của user hiện tại
        const userPosts = data.filter(article => {
          return article.author?.id === user?.userId || 
                 article.author?.id === user?.UserID ||
                 article.author?.id === user?.sub;
        });

        // Map sang format của PostCard
        const mapped = userPosts.map(a => ({
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
        console.error('Error fetching user posts:', error);
        toast.error('Không thể tải bài viết của bạn', {
          position: 'top-right',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserPosts();
    }
  }, [user]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDelete={handleDelete}
          showActions={true}
        />
      ))}
    </div>
  );
};

export default UserPosts;
