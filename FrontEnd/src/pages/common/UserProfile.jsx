import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../../API/users';
import { toast } from 'react-toastify';
import UserPosts from '../../Component/Profile/UserPosts';

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const normalizeImageUrl = (url) => {
    if (!url) return '/img/default-avatar.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const BACKEND_BASE = 'http://localhost:3000';
    if (url.startsWith('/')) return `${BACKEND_BASE}${url}`;
    return `${BACKEND_BASE}/${url}`;
  };

  const fetchUserProfile = async () => {
    try {
      const data = await getUserById(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error(`Không thể tải thông tin người dùng: ${error.message}`, {
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>
        <h3>Không tìm thấy người dùng</h3>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '40px auto', 
      padding: '20px',
      backgroundColor: '#1E1E1B',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginTop:"5%",
      color: '#fff'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Thông tin người dùng</h1>

      {/* Profile Info */}
      <div>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={normalizeImageUrl(profile.profile?.avatar)} 
            alt="Avatar"
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '3px solid #4ecdc4'
            }}
          />
          <div>
            <h2 style={{ margin: '0 0 10px 0' }}>{profile.fullName || profile.username || 'User'}</h2>
            <p style={{ margin: '5px 0' }}>📧 {profile.email}</p>
          </div>
        </div>

        {profile.profile?.bio && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize:"30px" }}>Mô tả</h3>
            <p style={{ color: '#fff', fontSize:"15px" }}>{profile.profile.bio}</p>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px', fontSize:"30px" }}>Thống kê</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>📝 <strong>{totalPosts}</strong> Đóng góp</div>
            <div>❤️ <strong>{totalLikes}</strong> Lượt thích</div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p>
            📅 Tham gia từ: <strong>{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</strong>
          </p>
        </div>
      </div>

      {/* Posts Section */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ 
          marginBottom: '24px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#f5e6d3'
        }}>
          📝 Bài viết của {profile.fullName || profile.username}
        </h3>
        
        <div style={{ minHeight: '200px' }}>
          <UserPosts 
            userId={parseInt(userId)}
            onStatsUpdate={(stats) => {
              setTotalPosts(stats.totalPosts);
              setTotalLikes(stats.totalLikes);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;