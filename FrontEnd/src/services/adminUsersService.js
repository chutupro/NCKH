import { apiClient } from './api';

/**
 * Admin Users Service - API quản lý người dùng
 */
const adminUsersService = {
  /**
   * Lấy danh sách users
   * @param {object} params - { search, page, limit, role, status }
   */
  getUsers: async (params = {}) => {
    const { search, page = 1, limit = 10, role, status } = params;
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.append('search', search);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (role) queryParams.append('role', role.toString());
    if (status) queryParams.append('status', status);

    const response = await apiClient.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Lấy chi tiết user
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Tạo user mới
   */
  createUser: async (data) => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  /**
   * Cập nhật user (role, status, fullName)
   */
  updateUser: async (id, data) => {
    const response = await apiClient.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Xóa user
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const response = await apiClient.get('/admin/users/stats/overview');
    return response.data;
  },
};

export default adminUsersService;
