# 📍 Tính Năng Chia Sẻ Địa Điểm trên Bản Đồ

## 🎯 Tổng Quan

Tính năng chia sẻ địa điểm cho phép người dùng:

- ✅ Chia sẻ địa điểm qua nhiều nền tảng mạng xã hội (Messenger, Zalo, Instagram, Facebook, WhatsApp, Email)
- ✅ Tạo link chia sẻ với thông tin đầy đủ (tọa độ, tên địa điểm, zoom level)
- ✅ Người nhận có thể xem địa điểm **KHÔNG CẦN ĐĂNG NHẬP**
- ✅ Tự động hiển thị tuyến đường từ vị trí người nhận đến địa điểm được chia sẻ

---

## 📁 Files Đã Tạo/Sửa Đổi

### 1. **ShareModal.jsx** (MỚI)

- **Đường dẫn:** `FrontEnd/src/pages/map/ShareModal.jsx`
- **Chức năng:**
  - Modal hiển thị các tùy chọn chia sẻ
  - Tạo shareable link với URL parameters
  - Tích hợp 6 nền tảng social media
  - Copy link to clipboard

### 2. **ShareModal.css** (MỚI)

- **Đường dẫn:** `FrontEnd/src/pages/map/ShareModal.css`
- **Chức năng:**
  - Style cho modal overlay và content
  - Responsive design (mobile, tablet, desktop)
  - Animations và transitions
  - Brand colors cho từng social platform

### 3. **MapPage.jsx** (CẬP NHẬT)

- **Đường dẫn:** `FrontEnd/src/pages/map/MapPage.jsx`
- **Thay đổi:**
  - Import `ShareModal` component
  - Thêm states: `shareModalOpen`, `shareLocation`, `shareMapPosition`
  - Thêm handler: `handleShareLocation(place)`
  - Attach event listeners cho share buttons (2 vị trí)
  - Thêm useEffect xử lý URL parameters
  - Render ShareModal với ReactDOM.createPortal

---

## 🚀 Cách Sử Dụng

### 1️⃣ Chia Sẻ Địa Điểm

1. **Mở thông tin địa điểm:**

   - Click vào marker trên bản đồ
   - Sidebar sẽ hiển thị thông tin chi tiết

2. **Click nút "Chia sẻ":**

   - Nút nằm trong tab "Tổng quan"
   - Modal chia sẻ sẽ hiển thị

3. **Chọn phương thức chia sẻ:**

   **🔵 Messenger:**

   - Click icon Messenger
   - Chọn bạn bè hoặc nhóm
   - Gửi link ngay

   **💬 Zalo:**

   - Click icon Zalo
   - Chọn người nhận hoặc nhóm
   - Chia sẻ link

   **📸 Instagram:**

   - Click icon Instagram
   - Link sẽ được tự động copy
   - Dán vào Story hoặc Bio

   **🔵 Facebook:**

   - Click icon Facebook
   - Chọn đối tượng (Bạn bè/Công khai)
   - Đăng bài

   **💚 WhatsApp:**

   - Click icon WhatsApp
   - Chọn contact hoặc group
   - Gửi message

   **📧 Email:**

   - Click icon Email
   - Email client sẽ mở với nội dung có sẵn
   - Nhập địa chỉ người nhận và gửi

   **🔗 Copy Link:**

   - Click nút "📋 Sao chép"
   - Dán vào bất kỳ đâu

---

### 2️⃣ Người Nhận Mở Link

1. **Click vào link được chia sẻ:**

   ```
   http://yoursite.com/map?locationId=123&locationName=Cầu+Rồng&lat=16.0544&lng=108.2273&zoom=15
   ```

2. **Điều gì sẽ xảy ra:**

   - ✅ Bản đồ tự động bay đến địa điểm (smooth animation)
   - ✅ Marker được highlight
   - ✅ Sidebar tự động mở với thông tin chi tiết
   - ✅ **KHÔNG CẦN ĐĂNG NHẬP** để xem

3. **Xem đường đi:**
   - Click nút "Đường đi"
   - Trình duyệt sẽ yêu cầu quyền truy cập vị trí
   - Polyline (đường màu xanh) sẽ hiển thị từ vị trí hiện tại đến địa điểm
   - Hiển thị khoảng cách (km) và thời gian di chuyển (phút)

---

## 🔧 Chi Tiết Kỹ Thuật

### URL Parameters

Link chia sẻ chứa các parameters sau:

| Parameter      | Mô tả                          | Bắt buộc     | Ví dụ          |
| -------------- | ------------------------------ | ------------ | -------------- |
| `locationId`   | ID của địa điểm trong database | Tùy chọn     | `123`          |
| `locationName` | Tên địa điểm                   | Tùy chọn     | `Cầu Rồng`     |
| `lat`          | Vĩ độ (latitude)               | **Bắt buộc** | `16.0544`      |
| `lng`          | Kinh độ (longitude)            | **Bắt buộc** | `108.2273`     |
| `zoom`         | Mức zoom của map               | Tùy chọn     | `15` (default) |

**Ví dụ URL đầy đủ:**

```
http://localhost:3000/map?locationId=42&locationName=B%C3%A0%20N%C3%A0%20Hills&lat=15.9947&lng=108.0699&zoom=17
```

### Luồng Xử Lý URL Parameters

```javascript
// 1. Parse URL params
const urlParams = new URLSearchParams(window.location.search);
const locationId = urlParams.get("locationId");
const lat = parseFloat(urlParams.get("lat"));
const lng = parseFloat(urlParams.get("lng"));
const zoom = parseInt(urlParams.get("zoom")) || 15;

// 2. Tìm địa điểm trong database
const targetPlace = places.find((p) => String(p.id) === String(locationId));

// 3. Fly to location
mapInstance.current.flyTo([lat, lng], zoom, {
  duration: 1.5,
  easeLinearity: 0.25,
});

// 4. Mở sidebar sau 1.8s (sau khi animation kết thúc)
setTimeout(() => {
  showPlaceDetail(targetPlace, mapInstance.current);
}, 1800);
```

### Social Media Integration

#### 1. **Messenger**

```javascript
// Mobile: Deep link to app
const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(
  shareLink
)}`;

// Desktop: Web dialog
const webMessengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
  shareLink
)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`;
```

⚠️ **LƯU Ý:** Cần thay `YOUR_FACEBOOK_APP_ID` bằng App ID thật của bạn từ [Facebook Developers](https://developers.facebook.com/)

#### 2. **Zalo**

```javascript
const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareLink)}`;
window.open(zaloUrl, "_blank");
```

#### 3. **Instagram**

```javascript
// Instagram không hỗ trợ direct link sharing
// → Copy link và prompt user
handleCopyLink();
alert(
  "📋 Link đã được sao chép! Hãy dán vào Instagram Story hoặc Bio của bạn."
);
```

#### 4. **Facebook**

```javascript
const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
  shareLink
)}`;
window.open(facebookUrl, "_blank", "width=600,height=400");
```

#### 5. **WhatsApp**

```javascript
const message = `${location.title} - ${shareLink}`;
const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
window.open(whatsappUrl, "_blank");
```

#### 6. **Email**

```javascript
const subject = `Chia sẻ địa điểm: ${location.title}`;
const body = `Xin chào,\n\nTôi muốn chia sẻ địa điểm này với bạn:\n\n${location.title}\n\nXem trên bản đồ: ${shareLink}`;
const mailtoUrl = `mailto:?subject=${encodeURIComponent(
  subject
)}&body=${encodeURIComponent(body)}`;
window.location.href = mailtoUrl;
```

### Routing với Polyline

```javascript
const calculateRoute = async (from, to, map) => {
  // OpenStreetMap Routing API
  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${from.lng},${from.lat};${to[1]},${to[0]}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.routes && data.routes[0]) {
    const route = data.routes[0];
    const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);

    // Vẽ polyline
    const polyline = L.polyline(coords, {
      color: "#4285f4",
      weight: 6,
      opacity: 0.9,
    }).addTo(map);

    // Fit map bounds
    map.fitBounds(polyline.getBounds());

    // Hiển thị thông tin
    const km = (route.distance / 1000).toFixed(1);
    const mins = Math.round(route.duration / 60);
  }
};
```

---

## 🎨 UI/UX Features

### Modal Design

- **Overlay:** Semi-transparent backdrop với blur effect
- **Animation:** Fade in + slide up (0.3s)
- **Responsive:** 3 columns (desktop) → 2 columns (mobile)
- **Close:** Click overlay hoặc X button (với rotate animation)

### Social Icons

- **Brand Colors:** Màu chính thức của từng platform
- **Hover Effect:**
  - Background chuyển sang màu brand
  - Text chuyển sang màu trắng
  - Nâng lên 4px (translateY)
  - Box shadow
- **Icons:** SVG inline (không cần external dependencies)

### Link Section

- **Input:** Read-only, click to select all
- **Copy Button:**
  - Màu xanh (#0d6efd)
  - Hover: Nâng lên + shadow
  - Copied: Chuyển sang màu xanh lá (#198754)
- **Note:** Italic, màu xám nhạt

---

## 🧪 Testing

### Test Case 1: Chia sẻ qua Messenger

1. Mở địa điểm bất kỳ
2. Click "Chia sẻ"
3. Click icon Messenger
4. **Expected:**
   - Mobile: Mở Messenger app
   - Desktop: Mở Facebook Messenger web dialog
5. Chọn bạn bè và gửi

### Test Case 2: Chia sẻ qua link

1. Click "Chia sẻ" → "📋 Sao chép"
2. Mở tab mới (Incognito để test KHÔNG CẦN ĐĂNG NHẬP)
3. Dán link vào address bar
4. **Expected:**
   - Map fly đến địa điểm (smooth animation)
   - Sidebar tự động mở
   - Thông tin địa điểm hiển thị đầy đủ

### Test Case 3: Xem đường đi

1. Mở link được chia sẻ
2. Click "Đường đi"
3. Allow location access
4. **Expected:**
   - Blue polyline từ vị trí hiện tại đến địa điểm
   - Hiển thị: "Thời gian: X phút · Khoảng cách: Y km"

---

## 🐛 Troubleshooting

### 1. Messenger không mở

**Vấn đề:** Click Messenger icon không có phản ứng

**Giải pháp:**

```javascript
// Cần thêm Facebook App ID vào ShareModal.jsx dòng 46
const webMessengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
  shareLink
)}&app_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(
  window.location.href
)}`;
```

Lấy App ID tại: https://developers.facebook.com/apps/

### 2. Link không hoạt động

**Vấn đề:** Mở link nhưng map không fly đến địa điểm

**Nguyên nhân:**

- `places` array chưa load xong
- URL parameters sai format

**Debug:**

```javascript
console.log("Places loaded:", places.length);
console.log("URL params:", {
  locationId: urlParams.get("locationId"),
  lat: urlParams.get("lat"),
  lng: urlParams.get("lng"),
});
```

### 3. "Không thể tìm đường"

**Vấn đề:** Click "Đường đi" nhưng báo lỗi

**Nguyên nhân:**

- User chưa bật định vị
- OpenStreetMap Routing API không khả dụng

**Giải pháp:**

1. Kiểm tra `userMarker.current` có tồn tại
2. Check network tab cho API call
3. Fallback: Dùng Google Maps Direction API (cần API key)

---

## 📝 TODO / Future Improvements

- [ ] **Facebook App ID:** Thêm vào environment variables
- [ ] **Analytics:** Track số lượt share theo platform
- [ ] **QR Code:** Generate QR code cho link
- [ ] **Short URL:** Tích hợp bit.ly hoặc tự build URL shortener
- [ ] **Deep Linking:** Support mobile app deep links
- [ ] **Share Image:** Generate preview image với Open Graph tags
- [ ] **WhatsApp Business:** Tích hợp WhatsApp Business API
- [ ] **Telegram:** Thêm Telegram share option
- [ ] **LINE:** Thêm LINE share (phổ biến ở Đông Nam Á)
- [ ] **Copy Coordinates:** Nút copy riêng cho lat/lng
- [ ] **Navigation Apps:** Tích hợp Google Maps, Apple Maps, Waze

---

## 🔐 Security Notes

1. **URL Parameters:** Đã encode để tránh XSS
2. **User Input:** ShareModal không nhận input từ user (chỉ hiển thị)
3. **External Links:** Mở trong tab mới (`target="_blank"`)
4. **Geolocation:** Cần user permission (browser prompt)

---

## 📞 Support

Nếu có vấn đề:

1. Check console logs (F12 → Console)
2. Verify URL parameters format
3. Test với địa điểm khác
4. Clear browser cache
5. Test trên incognito mode

---

## ✅ Checklist Triển Khai

- [x] Tạo ShareModal.jsx component
- [x] Tạo ShareModal.css styling
- [x] Tích hợp vào MapPage.jsx
- [x] Thêm event handlers cho share buttons
- [x] Xử lý URL parameters
- [x] Support 6 social platforms
- [x] Copy to clipboard functionality
- [x] Responsive design
- [x] Animation và transitions
- [x] Routing với polyline
- [x] Works without login
- [ ] Thêm Facebook App ID thật
- [ ] Testing trên production
- [ ] Tối ưu SEO (Open Graph tags)

---

**Phiên bản:** 1.0.0  
**Ngày tạo:** ${new Date().toLocaleDateString('vi-VN')}  
**Developer:** GitHub Copilot
