# Quản lý Marker trên Map - Hướng dẫn sử dụng

## 🎯 Tính năng mới

Đã thêm trang **Quản lý Marker trên Map** để xem và xóa các địa điểm đã đăng.

---

## 📍 Cách sử dụng

### 1. Truy cập trang

1. Đăng nhập với tài khoản Admin
2. Vào **Admin Panel** 
3. Chọn **📍 Quản lý Marker** trong sidebar

Hoặc truy cập trực tiếp: `http://localhost:5173/admin/map-markers`

---

### 2. Xem danh sách Marker

Trang hiển thị tất cả địa điểm đã đăng với:
- ✅ Ảnh hiện đại + Ảnh xưa
- ✅ Tên địa điểm
- ✅ Địa chỉ đầy đủ
- ✅ Danh mục (Văn hóa, Thiên nhiên...)
- ✅ Tọa độ GPS
- ✅ Mô tả ngắn

---

### 3. Tìm kiếm & Lọc

**Tìm kiếm:**
- Gõ tên địa điểm hoặc địa chỉ vào ô tìm kiếm
- Kết quả hiển thị tự động

**Lọc theo danh mục:**
- Chọn danh mục từ dropdown (Văn hóa, Thiên nhiên, Di sản...)
- Hiển thị chỉ các marker thuộc danh mục đó

---

### 4. Xem chi tiết Marker

1. Click nút **👁️ Chi tiết** trên card marker
2. Popup hiển thị:
   - Ảnh hiện đại & ảnh xưa (size lớn)
   - Thông tin đầy đủ
   - Mô tả chi tiết
   - Link xem trên Google Maps

---

### 5. Xóa Marker

**Cách 1: Xóa từ card**
1. Click nút **🗑️ Xóa** trên card marker
2. Xác nhận xóa
3. Marker bị xóa khỏi map

**Cách 2: Xóa từ popup chi tiết**
1. Mở chi tiết marker
2. Click **🗑️ Xóa Marker này**
3. Xác nhận xóa

**⚠️ Lưu ý quan trọng:**
- Xóa marker **CHỈ xóa địa điểm trên map**
- **KHÔNG xóa ảnh** khỏi thư viện
- Ảnh vẫn có thể dùng cho địa điểm khác

---

## 🔄 Luồng hoạt động

```
1. Admin đăng ảnh vào Thư viện → Ảnh có trong Gallery
2. Admin gắn địa điểm vào ảnh → Tạo Marker trên Map
3. Admin xem marker → Trang "Quản lý Marker"
4. Admin xóa marker → Marker mất, ảnh vẫn còn
```

---

## 📊 Thống kê

Trang hiển thị:
- **Tổng:** Tổng số marker đã đăng
- **Hiển thị:** Số marker sau khi lọc/tìm kiếm

---

## 🎨 Giao diện

- **Layout grid:** Hiển thị nhiều marker cùng lúc
- **Card đẹp:** Ảnh 2 cột (hiện đại + xưa)
- **Hover effect:** Card nổi lên khi di chuột
- **Responsive:** Hoạt động tốt trên mobile

---

## ✅ Checklist tính năng

- ✅ Xem danh sách marker
- ✅ Tìm kiếm marker
- ✅ Lọc theo danh mục
- ✅ Xem chi tiết
- ✅ Xóa marker
- ✅ Link Google Maps
- ✅ Hiển thị 2 ảnh (hiện đại + xưa)
- ✅ Hiển thị năm ảnh
- ✅ Responsive design

---

## 🚀 Bước tiếp theo (nếu muốn)

**Có thể thêm:**
- 📝 Sửa thông tin marker (edit)
- 🗺️ Hiển thị marker trên mini map
- 📊 Thống kê theo danh mục
- 📥 Export danh sách marker
- 🔍 Filter nâng cao (theo năm, rating...)

---

## 🐛 Troubleshooting

**Không thấy marker nào:**
- Kiểm tra đã tạo marker chưa (trang "Quản lý Địa điểm")
- Kiểm tra filter có bật không

**Xóa không được:**
- Kiểm tra kết nối backend
- Xem console log lỗi
- Kiểm tra quyền admin

**Ảnh không hiển thị:**
- Kiểm tra media-service đang chạy (port 3001)
- Kiểm tra đường dẫn ảnh

---

## 📞 Liên hệ

Nếu có lỗi hoặc cần thêm tính năng, báo tôi nhé! 😊
