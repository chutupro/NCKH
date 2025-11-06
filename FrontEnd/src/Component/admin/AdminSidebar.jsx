import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../Styles/Admin/AdminDashboard.css';

const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
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
        { path: '/admin/users', icon: '👥', label: 'Người dùng', badge: '12' },
        { path: '/admin/content', icon: '📰', label: 'Nội dung', badge: '5' },
        { path: '/admin/contributions', icon: '📝', label: 'Đóng góp', badge: '8' },
        { path: '/admin/comments', icon: '💬', label: 'Bình luận', badge: '3' },
      ],
    },
    {
      section: 'AI & Automation',
      items: [
        { path: '/admin/ai-models', icon: '🤖', label: 'AI Models', badge: null },
        { path: '/admin/crawler', icon: '🕷️', label: 'Crawler', badge: null },
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
