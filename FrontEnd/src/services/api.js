import axios from 'axios';

// Base URL của backend API
const API_BASE_URL = 'http://localhost:3000';

// ✅ GLOBAL VARIABLE để lưu accessToken getter (sẽ được set từ Context)
let getAccessToken = null;
let setAccessToken = null;

// Function để setup token getters từ Context
export const setupTokenGetters = (getTokenFn, setTokenFn) => {
  getAccessToken = getTokenFn;
  setAccessToken = setTokenFn;
};

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // ✅ QUAN TRỌNG: Cho phép gửi/nhận cookie
});

// Interceptor để tự động thêm access token vào headers
apiClient.interceptors.request.use(
  (config) => {
    // ✅ LẤY TOKEN TỪ MEMORY (Context state)
    const accessToken = getAccessToken ? getAccessToken() : null;
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

    // ✅ KHÔNG retry nếu request là /auth/refresh (tránh infinite loop)
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // ✅ KHÔNG retry nếu request là /auth/login (tránh loop khi login sai)
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // Nếu token hết hạn (401) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ GỌI REFRESH - Cookie tự động gửi
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // ✅ LƯU ACCESS_TOKEN MỚI VÀO STATE
        if (setAccessToken && data.accessToken) {
          setAccessToken(data.accessToken);
        }

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại → clear state (KHÔNG redirect để tránh loop)
        if (setAccessToken) {
          setAccessToken(null);
        }
        
        // Chỉ redirect nếu user đang ở trang protected
        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/login', '/register', '/about', '/forgot-password'];
        
        if (!publicPaths.includes(currentPath)) {
          console.log('[API] Refresh failed, redirecting to login...');
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export both default and named
export { apiClient };
export default apiClient;
