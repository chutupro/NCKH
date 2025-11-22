import apiClient from './api';

const adminPermissionsService = {

  async getRoleStats() {
    const response = await apiClient.get('/admin/permissions/roles/stats');
    return response.data;
  },

  async getPermissions(role) {
    const response = await apiClient.get(`/admin/permissions/roles/${role}`);
    return response.data;
  },

  async updatePermissions(role, permissions) {
    const response = await apiClient.patch(`/admin/permissions/roles/${role}`, permissions);
    return response.data;
  },
};

export default adminPermissionsService;
