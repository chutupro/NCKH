import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { toast } from 'react-toastify';
import '../../Styles/Admin/AdminDashboard.css';

const ContentModeration = () => {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    setLoading(true);
    try {

      const mockArticles = [
        {
          id: 1,
          title: 'Chùa Linh Ứng - Biểu tượng tâm linh Đà Nẵng',
          author: 'Nguyễn Văn An',
          category: 'Văn hóa',
          status: 'pending',
          createdAt: '2025-11-06',
          views: 245,
          content: 'Chùa Linh Ứng nằm trên bán đảo Sơn Trà...',
        },
        {
          id: 2,
          title: 'Cầu Rồng - Kiến trúc độc đáo bên sông Hàn',
          author: 'Trần Thị Bình',
          category: 'Kiến trúc',
          status: 'approved',
          createdAt: '2025-11-05',
          views: 1520,
          content: 'Cầu Rồng là một trong những biểu tượng...',
        },
        {
          id: 3,
          title: 'Bà Nà Hills - Thiên đường trên mây',
          author: 'Lê Văn Cường',
          category: 'Du lịch',
          status: 'approved',
          createdAt: '2025-11-04',
          views: 3450,
          content: 'Bà Nà Hills nằm ở độ cao 1.487m...',
        },
        {
          id: 4,
          title: 'Phố cổ Hội An về đêm',
          author: 'Phạm Thị Dung',
          category: 'Du lịch',
          status: 'rejected',
          createdAt: '2025-11-03',
          views: 120,
          content: 'Hội An về đêm với hàng ngàn đèn lồng...',
        },
        {
          id: 5,
          title: 'Ngũ Hành Sơn - Danh thắng Đà Nẵng',
          author: 'Hoàng Văn Em',
          category: 'Thiên nhiên',
          status: 'pending',
          createdAt: '2025-11-02',
          views: 89,
          content: 'Ngũ Hành Sơn gồm 5 ngọn núi đá...',
        },
      ];

      const filtered = filter === 'all' 
        ? mockArticles 
        : mockArticles.filter(a => a.status === filter);

      setArticles(filtered);
    } catch (error) {
      toast.error('❌ Không thể tải danh sách bài viết');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId) => {
    try {

      setArticles(articles.map(a => 
        a.id === articleId ? { ...a, status: 'approved' } : a
      ));
      toast.success('✅ Đã duyệt bài viết');
    } catch (error) {
      toast.error('❌ Không thể duyệt bài viết');
    }
  };

  const handleReject = async (articleId) => {
    const reason = window.prompt('Lý do từ chối:');
    if (!reason) return;

    try {

      setArticles(articles.map(a => 
        a.id === articleId ? { ...a, status: 'rejected' } : a
      ));
      toast.success('✅ Đã từ chối bài viết');
    } catch (error) {
      toast.error('❌ Không thể từ chối bài viết');
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    try {

      setArticles(articles.filter(a => a.id !== articleId));
      toast.success('✅ Đã xóa bài viết');
    } catch (error) {
      toast.error('❌ Không thể xóa bài viết');
    }
  };

  const pendingCount = articles.filter(a => a.status === 'pending').length;
  const approvedCount = articles.filter(a => a.status === 'approved').length;
  const rejectedCount = articles.filter(a => a.status === 'rejected').length;

  return (
    <div>
      {}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon primary">📰</div>
          </div>
          <div className="stats-card-title">Tổng bài viết</div>
          <div className="stats-card-value">{articles.length}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon warning">⏳</div>
          </div>
          <div className="stats-card-title">Chờ duyệt</div>
          <div className="stats-card-value">{pendingCount}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon success">✅</div>
          </div>
          <div className="stats-card-title">Đã duyệt</div>
          <div className="stats-card-value">{approvedCount}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon danger">❌</div>
          </div>
          <div className="stats-card-title">Từ chối</div>
          <div className="stats-card-value">{rejectedCount}</div>
        </div>
      </div>

      {}
      <div className="data-table-container">
        <div className="table-header">
          <h2 className="table-title">Quản lý nội dung</h2>
          <div className="table-actions">
            {}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>

            <button className="btn btn-primary">
              📊 Xuất báo cáo
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <div style={{ marginTop: '1rem', color: '#6b7280' }}>Đang tải...</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Lượt xem</th>
                <th>Ngày đăng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>{article.id}</td>
                  <td>
                    <strong style={{ color: '#1f2937' }}>
                      {article.title}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {article.content.substring(0, 50)}...
                    </div>
                  </td>
                  <td>{article.author}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      background: '#f3f4f6',
                      color: '#1f2937',
                    }}>
                      {article.category}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${article.status}`}>
                      {article.status === 'pending' && '⏳ Chờ duyệt'}
                      {article.status === 'approved' && '✅ Đã duyệt'}
                      {article.status === 'rejected' && '❌ Từ chối'}
                    </span>
                  </td>
                  <td>👁️ {article.views}</td>
                  <td>{article.createdAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {article.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(article.id)}
                          >
                            ✅ Duyệt
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleReject(article.id)}
                          >
                            ❌ Từ chối
                          </button>
                        </>
                      )}
                      <button className="btn btn-sm btn-secondary">
                        👁️ Xem
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(article.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ContentModeration;
