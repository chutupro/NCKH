# Media Service - Kho Ảnh Độc Lập

**Microservice đơn giản để lưu trữ và phục vụ ảnh/video cho ứng dụng Đà Nẵng Historical Images**

---

## 📋 Mô Tả

Media Service là **microservice độc lập**, chạy riêng biệt khỏi web chính:
- **Không có database** - chỉ lưu file vào disk
- **Không quản lý user** - chỉ lấy userId từ access token
- **Chức năng duy nhất**: Nhận file → Lưu vào `/storage` → Trả URL

---

## 🚀 Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy development mode
npm run start:dev

# 3. Service chạy trên http://localhost:3001
```

---

## 📁 Cấu Trúc Storage

```
storage/
├── avatar/           ← Ảnh đại diện user
│   └── user-123/
│       └── avatar_1730901234.jpg
├── van-hoa/          ← Ảnh/video văn hóa
│   ├── user-456/
│   └── admin-1/
├── du-lich/          ← Ảnh/video du lịch
├── thien-nhien/      ← Ảnh/video thiên nhiên
└── kien-truc/        ← Ảnh/video kiến trúc
```

**Quy tắc:**
- `type = avatar` → `storage/avatar/[userId]/`
- `type = post` → `storage/[category]/[userId]/`
- Tên file: `tên-gốc_timestamp.ext`

---

## 🔌 API Endpoints

### 1. Upload File

```http
POST http://localhost:3001/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Body:
- file: (binary)                    ← Bắt buộc
- type: "avatar" | "post"           ← Bắt buộc
- category: "van-hoa" | "du-lich" | "thien-nhien" | "kien-truc"  ← Bắt buộc nếu type=post
```

**Response:**
```json
{
  "url": "http://localhost:3001/storage/van-hoa/user-123/hoi-an_1730901234.jpg",
  "type": "post",
  "category": "van-hoa",
  "filename": "hoi-an_1730901234.jpg",
  "size": 245678,
  "path": "van-hoa/user-123/hoi-an_1730901234.jpg"
}
```

### 2. Serve Files (Static)

```http
GET http://localhost:3001/storage/van-hoa/user-123/hoi-an_1730901234.jpg
```

---

## 🔐 Authentication

Service **chỉ decode token** (không verify):

```javascript
// Token payload
{
  "sub": "user-123",   // userId - dùng để tạo folder
  "role": "user",      // không dùng
  "exp": 1730900000
}
```

**Lý do:** Tin tưởng rằng **web chính đã verify token** trước khi gọi Media Service.

---

## ✅ Validation

| Rule | Value |
|------|-------|
| **Allowed extensions** | `.jpg`, `.jpeg`, `.png`, `.mp4`, `.mov` |
| **Max file size** | 50MB |
| **Valid types** | `avatar`, `post` |
| **Valid categories** | `van-hoa`, `du-lich`, `thien-nhien`, `kien-truc` |

---

## 🧪 Testing

### Test Upload Avatar

```bash
curl -X POST http://localhost:3001/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@avatar.jpg" \
  -F "type=avatar"
```

### Test Upload Post

```bash
curl -X POST http://localhost:3001/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "type=post" \
  -F "category=van-hoa"
```

### Test Get File

```bash
curl http://localhost:3001/storage/avatar/user-123/avatar_1730901234.jpg
```

---

## 🔗 Tích Hợp với Web Chính

### Frontend (React)

```javascript
// Upload avatar
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'avatar');

const response = await axios.post('http://localhost:3001/upload', formData, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'multipart/form-data',
  },
});

const imageUrl = response.data.url;
// → http://localhost:3001/storage/avatar/user-123/avatar_123.jpg
```

```jsx
// Hiển thị ảnh
<img src={imageUrl} alt="Avatar" />
```

### Backend (NestJS)

```typescript
// Lưu URL vào database
async uploadAvatar(userId: number, file: File) {
  // 1. Upload lên Media Service
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'avatar');
  
  const response = await axios.post('http://localhost:3001/upload', formData, {
    headers: {
      'Authorization': `Bearer ${await this.getAccessToken()}`,
    },
  });
  
  // 2. Lưu URL vào database
  const avatarUrl = response.data.url;
  await this.userRepo.update(userId, { avatar: avatarUrl });
  
  return { avatarUrl };
}
```

---

## 📊 Workflow Hoàn Chỉnh

```
┌─────────┐                ┌─────────────┐              ┌────────────────┐
│ Frontend│                │ Web Backend │              │ Media Service  │
└────┬────┘                └──────┬──────┘              └───────┬────────┘
     │                            │                             │
     │ 1. Login                   │                             │
     ├───────────────────────────>│                             │
     │                            │                             │
     │ 2. accessToken             │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │ 3. Upload file             │                             │
     ├────────────────────────────┼────────────────────────────>│
     │    (with accessToken)      │                             │
     │                            │                             │
     │                            │     4. Decode token         │
     │                            │        (get userId)         │
     │                            │                             │
     │                            │     5. Save to disk         │
     │                            │        storage/category/    │
     │                            │        userId/filename      │
     │                            │                             │
     │ 6. Return URL              │                             │
     │<────────────────────────────────────────────────────────┤
     │                            │                             │
     │ 7. Save URL to DB (optional)                            │
     ├───────────────────────────>│                             │
     │                            │                             │
     │ 8. Display image           │                             │
     │    <img src="http://...">  │                             │
     │────────────────────────────┼────────────────────────────>│
     │                            │                     (Static serve)
```

---

## 📂 Project Structure

```
media-service/
├── src/
│   ├── main.ts                 ← Entry point
│   ├── app.module.ts           ← Root module
│   ├── media.controller.ts     ← Upload endpoint
│   ├── media.service.ts        ← Business logic
│   └── storage.service.ts      ← File system operations
├── storage/                    ← Kho ảnh thật
│   ├── avatar/
│   ├── van-hoa/
│   ├── du-lich/
│   ├── thien-nhien/
│   └── kien-truc/
├── package.json
└── README.md
```

---

## 🛡️ Security Notes

1. **Token không verify** → Chỉ dùng trong internal network
2. **No rate limiting** → Cần thêm nếu deploy production
3. **File validation** → Chỉ check extension (có thể fake)
4. **Folder traversal** → Đã sanitize filename

**Khuyến nghị Production:**
- Dùng S3/Cloudinary thay vì local storage
- Thêm virus scanning
- Rate limiting
- CDN caching
- Image optimization (resize, compress)

---

## 🚢 Deployment

### Development

```bash
npm run start:dev
```

### Production

```bash
# Build
npm run build

# Run
npm run start:prod
```

### Docker (TODO)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/main"]
EXPOSE 3001
```

---

## 📝 Environment Variables

```env
# .env (optional - có defaults)
MEDIA_SERVICE_URL=http://localhost:3001
PORT=3001
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module"
```bash
npm install
```

### Lỗi: "CORS blocked"
→ Kiểm tra `main.ts` đã enable CORS cho origin của web chính

### Lỗi: "Folder permission denied"
```bash
chmod -R 755 storage/
```

### File không hiển thị
→ Kiểm tra `app.use('/storage', express.static(...))` trong `main.ts`

---

## 📞 Support

- Email: support@danang-historical.com
- Issue: [GitHub Issues](https://github.com/your-repo/media-service/issues)

---

**Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**License:** MIT
