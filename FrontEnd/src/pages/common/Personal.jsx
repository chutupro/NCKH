import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { toast } from 'react-toastify';
import '../../Styles/Profile/Profile.css';

const Personal = () => {
  const { user } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // Fetch user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/users/profile/me', {
        method: 'GET',
        credentials: 'include', // Gửi cookie
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch('/users/profile/me', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header Banner */}
        <div className="profile-banner">
          <div className="banner-overlay"></div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="avatar-wrapper">
              <img 
                src={profile.profile.avatar || '/img/default-avatar.png'} 
                alt="Avatar"
                className="profile-avatar"
              />
              {editing && (
                <div className="avatar-edit-hint">
                  <small>Nhập URL ảnh mới bên dưới</small>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="profile-info-section">
            {!editing ? (
              <>
                <h1 className="profile-name">{profile.fullName || 'User'}</h1>
                <p className="profile-email">📧 {profile.email}</p>
                <p className="profile-bio">{profile.profile.bio || 'Chưa có mô tả'}</p>
                
                <button 
                  className="btn-edit-profile"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Chỉnh sửa profile
                </button>
              </>
            ) : (
              <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả bản thân</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Viết vài dòng về bạn..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Avatar URL</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    💾 Lưu thay đổi
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => {
                      setEditing(false);
                      setFullName(profile.fullName || '');
                      setBio(profile.profile.bio || '');
                      setAvatar(profile.profile.avatar || '/img/default-avatar.png');
                    }}
                  >
                    ❌ Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Stats Section */}
          <div className="profile-stats-section">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{profile.profile.totalContributions}</div>
              <div className="stat-label">Đóng góp</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✏️</div>
              <div className="stat-value">{profile.profile.totalEdits}</div>
              <div className="stat-label">Chỉnh sửa</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-value">{profile.profile.totalLikes}</div>
              <div className="stat-label">Lượt thích</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="profile-additional-info">
            <div className="info-item">
              <span className="info-label">📅 Tham gia:</span>
              <span className="info-value">
                {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">✅ Email xác thực:</span>
              <span className={`info-value ${profile.isEmailVerified ? 'verified' : 'not-verified'}`}>
                {profile.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personal;
