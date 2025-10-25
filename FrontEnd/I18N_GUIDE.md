# Hướng dẫn sử dụng chức năng đa ngôn ngữ (i18n)

## Tổng quan
Ứng dụng đã được tích hợp chức năng đa ngôn ngữ sử dụng thư viện **react-i18next**, hỗ trợ:
- 🇻🇳 Tiếng Việt (mặc định)
- 🇬🇧 Tiếng Anh

## Cách sử dụng

### 1. Chuyển đổi ngôn ngữ trên giao diện
- Tại header, bạn sẽ thấy 2 nút: **VI** và **EN**
- Click vào nút tương ứng để chuyển đổi ngôn ngữ
- Ngôn ngữ được chọn sẽ được lưu vào localStorage và giữ nguyên khi reload trang

### 2. Thêm translation cho component mới

#### Bước 1: Import hook useTranslation
```jsx
import { useTranslation } from 'react-i18next';

const YourComponent = () => {
  const { t } = useTranslation();
  // ...
}
```

#### Bước 2: Sử dụng function t() để dịch text
```jsx
<h1>{t('yourKey.title')}</h1>
<p>{t('yourKey.description')}</p>
```

#### Bước 3: Thêm translation vào files JSON
**src/locales/vi.json:**
```json
{
  "yourKey": {
    "title": "Tiêu đề tiếng Việt",
    "description": "Mô tả tiếng Việt"
  }
}
```

**src/locales/en.json:**
```json
{
  "yourKey": {
    "title": "Title in English",
    "description": "Description in English"
  }
}
```

## Cấu trúc files

```
FrontEnd/
├── src/
│   ├── config/
│   │   └── i18n.js              # Cấu hình i18next
│   ├── locales/
│   │   ├── vi.json              # Translation tiếng Việt
│   │   └── en.json              # Translation tiếng Anh
│   └── Component/
│       └── common/
│           └── LanguageSwitcher.jsx  # Component chuyển đổi ngôn ngữ
```

## Translation keys hiện có

### Navigation (nav)
- `nav.home` - Trang chủ / Home
- `nav.map` - Bản đồ / Map
- `nav.timeline` - Timeline
- `nav.community` - Cộng đồng / Community
- `nav.collection` - Bộ sưu tập / Collection
- `nav.join` - Tham gia / Join
- `nav.login` - Đăng Nhập / Login

### Banner
- `banner.title` - Dynamic Vault
- `banner.subtitle` - Tiêu đề phụ
- `banner.description` - Mô tả
- `banner.start` - Bắt đầu / Get Started
- `banner.search` - Tìm kiếm địa danh / Search landmarks

### Recent Posts (recentPosts)
- `recentPosts.title` - Bài viết mới nhất / Recent Posts
- `recentPosts.subtitle` - Khám phá những chia sẻ mới từ cộng đồng
- `recentPosts.viewMore` - Xem thêm bài viết / View more posts

### Contribute
- `contribute.callTitle` - Góp Ảnh Lưu Giữ Di Sản
- `contribute.callDescription` - Mô tả đóng góp
- `contribute.contributors` - Người đóng góp / Contributors
- `contribute.sharedPhotos` - Ảnh được chia sẻ / Photos shared
- `contribute.button` - Bắt đầu đóng góp / Start contributing

### Collection
- `collection.title` - Bộ sưu tập Di sản / Heritage Collection
- `collection.subtitle` - Khám phá vẻ đẹp văn hóa
- `collection.viewAll` - Xem thêm bộ sưu tập / View more collections

### Common
- `common.loading` - Đang tải... / Loading...
- `common.error` - Đã xảy ra lỗi / An error occurred
- `common.success` - Thành công / Success
- `common.cancel` - Hủy / Cancel
- `common.save` - Lưu / Save
- `common.edit` - Chỉnh sửa / Edit
- `common.delete` - Xóa / Delete
- `common.confirm` - Xác nhận / Confirm

## Tips
1. **Đặt tên key rõ ràng**: Sử dụng cấu trúc phân cấp như `section.subsection.key`
2. **Nhất quán**: Đảm bảo tất cả các ngôn ngữ đều có đầy đủ các key
3. **Test**: Luôn kiểm tra cả 2 ngôn ngữ sau khi thêm translation mới
4. **LocalStorage**: Ngôn ngữ được lưu tự động, người dùng không cần chọn lại khi quay lại

## Thêm ngôn ngữ mới
Nếu muốn thêm ngôn ngữ khác (ví dụ: tiếng Pháp):

1. Tạo file `src/locales/fr.json`
2. Thêm import vào `src/config/i18n.js`:
```javascript
import fr from '../locales/fr.json';

// Trong phần resources:
resources: {
  vi: { translation: vi },
  en: { translation: en },
  fr: { translation: fr }  // Thêm dòng này
}
```
3. Thêm nút trong `LanguageSwitcher.jsx`

## Lưu ý
- Translation được load khi khởi động app
- Thay đổi trong JSON files yêu cầu restart dev server
- Nếu không tìm thấy key, sẽ hiển thị key đó (ví dụ: "nav.home")
