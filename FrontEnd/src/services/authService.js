import axios from 'axios'; // ✅ Import axios gốc cho refreshToken
import apiClient from './api';

const authService = {

  register: async (email, password, fullName) => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        fullName,
        role: '1', // Default role: user
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (email, password, rememberMe = false) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        rememberMe, // 🔥 GỬi rememberMe lên backend
      });

      const { accessToken, user } = response.data;

      return {
        accessToken,  // Sẽ lưu vào React state
        user
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async () => {
    try {

      const cleanAxios = axios.create({
        baseURL: 'http://localhost:3000',
        withCredentials: true, // Gửi HttpOnly cookie
      });

      await cleanAxios.post('/auth/refresh'); // 204 No Content

      const userResponse = await cleanAxios.get('/users/me');

      const user = userResponse.data;

      return { user };
    } catch (error) {

      const err = new Error(error.response?.data?.message || 'Refresh token failed');
      err.response = error.response;
      err.status = error.response?.status;
      throw err;
    }
  },
};

export default authService;
