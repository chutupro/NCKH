import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { toast } from 'react-toastify';

const Personal = () => {
  const { user, accessToken } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Fetch user profile
  useEffect(() => {
    // Fetch profile on mount and when accessToken changes (if using header-based auth)
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Thông tin cá nhân</h1>

      {/* Profile Info */}
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
              <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{profile.fullName || 'User'}</h2>
              <p style={{ margin: '5px 0', color: '#666' }}>📧 {profile.email}</p>
              <p style={{ margin: '5px 0', color: profile.isEmailVerified ? '#10b981' : '#ef4444' }}>
                {profile.isEmailVerified ? '✅ Email đã xác thực' : '❌ Email chưa xác thực'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#555', marginBottom: '10px' }}>Mô tả</h3>
            <p style={{ color: '#666' }}>{profile.profile.bio || 'Chưa có mô tả'}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#555', marginBottom: '10px' }}>Thống kê</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>📝 <strong>{profile.profile.totalContributions}</strong> Đóng góp</div>
              <div>✏️ <strong>{profile.profile.totalEdits}</strong> Chỉnh sửa</div>
              <div>❤️ <strong>{profile.profile.totalLikes}</strong> Lượt thích</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#666' }}>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Avatar URL
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '15px'
              }}
            />
            {avatar && (
              <img 
                src={avatar} 
                alt="Preview" 
                style={{ 
                  marginTop: '10px', 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              💾 Lưu thay đổi
            </button>
            <button 
              type="button"
              onClick={() => {
                setEditing(false);
                setFullName(profile.fullName || '');
                setBio(profile.profile.bio || '');
                setAvatar(profile.profile.avatar || '/img/default-avatar.png');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Personal;
