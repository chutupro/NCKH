# 🔗 TÍCH HỢP MEDIA SERVICE VÀO MAIN APP

## 📋 Tổng Quan

**Hiện tại:** Admin upload ảnh → Backend lưu file vào `BackEnd/uploads/` → Lưu path vào DB

**Sau khi tích hợp:** Admin upload ảnh → **Media Service** lưu file → Trả URL → Frontend gửi URL cho Backend → Lưu URL vào DB

---

## ✅ ĐÃ LÀM

### 1. Media Service (Port 3001)
- ✅ Upload endpoint: POST /upload
- ✅ Static serve: GET /storage/*
- ✅ Decode JWT để lấy userId
- ✅ Lưu file vào `storage/[type]/[userId]/`

### 2. Frontend Services
- ✅ `mediaService.js` - Upload functions
- ✅ `ArticleImageUpload.jsx` - Upload component

---

## 🔧 CẦN LÀM THÊM

### Bước 1: Cập nhật API Client (Frontend)

File: `FrontEnd/src/services/api.js`

Đảm bảo `apiClient` tự động thêm Authorization header:

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // Gửi cookie (refresh token)
});

// Interceptor tự động thêm access token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Hoặc từ Context
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { apiClient };
```

### Bước 2: Sử dụng Component Upload

File: `FrontEnd/src/pages/contribute/CreateArticle.jsx` (hoặc tương tự)

```jsx
import React, { useState } from 'react';
import ArticleImageUpload from '../../Component/common/ArticleImageUpload';
import { apiClient } from '../../services/api';
import { toast } from 'react-toastify';

const CreateArticlePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: 1, // van-hoa
    imageUrl: '', // URL từ Media Service
    imageDescription: '',
  });

  // Callback khi upload ảnh thành công
  const handleImageUploaded = (url) => {
    console.log('✅ Ảnh đã upload:', url);
    setFormData({ ...formData, imageUrl: url });
  };

  // Submit form tạo bài viết
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Gọi API backend để tạo article
      const response = await apiClient.post('/articles', {
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        imagePath: formData.imageUrl, // URL từ Media Service
        imageDescription: formData.imageDescription,
      });

      toast.success('✅ Tạo bài viết thành công!');
      console.log('Article created:', response.data);
    } catch (error) {
      toast.error('❌ Tạo bài viết thất bại!');
      console.error(error);
    }
  };

  return (
    <div className="create-article-page">
      <h1>Tạo Bài Viết Mới</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Tiêu đề */}
        <div className="form-group">
          <label>Tiêu đề:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* Nội dung */}
        <div className="form-group">
          <label>Nội dung:</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Danh mục:</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
          >
            <option value={1}>Văn Hóa</option>
            <option value={2}>Du Lịch</option>
            <option value={3}>Thiên Nhiên</option>
            <option value={4}>Kiến Trúc</option>
          </select>
        </div>

        {/* Upload ảnh */}
        <div className="form-group">
          <label>Ảnh bài viết:</label>
          <ArticleImageUpload
            category="van-hoa" // Hoặc map từ categoryId
            onUploadSuccess={handleImageUploaded}
          />
          {formData.imageUrl && (
            <div className="image-preview">
              <p>✅ Đã upload: {formData.imageUrl}</p>
              <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '300px' }} />
            </div>
          )}
        </div>

        {/* Mô tả ảnh */}
        <div className="form-group">
          <label>Mô tả ảnh:</label>
          <input
            type="text"
            value={formData.imageDescription}
            onChange={(e) => setFormData({ ...formData, imageDescription: e.target.value })}
          />
        </div>

        <button type="submit" className="btn-submit">
          Đăng Bài
        </button>
      </form>
    </div>
  );
};

export default CreateArticlePage;
```

### Bước 3: Map Category ID → Category Name

Tạo helper:

```javascript
// FrontEnd/src/util/categoryMap.js
export const CATEGORY_MAP = {
  1: 'van-hoa',
  2: 'du-lich',
  3: 'thien-nhien',
  4: 'kien-truc',
};

export const getCategoryName = (categoryId) => {
  return CATEGORY_MAP[categoryId] || 'van-hoa';
};
```

Sử dụng:

```jsx
import { getCategoryName } from '../../util/categoryMap';

<ArticleImageUpload
  category={getCategoryName(formData.categoryId)}
  onUploadSuccess={handleImageUploaded}
/>
```

### Bước 4: Backend Không Cần Sửa Gì

Backend hiện tại đã nhận `imagePath` (string) và lưu vào DB:

```typescript
// BackEnd/src/modules/articles_Post/article-post.service.ts
async createArticle(dto: CreateArticleDto) {
  // ...
  
  if (dto.imagePath) {
    const image = this.imageRepo.create({
      FilePath: dto.imagePath, // Lưu URL từ Media Service
      AltText: dto.imageDescription || '',
      ArticleID: article.ArticleID,
      article,
    });
    await this.imageRepo.save(image);
  }
  
  // ...
}
```

**Trước:** `dto.imagePath = "/uploads/image_123.jpg"`  
**Sau:** `dto.imagePath = "http://localhost:3001/storage/van-hoa/user-456/image_123.jpg"`

→ **Không cần sửa code backend!** Chỉ cần gửi URL thay vì relative path.

---

## 🔄 Workflow Hoàn Chỉnh

```
1. Admin login
   ↓
   Nhận access token (JWT với userId)
   ↓
2. Admin chọn ảnh trong CreateArticle form
   ↓
3. ArticleImageUpload component upload ảnh lên Media Service
   POST http://localhost:3001/upload
   Authorization: Bearer <access_token>
   Body: {file, type: 'post', category: 'van-hoa'}
   ↓
4. Media Service:
   - Decode JWT → userId = 456 (admin)
   - Lưu file vào: storage/van-hoa/user-456/image_timestamp.jpg
   - Return: {url: "http://localhost:3001/storage/van-hoa/user-456/image_timestamp.jpg"}
   ↓
5. Frontend nhận URL, set vào formData.imageUrl
   ↓
6. Admin submit form
   ↓
7. Frontend gửi POST /api/articles
   Body: {
     title: "...",
     content: "...",
     categoryId: 1,
     imagePath: "http://localhost:3001/storage/van-hoa/user-456/image_timestamp.jpg",
     imageDescription: "..."
   }
   ↓
8. Backend lưu URL vào database (Images table, FilePath column)
   ↓
9. Hiển thị bài viết:
   <img src="http://localhost:3001/storage/van-hoa/user-456/image_timestamp.jpg" />
```

---

## 🎯 Lợi Ích

### So Với Cách Cũ (Backend Upload):

**Cách cũ:**
- ❌ Backend phải xử lý file upload (Multer)
- ❌ File lưu trong BackEnd/uploads (lộn xộn)
- ❌ Khó scale (backend phải serve static files)
- ❌ Khó quản lý (không biết user nào upload)

**Cách mới (Media Service):**
- ✅ Backend chỉ nhận URL (string)
- ✅ File lưu riêng trong Media Service
- ✅ Dễ scale (tách riêng service)
- ✅ Dễ quản lý (folder theo userId)
- ✅ Dễ migrate lên S3/Cloudinary sau này

---

## 🚀 Deploy Production

### Bước 1: Đổi Sang AWS S3

Thay vì lưu file local, Media Service sẽ upload lên S3:

```typescript
// media-service/src/media.service.ts
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'ap-southeast-1',
});

async upload(file: any, type: string, category?: string, token?: string) {
  const decoded = jwt.decode(token.replace('Bearer ', ''));
  const userId = decoded.sub;
  
  const key = `${type}/${userId}/${Date.now()}_${file.originalname}`;
  
  await s3.upload({
    Bucket: 'danang-historical-images',
    Key: key,
    Body: file.buffer,
    ACL: 'public-read',
  }).promise();
  
  return {
    url: `https://danang-historical-images.s3.amazonaws.com/${key}`,
  };
}
```

### Bước 2: Hoặc Cloudinary

```bash
npm install cloudinary
```

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async upload(file: any, type: string, category?: string, token?: string) {
  const decoded = jwt.decode(token.replace('Bearer ', ''));
  const userId = decoded.sub;
  
  const result = await cloudinary.uploader.upload(file.path, {
    folder: `${type}/${userId}`,
    public_id: `${Date.now()}_${file.originalname}`,
  });
  
  return {
    url: result.secure_url,
  };
}
```

---

## 📚 Files Đã Tạo

### Frontend
- ✅ `FrontEnd/src/services/mediaService.js` - Upload functions
- ✅ `FrontEnd/src/Component/common/ArticleImageUpload.jsx` - Upload component
- ✅ `FrontEnd/src/util/categoryMap.js` - Helper map category (tạo nếu chưa có)

### Backend
- ✅ Không cần sửa gì! Chỉ cần nhận URL thay vì relative path

### Media Service
- ✅ Đã chạy trên port 3001
- ✅ Endpoints: POST /upload, GET /storage/*

---

## ✅ Checklist Tích Hợp

### Development
- [ ] Copy `mediaService.js` vào `FrontEnd/src/services/`
- [ ] Copy `ArticleImageUpload.jsx` vào `FrontEnd/src/Component/common/`
- [ ] Tạo `categoryMap.js` trong `FrontEnd/src/util/`
- [ ] Sử dụng component trong CreateArticle page
- [ ] Test upload: Admin login → Chọn ảnh → Upload → Nhận URL
- [ ] Test submit: Submit form → URL lưu vào DB
- [ ] Test hiển thị: Ảnh hiển thị đúng từ Media Service

### Production
- [ ] Đổi từ local storage sang S3/Cloudinary
- [ ] Update URL trong response (S3 URL thay vì localhost:3001)
- [ ] Setup CDN (CloudFront, Cloudflare)
- [ ] Add image optimization (resize, compress)
- [ ] Add file size limits
- [ ] Add virus scanning (ClamAV)

---

**Bây giờ bạn có thể tích hợp Media Service vào main app!** 🚀

1. Copy 3 files đã tạo vào Frontend
2. Sử dụng `ArticleImageUpload` component trong form tạo bài viết
3. Khi submit, gửi URL (không phải file) cho backend
4. Backend lưu URL vào DB như bình thường
