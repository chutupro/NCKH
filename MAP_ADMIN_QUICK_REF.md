# 📍 MAP ADMIN MỚI - Quick Reference

## 🎯 Thay đổi cốt lõi

**TRƯỚC:** Admin quản lý địa điểm tự thêm địa điểm + upload ảnh  
**SAU:** Admin quản lý địa điểm CHỌN ảnh từ thư viện → GẮN địa điểm vào ảnh

---

## 🔄 Quy trình 4 bước

```
1. Admin Thư viện → Upload ảnh vào Images table
2. Admin Địa điểm → XEM danh sách ảnh
3. Admin Địa điểm → CHỌN ảnh
4. Admin Địa điểm → GẮN thông tin địa điểm (tọa độ, tên, địa chỉ)
```

---

## 🎨 Giao diện

### Layout 2 cột

**Bên trái:** Danh sách ảnh từ thư viện
- Filter theo category
- Grid 2 cột
- Pagination
- Ảnh được chọn có border xanh + ✓

**Bên phải:** Form + Map
- Preview ảnh đã chọn
- Form điền thông tin địa điểm
- Bản đồ interactive
- Nút "📍 Gắn Địa điểm vào Ảnh"

---

## 🔧 Files

### Mới:
- `FrontEnd/src/pages/map/MapAdminNew.jsx`

### Cập nhật:
- `FrontEnd/src/pages/admin/LocationManagement.jsx`
  - Import MapAdminNew thay vì MapAdmin

### Không đổi:
- Backend API (đã có sẵn)
- PhotoModeration.jsx (tab "Duyệt Ảnh")

---

## ⚠️ Lưu ý

- ❌ Admin địa điểm KHÔNG thể upload ảnh
- ✅ Admin địa điểm CHỈ chọn ảnh có sẵn
- ✅ Nếu không có ảnh → Liên hệ Admin Thư viện Ảnh

---

## 🧪 Test nhanh

1. Vào "Quản lý Địa điểm"
2. Chọn 1 ảnh bên trái
3. Điền thông tin địa điểm
4. Click map để chọn tọa độ
5. Submit → Kiểm tra location mới trên map

---

Chi tiết: [MAP_ADMIN_NEW_DESIGN.md](./MAP_ADMIN_NEW_DESIGN.md)
