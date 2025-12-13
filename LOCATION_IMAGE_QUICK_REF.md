# 📍 Location Image Assignment - Quick Reference

## 🎯 Thay đổi chính

Admin quản lý địa điểm **KHÔNG UPLOAD ảnh** nữa, mà **CHỌN ảnh có sẵn** từ thư viện.

## 🔄 Quy trình mới

```
1. Admin Thư viện → Upload ảnh vào Images table
2. Admin Địa điểm → Chọn ảnh từ thư viện
3. Admin Địa điểm → Gắn location vào ảnh
```

## 📡 API mới

### GET `/location-images/available-images`
Lấy danh sách ảnh để chọn

**Query:** `?category=van-hoa&page=1&limit=50`

### POST `/location-images/assign`
Gắn location vào ảnh

**Body:**
```json
{
  "imageId": 123,
  "locationId": 45,
  "year": 2024
}
```

## 🎨 UI Changes

### MapAdmin.jsx
- ❌ Xóa: File upload input
- ✅ Thêm: Button "Chọn ảnh từ thư viện"
- ✅ Thêm: ImageSelectionModal

### ImageSelectionModal.jsx (Mới)
- Grid ảnh với preview
- Lọc theo category
- Phân trang

## ✅ Giữ nguyên

- Tab "🖼️ Duyệt Ảnh" (cho ảnh bình luận)
- Tất cả chức năng quản lý địa điểm khác

## 📂 Files thay đổi

**Backend:**
- `location-images.controller.ts` - 2 API mới
- `images.service.ts` - Method mới

**Frontend:**
- `ImageSelectionModal.jsx` - Mới
- `MapAdmin.jsx` - Cập nhật logic

---

Chi tiết đầy đủ: [LOCATION_IMAGE_ASSIGNMENT_GUIDE.md](./LOCATION_IMAGE_ASSIGNMENT_GUIDE.md)
