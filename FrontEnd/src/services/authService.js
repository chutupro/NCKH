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
   * @param {boolean} rememberMe - Ghi nhớ đăng nhập (30 ngày nếu true, 7 ngày nếu false)
   * @returns {Promise} Response với accessToken và user info
   */
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        rememberMe, // 🔥 GỬi rememberMe lên backend
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
   * ⚠️ QUAN TRỌNG: Backend trả 204 No Content, chỉ set HttpOnly cookie
   * Frontend phải gọi /users/me để lấy user info
   * @returns {Promise} Response với user info (access_token trong cookie)
   */
  refreshToken: async () => {
    try {
      // 🔥 BƯỚC 1: Gọi /auth/refresh - Backend trả 204, set cookie mới
      const cleanAxios = axios.create({
        baseURL: 'http://localhost:3000',
        withCredentials: true, // Gửi HttpOnly cookie
      });

      await cleanAxios.post('/auth/refresh'); // 204 No Content

      // 🔥 BƯỚC 2: Gọi /users/me để lấy user info (cookie mới đã được set)
      const userResponse = await cleanAxios.get('/users/me');

      const user = userResponse.data;

      // Trả về user info (access_token đã trong cookie, không cần trả về)
      return { user };
    } catch (error) {
      // ✅ Throw error mới với format chuẩn
      const err = new Error(error.response?.data?.message || 'Refresh token failed');
      err.response = error.response;
      err.status = error.response?.status;
      throw err;
    }
  },
};

export default authService;
