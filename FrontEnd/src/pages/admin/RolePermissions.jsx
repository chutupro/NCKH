import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import '../../Styles/Admin/AdminDashboard.css';

const RolePermissions = () => {
  const { user } = useAppContext();

  const roles = [
    {
      name: 'Admin',
      description: 'Toàn quyền quản trị hệ thống',
      permissions: ['all'],
      userCount: 2,
      color: '#ef4444',
    },
    {
      name: 'Moderator',
      description: 'Kiểm duyệt nội dung, quản lý người dùng',
      permissions: ['content.read', 'content.approve', 'content.delete', 'users.read', 'users.edit'],
      userCount: 5,
      color: '#f59e0b',
    },
    {
      name: 'Editor',
      description: 'Tạo và chỉnh sửa nội dung',
      permissions: ['content.read', 'content.create', 'content.edit', 'content.delete.own'],
      userCount: 12,
      color: '#3b82f6',
    },
    {
      name: 'Viewer',
      description: 'Chỉ xem nội dung',
      permissions: ['content.read'],
      userCount: 1229,
      color: '#6b7280',
    },
  ];

  const allPermissions = [
    { id: 'content.read', name: 'Xem nội dung', category: 'Content' },
    { id: 'content.create', name: 'Tạo nội dung', category: 'Content' },
    { id: 'content.edit', name: 'Sửa nội dung', category: 'Content' },
    { id: 'content.delete', name: 'Xóa nội dung', category: 'Content' },
    { id: 'content.approve', name: 'Duyệt nội dung', category: 'Content' },
    { id: 'users.read', name: 'Xem người dùng', category: 'Users' },
    { id: 'users.create', name: 'Tạo người dùng', category: 'Users' },
    { id: 'users.edit', name: 'Sửa người dùng', category: 'Users' },
    { id: 'users.delete', name: 'Xóa người dùng', category: 'Users' },
    { id: 'system.config', name: 'Cấu hình hệ thống', category: 'System' },
    { id: 'system.logs', name: 'Xem logs', category: 'System' },
    { id: 'ai.manage', name: 'Quản lý AI', category: 'AI' },
  ];

  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const hasPermission = (permission) => {
    if (selectedRole.permissions.includes('all')) return true;
    return selectedRole.permissions.includes(permission);
  };

  return (
    <div>
      {/* Current User Info */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}>
            👤
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
              {user?.FullName || 'Admin'}
            </h2>
            <div style={{ opacity: 0.9, marginTop: '0.25rem' }}>
              <strong>Vai trò:</strong> {user?.Role || 'Administrator'}
            </div>
            <div style={{ opacity: 0.9, marginTop: '0.25rem' }}>
              <strong>Quyền hiện tại:</strong> Toàn quyền quản trị hệ thống
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
          Danh sách vai trò
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
        }}>
          {roles.map((role) => (
            <div
              key={role.name}
              onClick={() => setSelectedRole(role)}
              style={{
                background: 'white',
                border: `2px solid ${selectedRole.name === role.name ? role.color : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: role.color,
                  fontWeight: 700,
                }}>
                  {role.name}
                </h3>
                <span style={{
                  background: `${role.color}20`,
                  color: role.color,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {role.userCount} người
                </span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                {role.description}
              </p>
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                {role.permissions.includes('all') 
                  ? 'Tất cả quyền' 
                  : `${role.permissions.length} quyền`
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="data-table-container">
        <div className="table-header">
          <h2 className="table-title">
            Chi tiết quyền: {selectedRole.name}
          </h2>
          <button className="btn btn-primary">
            💾 Lưu thay đổi
          </button>
        </div>

        <div style={{ padding: '1rem 0' }}>
          {['Content', 'Users', 'System', 'AI'].map((category) => (
            <div key={category} style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 700,
                marginBottom: '1rem',
                color: '#1f2937',
              }}>
                {category}
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}>
                {allPermissions
                  .filter(p => p.category === category)
                  .map((permission) => (
                    <label
                      key={permission.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        background: hasPermission(permission.id) ? '#f0fdf4' : '#f9fafb',
                        border: `1px solid ${hasPermission(permission.id) ? '#86efac' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={hasPermission(permission.id)}
                        onChange={() => {}}
                        disabled={selectedRole.permissions.includes('all')}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ color: '#1f2937' }}>
                        {permission.name}
                      </span>
                      {hasPermission(permission.id) && (
                        <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>
                      )}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Control Rules */}
      <div className="data-table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h2 className="table-title">Quy tắc kiểm soát truy cập (RBAC)</h2>
        </div>

        <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#1f2937' }}>🔒 Nguyên tắc hoạt động:</strong>
          </div>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Mỗi user được gán 1 vai trò (role)</li>
            <li>Mỗi role có tập quyền (permissions) xác định</li>
            <li>Hệ thống kiểm tra quyền trước khi cho phép thao tác</li>
            <li>Admin có toàn quyền, bypass mọi kiểm tra</li>
          </ul>

          <div style={{ marginTop: '1.5rem' }}>
            <strong style={{ color: '#1f2937' }}>📋 Ví dụ áp dụng trong UI:</strong>
          </div>
          <div style={{ 
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            marginTop: '0.5rem',
          }}>
            {`// Frontend: Ẩn nút nếu không đủ quyền
{user.hasPermission('content.delete') && (
  <button onClick={deletePost}>Xóa bài viết</button>
)}

// Backend: Middleware kiểm tra quyền
@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('content.delete')
async deleteArticle(@Param('id') id: number) {
  // Logic xóa
}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
