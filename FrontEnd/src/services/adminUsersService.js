import { apiClient } from './api';

const adminUsersService = {

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

  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await apiClient.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/admin/users/stats/overview');
    return response.data;
  },
};

export default adminUsersService;
