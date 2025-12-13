# 📍 Hướng dẫn: Admin Quản lý Địa điểm - Chọn ảnh từ Thư viện

## 🎯 Tổng quan

Thay đổi cách admin quản lý địa điểm làm việc với ảnh:

### ❌ TRƯỚC (Cũ):
- Admin quản lý địa điểm có thể **upload ảnh**
- Tự upload file từ máy tính

### ✅ SAU (Mới):
- Admin quản lý địa điểm **KHÔNG upload ảnh**
- Chỉ **chọn ảnh có sẵn** từ thư viện (Images table)
- Ảnh được admin thư viện ảnh upload trước
- Admin quản lý địa điểm chỉ việc **gắn vị trí/địa điểm** vào ảnh

### 🔄 Quy trình mới:

```
Admin Thư viện Ảnh (Gallery Admin)
    ↓
  Upload ảnh vào Images table
    ↓
Admin Quản lý Địa điểm (Location Admin)
    ↓
  Chọn ảnh từ thư viện
    ↓
  Gắn Location vào ảnh đã chọn
    ↓
  Ảnh được hiển thị trên bản đồ với vị trí
```

---

## 🛠️ Các thay đổi kỹ thuật

### 1. Backend - API mới

#### ✅ GET `/location-images/available-images`
Lấy danh sách ảnh có thể gắn location từ Images table

**Query Parameters:**
- `category` (optional): Lọc theo category (van-hoa, di-san, thien-nhien...)
- `page` (optional): Trang hiện tại (default: 1)
- `limit` (optional): Số ảnh mỗi trang (default: 50)

**Response:**
```json
{
  "images": [
    {
      "ImageID": 123,
      "FilePath": "http://localhost:3000/storage/van-hoa/admin/image.jpg",
      "AltText": "Cầu Rồng",
      "Type": "post",
      "CategoryID": 1,
      "category": {
        "CategoryID": 1,
        "Name": "Văn hóa",
        "Slug": "van-hoa"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
```

#### ✅ POST `/location-images/assign`
Gắn location vào ảnh có sẵn (không upload)

**Body:**
```json
{
  "imageId": 123,
  "locationId": 45,
  "userId": 1,
  "year": 2024
}
```

**Response:**
```json
{
  "SubmissionID": 789,
  "LocationID": 45,
  "Year": 2024,
  "Status": "pending",
  "ImagePath": "http://localhost:3000/storage/van-hoa/admin/image.jpg",
  "message": "Ảnh đã được gửi, vui lòng chờ quản trị viên duyệt."
}
```

---

### 2. Frontend - Thay đổi UI

#### File mới: `ImageSelectionModal.jsx`
Modal chọn ảnh từ thư viện với:
- Hiển thị grid ảnh đẹp mắt
- Lọc theo category
- Phân trang
- Preview ảnh khi hover

#### File cập nhật: `MapAdmin.jsx`

**State thay đổi:**
```javascript
// CŨ
{
  image: null,           // File object
  imagePreview: "",      // URL preview
  oldImage: null,        // File object
  oldImagePreview: "",   // URL preview
}

// MỚI
{
  selectedImage: null,      // Image object từ DB
  selectedOldImage: null,   // Image object từ DB
}
```

**UI thay đổi:**
- ❌ Xóa: Input file upload
- ✅ Thêm: Button "Chọn ảnh" mở modal
- ✅ Thêm: Preview ảnh đã chọn với nút xóa

**Flow submit mới:**
1. Tạo location
2. Gọi API `/location-images/assign` cho ảnh hiện đại (nếu có)
3. Gọi API `/location-images/assign` cho ảnh xưa (nếu có)

---

## 📋 Chức năng GIỮ LẠI

### ✅ Tab "🖼️ Duyệt Ảnh" vẫn hoạt động

Tab này dành cho **duyệt ảnh bình luận** của user, không phải ảnh địa điểm:
- User đăng ảnh trong bình luận
- Admin quản lý địa điểm duyệt ảnh bình luận
- Không liên quan đến ảnh địa điểm

File: `PhotoModeration.jsx`
- Component: `LocationManagement.jsx` - Tab "Duyệt Ảnh"
- API: `/location-images/pending` và `/location-images/:id/status`

---

## 🎨 Giao diện mới

### MapAdmin - Form chọn ảnh

```
┌──────────────────────────────────┐
│ 🖼️ Ảnh hiện đại (từ thư viện)   │
│                                  │
│  ┌────────┐                      │
│  │ [Img]  │  Cầu Rồng            │
│  │        │  [✖ Xóa]             │
│  └────────┘                      │
│                                  │
│  Năm ảnh: [2024]                 │
└──────────────────────────────────┘
```

### ImageSelectionModal

```
┌────────────────────────────────────────────┐
│  🖼️ Chọn ảnh từ thư viện                 │
│  Chọn ảnh có sẵn để gắn vào địa điểm       │
│  ────────────────────────────────────────  │
│  [Tất cả] [Văn hóa] [Di sản] [Thiên nhiên] │
│  ────────────────────────────────────────  │
│                                            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│  │ Img │ │ Img │ │ Img │ │ Img │         │
│  │     │ │     │ │     │ │     │         │
│  └─────┘ └─────┘ └─────┘ └─────┘         │
│                                            │
│  [← Trước]  Trang 1/3  [Sau →]            │
└────────────────────────────────────────────┘
```

---

## 🚀 Cách sử dụng

### Cho Admin Quản lý Địa điểm:

1. **Đăng nhập** với tài khoản admin/moderator
2. Vào **Quản lý Địa điểm**
3. Điền thông tin địa điểm (tên, địa chỉ, tọa độ)
4. **Chọn ảnh hiện đại:**
   - Click button "Chọn ảnh"
   - Chọn category (nếu cần)
   - Click vào ảnh muốn sử dụng
   - Điền năm ảnh (optional)
5. **Chọn ảnh xưa:** (tương tự)
6. Click **"Thêm địa điểm"**

### Lưu ý quan trọng:

⚠️ **Admin quản lý địa điểm KHÔNG THỂ upload ảnh mới**
- Phải sử dụng ảnh có sẵn trong thư viện
- Nếu không có ảnh phù hợp → Liên hệ Admin Thư viện Ảnh để upload

✅ **Admin quản lý địa điểm VẪN CÓ THỂ:**
- Duyệt ảnh bình luận (tab "Duyệt Ảnh")
- Quản lý địa điểm trên bản đồ
- Gắn ảnh có sẵn vào địa điểm

---

## 🔧 File đã thay đổi

### Backend:
1. ✅ `BackEnd/src/modules/location-images/location-images.controller.ts`
   - Thêm API `GET /available-images`
   - Thêm API `POST /assign`

2. ✅ `BackEnd/src/common/images.service.ts`
   - Thêm method `getAvailableImagesForLocation()`

### Frontend:
1. ✅ `FrontEnd/src/pages/admin/ImageSelectionModal.jsx` (MỚI)
   - Modal chọn ảnh từ thư viện

2. ✅ `FrontEnd/src/pages/map/MapAdmin.jsx`
   - Xóa upload file
   - Thêm chọn ảnh từ modal
   - Cập nhật logic submit

3. ✅ `FrontEnd/src/pages/admin/LocationManagement.jsx` (KHÔNG ĐỔI)
   - Tab "Duyệt Ảnh" vẫn hoạt động bình thường

---

## ✅ Checklist kiểm tra

- [x] API GET `/location-images/available-images` hoạt động
- [x] API POST `/location-images/assign` hoạt động
- [x] Modal chọn ảnh hiển thị đúng
- [x] Lọc theo category hoạt động
- [x] Phân trang hoạt động
- [x] Gắn ảnh vào location thành công
- [x] Tab "Duyệt Ảnh" vẫn hoạt động
- [ ] Test tích hợp với backend đang chạy
- [ ] Test với user có quyền Moderator

---

## 🐛 Troubleshooting

### Lỗi: "Không có ảnh nào"
**Nguyên nhân:** Chưa có ảnh trong Images table
**Giải pháp:** Admin thư viện ảnh cần upload ảnh trước

### Lỗi: "Không thể gắn ảnh"
**Nguyên nhân:** 
- LocationID không tồn tại
- ImageID không tồn tại
**Giải pháp:** Kiểm tra database và đảm bảo location đã được tạo

### Lỗi CORS khi load ảnh
**Nguyên nhân:** Media service chưa config CORS
**Giải pháp:** Thêm CORS header cho media service

---

## 📞 Liên hệ

Nếu có vấn đề, báo lỗi tại issue tracker hoặc liên hệ team dev.

---

**Cập nhật:** 12/12/2024  
**Version:** 1.0  
**Tác giả:** GitHub Copilot
