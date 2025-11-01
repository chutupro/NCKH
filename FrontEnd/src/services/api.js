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
        // Nếu refresh thất bại → logout
        if (setAccessToken) {
          setAccessToken(null);
        }
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
