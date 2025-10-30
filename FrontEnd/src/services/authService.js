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
   * @returns {Promise} Response với tokens
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      // Lưu tokens và userId vào localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', user.UserID);
      localStorage.setItem('userEmail', user.Email);
      localStorage.setItem('userFullName', user.FullName || '');

      return response.data;
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
      
      // Xóa tokens khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullName');

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      // Vẫn xóa tokens dù API thất bại
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullName');
      
      throw error.response?.data || error.message;
    }
  },

  /**
   * Refresh access token
   * @returns {Promise} Response với tokens mới
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const userId = localStorage.getItem('userId');

      if (!refreshToken || !userId) {
        throw new Error('Không tìm thấy refresh token');
      }

      const response = await apiClient.post('/auth/refresh', {
        userId: parseInt(userId),
        refresh_token: refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Lưu tokens mới
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Kiểm tra user đã đăng nhập chưa
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  },

  /**
   * Lấy thông tin user từ localStorage
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName');

    if (!userId) return null;

    return {
      userId: parseInt(userId),
      email: userEmail,
      fullName: userFullName,
    };
  },
};

export default authService;
