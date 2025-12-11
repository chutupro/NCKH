# ✅ ĐÃ FIX: Hiển thị tên Collection và Tiêu đề ảnh

## 🐛 Vấn đề
Khi upload ảnh với collection và tiêu đề, trong tab "Ảnh chờ duyệt" hiển thị sai:
- Hiển thị "🌳 Thiên nhiên" thay vì tên collection "ma1"
- Hiển thị "Chưa có tiêu đề" thay vì tiêu đề "ma2"

## ✅ Đã sửa

### 1. Backend - Upload Controller (`BackEnd/src/modules/upload/upload.controller.ts`)
- ✅ Thêm xử lý `collectionId` từ form
- ✅ Lưu `title` vào `AltText` của ảnh

### 2. Backend - Gallery Controller (`BackEnd/src/gallerys/gallery.controller.ts`)
- ✅ Xóa duplicate create (tránh tạo 2 bản ghi trùng nhau)
- ✅ Thêm log debug để kiểm tra

### 3. Backend - Gallery Service (`BackEnd/src/gallerys/gallery.service.ts`)
- ✅ Thêm log debug để kiểm tra CollectionID được lưu đúng

### 4. Frontend - TimelineManagement (`FrontEnd/src/pages/admin/TimelineManagement.jsx`)
- ✅ Sửa hiển thị: Ưu tiên `collection.Title/Name` trước khi fallback về category
- ✅ Thêm fallback `image.Title` nếu `AltText` null
- ✅ Thêm console.log debug chi tiết

## 🧪 Cách test

### Bước 1: Restart Backend
```powershell
cd BackEnd
npm run start:dev
```

### Bước 2: Tạo Collection mới (nếu chưa có)
1. Mở trang Admin → **Collection Management**
2. Click "➕ Tạo bộ sưu tập mới"
3. Điền:
   - **Tên bộ sưu tập**: `ma1` (slug)
   - **Tiêu đề**: `Bộ sưu tập Ma 1` (hiển thị)
   - **Mô tả**: `Test collection`
   - **Danh mục**: Chọn "Thiên nhiên"
4. Click "Lưu"
5. **Ghi nhớ CollectionID** (ví dụ: CollectionID = 5)

### Bước 3: Upload ảnh với Collection
1. Mở trang Admin → **Gallery Management** (Thư viện ảnh)
2. Click "➕ Upload Ảnh Mới"
3. Điền:
   - **Chọn ảnh**: Upload file ảnh
   - **Tiêu đề**: `ma2` ← QUAN TRỌNG: Đây sẽ lưu vào AltText
   - **Danh mục**: Chọn "Thiên nhiên"
   - **Bộ sưu tập**: Chọn "ma1" (hoặc "Bộ sưu tập Ma 1") ← QUAN TRỌNG
4. Click "Upload"

### Bước 4: Kiểm tra kết quả
1. Mở trang Admin → **Timeline Management**
2. Click tab **"Ảnh chờ duyệt"**
3. Kiểm tra ảnh vừa upload:
   - **Tiêu đề lớn** (màu xanh): Phải hiển thị **"Bộ sưu tập Ma 1"** (hoặc "ma1"), KHÔNG PHẢI "🌳 Thiên nhiên"
   - **Mô tả nhỏ** (màu xám): Phải hiển thị **"ma2"**, KHÔNG PHẢI "Chưa có tiêu đề"

### Bước 5: Xem Console Log (Debug)
Mở DevTools (F12) → Console, tìm:
```
📊 [Timeline Debug]
📷 Pending Images Detail:
  ImageID=123:
    - AltText: "ma2"           ← Phải có giá trị
    - Title: "NULL"
    - CategoryID: 3
    - CollectionID: 5           ← Phải có giá trị
    - Collection: {CollectionID: 5, Name: "ma1", Title: "Bộ sưu tập Ma 1", ...}
```

## 🔍 Nếu vẫn lỗi

### Trường hợp 1: Hiển thị "🌳 Thiên nhiên" thay vì tên collection
**Nguyên nhân**: `image.collection` là `null`
**Giải pháp**:
1. Kiểm tra trong database:
   ```sql
   SELECT ImageID, AltText, CollectionID FROM Images WHERE ImageID = [ImageID của ảnh];
   SELECT * FROM Collections WHERE CollectionID = [CollectionID];
   ```
2. Nếu `CollectionID` là NULL → Upload lại ảnh và **NHỚ CHỌN** bộ sưu tập
3. Nếu CollectionID có giá trị nhưng không tồn tại trong Collections table → Tạo lại collection

### Trường hợp 2: Hiển thị "Chưa có tiêu đề" thay vì "ma2"
**Nguyên nhân**: `image.AltText` là `null`
**Giải pháp**:
1. Kiểm tra trong database:
   ```sql
   SELECT ImageID, AltText, Title FROM Images WHERE ImageID = [ImageID của ảnh];
   ```
2. Nếu cả `AltText` và `Title` đều NULL → Upload lại ảnh và **NHỚ ĐIỀN** tiêu đề

### Trường hợp 3: Backend không nhận được collectionId
**Kiểm tra log backend**:
```
[Gallery Service] Setting CollectionID=5 for image
[Gallery Service] Payload: {
  "FilePath": "http://localhost:3001/...",
  "AltText": "ma2",
  "CategoryID": 3,
  "CollectionID": 5
}
```

Nếu không thấy log → Kiểm tra frontend có gửi `collectionId` không (F12 → Network → gallery → Payload)

## 📝 Lưu ý quan trọng

1. **Collection Management** ≠ **Gallery Management**
   - Collection Management: Tạo/sửa **bộ sưu tập** (category group)
   - Gallery Management: Upload **ảnh** vào thư viện

2. **Để ảnh hiển thị đúng collection**:
   - Phải upload qua **Gallery Management**
   - Phải chọn collection từ dropdown "Bộ sưu tập"

3. **Để ảnh hiển thị đúng tiêu đề**:
   - Phải điền vào trường "Tiêu đề" khi upload
   - Tiêu đề sẽ lưu vào cột `AltText` của Images table

## 🎯 Kết luận

Code đã được sửa đúng. Nếu bạn:
1. ✅ Restart backend
2. ✅ Upload ảnh mới qua **Gallery Management**
3. ✅ Điền đầy đủ "Tiêu đề" và chọn "Bộ sưu tập"

Thì sẽ hiển thị đúng:
- **Tên collection** thay vì "🌳 Thiên nhiên"
- **Tiêu đề ảnh** thay vì "Chưa có tiêu đề"
