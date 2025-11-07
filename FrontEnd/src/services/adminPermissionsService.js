import apiClient from './api';

const adminPermissionsService = {
  /**
   * Lấy thống kê số lượng user theo role (THẬT từ DB)
   */
  async getRoleStats() {
    const response = await apiClient.get('/admin/permissions/roles/stats');
    return response.data;
  },

  /**
   * Lấy quyền của một role
   * @param {string} role - Admin, Editor, User
   */
  async getPermissions(role) {
    const response = await apiClient.get(`/admin/permissions/roles/${role}`);
    return response.data;
  },

  /**
   * Cập nhật quyền của một role
   * @param {string} role - Admin, Editor, User
   * @param {object} permissions - { content: [], users: [] }
   */
  async updatePermissions(role, permissions) {
    const response = await apiClient.patch(`/admin/permissions/roles/${role}`, permissions);
    return response.data;
  },
};

export default adminPermissionsService;
