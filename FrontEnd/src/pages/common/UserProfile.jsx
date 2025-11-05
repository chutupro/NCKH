import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../Styles/Profile/Profile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/users/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Không thể tải thông tin người dùng', {
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Không tìm thấy người dùng này</h3>
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
            </div>
          </div>

          {/* Info Section */}
          <div className="profile-info-section">
            <h1 className="profile-name">{profile.fullName || 'User'}</h1>
            <p className="profile-email">📧 {profile.email}</p>
            <p className="profile-bio">{profile.profile.bio || 'Chưa có mô tả'}</p>
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

export default UserProfile;
