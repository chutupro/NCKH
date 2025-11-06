import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import '../../Styles/Admin/AdminDashboard.css';

const AdminLayout = ({ title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`admin-content-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminNavbar sidebarCollapsed={sidebarCollapsed} title={title} />

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
