import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import { toast } from 'react-toastify';
import '../../Styles/Admin/AdminDashboard.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API
      // const response = await apiClient.get('/admin/users');
      // setUsers(response.data);

      // Mock data
      setUsers([
        {
          id: 1,
          fullName: 'Nguyễn Văn An',
          email: 'nva@example.com',
          role: 'Editor',
          status: 'active',
          createdAt: '2025-01-15',
          lastLogin: '2025-11-06',
        },
        {
          id: 2,
          fullName: 'Trần Thị Bình',
          email: 'ttb@example.com',
          role: 'Moderator',
          status: 'active',
          createdAt: '2025-02-20',
          lastLogin: '2025-11-05',
        },
        {
          id: 3,
          fullName: 'Lê Văn Cường',
          email: 'lvc@example.com',
          role: 'Viewer',
          status: 'inactive',
          createdAt: '2025-03-10',
          lastLogin: '2025-10-28',
        },
        {
          id: 4,
          fullName: 'Phạm Thị Dung',
          email: 'ptd@example.com',
          role: 'Editor',
          status: 'active',
          createdAt: '2025-04-05',
          lastLogin: '2025-11-06',
        },
      ]);
    } catch (error) {
      toast.error('❌ Không thể tải danh sách người dùng');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      // await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`✅ Đã thay đổi vai trò thành ${newRole}`);
    } catch (error) {
      toast.error('❌ Không thể thay đổi vai trò');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      // await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
      
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`✅ Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản`);
    } catch (error) {
      toast.error('❌ Không thể thay đổi trạng thái');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      // await apiClient.delete(`/admin/users/${userId}`);
      
      setUsers(users.filter(u => u.id !== userId));
      toast.success('✅ Đã xóa người dùng');
    } catch (error) {
      toast.error('❌ Không thể xóa người dùng');
    }
  };

  return (
    <div>
      {/* Header Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon primary">👥</div>
          </div>
          <div className="stats-card-title">Tổng người dùng</div>
          <div className="stats-card-value">{users.length}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon success">✅</div>
          </div>
          <div className="stats-card-title">Đang hoạt động</div>
          <div className="stats-card-value">
            {users.filter(u => u.status === 'active').length}
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon warning">⏸️</div>
          </div>
          <div className="stats-card-title">Bị khóa</div>
          <div className="stats-card-value">
            {users.filter(u => u.status === 'inactive').length}
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon danger">👨‍💼</div>
          </div>
          <div className="stats-card-title">Moderator</div>
          <div className="stats-card-value">
            {users.filter(u => u.role === 'Moderator').length}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="data-table-container">
        <div className="table-header">
          <h2 className="table-title">Danh sách người dùng</h2>
          <div className="table-actions">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm..."
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            />
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              ➕ Thêm người dùng
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
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Đăng nhập cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <strong style={{ color: '#1f2937' }}>{user.fullName}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--admin-border)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? '✅ Hoạt động' : '🔒 Bị khóa'}
                    </span>
                  </td>
                  <td>{user.createdAt}</td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className={`btn btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.status === 'active' ? '🔒 Khóa' : '🔓 Mở'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
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

      {/* Pagination */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm">← Trước</button>
        <button className="btn btn-primary btn-sm">1</button>
        <button className="btn btn-secondary btn-sm">2</button>
        <button className="btn btn-secondary btn-sm">3</button>
        <button className="btn btn-secondary btn-sm">Sau →</button>
      </div>
    </div>
  );
};

export default UserManagement;
