# Cập Nhật Tính Năng Popup Trên Map

## 🎯 Mục Tiêu

Cải thiện trải nghiệm người dùng trên bản đồ bằng cách:

1. **Hiển thị popup tự động** khi marker được tạo (không cần hover)
2. **Click vào popup** để xem chi tiết địa điểm
3. **Quản lý popup** - đóng popup cũ khi mở popup mới

## ✅ Các Thay Đổi Đã Thực Hiện

### 1. Thêm Ref Theo Dõi Popup Hiện Tại

```javascript
const currentOpenPopupMarker = useRef(null);
```

- Theo dõi marker nào đang có popup mở
- Giúp đóng popup cũ khi mở popup mới

### 2. Cải Thiện Nội Dung Popup

Popup hiện tại hiển thị:

- **Hình ảnh** địa điểm (200x100px)
- **Tên địa điểm** (font-weight: 600)
- **Đánh giá** với số sao và số lượt review
- **Mô tả ngắn** (tối đa 40px chiều cao)
- **Hướng dẫn** "👆 Click để xem chi tiết"

### 3. Tự Động Mở Popup

```javascript
marker
  .bindPopup(popupContent, {
    maxWidth: 250,
    className: "custom-marker-popup",
    autoClose: false,
    closeOnClick: false,
  })
  .openPopup();
```

**Các tùy chọn:**

- `autoClose: false` - Không tự đóng khi click vào map
- `closeOnClick: false` - Không đóng khi click vào chính popup
- `maxWidth: 250` - Chiều rộng tối đa 250px

### 4. Event Handler Cho Popup

```javascript
marker.on("popupopen", () => {
  // Đóng popup cũ nếu có
  if (
    currentOpenPopupMarker.current &&
    currentOpenPopupMarker.current !== marker
  ) {
    currentOpenPopupMarker.current.closePopup();
  }

  // Cập nhật marker hiện tại
  currentOpenPopupMarker.current = marker;

  // Thêm event listener cho click
  const popupElement = document.querySelector(
    `.marker-popup-content[data-place-id="${place.id}"]`
  );
  if (popupElement) {
    popupElement.onclick = () => {
      currentPlace.current = place;
      clearCurrentRoute();
      showPlaceDetail(place, mapInstance.current);
      marker.closePopup();
    };
  }
});
```

### 5. Cải Thiện Click Handler Cho Marker

```javascript
marker.on("click", () => {
  hideHoverPopup();

  // Đóng tất cả popup khác
  allMarkersRef.current.forEach((m) => {
    if (m !== marker) {
      m.closePopup();
    }
  });

  // Mở popup của marker này
  marker.openPopup();
  currentOpenPopupMarker.current = marker;

  // Mở sidebar chi tiết
  currentPlace.current = place;
  clearCurrentRoute();
  showPlaceDetail(place, mapInstance.current);
});
```

### 6. Custom CSS Cho Popup

```css
.custom-marker-popup .leaflet-popup-content-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 0;
  overflow: hidden;
}

.custom-marker-popup .leaflet-popup-content {
  margin: 0;
  width: auto !important;
}

.marker-popup-content:hover {
  background-color: #f8f9fa;
}

.marker-popup-content {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  padding: 12px;
}
```

## 🎨 Trải Nghiệm Người Dùng

### Trước Khi Cập Nhật

- ❌ Popup chỉ hiện khi hover vào marker
- ❌ Không thể click vào popup để xem chi tiết
- ❌ Nhiều popup có thể mở cùng lúc gây rối

### Sau Khi Cập Nhật

- ✅ Popup tự động hiển thị khi marker được tạo
- ✅ Click vào popup để mở sidebar chi tiết
- ✅ Chỉ 1 popup mở tại 1 thời điểm
- ✅ Hover effect vẫn hoạt động (có thể tắt nếu muốn)
- ✅ Popup có animation khi hover

## 🔧 Tùy Chỉnh Thêm (Tùy Chọn)

### Tắt Hover Effect

Nếu không muốn hover popup, xóa các dòng:

```javascript
marker.on("mouseover", () => showHoverPopup(place, place.position));
marker.on("mouseout", () => {
  hoverTimeoutRef.current = setTimeout(() => hideHoverPopup(), 300);
});
```

### Thay Đổi Kích Thước Popup

Trong `bindPopup`, thay đổi:

```javascript
maxWidth: 300, // Tăng từ 250 lên 300
```

### Tự Động Đóng Popup Khi Click Map

Thay đổi:

```javascript
autoClose: true,  // Thay vì false
closeOnClick: true  // Thay vì false
```

## 📱 Responsive

Popup tự động điều chỉnh:

- Min-width: 200px
- Max-width: 250px
- Chiều cao tự động dựa trên nội dung
- Border-radius: 12px cho modern look

## 🐛 Lưu Ý

1. Popup được bind với `data-place-id` để tracking
2. Event listener được thêm trong `popupopen` event
3. `currentOpenPopupMarker` đảm bảo chỉ 1 popup mở
4. Tương thích với dark mode và các tính năng hiện có

## 🚀 Test

1. Mở trang map
2. Kiểm tra popup tự động hiển thị
3. Click vào popup → Sidebar chi tiết mở
4. Click marker khác → Popup cũ đóng, popup mới mở
5. Click vào marker → Mở cả popup và sidebar

---

**Cập nhật:** 8/12/2024
