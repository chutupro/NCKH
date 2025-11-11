import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import authService from '../../services/authService';
import '../../Styles/Admin/AdminDashboard.css';

const AdminNavbar = ({ sidebarCollapsed, title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { user, setUser, setAccessToken, setIsAuthenticated } = useAppContext();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      // ✅ CLEAR CONTEXT
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`admin-navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left Side */}
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        {/* Search */}
        <div className="navbar-search">
          <span className="navbar-search-icon">🔍</span>
          <input type="text" placeholder="Tìm kiếm..." />
        </div>

        {/* Notifications */}
        <button className="navbar-icon-btn">
          <span>🔔</span>
          <span className="badge">5</span>
        </button>

        {/* Messages */}
        <button className="navbar-icon-btn">
          <span>💬</span>
          <span className="badge">3</span>
        </button>

        {/* User Menu */}
        <div
          className="navbar-user"
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{ position: 'relative' }}
        >
          <div className="navbar-user-avatar">
            {user?.FullName?.[0] || 'A'}
          </div>
          <div className="navbar-user-info">
            <div className="navbar-user-name">
              {user?.FullName || 'Admin'}
            </div>
            <div className="navbar-user-role">
              {user?.Role || 'Administrator'}
            </div>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                minWidth: '200px',
                zIndex: 1000,
              }}
            >
              <div style={{ padding: '0.5rem 0' }}>
                <a
                  href="/profile"
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    color: '#1f2937',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  👤 Hồ sơ
                </a>
                <a
                  href="/admin/settings"
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    color: '#1f2937',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  ⚙️ Cài đặt
                </a>
                <div
                  style={{
                    borderTop: '1px solid #e5e7eb',
                    margin: '0.5rem 0',
                  }}
                />
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
