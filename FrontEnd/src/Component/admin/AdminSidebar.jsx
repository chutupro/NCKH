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
        { path: '/admin', label: 'Dashboard', badge: null },
      ],
    },
    {
      section: 'Management',
      items: [
        { path: '/admin/users', label: 'Người dùng', badge: null },
        { path: '/admin/content', label: 'Thư viện Ảnh', badge: null },
        { path: '/admin/locations', label: 'Quản lý Địa điểm', badge: null },
        { path: '/admin/timeline-management', label: 'Quản lý Timeline', badge: null },
        { path: '/admin/contributions', label: 'Đóng góp', badge: pendingCount > 0 ? String(pendingCount) : null },
        { path: '/admin/comparisons', label: 'Quản lý So Sánh', badge: null },
      ],
    },
  ];

  // Menu items for Moderator only (2 items)
  const moderatorMenuItems = [
    {
      section: 'Moderation',
      items: [
        { path: '/admin/contributions', label: 'Duyệt Ảnh', badge: pendingCount > 0 ? String(pendingCount) : null },
        { path: '/admin/map-management', label: 'Quản Lý Bản Đồ', badge: null },
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
          <span className="sidebar-logo-text">Admin Panel</span>
        </Link>
        
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <div className="menu-section-title">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="menu-item-icon">{item.icon}</span>
                <span className="menu-item-text">{item.label}</span>
                {item.badge && (
                  <span className="menu-item-badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="sidebar-footer" style={{ padding: '1.5rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
          <div>Version 2.0.0</div>
          <div>© 2025 Đà Nẵng Heritage</div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
