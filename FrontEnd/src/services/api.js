import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

let getAccessToken = null;
let setAccessToken = null;

export const setupTokenGetters = (getTokenFn, setTokenFn) => {
  getAccessToken = getTokenFn;
  setAccessToken = setTokenFn;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // ✅ QUAN TRỌNG: Cho phép gửi/nhận cookie
});

apiClient.interceptors.request.use(
  (config) => {

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/users/me')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {

        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        return apiClient(originalRequest);
      } catch (refreshError) {

        if (setAccessToken) {
          setAccessToken(null);
        }

        const currentPath = window.location.pathname;
        const publicPaths = ['/', '/login', '/register', '/about', '/forgot-password'];

        if (!publicPaths.includes(currentPath)) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
