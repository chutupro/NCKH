import React, { useEffect, useState } from 'react';
import adminUsersService from '../../services/adminUsersService';
import { toast } from 'react-toastify';
import '../../Styles/Admin/AdminDashboard.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, editors: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', roleId: 2 });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [pagination.page, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (searchQuery) params.search = searchQuery;
      const response = await adminUsersService.getUsers(params);
      setUsers(response.data);
      setPagination(prev => ({ 
        ...prev, 
        total: response.pagination.total, 
        totalPages: response.pagination.totalPages 
      }));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminUsersService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChangeRole = async (userId, newRoleId) => {
    try {
      await adminUsersService.updateUser(userId, { roleId: parseInt(newRoleId) });
      toast.success('Đã cập nhật vai trò');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error('Lỗi');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';
    if (!window.confirm(newStatus === 'locked' ? 'Khóa?' : 'Mở?')) return;
    try {
      await adminUsersService.updateUser(userId, { status: newStatus });
      toast.success(newStatus === 'locked' ? 'Đã khóa' : 'Đã mở');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error('Lỗi');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Xóa?')) return;
    try {
      await adminUsersService.deleteUser(userId);
      toast.success('Đã xóa');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error('Lỗi');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast.error('Thiếu thông tin');
      return;
    }
    try {
      await adminUsersService.createUser({ ...newUser, roleId: parseInt(newUser.roleId) });
      toast.success('Tạo thành công');
      setShowAddModal(false);
      setNewUser({ email: '', password: '', fullName: '', roleId: 2 });
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error('Lỗi');
    }
  };

  if (loading && users.length === 0) return <div className="admin-content">Đang tải...</div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Quản Lý Người Dùng</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => setShowAddModal(true)}>Thêm</button>
      </div>
      <div className="admin-stats-grid">
        <div className="stats-card"><div className="stats-icon stats-icon-primary"></div><div className="stats-info"><h3>Tổng</h3><p className="stats-value">{stats.total}</p></div></div>
        <div className="stats-card"><div className="stats-icon stats-icon-success"></div><div className="stats-info"><h3>Active</h3><p className="stats-value">{stats.active}</p></div></div>
        <div className="stats-card"><div className="stats-icon stats-icon-warning"></div><div className="stats-info"><h3>Locked</h3><p className="stats-value">{stats.inactive}</p></div></div>
        <div className="stats-card"><div className="stats-icon stats-icon-danger"></div><div className="stats-info"><h3>Editor</h3><p className="stats-value">{stats.editors}</p></div></div>
      </div>
      <div className="admin-filters">
        <input type="text" className="admin-search" placeholder="Tìm..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }} />
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Email</th><th>Tên</th><th>Role</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {users.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center' }}>No data</td></tr> : users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.fullName || '-'}</td>
                <td>
                  <select className="admin-select" value={user.roleId} onChange={(e) => handleChangeRole(user.id, e.target.value)}>
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                    <option value="4">Editor</option>
                  </select>
                </td>
                <td><span className={`admin-badge admin-badge-${user.status === 'active' ? 'success' : 'danger'}`}>{user.status === 'active' ? '✅' : '🔒'}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="admin-actions">
                    <button className={`admin-btn admin-btn-sm ${user.status === 'active' ? 'admin-btn-warning' : 'admin-btn-success'}`} onClick={() => handleToggleStatus(user.id, user.status)}>{user.status === 'active' ? '🔒' : '🔓'}</button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDeleteUser(user.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <button className="admin-pagination-btn" onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1}> Trước</button>
          <span>Trang {pagination.page} / {pagination.totalPages}</span>
          <button className="admin-pagination-btn" onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.totalPages}>Sau </button>
        </div>
      )}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>Thêm User</h2><button className="admin-modal-close" onClick={() => setShowAddModal(false)}></button></div>
            <form className="admin-modal-body" onSubmit={handleCreateUser}>
              <div className="admin-form-group"><label>Email *</label><input type="email" required className="admin-input" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
              <div className="admin-form-group"><label>Password *</label><input type="password" required className="admin-input" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} minLength={6} /></div>
              <div className="admin-form-group"><label>Tên *</label><input type="text" required className="admin-input" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} /></div>
              <div className="admin-form-group"><label>Role</label><select className="admin-select" value={newUser.roleId} onChange={(e) => setNewUser({ ...newUser, roleId: parseInt(e.target.value) })}><option value="2">User</option><option value="4">Editor</option><option value="1">Admin</option></select></div>
              <div className="admin-modal-footer"><button type="button" className="admin-btn" onClick={() => setShowAddModal(false)}>Hủy</button><button type="submit" className="admin-btn admin-btn-primary">Tạo</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;