import { apiClient } from './api';

const MEDIA_SERVICE_URL = 'http://localhost:3001';

/**
 * Upload avatar (ảnh đại diện)
 * @param {File} file - File ảnh
 * @returns {Promise<string>} URL của ảnh đã upload
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'avatar');

  // apiClient tự động thêm Authorization header (access token)
  const response = await apiClient.post(`${MEDIA_SERVICE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url; // "http://localhost:3001/storage/avatar/user-456/xxx.jpg"
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

  const response = await apiClient.post(`${MEDIA_SERVICE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
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
  
  await apiClient.delete(`${MEDIA_SERVICE_URL}${path}`);
};
