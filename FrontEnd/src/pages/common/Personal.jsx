import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { toast } from 'react-toastify';
import UserPosts from '../../Component/Profile/UserPosts';
import LikedPosts from '../../Component/Profile/LikedPosts';

const Personal = () => {
  const { accessToken, user, setUser } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const [activeTab, setActiveTab] = useState('my-posts'); // 'my-posts' or 'liked-posts'

  const [totalPosts, setTotalPosts] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {

    fetchProfile();

  }, [accessToken]);

  const fetchProfile = async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const response = await fetch('/users/profile/me', {
        method: 'GET',
        credentials: 'include', // still include cookie as fallback
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setFullName(data.fullName || '');
      setBio(data.profile.bio || '');
      setAvatar(data.profile.avatar || '/img/default-avatar.png');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Không thể tải thông tin profile', {
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const response = await fetch('/users/profile/me', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          fullName,
          bio,
          avatar,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data);
      setEditing(false);

      setUser({
        ...user,
        fullName: data.fullName,
        avatar: data.profile?.avatar || avatar,
      });

      window.dispatchEvent(new Event('profileUpdated'));

      toast.success('Cập nhật profile thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật profile', {
        position: 'top-right',
      });
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Không tìm thấy thông tin profile</h3>
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
      <h1 style={{ marginBottom: '30px' }}>Thông tin cá nhân</h1>

      {}
      {!editing ? (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src={profile.profile.avatar || '/img/default-avatar.png'} 
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
              <h2 style={{ margin: '0 0 10px 0' }}>{profile.fullName || 'User'}</h2>
              <p style={{ margin: '5px 0' }}>📧 {profile.email}</p>
              <p style={{ margin: '5px 0', color: profile.isEmailVerified ? '#10b981' : '#ef4444' }}>
                {profile.isEmailVerified ? '✅ Email đã xác thực' : '❌ Email chưa xác thực'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize:"30px" }}>Mô tả</h3>
            <p style={{ color: '#fff', fontSize:"15px" }}>{profile.profile.bio || 'Chưa có mô tả'}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '10px', fontSize:"30px" }}>Thống kê</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>📝 <strong>{totalPosts}</strong> Đóng góp</div>
              <div>❤️ <strong>{totalLikes}</strong> Lượt thích</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p >
              📅 Tham gia từ: <strong>{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</strong>
            </p>
          </div>

          <button 
            onClick={() => setEditing(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            ✏️ Chỉnh sửa thông tin
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500'}}>
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ tên"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500'}}>
              Mô tả bản thân
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Viết vài dòng về bạn..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Avatar
            </label>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept="image}
      {!editing && (
        <div style={{ marginTop: '40px' }}>
          {}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '24px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '0'
          }}>
            <button
              onClick={() => setActiveTab('my-posts')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'my-posts' ? '#e8d7b7' : 'transparent',
                color: activeTab === 'my-posts' ? '#2b2b2b' : '#f5e6d3',
                border: 'none',
                borderBottom: activeTab === 'my-posts' ? '3px solid #e8d7b7' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                borderRadius: '8px 8px 0 0'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'my-posts') {
                  e.target.style.backgroundColor = 'rgba(232, 215, 183, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'my-posts') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              📝 Bài viết của tôi
            </button>
            <button
              onClick={() => setActiveTab('liked-posts')}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === 'liked-posts' ? '#e8d7b7' : 'transparent',
                color: activeTab === 'liked-posts' ? '#2b2b2b' : '#f5e6d3',
                border: 'none',
                borderBottom: activeTab === 'liked-posts' ? '3px solid #e8d7b7' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                borderRadius: '8px 8px 0 0'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'liked-posts') {
                  e.target.style.backgroundColor = 'rgba(232, 215, 183, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'liked-posts') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              ❤️ Bài viết đã thích
            </button>
          </div>

          {}
          <div style={{ minHeight: '200px' }}>
            {activeTab === 'my-posts' && <UserPosts onStatsUpdate={(stats) => {
              setTotalPosts(stats.totalPosts);
              setTotalLikes(stats.totalLikes);
            }} />}
            {activeTab === 'liked-posts' && <LikedPosts />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;
