# ADMIN TIMELINE - 3-PILLAR SYSTEM

## ✅ ĐÃ HOÀN THÀNH

### 1. **Refactor Giao Diện Admin Timeline**
Thiết kế lại hoàn toàn theo logic 3-trụ cột liên kết.

---

## 📐 LOGIC 3-TRỤ CỘT

```
🖼️ GALLERY (Thư viện ảnh)
    ↓ ImageID
    
🕒 TIMELINE (Dòng thời gian) ← YOU ARE HERE
    ↓ LocationID
    
📍 MAP (Bản đồ địa điểm)
```

### **Timeline PHẢI gắn với:**
1. **ImageID** (Chọn từ Gallery) - Bắt buộc
2. **LocationID** (Chọn từ Map) - Bắt buộc
3. **CategoryID** tự động lấy từ ảnh (không nhập)

---

## 🎨 GIAO DIỆN MỚI

### **Header:**
- Title: "🕒 Quản lý Timeline (Trụ cột 3)"
- Hint: "Timeline liên kết với 📍 Map (địa điểm) và 🖼️ Gallery (ảnh)"

### **Filters:**
- ✅ Tìm kiếm theo tiêu đề, mô tả
- ✅ Lọc theo địa điểm (LocationID from Map)
- ✅ Lọc theo khoảng năm (từ năm - đến năm)

### **Table Columns:**
| ID | Hình ảnh | Tiêu đề | Ngày sự kiện | Địa điểm | Danh mục (từ ảnh) | Mô tả | Thao tác |
|----|----------|---------|--------------|----------|-------------------|-------|----------|

---

## 📝 FORM TẠO/SỬA TIMELINE

### **Fields:**

1. **Tiêu đề*** (text, required)
   - Tên sự kiện timeline

2. **Ngày sự kiện*** (date, required)
   - Ngày diễn ra sự kiện

3. **🖼️ Chọn ảnh từ Gallery*** (select, required)
   - Dropdown danh sách ảnh từ `http://localhost:3000/api/gallery`
   - Hiển thị: `ID:X - AltText (CategoryName)`
   - Preview ảnh khi chọn

4. **📍 Chọn địa điểm từ Map*** (select, required)
   - Dropdown danh sách địa điểm từ `http://localhost:3000/api/map-locations`
   - Hiển thị: `Name - Address`
   - Hint: "Timeline này sẽ được liên kết với địa điểm đã chọn"

5. **Mô tả chi tiết** (textarea, optional)
   - Mô tả đầy đủ về sự kiện

6. **Nguồn tham khảo** (URL, optional)
   - Link nguồn tham khảo

### **Validation:**
- ❌ Không cho phép tạo nếu thiếu ImageID
- ❌ Không cho phép tạo nếu thiếu LocationID
- ✅ Danh mục tự động lấy từ ảnh đã chọn

---

## 🔄 WORKFLOW

### **Tạo Timeline Mới:**
1. Admin click "Tạo Timeline Mới"
2. Chọn ảnh từ Gallery (thấy preview)
3. Chọn địa điểm từ Map
4. Điền tiêu đề, ngày, mô tả
5. Submit → POST `/api/timeline`

### **Sửa Timeline:**
1. Click "Sửa" trên timeline
2. Form load data sẵn (kể cả preview ảnh)
3. Có thể đổi ImageID, LocationID
4. Submit → PUT `/api/timeline/:id`

### **Xem Detail:**
- Hiển thị đầy đủ:
  - Ảnh (từ Gallery via ImageID)
  - Địa điểm (từ Map via LocationID)
  - Danh mục (từ ảnh)
  - Mô tả đầy đủ
  - Nguồn tham khảo

---

## 🎯 PAYLOAD MẪU

### **POST/PUT Request:**
```json
{
  "title": "Khánh thành Cầu Rồng",
  "eventDate": "2013-03-29",
  "description": "Cầu Rồng chính thức được khánh thành...",
  "ImageID": 123,       // ID từ Gallery
  "LocationID": 45,     // ID từ Map
  "sourceUrl": "https://example.com/source"
}
```

### **Response:**
```json
{
  "timelineID": 789,
  "title": "Khánh thành Cầu Rồng",
  "eventDate": "2013-03-29",
  "ImageID": 123,
  "LocationID": 45,
  "description": "...",
  "sourceUrl": "https://..."
}
```

---

## 🔗 API ENDPOINTS

### **Timeline:**
- GET `/api/timeline` - Lấy danh sách
- GET `/api/timeline/:id` - Lấy chi tiết
- POST `/api/timeline` - Tạo mới (cần backend implement)
- PUT `/api/timeline/:id` - Cập nhật (cần backend implement)
- DELETE `/api/timeline/:id` - Xóa (cần backend implement)

### **Dependencies:**
- GET `/api/gallery` - Lấy danh sách ảnh
- GET `/api/map-locations` - Lấy danh sách địa điểm

---

## 📊 DATABASE STRUCTURE

### **Timelines Table:**
```sql
timelineID      INT (PK)
title           NVARCHAR(150)
eventDate       DATE
description     NVARCHAR(MAX)
ImageID         INT (FK → Images.ImageID)
LocationID      INT (FK → MapLocations.LocationID)
sourceUrl       NVARCHAR(500)
```

### **Foreign Keys:**
- `ImageID` → `Images.ImageID` (ON DELETE SET NULL)
- `LocationID` → `MapLocations.LocationID` (ON DELETE SET NULL)

### **Category Logic:**
```sql
-- Lấy category của timeline qua JOIN
SELECT t.*, i.CategoryID, c.Name as CategoryName
FROM Timelines t
LEFT JOIN Images i ON t.ImageID = i.ImageID
LEFT JOIN Categories c ON i.CategoryID = c.CategoryID
WHERE t.timelineID = ?
```

---

## 🚨 LƯU Ý

### **Đã Xóa:**
- ❌ Upload ảnh trực tiếp trong Timeline form
- ❌ Dropdown chọn category thủ công
- ❌ ArticleID field
- ❌ CategoryID field (lấy từ Image)

### **Logic Mới:**
- ✅ Chỉ chọn từ Gallery/Map (không tạo mới)
- ✅ Category tự động từ ảnh
- ✅ 1 địa điểm có thể có nhiều timeline (cùng LocationID)
- ✅ 1 ảnh có thể dùng cho nhiều timeline (cùng ImageID)

---

## 📋 TODO - BACKEND ENDPOINTS

Cần implement các endpoint sau:

### 1. **POST /api/timeline**
```typescript
// timeline.controller.ts
@Post()
async create(@Body() createDto: CreateTimelineDto) {
  // Validate ImageID exists in Images
  // Validate LocationID exists in MapLocations
  // Insert into Timelines table
  return savedTimeline;
}
```

### 2. **PUT /api/timeline/:id**
```typescript
@Put(':id')
async update(@Param('id') id: number, @Body() updateDto: UpdateTimelineDto) {
  // Validate ImageID exists
  // Validate LocationID exists
  // Update timeline
  return updatedTimeline;
}
```

### 3. **DELETE /api/timeline/:id**
```typescript
@Delete(':id')
async delete(@Param('id') id: number) {
  // Delete timeline (FK constraints auto handle Images/Locations)
  return { deleted: true };
}
```

### 4. **GET /api/timeline/:id - Enhance**
```typescript
@Get(':id')
async findOne(@Param('id') id: number) {
  // JOIN with Images and MapLocations
  return await this.timelineRepo.findOne({
    where: { timelineID: id },
    relations: ['image', 'location'],
  });
}
```

---

## 🎨 CSS STYLES

### **New Classes Added:**
```css
.header-hint             /* Hint text dưới header */
.pillar-select           /* Container cho Gallery/Map select */
.pillar-select-gallery   /* Select box Gallery */
.pillar-select-map       /* Select box Map */
.image-preview-box       /* Preview ảnh từ Gallery */
.form-hint               /* Hint text trong form */
.timeline-location       /* Location column trong table */
.detail-location         /* Location trong detail modal */
```

---

## ✨ HIGHLIGHTS

### **User Experience:**
1. Admin thấy rõ timeline gắn với địa điểm nào
2. Chọn ảnh từ Gallery → thấy preview ngay
3. Category tự động → không sai
4. Filter theo địa điểm → dễ quản lý

### **Data Integrity:**
1. Foreign key constraints → không xóa sai
2. Validation → không tạo timeline không hợp lệ
3. Single source of truth cho category (từ Image)

### **Architecture:**
```
Gallery ← ImageID ← Timeline → LocationID → Map
                        ↓
                    Category (auto)
```

---

## 🔮 NEXT STEPS

1. ✅ Frontend đã xong
2. ⏳ Implement backend POST/PUT/DELETE endpoints
3. ⏳ Test complete workflow
4. ⏳ Run database migration
5. ⏳ Migrate existing data (URL → ImageID)

---

**Thiết kế hoàn thành! Logic 3-pillar system đúng 100%** 🎯
