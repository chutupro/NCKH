import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/useAppContext';
import axios from 'axios';
import { getArticles } from '../../API/articles';
import '../../Styles/Admin/AdminContributions.css';

const AdminContributions = () => {
  const { user } = useAppContext();
  // ✅ Moderator được phép xem trang này (duyệt ảnh, bài viết)
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [pendingArticles, setPendingArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);
  const [rejectedArticles, setRejectedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [communityArticles, setCommunityArticles] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchCategories();
    fetchPendingArticles();
    fetchApprovedArticles();
    fetchRejectedArticles();
    // preload community articles so tab is snappy
    fetchCommunityArticles();
  }, []);

  const fetchCommunityArticles = async () => {
    try {
      setLoadingCommunity(true);
      const data = await getArticles();
      const normalized = (data || []).map((a) => ({
        id: a.ArticleID ?? a.id ?? a.ArticleId,
        ...a,
      }));
      setCommunityArticles(normalized);
    } catch (err) {
      console.error('Error fetching community articles:', err);
      setCommunityArticles([]);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPendingArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/articles_post/pending/list`);
      setPendingArticles(response.data);
    } catch (error) {
      console.error('Error fetching pending articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}/articles_post`);
      setApprovedArticles(response.data);
    } catch (error) {
      console.error('Error fetching approved articles:', error);
    }
  };

  const fetchRejectedArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}/articles_post/rejected/list`);
      setRejectedArticles(response.data);
    } catch (error) {
      console.error('Error fetching rejected articles:', error);
    }
  };

  const handleApprove = async (articleId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt bài viết này?')) return;

    try {
      await axios.put(`${API_URL}/articles_post/${articleId}/approve`);
      alert('Đã duyệt bài viết thành công!');
      fetchPendingArticles();
      fetchApprovedArticles();
      fetchRejectedArticles();
    } catch (error) {
      console.error('Error approving article:', error);
      alert('Có lỗi xảy ra khi duyệt bài viết!');
    }
  };

  const handleReject = async (articleId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối bài viết này?')) return;

    try {
      await axios.put(`${API_URL}/articles_post/${articleId}/reject`);
      alert('Đã từ chối bài viết!');
      fetchPendingArticles();
      fetchApprovedArticles();
      fetchRejectedArticles();
    } catch (error) {
      console.error('Error rejecting article:', error);
      alert('Có lỗi xảy ra khi từ chối bài viết!');
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn bài viết này? Hành động này không thể hoàn tác!')) return;

    try {
      await axios.delete(`${API_URL}/articles_post/${articleId}`);
      alert('Đã xóa bài viết thành công!');
      fetchPendingArticles();
      fetchApprovedArticles();
      fetchRejectedArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Có lỗi xảy ra khi xóa bài viết!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Tổng lượt thích (cố gắng hỗ trợ nhiều dạng dữ liệu từ backend)
  const getTotalLikes = (article) => {
    if (!article) return 0;
    // arrays of timestamps
    const ts = article.likes_timestamps || article.like_timestamps || article.likesTimestamps || null;
    if (Array.isArray(ts)) return ts.length;

    // details arrays
    const details = article.likesDetails || article.likes_details || article.likeEvents || article.likes_events || null;
    if (Array.isArray(details)) return details.length;

    // numeric fields
    return article.likes ?? article.likeCount ?? article.total_likes ?? article.totalLikes ?? article.like ?? 0;
  };

  const handleViewDetail = (article) => {
    setSelectedArticle(article);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedArticle(null);
  };

  // Lọc bài viết theo tìm kiếm và danh mục
  const filterArticles = (articles) => {
    return articles.filter((article) => {
      const matchesSearch = !searchQuery || 
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        article.category?.toLowerCase() === selectedCategory.toLowerCase();
      // month filter: check createdAt or created fields
      const created = article.createdAt || article.created_at || article.created;
      let matchesMonth = true;
      if (selectedMonth && selectedMonth !== 'all') {
        const d = new Date(created);
        if (isNaN(d)) matchesMonth = false;
        else {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          matchesMonth = key === selectedMonth;
        }
      }

      return matchesSearch && matchesCategory && matchesMonth;
    });
  };

  // Lấy danh sách bài viết đã lọc
  const filteredPendingArticles = filterArticles(pendingArticles);
  const filteredApprovedArticles = filterArticles(approvedArticles);
  const filteredRejectedArticles = filterArticles(rejectedArticles);
  const filteredCommunityArticles = filterArticles(communityArticles);

  // Helper: sort array by total likes descending
  const sortByLikesDesc = (arr) => {
    return (arr || []).slice().sort((a, b) => {
      const la = getTotalLikes(a) || 0;
      const lb = getTotalLikes(b) || 0;
      return lb - la;
    });
  };

  const sortedPendingArticles = useMemo(() => sortByLikesDesc(filteredPendingArticles), [filteredPendingArticles]);
  const sortedApprovedArticles = useMemo(() => sortByLikesDesc(filteredApprovedArticles), [filteredApprovedArticles]);
  const sortedRejectedArticles = useMemo(() => sortByLikesDesc(filteredRejectedArticles), [filteredRejectedArticles]);
  const sortedCommunityArticles = useMemo(() => sortByLikesDesc(filteredCommunityArticles), [filteredCommunityArticles]);

  // Build available months (YYYY-MM) from all article sources
  const months = useMemo(() => {
    const set = new Set();
    const pushFrom = (arr) => arr.forEach(a => {
      const created = a.createdAt || a.created_at || a.created;
      if (!created) return;
      const d = new Date(created);
      if (isNaN(d)) return;
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    pushFrom(pendingArticles);
    pushFrom(approvedArticles);
    pushFrom(rejectedArticles);
    pushFrom(communityArticles);
    return ['all', ...Array.from(set).sort().reverse()];
  }, [pendingArticles, approvedArticles, rejectedArticles, communityArticles]);

  // Tổng số bài đóng góp (pending + approved + rejected)
  const totalSubmissions = pendingArticles.length + approvedArticles.length + rejectedArticles.length;

  const renderArticleCard = (article, status = 'pending') => (
    <div key={article.id} className="contribution-item">
      <div className="contribution-main">
        <div className="contribution-header-info">
          <div className="contribution-title-section">
            <h3 className="contribution-item-title">{article.title}</h3>
            {article.moderation && article.moderation.label === 'hate' && (
              <span className="moderation-flag" title="Bị gắn nhãn hate">❗</span>
            )}
            <span className="contribution-badge">{article.category}</span>
          </div>
          <div className="contribution-meta">
            <span className="contribution-author-text">👤 {article.author?.fullName}</span>
            <span className="contribution-date-text">📅 {formatDate(article.createdAt)}</span>
          </div>
        </div>
        
        <div className="contribution-content-preview">
          {article.content?.substring(0, 200)}
          {article.content?.length > 200 ? '...' : ''}
        </div>
      </div>

      <div className="contribution-actions-row">
        <button
          className="btn-view-detail"
          onClick={() => handleViewDetail(article)}
          title="Xem chi tiết"
        >
          👁️
        </button>
        {status === 'pending' ? (
          <>
            <button
              className="btn-approve-action"
              onClick={() => handleApprove(article.id)}
            >
              ✓ Phê duyệt
            </button>
            <button
              className="btn-reject-action"
              onClick={() => handleReject(article.id)}
            >
              ✕ Từ chối
            </button>
          </>
        ) : status === 'approved' ? (
          <button
            className="btn-delete-action"
            onClick={() => handleDelete(article.id)}
          >
            🗑️ Xóa
          </button>
        ) : (
          <>
            <button
              className="btn-approve-action"
              onClick={() => handleApprove(article.id)}
            >
              ✓ Duyệt lại
            </button>
            <button
              className="btn-delete-action"
              onClick={() => handleDelete(article.id)}
            >
              🗑️ Xóa
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-contributions">
      <div className="contributions-header">
        <h1>Quản lý Đóng góp</h1>
        <div className="contributions-stats">
          <div className="stat-card total">
            <span className="stat-number">{totalSubmissions}</span>
            <span className="stat-label">Tổng đóng góp</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-number">{pendingArticles.length}</span>
            <span className="stat-label">Chờ duyệt</span>
          </div>
          <div className="stat-card approved">
            <span className="stat-number">{approvedArticles.length}</span>
            <span className="stat-label">Đã duyệt</span>
          </div>
          <div className="stat-card rejected">
            <span className="stat-number">{rejectedArticles.length}</span>
            <span className="stat-label">Đã từ chối</span>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="contributions-filters">
        <div className="contrib-search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="contrib-search-input"
          />
          {searchQuery && (
            <button 
              className="contrib-clear-search"
              onClick={() => setSearchQuery('')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="contrib-category-filter"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.CategoryID} value={category.Name}>
              {category.Name}
            </option>
          ))}
        </select>
        
        {/* Month selector */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-filter"
          style={{ marginLeft: '0.5rem' }}
        >
          {months.map(m => (
            <option key={m} value={m}>{m === 'all' ? 'Tất cả tháng' : `${m.slice(5)}/${m.slice(0,4)}`}</option>
          ))}
        </select>
      </div>

      <div className="contributions-tabs">
        <button
          className={`tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Bài viết cộng đồng ({communityArticles.length})
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Chờ duyệt ({filteredPendingArticles.length}/{pendingArticles.length})
        </button>
        <button
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Đã duyệt ({filteredApprovedArticles.length}/{approvedArticles.length})
        </button>
        <button
          className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Đã từ chối ({filteredRejectedArticles.length}/{rejectedArticles.length})
        </button>
        
      </div>

      <div className="contributions-content">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <div className="contributions-list">
            {activeTab === 'pending' &&
              (sortedPendingArticles.length > 0 ? (
                sortedPendingArticles.map((article) => renderArticleCard(article, 'pending'))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>
                    {searchQuery || selectedCategory 
                      ? 'Không tìm thấy bài viết nào phù hợp'
                      : 'Không có bài viết nào đang chờ duyệt'
                    }
                  </p>
                </div>
              ))}

            {activeTab === 'approved' &&
              (sortedApprovedArticles.length > 0 ? (
                sortedApprovedArticles.map((article) => renderArticleCard(article, 'approved'))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <p>
                    {searchQuery || selectedCategory 
                      ? 'Không tìm thấy bài viết nào phù hợp'
                      : 'Không có bài viết nào đã được duyệt'
                    }
                  </p>
                </div>
              ))}

            {activeTab === 'rejected' &&
              (sortedRejectedArticles.length > 0 ? (
                sortedRejectedArticles.map((article) => renderArticleCard(article, 'rejected'))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">❌</div>
                  <p>
                    {searchQuery || selectedCategory 
                      ? 'Không tìm thấy bài viết nào phù hợp'
                      : 'Không có bài viết nào bị từ chối'
                    }
                  </p>
                </div>
              ))}

            {activeTab === 'community' && (
              loadingCommunity ? (
                <div className="loading-spinner">Đang tải bài viết cộng đồng...</div>
              ) : sortedCommunityArticles.length > 0 ? (
                sortedCommunityArticles.map((art) => (
                  <div key={art.id || art.title} className="contribution-item">
                    <div className="contribution-main">
                      <div className="contribution-header-info">
                        <div className="contribution-title-section">
                          <h3 className="contribution-item-title">{art.title}</h3>
                          <span className="contribution-badge">{art.category}</span>
                        </div>
                        <div className="contribution-meta">
                          <span className="contribution-author-text">👤 {art.author?.fullName || art.authorName || '—'}</span>
                          <span className="contribution-date-text">📅 {formatDate(art.createdAt || art.created_at || art.created)}</span>
                        </div>
                      </div>
                      <div className="contribution-content-preview">{(art.content || '').slice(0,200)}{(art.content || '').length>200?'...':''}</div>
                    </div>
                    <div className="contribution-actions-row">
                      <button className="btn-view-detail" onClick={() => handleViewDetail(art)} title="Xem chi tiết">👁️</button>
                      <div className="like-count" title={`Tổng lượt thích`}>❤️ {getTotalLikes(art) ?? 0}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📰</div>
                  <p>Không có bài viết cộng đồng để hiển thị</p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Modal xem chi tiết */}
      {showDetailModal && selectedArticle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết bài đóng góp</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <label>Tác giả:</label>
                <div className="detail-author">
                  <img
                    src={selectedArticle.author?.avatar || '/img/default-avatar.png'}
                    alt={selectedArticle.author?.fullName}
                    className="detail-avatar"
                  />
                  <span>{selectedArticle.author?.fullName}</span>
                </div>
              </div>

              <div className="detail-section">
                <label>Danh mục:</label>
                <span className="detail-category">{selectedArticle.category}</span>
              </div>

              <div className="detail-section">
                <label>Ngày tạo:</label>
                <span>{formatDate(selectedArticle.createdAt)}</span>
              </div>

              <div className="detail-section">
                <label>Tiêu đề:</label>
                <h3 className="detail-title">{selectedArticle.title}</h3>
              </div>

              {selectedArticle.image && (
                <div className="detail-section">
                  <label>Hình ảnh:</label>
                  <img
                    src={`${API_URL}${selectedArticle.image}`}
                    alt={selectedArticle.title}
                    className="detail-image"
                  />
                </div>
              )}

              {selectedArticle.imageDescription && (
                <div className="detail-section">
                  <label>Mô tả ảnh:</label>
                  <div className="detail-text">{selectedArticle.imageDescription}</div>
                </div>
              )}

              <div className="detail-section">
                <label>Nội dung:</label>
                <div className="detail-content">{selectedArticle.content}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-close" onClick={closeModal}>
                Đóng
              </button>
              {activeTab === 'pending' ? (
                <>
                  <button
                    className="btn-modal-approve"
                    onClick={() => {
                      handleApprove(selectedArticle.id);
                      closeModal();
                    }}
                  >
                    ✓ Duyệt
                  </button>
                  <button
                    className="btn-modal-reject"
                    onClick={() => {
                      handleReject(selectedArticle.id);
                      closeModal();
                    }}
                  >
                    ✕ Từ chối
                  </button>
                </>
              ) : activeTab === 'approved' ? (
                <button
                  className="btn-modal-delete"
                  onClick={() => {
                    handleDelete(selectedArticle.id);
                    closeModal();
                  }}
                >
                  🗑️ Xóa
                </button>
              ) : activeTab === 'rejected' ? (
                <>
                  <button
                    className="btn-modal-approve"
                    onClick={() => {
                      handleApprove(selectedArticle.id);
                      closeModal();
                    }}
                  >
                    ✓ Duyệt lại
                  </button>
                  <button
                    className="btn-modal-delete"
                    onClick={() => {
                      handleDelete(selectedArticle.id);
                      closeModal();
                    }}
                  >
                    🗑️ Xóa
                  </button>
                </>
              ) : activeTab === 'community' ? null : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContributions;
