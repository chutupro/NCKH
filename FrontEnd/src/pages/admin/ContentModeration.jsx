import React from 'react';
import '../../Styles/Admin/AdminDashboard.css';
import CollectionManagement from './CollectionManagement';

const ContentModeration = () => {

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API
      // const response = await apiClient.get(`/admin/articles?status=${filter}`);
      // setArticles(response.data);

      // Mock data
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
      // await apiClient.patch(`/admin/articles/${articleId}/approve`);
      
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
      // await apiClient.patch(`/admin/articles/${articleId}/reject`, { reason });
      
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
      // await apiClient.delete(`/admin/articles/${articleId}`);
      
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
      {/* Tab Navigation */}
      <div style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('articles')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'articles' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'articles' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'articles' ? '600' : '400',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📰 Bài viết
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'collections' ? '3px solid #10b981' : '3px solid transparent',
              color: activeTab === 'collections' ? '#10b981' : '#6b7280',
              fontWeight: activeTab === 'collections' ? '600' : '400',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📚 Bộ sưu tập
          </button>
        </div>
      </div>

      {/* Render Active Tab Content */}
      {activeTab === 'collections' ? (
        <CollectionManagement />
      ) : (
        <>
          {/* Header Stats */}
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

      {/* Content Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h2 className="table-title">Quản lý nội dung</h2>
          <div className="table-actions">
            {/* Filter */}
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
        </>
      )}
    </div>
  );
};

export default ContentModeration;
