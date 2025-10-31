import axios from 'axios';

// Base URL của backend API
const API_BASE_URL = 'http://localhost:3000';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Interceptor để tự động thêm access token vào headers
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn (401) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lấy refresh token và userId
        const refreshToken = localStorage.getItem('refreshToken');
        const userId = localStorage.getItem('userId');

        if (refreshToken && userId) {
          // Gọi API refresh token
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            userId: parseInt(userId),
            refresh_token: refreshToken,
          });

          // Lưu tokens mới
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Retry request với token mới
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh thất bại, xóa tokens và redirect login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
