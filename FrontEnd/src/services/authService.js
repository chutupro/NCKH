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
   * @returns {Promise} Response với accessToken mới
   */
  refreshToken: async () => {
    try {
      // ✅ KHÔNG CẦN GỬI GÌ - Cookie tự động gửi
      const response = await apiClient.post('/auth/refresh');

      const { accessToken } = response.data;

      return { accessToken };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
