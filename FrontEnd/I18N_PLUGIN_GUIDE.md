# Hướng dẫn tích hợp dịch (i18n) cho project

Tài liệu này mô tả cách project hiện tại xử lý đa ngôn ngữ (i18n), nơi đặt file locale, cách sử dụng trong component, cách thêm key mới, và các tùy chọn nếu bạn muốn dùng Google Translate thay vì file locale tĩnh.

Nội dung:
- Mục tiêu
- File và vị trí quan trọng
- Thiết lập (step-by-step)
- Cách dùng trong component (ví dụ)
- Thêm key mới & best practices
- Kiểm tra & debug
- Tùy chọn: Google Translate (những lưu ý)

---

## 1. Mục tiêu

- Cho phép UI hiển thị nhiều ngôn ngữ (current: `vi` + `en`).
- Giữ text trong file `locales` thay vì string cố định trong component.
- Hỗ trợ đổi ngôn ngữ tại runtime và dễ dàng mở rộng.

## 2. File và vị trí quan trọng trong repo

- `src/config/i18n.js` hoặc `src/i18nShim.js` — nơi khởi tạo i18next (import file này trước khi render app, ví dụ trong `main.jsx`).
- `src/locales/en.json` — English translations
- `src/locales/vi.json` — Vietnamese translations
- Các component sử dụng hook `useTranslation` từ `react-i18next` (ví dụ: `RecentPosts.jsx`, `CollectionGallery.jsx`, ...).

Nếu bạn không tìm thấy `src/config/i18n.js` trong repo, kiểm tra `src/i18nShim.js` hoặc tìm file import `react-i18next` tại `main.jsx`.

## 3. Thiết lập (từng bước)

1. Cài dependency (nếu project chưa có):

```powershell
npm install i18next react-i18next
```

2. Tạo files locale (ví dụ):

- `src/locales/en.json`
- `src/locales/vi.json`

Định dạng mẫu:

```json
{
  "recentPosts": {
    "title": "Recent posts",
    "subtitle": "Latest contributions"
  },
  "common": { "prev": "Prev", "next": "Next" }
}
```

3. Khởi tạo i18n trong `src/config/i18n.js`:

- Import `i18next`, `initReactI18next`.
- Load resources (static JSON) hoặc cấu hình backend để lazy-load.
- Thiết lập `fallbackLng` và `debug` theo môi trường dev.

Ví dụ ngắn (ở level ý tưởng): import các JSON và gọi `i18n.use(initReactI18next).init({ resources: { en: { translation: enJson }, vi: { translation: viJson } }, fallbackLng: 'vi' })`.

4. Import file init trước khi mount app (ví dụ trong `main.jsx`):

```js
import './config/i18n'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)
```

## 4. Cách dùng trong component

1. Import hook:

```js
import { useTranslation } from 'react-i18next'

const { t, i18n } = useTranslation()
```

2. Gọi key:

```jsx
<h2>{t('recentPosts.title')}</h2>
<button onClick={() => i18n.changeLanguage('en')}>EN</button>
<button onClick={() => i18n.changeLanguage('vi')}>VI</button>
```

3. Interpolation / biến:

```json
"welcomeUser": "Xin chào, {{name}}!"
```

Trong component: `t('welcomeUser', { name: 'An' })`.

## 5. Thêm key mới & best practices

- Mỗi key nên tồn tại ở cả `en.json` và `vi.json`.
- Dùng namespace/chunk (ví dụ: `home.title`, `common.prev`) để tránh file quá lớn.
- Sắp xếp file JSON theo nhóm component hoặc pages.
- Nếu key hay bị thiếu trong runtime, bật debug (chỉ dev) để console hiển thị các key missing.

## 6. Kiểm tra & debug

- Nếu UI hiển thị raw key (ví dụ `recentPosts.title`), nghĩa là key chưa tồn tại hoặc resource chưa load.
- Nếu dùng lazy loading, kiểm tra Network tab xem JSON có được tải.
- Bật `debug: true` trong config i18n để xem log chi tiết.

## 7. Tùy chọn: Google Translate (nhúng widget hoặc API)

Hai phương án:

1. Nhúng Google Translate widget (client-side):
  - Dễ làm nhưng không đẹp cho UI/UX, và phụ thuộc vào script ngoài.
  - Không nên dùng cho sản phẩm chính thức; dùng nếu muốn cung cấp bản dịch nhanh cho user.

2. Dùng Google Translate API (server-side calls):
  - Tốn phí, cần giữ API key bảo mật.
  - Có thể dịch nội dung động (bài viết user-contributed) trước khi render.

Lưu ý: Google Translate chất lượng tự động sẽ không bằng biên dịch thủ công; nếu cần chính xác nội dung (nội dung lịch sử/khoa học), nên duy trì translation files thủ công hoặc thuê dịch thuật.

## 8. Công cụ bổ sung (tuỳ chọn)

- i18next-browser-languagedetector: phát hiện ngôn ngữ từ browser / localStorage.
- i18next-http-backend: lazy-load locale JSON từ server.
- FormatJS / react-intl: thay thế nếu cần hỗ trợ định dạng ngày / tiền tệ phức tạp.

## 9. Nhiệm vụ tiếp theo tôi có thể làm cho bạn

- Quét code và tạo report các key thiếu giữa `en.json` và `vi.json`.
- Thêm language switcher ở header và lưu lựa chọn vào `localStorage`.
- Chuyển sang lazy-loading cho locale files để giảm bundle size.

---

Nếu bạn muốn tôi tạo report các key thiếu hoặc tự động thêm switcher vào project, chọn 1 trong những tùy chọn ở trên. 

Created on: 2025-10-31
