# 🚀 HƯỚNG DẪN SETUP & CHẠY MEDIA SERVICE

## Bước 1: Cài đặt dependencies

```bash
cd media-service
npm install
```

## Bước 2: Chạy development mode

```bash
npm run start:dev
```

Console sẽ hiện:
```
🚀 Media Service running on: http://localhost:3001
📁 Storage path: E:\NCKH\duan\NCKH\media-service\storage

📋 Endpoints:
   POST /upload - Upload ảnh/video
   GET  /storage/* - Serve files
```

## Bước 3: Test với Postman/cURL

### Test 1: Upload Avatar

**Request:**
```http
POST http://localhost:3001/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx
Content-Type: multipart/form-data

Body:
- file: [chọn file ảnh]
- type: avatar
```

**Response:**
```json
{
  "url": "http://localhost:3001/storage/avatar/user-123/my-avatar_1730901234.jpg",
  "type": "avatar",
  "category": null,
  "filename": "my-avatar_1730901234.jpg",
  "size": 245678
}
```

### Test 2: Upload Post (văn hóa)

**Request:**
```http
POST http://localhost:3001/upload
Authorization: Bearer eyJ...
Content-Type: multipart/form-data

Body:
- file: [chọn file]
- type: post
- category: van-hoa
```

**Response:**
```json
{
  "url": "http://localhost:3001/storage/van-hoa/user-123/hoi-an_1730901234.jpg",
  "type": "post",
  "category": "van-hoa",
  "filename": "hoi-an_1730901234.jpg",
  "size": 512345
}
```

### Test 3: Xem ảnh (Static)

```http
GET http://localhost:3001/storage/van-hoa/user-123/hoi-an_1730901234.jpg
```

→ Browser sẽ hiển thị ảnh

---

## 🔐 Tạo Token Để Test

**Dùng jwt.io hoặc code:**

```javascript
// Node.js
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    sub: 'user-123',  // userId
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 1 ngày
  },
  'any-secret' // Không cần đúng secret vì chỉ decode
);

console.log(token);
```

---

## 📂 Kiểm Tra Storage

Sau khi upload, kiểm tra folder:

```
media-service/storage/
├── avatar/
│   └── user-123/
│       └── my-avatar_1730901234.jpg  ← File đã lưu
├── van-hoa/
│   └── user-123/
│       └── hoi-an_1730901234.jpg
```

---

## 🔗 Tích Hợp với Web Chính

### Frontend: Upload từ React

```javascript
// src/services/mediaService.js
import axios from 'axios';

const MEDIA_SERVICE_URL = 'http://localhost:3001';

export const uploadAvatar = async (file, accessToken) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'avatar');

  const response = await axios.post(`${MEDIA_SERVICE_URL}/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

export const uploadPost = async (file, category, accessToken) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'post');
  formData.append('category', category);

  const response = await axios.post(`${MEDIA_SERVICE_URL}/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
```

**Sử dụng:**

```jsx
// Component upload avatar
const handleUpload = async (event) => {
  const file = event.target.files[0];
  const accessToken = getAccessToken(); // Từ context/state

  try {
    const imageUrl = await uploadAvatar(file, accessToken);
    console.log('✅ Uploaded:', imageUrl);
    
    // Hiển thị ảnh
    setAvatarUrl(imageUrl);
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
};
```

### Backend: Lưu URL vào Database

```typescript
// user.service.ts
async updateAvatar(userId: number, file: Express.Multer.File, accessToken: string) {
  // 1. Upload lên Media Service
  const formData = new FormData();
  formData.append('file', file.buffer);
  formData.append('type', 'avatar');

  const response = await axios.post('http://localhost:3001/upload', formData, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const avatarUrl = response.data.url;

  // 2. Lưu URL vào database
  await this.userRepo.update(userId, { avatar: avatarUrl });

  return { avatarUrl };
}
```

---

## 🐛 Common Errors

### 1. "Cannot find module @nestjs/core"

```bash
cd media-service
npm install
```

### 2. "Port 3001 already in use"

```bash
# Tìm process đang dùng port
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <PID> /F

# Hoặc đổi port trong main.ts
await app.listen(3002);
```

### 3. "CORS blocked"

→ Đã config CORS trong `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  ...
});
```

Nếu frontend chạy port khác → thêm vào array

### 4. "Token không hợp lệ"

→ Kiểm tra token có `sub` claim:
```javascript
const payload = jwt.decode(token);
console.log(payload.sub); // phải có userId
```

---

## ✅ Checklist

- [x] `npm install` thành công
- [x] Service chạy trên http://localhost:3001
- [x] Upload avatar thành công
- [x] Upload post với category thành công
- [x] File được lưu vào `storage/` folder
- [x] GET /storage/... trả về ảnh
- [x] Frontend có thể gọi API
- [x] URL được lưu vào database (nếu cần)

---

**Media Service đã sẵn sàng! 🎉**

Next steps:
1. Tích hợp với frontend (React)
2. Lưu URL vào database (Backend)
3. Deploy lên server riêng (production)
