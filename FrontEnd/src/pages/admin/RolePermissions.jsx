import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import adminPermissionsService from '../../services/adminPermissionsService';
import { toast } from 'react-toastify';
import '../../Styles/Admin/AdminDashboard.css';

const RolePermissions = () => {
  const { user } = useAppContext();

  const [roleStats, setRoleStats] = useState({ Admin: 0, Editor: 0, User: 0 });

  const roles = [
    {
      name: 'Admin',
      description: 'Toàn quyền quản trị hệ thống',
      color: '#ef4444',
    },
    {
      name: 'Editor',
      description: 'Tạo và chỉnh sửa nội dung',
      color: '#3b82f6',
    },
    {
      name: 'User',
      description: 'Người dùng thông thường',
      color: '#6b7280',
    },
  ];

  const allPermissions = [
    { id: 'read', name: 'Xem nội dung', category: 'Content' },
    { id: 'create', name: 'Tạo nội dung', category: 'Content' },
    { id: 'edit', name: 'Sửa nội dung', category: 'Content' },
    { id: 'delete', name: 'Xóa nội dung', category: 'Content' },
    { id: 'approve', name: 'Duyệt nội dung', category: 'Content' },
    { id: 'read', name: 'Xem người dùng', category: 'Users' },
    { id: 'create', name: 'Tạo người dùng', category: 'Users' },
    { id: 'edit', name: 'Sửa người dùng', category: 'Users' },
    { id: 'delete', name: 'Xóa người dùng', category: 'Users' },
  ];

  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [permissions, setPermissions] = useState({ content: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load role stats khi mount
  useEffect(() => {
    loadRoleStats();
  }, []);

  // Load permissions khi đổi role
  useEffect(() => {
    loadPermissions();
  }, [selectedRole.name]);

  const loadRoleStats = async () => {
    try {
      const response = await adminPermissionsService.getRoleStats();
      setRoleStats(response.data);
    } catch (error) {
      console.error('Error loading role stats:', error);
    }
  };

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await adminPermissionsService.getPermissions(selectedRole.name);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Không thể tải quyền');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permId, category) => {
    const categoryKey = category.toLowerCase();
    return permissions[categoryKey]?.includes(permId) || false;
  };

  const togglePermission = (permId, category) => {
    const categoryKey = category.toLowerCase();
    setPermissions(prev => {
      const currentPerms = prev[categoryKey] || [];
      const newPerms = currentPerms.includes(permId)
        ? currentPerms.filter(p => p !== permId)
        : [...currentPerms, permId];
      return { ...prev, [categoryKey]: newPerms };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminPermissionsService.updatePermissions(selectedRole.name, permissions);
      toast.success('✅ Đã lưu quyền thành công!');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Lỗi khi lưu quyền');
    } finally {
      setSaving(false);
    }
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
                  {roleStats[role.name] || 0} người
                </span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                {role.description}
              </p>
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
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            Đang tải quyền...
          </div>
        ) : (
          <div style={{ padding: '1rem 0' }}>
          {['Content', 'Users'].map((category) => (
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
                        background: hasPermission(permission.id, category) ? '#f0fdf4' : '#f9fafb',
                        border: `1px solid ${hasPermission(permission.id, category) ? '#86efac' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={hasPermission(permission.id, category)}
                        onChange={() => togglePermission(permission.id, category)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ color: '#1f2937' }}>
                        {permission.name}
                      </span>
                      {hasPermission(permission.id, category) && (
                        <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>
                      )}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Access Control Rules */}


    </div>
  );
};

export default RolePermissions;
