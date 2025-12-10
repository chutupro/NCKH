import axios from 'axios';

const MEDIA_SERVICE_URL = 'http://localhost:3001';
const MAIN_BACKEND_URL = 'http://localhost:3000';

/**
 * Get access token by calling backend endpoint that returns the token from cookie
 */
const getAccessToken = async () => {
  try {
    // Call the backend to get the token from HttpOnly cookie
    const response = await axios.get(`${MAIN_BACKEND_URL}/auth/token`, {
      withCredentials: true, // Important: send cookies
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw new Error('Không thể lấy access token. Vui lòng đăng nhập lại.');
  }
};

/**
 * Upload avatar (ảnh đại diện)
 * @param {File} file - File ảnh
 * @returns {Promise<string>} URL của ảnh đã upload
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'avatar');

  // Get access token from backend
  const accessToken = await getAccessToken();

  // 👉 GỌI BACKEND, không gọi trực tiếp media-service
  const response = await axios.post(`${MAIN_BACKEND_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.data.filePath; // Backend trả URL từ media-service
};

/**
 * Upload ảnh cho bài viết
 * @param {File} file - File ảnh/video
 * @param {string} category - 'van-hoa' | 'du-lich' | 'thien-nhien' | 'kien-truc'
 * @returns {Promise<string>} URL của file đã upload
 */
export const uploadPostImage = async (file, category) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'post');
  formData.append('category', category);

  // Get access token from backend
  const accessToken = await getAccessToken();

  // 👉 GỌI BACKEND, không gọi trực tiếp media-service
  const response = await axios.post(`${MAIN_BACKEND_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.data.filePath; // Backend trả URL từ media-service
};

/**
 * Upload nhiều ảnh cho bài viết
 * @param {File[]} files - Mảng các file
 * @param {string} category - Category của bài viết
 * @returns {Promise<string[]>} Mảng URLs
 */
export const uploadMultipleImages = async (files, category) => {
  const uploadPromises = files.map(file => uploadPostImage(file, category));
  return Promise.all(uploadPromises);
};

/**
 * Delete file (gọi Media Service để xóa)
 * Lưu ý: Cần implement DELETE endpoint trong Media Service
 * @param {string} url - URL của file cần xóa
 */
export const deleteFile = async (url) => {
  // Extract path từ URL: http://localhost:3001/storage/avatar/user-123/file.jpg
  // → /storage/avatar/user-123/file.jpg
  const path = new URL(url).pathname;
  
  // Get access token from backend
  const accessToken = await getAccessToken();
  
  await axios.delete(`${MEDIA_SERVICE_URL}${path}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
};
