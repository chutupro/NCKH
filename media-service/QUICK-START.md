# ⚡ QUICK START - Test Media Service Ngay Trong 30 Giây

## 🚀 Bước 1: Start Service (Nếu Chưa Chạy)

```powershell
cd media-service
npm run start:dev
```

**Đợi thấy:**
```
🚀 Media Service running on: http://localhost:3001
```

---

## 🧪 Bước 2: Test Ngay

### ⭐ CÁCH DỄ NHẤT - Dùng HTML

```powershell
# Từ thư mục media-service
start test-upload.html
```

Trong browser:
1. ✅ Kiểm tra status: "✅ Media Service đang online"
2. 📁 Chọn file ảnh (jpg/png)
3. 📂 Chọn Type: "Avatar"
4. 📤 Nhấn "Upload"

**Kết quả ngay lập tức:**
- URL: `http://localhost:3001/storage/avatar/user-123/your-image_xxxxx.jpg`
- Preview ảnh ngay trên trang
- Click "🔗 Mở trong tab mới" để xem ảnh

---

## ✅ Bước 3: Kiểm Tra File Đã Lưu

```powershell
# Mở folder chứa file
explorer media-service\storage\avatar\user-123
```

**Bạn sẽ thấy:** File ảnh với tên `your-image_timestamp.jpg`

---

## 🎉 DONE! Media Service Hoạt Động!

### Tiếp Theo Làm Gì?

#### 1. Test Thêm Các Category
- Upload với Type = "Post"
- Category = "van-hoa" (Văn Hóa)
- Category = "du-lich" (Du Lịch)
- Category = "thien-nhien" (Thiên Nhiên)
- Category = "kien-truc" (Kiến Trúc)

#### 2. Test Upload Video
- Chọn file .mp4 hoặc .mov
- Upload như bình thường
- Preview video ngay trên trang

#### 3. Test Với Token Khác
Sửa token trong `test-upload.html` (dòng 260):
```javascript
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQ1NiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxOTMwOTAwMDAwfQ.xxx';
```
→ File sẽ lưu vào folder `user-456`

#### 4. Tích Hợp Vào Main App
Xem hướng dẫn trong `SETUP.md`

---

## 🐛 Nếu Gặp Lỗi

### ❌ Service không online
```powershell
# Start lại service
cd media-service
npm run start:dev
```

### ❌ File upload nhưng không hiển thị
```powershell
# Kiểm tra URL trả về
# Phải là: http://localhost:3001/storage/...
# Mở trực tiếp URL đó trong browser
```

### ❌ CORS error
```powershell
# Sửa main.ts, thêm origin của frontend
# Restart service
```

---

## 📚 Tài Liệu Đầy Đủ

- `HOW-TO-TEST.md` - 5 cách test khác nhau
- `TEST-GUIDE.md` - Hướng dẫn chi tiết từng bước
- `README.md` - API documentation
- `SETUP.md` - Integration guide

---

**Thời gian:** 30 giây ⏱️  
**Khó:** ⭐ (Rất dễ)  
**Hiệu quả:** 100% ✅  

**LET'S GO!** 🚀
