# 🧪 HƯỚNG DẪN TEST MEDIA SERVICE

## ✅ Kiểm tra Service đang chạy

Service phải chạy trên http://localhost:3001

Console phải hiện:
```
🚀 Media Service running on: http://localhost:3001
📁 Storage path: E:\NCKH\duan\NCKH\media-service\storage
```

Nếu chưa chạy:
```bash
cd media-service
npm run start:dev
```

---

## 🧪 TEST 1: Health Check (Kiểm tra service sống chưa)

### Dùng Browser:
Mở browser, vào: http://localhost:3001/health (sẽ fail vì là POST)

### Dùng PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method POST
```

**Kết quả mong đợi:**
```
StatusCode        : 200
```

---

## 🧪 TEST 2: Upload Avatar (Dùng Thunder Client/Postman)

### Bước 1: Mở Thunder Client trong VS Code
- Nhấn `Ctrl+Shift+P`
- Gõ "Thunder Client"
- Chọn "Thunder Client: New Request"

### Bước 2: Config Request

**Method:** POST

**URL:** http://localhost:3001/upload

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx
```

**Body → Form:**
- Chọn tab "Form"
- Add field:
  - Name: `file`
  - Type: File
  - Value: [Chọn 1 file ảnh .jpg/.png từ máy bạn]
- Add field:
  - Name: `type`
  - Type: Text
  - Value: `avatar`

### Bước 3: Send Request

**Kết quả mong đợi:**
```json
{
  "url": "http://localhost:3001/storage/avatar/user-123/my-image_1730901234.jpg",
  "type": "avatar",
  "category": null,
  "filename": "my-image_1730901234.jpg",
  "size": 245678
}
```

### Bước 4: Kiểm tra file đã lưu

```powershell
# Mở folder storage
explorer media-service\storage\avatar\user-123

# Phải thấy file: my-image_1730901234.jpg
```

### Bước 5: Xem ảnh trong browser

Copy URL từ response, paste vào browser:
```
http://localhost:3001/storage/avatar/user-123/my-image_1730901234.jpg
```

→ Browser phải hiển thị ảnh ✅

---

## 🧪 TEST 3: Upload Post (Van Hoa)

**Method:** POST

**URL:** http://localhost:3001/upload

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx
```

**Body → Form:**
- `file`: [Chọn file ảnh]
- `type`: `post`
- `category`: `van-hoa`

**Kết quả:**
```json
{
  "url": "http://localhost:3001/storage/van-hoa/user-123/hoi-an_1730901234.jpg",
  "type": "post",
  "category": "van-hoa",
  "filename": "hoi-an_1730901234.jpg",
  "size": 512345
}
```

**Kiểm tra:**
```powershell
explorer media-service\storage\van-hoa\user-123
```

---

## 🧪 TEST 4: Validation (Test lỗi)

### Test 1: Thiếu file
```
Body: (không có file)
type: avatar
```
**Kết quả:** 400 Bad Request - "File không được để trống"

### Test 2: Thiếu type
```
file: [ảnh]
(không có type)
```
**Kết quả:** 400 Bad Request - "Type không được để trống"

### Test 3: Thiếu token
```
Headers: (không có Authorization)
Body: file + type
```
**Kết quả:** 400 Bad Request - "Thiếu Authorization header"

### Test 4: Type = post nhưng thiếu category
```
file: [ảnh]
type: post
(không có category)
```
**Kết quả:** 400 Bad Request - "Category bắt buộc khi type = post"

### Test 5: Category không hợp lệ
```
file: [ảnh]
type: post
category: abc
```
**Kết quả:** 400 Bad Request - "Category không hợp lệ. Phải là: van-hoa, du-lich, thien-nhien, kien-truc"

### Test 6: File không hợp lệ
```
file: document.pdf
type: avatar
```
**Kết quả:** 400 Bad Request - "Chỉ cho phép file: .jpg, .jpeg, .png, .mp4, .mov"

---

## 🧪 TEST 5: Upload Video

**Method:** POST
**URL:** http://localhost:3001/upload

**Body:**
- `file`: video.mp4 (phải < 50MB)
- `type`: post
- `category`: du-lich

**Kết quả:**
```json
{
  "url": "http://localhost:3001/storage/du-lich/user-123/my-video_1730901234.mp4",
  "type": "post",
  "category": "du-lich"
}
```

---

## 🧪 TEST 6: Kiểm tra Token (userId khác nhau)

### Token 1 (user-123):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx
```
→ File lưu vào: `storage/avatar/user-123/`

### Token 2 (user-456):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQ1NiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx
```
→ File lưu vào: `storage/avatar/user-456/`

Upload với 2 token khác nhau → Phải thấy 2 folder khác nhau

---

## 📊 Checklist Hoàn Chỉnh

### Service Running:
- [x] Service chạy trên port 3001
- [x] Console hiển thị đúng message
- [x] Storage folders được tạo (avatar, van-hoa, du-lich, thien-nhien, kien-truc)

### Upload Avatar:
- [x] Upload thành công
- [x] File lưu vào `storage/avatar/[userId]/`
- [x] Response trả về URL đúng
- [x] Browser mở URL hiển thị ảnh

### Upload Post:
- [x] Upload với category van-hoa
- [x] Upload với category du-lich
- [x] Upload với category thien-nhien
- [x] Upload với category kien-truc
- [x] File lưu vào `storage/[category]/[userId]/`

### Upload Video:
- [x] Upload .mp4 thành công
- [x] Upload .mov thành công
- [x] File < 50MB
- [x] Browser play được video

### Validation:
- [x] Lỗi khi thiếu file
- [x] Lỗi khi thiếu type
- [x] Lỗi khi thiếu token
- [x] Lỗi khi type=post nhưng thiếu category
- [x] Lỗi khi category không hợp lệ
- [x] Lỗi khi file không đúng định dạng
- [x] Lỗi khi file > 50MB

### Token:
- [x] Token khác nhau → folder khác nhau
- [x] Token không có sub → lỗi
- [x] Token invalid → lỗi

---

## 🐛 Nếu Gặp Lỗi

### Lỗi: "Cannot POST /upload"
→ Service chưa chạy hoặc chạy sai port
```bash
cd media-service
npm run start:dev
```

### Lỗi: "CORS blocked"
→ Frontend chạy port không được phép
→ Thêm origin vào `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:YOUR_PORT'],
  ...
});
```

### Lỗi: "ENOENT: no such file or directory"
→ Storage folder chưa được tạo
→ Restart service (service tự tạo folder khi start)

### File upload nhưng không hiển thị
→ Kiểm tra static serve trong `main.ts`:
```typescript
app.use('/storage', express.static(path.join(__dirname, '..', 'storage')));
```

---

## ✅ Test Thành Công Khi:

1. ✅ Upload avatar → File lưu vào `storage/avatar/user-123/`
2. ✅ Upload post → File lưu vào `storage/[category]/user-123/`
3. ✅ URL trả về mở được trong browser
4. ✅ Validation errors đúng khi gửi sai data
5. ✅ Token khác nhau → folder khác nhau

---

**Media Service hoạt động hoàn hảo! 🎉**
