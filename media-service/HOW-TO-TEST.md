# 🧪 CÁC CÁCH TEST MEDIA SERVICE

Media Service đang chạy trên: **http://localhost:3001**

## ✅ Kiểm Tra Nhanh

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method POST

# Kết quả: StatusCode 200
```

---

## 🎯 CÁCH 1: Test Bằng HTML (Dễ nhất)

### Bước 1: Mở file HTML
```powershell
# Từ thư mục media-service
start test-upload.html
```

### Bước 2: Upload
1. Chọn file ảnh/video
2. Chọn Type (avatar hoặc post)
3. Nếu chọn post → Chọn Category
4. Nhấn "📤 Upload"

### Bước 3: Xem kết quả
- ✅ Hiển thị URL
- ✅ Preview ảnh/video ngay trên trang
- ✅ Copy URL bằng 1 click

**Ưu điểm:**
- ✅ Không cần cài thêm gì
- ✅ Có preview
- ✅ Có validation
- ✅ Dễ dùng nhất

---

## 🎯 CÁCH 2: Test Bằng PowerShell Script

### Bước 1: Chuẩn bị file ảnh
```powershell
# Ví dụ: Có file avatar.jpg trong Downloads
```

### Bước 2: Chạy script
```powershell
# Upload avatar
.\test-upload.ps1 -ImagePath "C:\Users\YourName\Downloads\avatar.jpg" -Type "avatar"

# Upload post (văn hóa)
.\test-upload.ps1 -ImagePath "C:\path\to\image.jpg" -Type "post" -Category "van-hoa"

# Upload post (du lịch)
.\test-upload.ps1 -ImagePath "C:\path\to\image.jpg" -Type "post" -Category "du-lich"
```

### Bước 3: Xem kết quả
- Script tự hỏi bạn có muốn mở browser xem ảnh không
- Script tự hỏi bạn có muốn mở folder chứa file không

**Ưu điểm:**
- ✅ Nhanh, gọn
- ✅ Tự động mở browser/folder
- ✅ Validation ngay từ đầu

**Yêu cầu:**
- PowerShell 7+ (pwsh)
- Nếu chưa có: `winget install Microsoft.PowerShell`

---

## 🎯 CÁCH 3: Test Bằng Thunder Client (VS Code)

### Bước 1: Mở Thunder Client
- Nhấn `Ctrl+Shift+P`
- Gõ: "Thunder Client"
- Chọn "New Request"

### Bước 2: Config Request

**Method:** POST

**URL:** http://localhost:3001/upload

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx
```

**Body:**
- Tab: "Form"
- Add fields:
  - `file`: [Chọn file ảnh]
  - `type`: avatar
  - `category`: (nếu type=post) van-hoa

### Bước 3: Send

**Response:**
```json
{
  "url": "http://localhost:3001/storage/avatar/user-123/my-image_1730901234.jpg",
  "filename": "my-image_1730901234.jpg",
  "size": 245678
}
```

**Ưu điểm:**
- ✅ Trong VS Code, không cần chuyển app
- ✅ Lưu request để test lại
- ✅ Xem response JSON đẹp

---

## 🎯 CÁCH 4: Test Bằng Postman

### Bước 1: Import Collection
```powershell
# Mở Postman
# File → Import → media-service/Media-Service.postman_collection.json
```

### Bước 2: Test theo thứ tự
1. **Health Check** → Xem service sống chưa
2. **Upload Avatar** → Upload ảnh đại diện
3. **Upload Post (Van Hoa)** → Upload bài viết văn hóa
4. **Upload Post (Du Lich)** → Upload bài viết du lịch

### Bước 3: Xem kết quả
- Response có URL
- Mở URL trong browser
- Check folder `storage/[type]/user-123/`

**Ưu điểm:**
- ✅ Có sẵn 4 request mẫu
- ✅ Dễ chỉnh sửa
- ✅ Environment variables

---

## 🎯 CÁCH 5: Test Bằng cURL (PowerShell)

### Upload Avatar
```powershell
curl.exe -X POST `
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx" `
  -F "file=@C:\path\to\avatar.jpg" `
  -F "type=avatar" `
  http://localhost:3001/upload
```

### Upload Post
```powershell
curl.exe -X POST `
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx" `
  -F "file=@C:\path\to\image.jpg" `
  -F "type=post" `
  -F "category=van-hoa" `
  http://localhost:3001/upload
```

**Ưu điểm:**
- ✅ Nhanh nhất
- ✅ Script được
- ✅ Có sẵn trong Windows

**Lưu ý:**
- Dùng `curl.exe` (không phải PowerShell alias)
- Đường dẫn file phải tồn tại

---

## 📊 So Sánh Các Cách Test

| Cách | Dễ | Nhanh | Preview | Lưu Request |
|------|-----|-------|---------|-------------|
| **HTML** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ❌ |
| **PowerShell Script** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ❌ |
| **Thunder Client** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | ✅ |
| **Postman** | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | ✅ |
| **cURL** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ❌ |

---

## 🎯 Khuyến Nghị

### Test lần đầu → Dùng HTML
```powershell
start test-upload.html
```
**Lý do:** Dễ nhất, có preview, validation sẵn

### Test nhiều lần → Dùng PowerShell Script
```powershell
.\test-upload.ps1 -ImagePath "path/to/file.jpg" -Type "avatar"
```
**Lý do:** Nhanh, tự động mở browser/folder

### Debug API → Dùng Thunder Client/Postman
**Lý do:** Xem raw request/response, lưu request

### Script automation → Dùng cURL
**Lý do:** Gọn, script được

---

## ✅ Checklist Test

### Chức Năng Cơ Bản
- [ ] Upload avatar thành công
- [ ] Upload post (van-hoa) thành công
- [ ] Upload post (du-lich) thành công
- [ ] Upload post (thien-nhien) thành công
- [ ] Upload post (kien-truc) thành công
- [ ] File lưu đúng folder `storage/[type]/[userId]/`
- [ ] URL trả về mở được trong browser
- [ ] Ảnh hiển thị đúng
- [ ] Video play được

### Validation
- [ ] Lỗi khi thiếu file
- [ ] Lỗi khi thiếu type
- [ ] Lỗi khi type=post nhưng thiếu category
- [ ] Lỗi khi category không hợp lệ
- [ ] Lỗi khi file không đúng định dạng (.pdf → lỗi)
- [ ] Lỗi khi file > 50MB

### Security
- [ ] Lỗi khi thiếu Authorization header
- [ ] Token khác nhau → folder khác nhau

---

## 🐛 Troubleshooting

### Lỗi: Cannot POST /upload
```powershell
# Service chưa chạy → Start lại
cd media-service
npm run start:dev
```

### Lỗi: CORS blocked
```powershell
# Check origin trong main.ts
# Phải có: http://localhost:5173 (hoặc port frontend của bạn)
```

### File upload nhưng không hiển thị
```powershell
# Check static serve
# Mở: http://localhost:3001/storage/avatar/user-123/filename.jpg
```

### PowerShell script không chạy
```powershell
# Cài PowerShell 7+
winget install Microsoft.PowerShell

# Hoặc dùng pwsh
pwsh .\test-upload.ps1 -ImagePath "path/to/file.jpg"
```

---

## 📚 Xem Thêm

- `TEST-GUIDE.md` - Hướng dẫn chi tiết từng bước
- `README.md` - API documentation
- `SETUP.md` - Integration guide
- `Media-Service.postman_collection.json` - Postman collection

---

**Bắt đầu test ngay:** `start test-upload.html` 🚀
