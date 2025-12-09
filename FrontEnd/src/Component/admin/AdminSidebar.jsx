import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../../context/useAppContext';
import '../../Styles/Admin/AdminDashboard.css';

const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAppContext();
  const [pendingCount, setPendingCount] = useState(0);

  const isActive = (path) => location.pathname === path;
  
  // Check if user is Moderator
  const isModerator = user?.role === 'Moderator' || user?.Role === 'Moderator';

  useEffect(() => {
    fetchPendingCount();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await axios.get('http://localhost:3000/articles_post/pending/list');
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  // Menu items for Admin only
  const adminMenuItems = [
    {
      section: 'Main',
      items: [
        { path: '/admin', icon: '📊', label: 'Dashboard', badge: null },
        { path: '/admin/analytics', icon: '📈', label: 'Analytics', badge: null },
      ],
    },
    {
      section: 'Management',
      items: [
        { path: '/admin/users', icon: '👥', label: 'Người dùng', badge: null },
        { path: '/admin/content', icon: '📚', label: 'Thư viện ảnh', badge: null },
        { path: '/admin/locations', icon: '🗺️', label: 'Quản lý Địa điểm', badge: null },
        { path: '/admin/contributions', icon: '📝', label: 'Đóng góp', badge: pendingCount > 0 ? String(pendingCount) : null },
        { path: '/admin/comparisons', icon: '📸', label: 'Quản lý So Sánh', badge: null },
        
      ],
    },
    {
      section: 'AI & Automation',
      items: [
        { path: '/admin/ai-models', icon: '🤖', label: 'AI Models', badge: null },
      ],
    },
    {
      section: 'System',
      items: [
        { path: '/admin/system-monitor', icon: '🛡️', label: 'Giám sát', badge: null },
        { path: '/admin/permissions', icon: '⚙️', label: 'Phân quyền', badge: null },
        { path: '/admin/logs', icon: '📋', label: 'Logs', badge: null },
      ],
    },
  ];

  // Menu items for Moderator only (2 items)
  const moderatorMenuItems = [
    {
      section: 'Moderation',
      items: [
        { path: '/admin/contributions', icon: '📝', label: 'Duyệt Ảnh', badge: pendingCount > 0 ? String(pendingCount) : null },
        { path: '/admin/map-management', icon: '🗺️', label: 'Quản Lý Bản Đồ', badge: null },
      ],
    },
  ];

  // Use appropriate menu based on role
  const menuItems = isModerator ? moderatorMenuItems : adminMenuItems;

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-logo">
          <div className="sidebar-logo-icon">🏛️</div>
          {!collapsed && <span>Admin Panel</span>}
        </Link>
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <div className="menu-section-title">{section.section}</div>
            )}
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="menu-item-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="menu-item-text">{item.label}</span>
                    {item.badge && (
                      <span className="menu-item-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div style={{ padding: '1.5rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            <div>Version 2.0.0</div>
            <div>© 2025 Đà Nẵng Heritage</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
