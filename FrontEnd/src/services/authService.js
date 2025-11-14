import axios from 'axios'; // ✅ Import axios gốc cho refreshToken
import apiClient from './api';

/**
 * Auth Service - Xử lý các API liên quan đến authentication
 */
const authService = {
  /**
   * Đăng ký tài khoản mới
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @param {string} fullName - Họ và tên
   * @returns {Promise} Response từ server
   */
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

  /**
   * Đăng nhập
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Promise} Response với accessToken và user info
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      // ✅ KHÔNG LƯU VÀO LOCALSTORAGE
      // ✅ refresh_token đã được backend set vào HttpOnly cookie
      // ✅ Chỉ trả về data để Context/State lưu vào memory

      return {
        accessToken,  // Sẽ lưu vào React state
        user
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Đăng xuất
   * @returns {Promise} Response từ server
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      
      // ✅ Backend đã clear HttpOnly cookie
      // ✅ Context sẽ clear state

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Refresh access token
   * ⚠️ QUAN TRỌNG: Dùng axios trực tiếp, KHÔNG dùng apiClient để tránh interceptor loop
   * @returns {Promise} Response với accessToken và user info mới
   */
  refreshToken: async () => {
    try {
      console.log('[authService] Calling /auth/refresh...');
      // ✅ Dùng axios.create() mới, KHÔNG interceptor
      const cleanAxios = axios.create({
        baseURL: 'http://localhost:3000',
        withCredentials: true, // Gửi HttpOnly cookie
      });

      const response = await cleanAxios.post('/auth/refresh');
      console.log('[authService] Refresh success:', response.data);

      const { accessToken, user } = response.data;

      return { accessToken, user };
    } catch (error) {
      console.log('[authService] Refresh failed:', error.response?.status, error.response?.data);
      // ✅ Throw error mới với format chuẩn
      const err = new Error(error.response?.data?.message || 'Refresh token failed');
      err.response = error.response;
      err.status = error.response?.status;
      throw err;
    }
  },
};

export default authService;
