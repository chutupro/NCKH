import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../Component/admin/StatsCard';
import { apiClient } from '../../services/api';
import '../../Styles/Admin/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    pendingContent: 0,
    totalViews: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Fetch stats từ API
    // TODO: Thay bằng API thật
    setStats({
      totalUsers: 1248,
      totalArticles: 456,
      pendingContent: 12,
      totalViews: 45678,
    });

    setRecentActivities([
      { id: 1, user: 'Nguyễn Văn A', action: 'đã tạo bài viết mới', time: '5 phút trước', type: 'create' },
      { id: 2, user: 'Trần Thị B', action: 'đã bình luận', time: '10 phút trước', type: 'comment' },
      { id: 3, user: 'Lê Văn C', action: 'đã thích bài viết', time: '15 phút trước', type: 'like' },
      { id: 4, user: 'Admin', action: 'đã duyệt 3 bài viết', time: '1 giờ trước', type: 'approve' },
    ]);
  }, []);

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard
          icon="👥"
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          trend="up"
          trendValue="+12%"
          footer="Tăng 150 người trong tháng này"
          color="primary"
        />
        <StatsCard
          icon="📰"
          title="Tổng bài viết"
          value={stats.totalArticles.toLocaleString()}
          trend="up"
          trendValue="+8%"
          footer="45 bài viết mới tuần này"
          color="success"
        />
        <StatsCard
          icon="⏳"
          title="Chờ duyệt"
          value={stats.pendingContent}
          trend="down"
          trendValue="-3"
          footer="Giảm so với tuần trước"
          color="warning"
        />
        <StatsCard
          icon="👁️"
          title="Lượt xem"
          value={stats.totalViews.toLocaleString()}
          trend="up"
          trendValue="+25%"
          footer="Tăng trưởng ổn định"
          color="danger"
        />
      </div>

      {/* Map Management Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem', 
        marginTop: '2rem' 
      }}>
        {/* 1. Quản lý Địa điểm */}
        <div
          onClick={() => navigate('/map/admin')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: 'white', 
                  marginBottom: '0.5rem' 
                }}>
                  🗺️ Quản lý Địa điểm
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                  Thêm, sửa, xóa điểm lịch sử trên bản đồ
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '1rem',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              }}>
                <span style={{ fontSize: '2rem' }}>📍</span>
              </div>
            </div>
            <div style={{ 
              marginTop: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
            }}>
              <span>→</span>
              <span>Nhấn để vào trang quản trị</span>
            </div>
          </div>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }} />
        </div>
      </div>

      {/* Charts & Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Recent Articles */}
        <div className="data-table-container">
          <div className="table-header">
            <h2 className="table-title">Bài viết gần đây</h2>
            <button className="btn btn-primary btn-sm">
              Xem tất cả →
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Trạng thái</th>
                <th>Ngày đăng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chùa Linh Ứng - Biểu tượng tâm linh Đà Nẵng</td>
                <td>Nguyễn Văn A</td>
                <td><span className="status-badge active">Đã duyệt</span></td>
                <td>06/11/2025</td>
              </tr>
              <tr>
                <td>Cầu Rồng - Kiến trúc độc đáo bên sông Hàn</td>
                <td>Trần Thị B</td>
                <td><span className="status-badge pending">Chờ duyệt</span></td>
                <td>05/11/2025</td>
              </tr>
              <tr>
                <td>Bà Nà Hills - Thiên đường trên mây</td>
                <td>Lê Văn C</td>
                <td><span className="status-badge active">Đã duyệt</span></td>
                <td>04/11/2025</td>
              </tr>
              <tr>
                <td>Phố cổ Hội An về đêm</td>
                <td>Phạm Thị D</td>
                <td><span className="status-badge rejected">Từ chối</span></td>
                <td>03/11/2025</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recent Activities */}
        <div className="data-table-container">
          <div className="table-header">
            <h2 className="table-title">Hoạt động gần đây</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  borderLeft: '3px solid #3b82f6',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1f2937' }}>
                  {activity.user}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {activity.action}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="data-table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h2 className="table-title">Thao tác nhanh</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ padding: '1rem', justifyContent: 'center' }}>
            ➕ Tạo bài viết
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'center' }}>
            👥 Thêm người dùng
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'center' }}>
            📊 Xuất báo cáo
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'center' }}>
            ⚙️ Cài đặt hệ thống
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
