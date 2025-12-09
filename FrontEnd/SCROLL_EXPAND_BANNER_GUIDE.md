# 🎬 ScrollExpandBanner Integration Guide

## ✅ Đã cài đặt thành công!

### 📦 Component đã tạo:

1. **ScrollExpandBanner.jsx** - Component scroll-to-expand chính
2. **BannerExpand.jsx** - Banner mới tích hợp ScrollExpandBanner
3. **ScrollExpandBanner.css** - Styles cho component
4. **BannerExpand.css** - Styles cho banner content

### 🚀 Cách sử dụng:

#### Option 1: Thay thế Banner hiện tại

Mở file `src/pages/common/Home.jsx` và thay đổi:

```jsx
// TỪ:
import Banner from "../../Component/home/Banner";

// SANG:
import BannerExpand from "../../Component/home/BannerExpand";

// Trong JSX:
// TỪ: <Banner />
// SANG: <BannerExpand />
```

#### Option 2: Sử dụng song song (A/B Testing)

```jsx
import Banner from "../../Component/home/Banner";
import BannerExpand from "../../Component/home/BannerExpand";
import { useState } from "react";

const Home = () => {
  const [useNewBanner, setUseNewBanner] = useState(true);

  return (
    <>
      {useNewBanner ? <BannerExpand /> : <Banner />}
      {/* Rest of your home page */}
    </>
  );
};
```

### 🎨 Tính năng:

- ✅ **Scroll to Expand**: Cuộn chuột để mở rộng media từ nhỏ → toàn màn hình
- ✅ **Autoplay Detection**: Tự động phát hiện khi media đã mở rộng hoàn toàn
- ✅ **Touch Support**: Hỗ trợ mobile với touch gestures
- ✅ **Smooth Animation**: Animation mượt mà với framer-motion
- ✅ **Responsive**: Tự động điều chỉnh cho mobile/desktop
- ✅ **Video/Image Support**: Hỗ trợ cả video và image
- ✅ **Dynamic Content**: Tích hợp với context data hiện tại

### 🎯 Props của ScrollExpandBanner:

```jsx
<ScrollExpandBanner
  mediaType="image" // 'image' hoặc 'video'
  mediaSrc={imageUrl} // URL của ảnh/video
  posterSrc={posterUrl} // (Optional) Poster cho video
  bgImageSrc={bgUrl} // Background image
  title="Tiêu đề" // Tiêu đề chính
  subtitle="Phụ đề" // Phụ đề
  scrollToExpand="Scroll..." // Text hướng dẫn
  textBlend={false} // Mix-blend-mode cho text
>
  {/* Nội dung hiển thị sau khi expand */}
</ScrollExpandBanner>
```

### 🔧 Customize:

#### Thay đổi màu gradient:

Sửa trong `BannerExpand.css`:

```css
.kicker {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}

.banner-expand-title {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

#### Thay đổi tốc độ scroll:

Sửa trong `ScrollExpandBanner.jsx`:

```jsx
// Line ~43 - Tốc độ scroll chuột
const scrollDelta = e.deltaY * 0.0009; // Tăng để nhanh hơn

// Line ~72 - Tốc độ touch mobile
const scrollFactor = deltaY < 0 ? 0.008 : 0.005; // Tăng để nhạy hơn
```

#### Thêm video thay vì image:

```jsx
<ScrollExpandBanner
  mediaType="video"
  mediaSrc="/path/to/video.mp4"
  posterSrc="/path/to/poster.jpg"
  // ... rest of props
/>
```

### 📱 Mobile Optimization:

- Tự động điều chỉnh kích thước media
- Touch gestures được tối ưu
- Text responsive với breakpoints
- Features grid chuyển sang 1 cột

### 🎭 Animation Details:

- Background fade out khi scroll (opacity)
- Media width/height tăng từ 300px → 1550px
- Text translateX theo progress
- Children content fade in sau khi expand
- Smooth transitions với requestAnimationFrame

### 🐛 Troubleshooting:

**Nếu scroll không hoạt động:**

- Đảm bảo `framer-motion` đã cài: `npm install framer-motion`
- Check console để xem có lỗi không
- Đảm bảo không có CSS `overflow: hidden` trên parent

**Nếu media không hiển thị:**

- Check URL của mediaSrc và bgImageSrc
- Verify CORS nếu dùng external URLs
- Check responsive size trong CSS

**Performance issues:**

- Giảm size ảnh background (optimize < 500KB)
- Dùng poster cho video
- Giảm scrollDelta nếu lag

### 📚 Resources:

- Framer Motion: https://www.framer.com/motion/
- Unsplash (Free images): https://unsplash.com/
- CSS Tricks: https://css-tricks.com/

### 🎉 Next Steps:

1. Test trên dev server: `npm run dev`
2. Thử scroll trên desktop và mobile
3. Customize colors/text theo brand
4. Add more features trong children content
5. A/B test với Banner cũ

---

Made with ❤️ for Dynamic Vault Đà Nẵng
