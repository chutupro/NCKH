import React, { useState } from 'react';
import { uploadPostImage, uploadMultipleImages } from '../services/mediaService';
import { toast } from 'react-toastify';

/**
 * Component upload ảnh cho bài viết
 * Dùng trong form tạo/edit article
 */
const ArticleImageUpload = ({ category, onUploadSuccess, multiple = false }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      if (multiple) {
        // Upload nhiều ảnh
        const urls = await uploadMultipleImages(Array.from(files), category);
        
        toast.success(`✅ Upload thành công ${urls.length} ảnh!`);
        onUploadSuccess(urls);
      } else {
        // Upload 1 ảnh
        const file = files[0];
        
        // Preview local
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload lên Media Service
        const url = await uploadPostImage(file, category);
        
        toast.success('✅ Upload ảnh thành công!');
        onUploadSuccess(url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`❌ Upload thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="article-image-upload">
      <label htmlFor="image-upload" className="upload-label">
        {uploading ? '⏳ Đang upload...' : '📤 Chọn ảnh'}
      </label>
      
      <input
        id="image-upload"
        type="file"
        accept=".jpg,.jpeg,.png,.mp4,.mov"
        onChange={handleFileChange}
        disabled={uploading}
        multiple={multiple}
        style={{ display: 'none' }}
      />

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
        </div>
      )}
    </div>
  );
};

export default ArticleImageUpload;
