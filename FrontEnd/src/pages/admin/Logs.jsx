import React, { useEffect, useState } from 'react';
import adminUsersService from '../../services/adminUsersService';
import '../../Styles/Admin/Logs.css';

const Logs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name
  const [selectedUser, setSelectedUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyStats, setHistoryStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchQuery, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.page, 
        limit: pagination.limit,
      };
      if (searchQuery) params.search = searchQuery;
      if (filterRole !== 'all') params.role = filterRole;
      
      const response = await adminUsersService.getUsers(params);
      setUsers(response.data);
      setPagination(prev => ({ 
        ...prev, 
        total: response.pagination.total, 
        totalPages: response.pagination.totalPages 
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortedUsers = () => {
    let sorted = [...users];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
        break;
      case 'name':
        sorted.sort((a, b) => a.FullName.localeCompare(b.FullName));
        break;
      default:
        break;
    }
    return sorted;
  };

  const getRoleName = (roleId) => {
    const roles = { 1: 'Admin', 2: 'User', 3: 'Editor' };
    return roles[roleId] || 'Unknown';
  };

  const getRoleBadgeClass = (roleId) => {
    const classes = { 1: 'role-admin', 2: 'role-user', 3: 'role-editor' };
    return classes[roleId] || 'role-user';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setLoadingHistory(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock login history data
    const mockHistory = [
      {
        LoginTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        LogoutTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        IPAddress: '192.168.1.100',
        UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        DeviceType: 'Desktop',
        Browser: 'Chrome',
        OS: 'Windows',
        SessionDuration: 60
      },
      {
        LoginTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        LogoutTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        IPAddress: '192.168.1.101',
        UserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',
        DeviceType: 'Mobile',
        Browser: 'Safari',
        OS: 'iOS',
        SessionDuration: 120
      },
      {
        LoginTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        LogoutTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
        IPAddress: '192.168.1.100',
        UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        DeviceType: 'Desktop',
        Browser: 'Edge',
        OS: 'Windows',
        SessionDuration: 45
      },
      {
        LoginTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        LogoutTime: new Date(Date.now() - 46 * 60 * 60 * 1000),
        IPAddress: '10.0.0.50',
        UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        DeviceType: 'Desktop',
        Browser: 'Firefox',
        OS: 'macOS',
        SessionDuration: 90
      },
      {
        LoginTime: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
        LogoutTime: null, // Still active
        IPAddress: '192.168.1.105',
        UserAgent: 'Mozilla/5.0 (Linux; Android 11)',
        DeviceType: 'Mobile',
        Browser: 'Chrome',
        OS: 'Android',
        SessionDuration: null
      }
    ];

    // Mock stats
    const mockStats = {
      totalLogins: mockHistory.length,
      avgSessionDuration: 78,
      lastLogin: mockHistory[0].LoginTime
    };

    setLoginHistory(mockHistory);
    setHistoryStats(mockStats);
    setLoadingHistory(false);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setLoginHistory([]);
    setHistoryStats(null);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Email', 'Họ Tên', 'Vai Trò', 'Ngày Đăng Ký', 'Email Xác Thực'].join(','),
      ...users.map(u => [
        u.UserID,
        u.Email,
        u.FullName,
        getRoleName(u.RoleID),
        formatDate(u.CreatedAt),
        u.IsEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sortedUsers = getSortedUsers();

  return (
    <div className="logs-container">
      <div className="logs-header">
        <div>
          <h1>📋 User Registration Logs</h1>
          <p>Danh sách tất cả tài khoản đã đăng ký trong hệ thống</p>
        </div>
        <button className="btn-export" onClick={handleExport}>
          📥 Xuất CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="logs-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <p className="stat-label">Tổng Users</p>
            <p className="stat-value">{pagination.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔵</div>
          <div className="stat-info">
            <p className="stat-label">Users</p>
            <p className="stat-value">{users.filter(u => u.RoleID === 2).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✏️</div>
          <div className="stat-info">
            <p className="stat-label">Editors</p>
            <p className="stat-value">{users.filter(u => u.RoleID === 3).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <p className="stat-label">Admins</p>
            <p className="stat-value">{users.filter(u => u.RoleID === 1).length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo email hoặc tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Vai trò:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
            <option value="3">Editor</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sắp xếp:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="name">Tên A-Z</option>
          </select>
        </div>

        <button className="btn-refresh" onClick={fetchUsers}>
          🔄 Làm mới
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Họ Tên</th>
                  <th>Vai Trò</th>
                  <th>Ngày Đăng Ký</th>
                  <th>Email Xác Thực</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      <span>📭</span>
                      <p>Không có dữ liệu</p>
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => (
                    <tr key={user.UserID}>
                      <td>#{user.UserID}</td>
                      <td className="email-cell">{user.Email}</td>
                      <td className="name-cell">{user.FullName}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(user.RoleID)}`}>
                          {getRoleName(user.RoleID)}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(user.CreatedAt)}</td>
                      <td>
                        <span className={`verify-badge ${user.IsEmailVerified ? 'verified' : 'unverified'}`}>
                          {user.IsEmailVerified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-view-detail"
                          onClick={() => handleViewDetails(user)}
                        >
                          👁️ Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="logs-pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ← Trước
              </button>
              <span>
                Trang {pagination.page} / {pagination.totalPages} 
                <small> ({pagination.total} users)</small>
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            
            <h2>Chi tiết tài khoản</h2>
            
            <div className="user-detail">
              <div className="detail-row">
                <strong>🆔 User ID:</strong>
                <span>#{selectedUser.UserID}</span>
              </div>
              
              <div className="detail-row">
                <strong>📧 Email:</strong>
                <span>{selectedUser.Email}</span>
              </div>
              
              <div className="detail-row">
                <strong>👤 Họ và Tên:</strong>
                <span>{selectedUser.FullName}</span>
              </div>
              
              <div className="detail-row">
                <strong>🎭 Vai Trò:</strong>
                <span className={`role-badge ${getRoleBadgeClass(selectedUser.RoleID)}`}>
                  {getRoleName(selectedUser.RoleID)}
                </span>
              </div>
              
              <div className="detail-row">
                <strong>📅 Ngày Đăng Ký:</strong>
                <span>{formatDate(selectedUser.CreatedAt)}</span>
              </div>
              
              <div className="detail-row">
                <strong>✉️ Trạng Thái Email:</strong>
                <span className={`verify-badge ${selectedUser.IsEmailVerified ? 'verified' : 'unverified'}`}>
                  {selectedUser.IsEmailVerified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}
                </span>
              </div>

              {selectedUser.profile && (
                <>
                  <hr />
                  <div className="detail-row">
                    <strong>📝 Bio:</strong>
                    <span>{selectedUser.profile.Bio || 'Chưa có bio'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <strong>🖼️ Avatar:</strong>
                    {selectedUser.profile.Avatar ? (
                      <img 
                        src={selectedUser.profile.Avatar} 
                        alt="Avatar" 
                        className="detail-avatar"
                      />
                    ) : (
                      <span>Chưa có avatar</span>
                    )}
                  </div>
                </>
              )}

              <hr />
              <h3>🔐 Lịch sử đăng nhập</h3>
              
              {loadingHistory ? (
                <div className="loading-history">
                  <div className="spinner-small"></div>
                  <p>Đang tải lịch sử...</p>
                </div>
              ) : (
                <>
                  {historyStats && (
                    <div className="history-stats">
                      <div className="stat-mini">
                        <strong>Tổng số lần đăng nhập:</strong>
                        <span>{historyStats.totalLogins}</span>
                      </div>
                      <div className="stat-mini">
                        <strong>Thời gian trung bình:</strong>
                        <span>{historyStats.avgSessionDuration} phút</span>
                      </div>
                      <div className="stat-mini">
                        <strong>Lần đăng nhập cuối:</strong>
                        <span>{formatDate(historyStats.lastLogin)}</span>
                      </div>
                    </div>
                  )}

                  <div className="login-history-list">
                    {loginHistory.length === 0 ? (
                      <p className="no-history">Chưa có lịch sử đăng nhập</p>
                    ) : (
                      loginHistory.map((history, index) => (
                        <div key={index} className="history-item">
                          <div className="history-time">
                            <div className="time-in">
                              <strong>🔓 Đăng nhập:</strong>
                              <span>{formatDate(history.LoginTime)}</span>
                            </div>
                            {history.LogoutTime && (
                              <div className="time-out">
                                <strong>🔒 Đăng xuất:</strong>
                                <span>{formatDate(history.LogoutTime)}</span>
                              </div>
                            )}
                            {history.SessionDuration && (
                              <div className="duration">
                                <strong>⏱️ Thời lượng:</strong>
                                <span>{history.SessionDuration} phút</span>
                              </div>
                            )}
                          </div>
                          <div className="history-meta">
                            <span className="meta-chip">💻 {history.DeviceType}</span>
                            <span className="meta-chip">🌐 {history.Browser}</span>
                            <span className="meta-chip">🖥️ {history.OS}</span>
                            {history.IPAddress && (
                              <span className="meta-chip">🌍 {history.IPAddress}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
