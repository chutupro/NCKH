import { apiClient } from './api';

const MEDIA_SERVICE_URL = 'http://localhost:3001';

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'avatar');

  const response = await apiClient.post(`${MEDIA_SERVICE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url; // "http://localhost:3001/storage/avatar/user-456/xxx.jpg"
};

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

export const uploadMultipleImages = async (files, category) => {
  const uploadPromises = files.map(file => uploadPostImage(file, category));
  return Promise.all(uploadPromises);
};

export const deleteFile = async (url) => {

  const path = new URL(url).pathname;

  await apiClient.delete(`${MEDIA_SERVICE_URL}${path}`);
};
