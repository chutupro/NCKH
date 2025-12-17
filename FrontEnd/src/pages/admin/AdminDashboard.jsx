import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import StatsCard from '../../Component/admin/StatsCard';
import { apiClient } from '../../services/api';
import '../../Styles/Admin/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    pendingContent: 0,
  });

  const [recentArticles, setRecentArticles] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⛔ Moderator không được xem Dashboard - redirect to Contributions
    const isModerator = user?.role === 'Moderator' || user?.Role === 'Moderator';
    if (isModerator) {
      navigate('/admin/contributions', { replace: true });
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch tổng người dùng
      const usersRes = await apiClient.get('/admin/users');
      console.log('📊 [Dashboard] Users API response:', usersRes.data);
      
      // API trả về object {users: [...], total: X} hoặc array
      let usersData = [];
      if (Array.isArray(usersRes.data)) {
        usersData = usersRes.data;
      } else if (usersRes.data?.users && Array.isArray(usersRes.data.users)) {
        usersData = usersRes.data.users;
      } else if (usersRes.data?.data && Array.isArray(usersRes.data.data)) {
        usersData = usersRes.data.data;
      }
      
      console.log('📊 [Dashboard] Processed users data:', usersData.length, 'users');
      const totalUsers = usersData.length;

      // 2️⃣ Fetch collections (thư viện ảnh) 
      const collectionsRes = await apiClient.get('/collections');
      const collections = collectionsRes.data || [];
      const totalArticles = collections.length;

      // 3️⃣ Đếm "Ảnh chờ duyệt" = images chưa có timeline (chưa gắn vào sự kiện)
      const timelinesRes = await apiClient.get('/timeline');
      const timelines = timelinesRes.data || [];
      
      // Fetch tất cả images từ gallery
      const imagesRes = await apiClient.get('/gallery');
      console.log('📊 [Dashboard] Gallery API response:', imagesRes.data);
      
      // API có thể trả về array hoặc object {data: []}
      let allImages = [];
      if (Array.isArray(imagesRes.data)) {
        allImages = imagesRes.data;
      } else if (imagesRes.data?.data && Array.isArray(imagesRes.data.data)) {
        allImages = imagesRes.data.data;
      }
      
      console.log('📊 [Dashboard] Processed images:', allImages.length);
      
      // Lọc ảnh chưa gắn vào timeline và không phải map
      const pendingImages = allImages.filter(img => {
        const hasTimeline = timelines.some(t => t.ImageID === img.ImageID);
        const isMapImage = img.Type === 'map';
        return !hasTimeline && !isMapImage;
      });
      
      console.log('📊 [Dashboard] Pending images (chưa gắn timeline):', pendingImages.length);

      setStats({
        totalUsers,
        totalArticles,
        pendingContent: pendingImages.length, // Số ảnh chưa gắn vào timeline
      });

      // 4️⃣ Lấy 5 collections mới nhất cho "Bài viết gần đây"
      const sortedCollections = [...collections]
        .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
        .slice(0, 5);
      
      setRecentArticles(sortedCollections);

      // 5️⃣ Lấy 5 users mới tạo gần đây
      const sortedUsers = [...usersData]
        .sort((a, b) => {
          const dateA = new Date(a.CreatedAt || a.createdAt || 0);
          const dateB = new Date(b.CreatedAt || b.createdAt || 0);
          return dateB - dateA;
        })
        .slice(0, 5);
      
      setRecentUsers(sortedUsers);

    } catch (error) {
      console.error('Lỗi khi fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard
          icon="👥"
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          footer={`${stats.totalUsers} người dùng trong hệ thống`}
          color="primary"
        />
        <StatsCard
          icon="📰"
          title="Tổng bài viết"
          value={stats.totalArticles.toLocaleString()}
          footer={`${stats.totalArticles} bộ sưu tập trong thư viện`}
          color="success"
        />
        <StatsCard
          icon="⏳"
          title="Chờ duyệt"
          value={stats.pendingContent}
          footer={`Timeline chờ duyệt`}
          color="warning"
        />
      </div>

      {/* Charts & Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Recent Articles */}
        <div className="data-table-container">
          <div className="table-header">
            <h2 className="table-title">Bài viết gần đây</h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/admin/image-library')}
            >
              Xem tất cả →
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Năm</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    Chưa có bài viết nào
                  </td>
                </tr>
              ) : (
                recentArticles.map((article) => (
                  <tr key={article.CollectionID}>
                    <td>{article.Title || 'Không có tiêu đề'}</td>
                    <td>{article.Year || 'N/A'}</td>
                    <td>{formatDate(article.CreatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Users */}
        <div className="data-table-container">
          <div className="table-header">
            <h2 className="table-title">Tài khoản mới tạo gần đây</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Chưa có người dùng mới
              </div>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u.id || u.UserID}
                  style={{
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    borderLeft: '3px solid #3b82f6',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1f2937' }}>
                    {u.fullName || u.Username || u.email || u.Email || 'Người dùng'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {u.roleName || u.Role || 'User'} • {u.email || u.Email}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    Tạo tài khoản: {getTimeAgo(u.createdAt || u.CreatedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
