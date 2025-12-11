# 🔐 FIX: Token Expiry Issue - Tự động logout sau 10 phút

## 📋 **VẤN ĐỀ**

Người dùng bị tự động logout sau khoảng 10 phút khi F5 (refresh) trang web.

## 🐛 **NGUYÊN NHÂN**

### 1. **Access Token chỉ có thời hạn 60 GIÂY thay vì 3600 giây (1 giờ)**

**File: `.env`**
```env
JWT_ACCESS_EXPIRES=60000  ❌ SAI - Backend hiểu là 60000ms = 60 giây!
```

**File: `auth.module.ts`**
```typescript
signOptions: { expiresIn: cs.get<number>('JWT_ACCESS_EXPIRES') || 900 }
// ❌ SAI: JWT hiểu số nguyên = milliseconds → 60000ms = 60 giây
```

**File: `auth.service.ts`**
```typescript
expiresIn: `${accessTokenExpiry}s`  ✅ ĐÚNG - Thêm 's' để chỉ rõ là SECONDS
```

→ **XUNG ĐỘT**: `auth.module.ts` hiểu là milliseconds, nhưng `auth.service.ts` hiểu là seconds!

### 2. **HttpOnly Cookie `access_token` bị expire sau 15 phút**

**File: `auth.controller.ts`**
```typescript
res.cookie('access_token', result.accessToken, {
  maxAge: 15 * 60 * 1000, // ❌ 15 phút
});
```

→ Sau 15 phút, cookie bị xóa → F5 → không có token → logout!

### 3. **Refresh Token Cookie cũng bị expire sau 15 phút trong hàm `refresh()`**

**File: `auth.controller.ts` - hàm `refresh()`**
```typescript
res.cookie('access_token', result.accessToken, {
  maxAge: 15 * 60 * 1000, // ❌ 15 phút
});
```

## ✅ **GIẢI PHÁP**

### **Fix 1: Thay đổi `JWT_ACCESS_EXPIRES` trong `.env`**

```diff
- JWT_ACCESS_EXPIRES=60000
+ JWT_ACCESS_EXPIRES=3600
```

**Giải thích:**
- `3600` seconds = 1 giờ (thời gian hợp lý cho access token)
- Backend sẽ thêm `s` vào → `3600s` = 1 giờ

### **Fix 2: Sửa format trong `auth.module.ts`**

```diff
- signOptions: { expiresIn: cs.get<number>('JWT_ACCESS_EXPIRES') || 900 }
+ signOptions: { expiresIn: `${cs.get<number>('JWT_ACCESS_EXPIRES') || 3600}s` }
```

**Giải thích:**
- Thêm backticks và `s` suffix để match format của `auth.service.ts`
- Đảm bảo JWT hiểu là SECONDS chứ không phải milliseconds

### **Fix 3: Tăng `maxAge` của access_token cookie lên 1 giờ (2 chỗ)**

**Chỗ 1: Hàm `login()`**
```diff
  res.cookie('access_token', result.accessToken, {
    ...cookieOptions,
-   maxAge: 15 * 60 * 1000, // 15 minutes
+   maxAge: 60 * 60 * 1000, // 1 hour (khớp với JWT expiry)
  });
```

**Chỗ 2: Hàm `refresh()`**
```diff
  res.cookie('access_token', result.accessToken, {
    ...cookieOptions,
-   maxAge: 15 * 60 * 1000, // 15 minutes
+   maxAge: 60 * 60 * 1000, // 1 hour (khớp với JWT expiry)
  });
```

## 🎯 **KẾT QUẢ SAU KHI FIX**

### **Access Token Expiry:**
- JWT expiry: `3600s` = **1 giờ** ✅
- Cookie maxAge: `3600000ms` = **1 giờ** ✅
- Redis JTI TTL: `3600s` = **1 giờ** ✅

### **Refresh Token Expiry:**
- JWT expiry: `30d` (nếu rememberMe) hoặc `7d` (mặc định) ✅
- Cookie maxAge: **30 ngày** hoặc **7 ngày** ✅
- Redis RT TTL: **30 ngày** hoặc **7 ngày** ✅

### **Flow hoạt động đúng:**

1. **Login** → Access token có hiệu lực **1 giờ**
2. **F5 trang** trong vòng **1 giờ** → Cookie còn hạn → Vẫn authenticated ✅
3. **Sau 1 giờ** → Access token hết hạn → Frontend tự động gọi `/auth/refresh`
4. **Refresh thành công** → Nhận access token mới (1 giờ) ✅
5. **Sau 7 ngày** (hoặc 30 ngày nếu tick "Ghi nhớ") → Refresh token hết hạn → Phải login lại ✅

## 📝 **LƯU Ý**

- Refresh token được **rotate** (tạo mới) mỗi lần refresh
- Old refresh token bị **revoke** ngay lập tức (xóa khỏi Redis)
- JTI được dùng để **revoke** access token cũ khi tạo mới
- Frontend **KHÔNG LƯU TOKEN** trong localStorage/sessionStorage
- Frontend **CHỈ DÙNG HTTPONLY COOKIE** (bảo mật cao hơn)

## 🔒 **SECURITY BEST PRACTICES**

✅ **Access Token**: Short-lived (1 hour) - Giảm rủi ro nếu bị đánh cắp  
✅ **Refresh Token**: Long-lived (7-30 days) - Stored in HttpOnly cookie  
✅ **Token Rotation**: Refresh token mới mỗi lần refresh  
✅ **JTI-based Revocation**: Revoke access token ngay lập tức  
✅ **HttpOnly Cookie**: Chống XSS attack  
✅ **SameSite=Lax**: Chống CSRF attack (dev mode)  
✅ **Redis TTL**: Tự động xóa token hết hạn  

## 🧪 **TESTING**

### Test 1: Login và F5 trong 1 giờ
```bash
1. Login → Kiểm tra cookie `access_token` có maxAge = 3600000ms
2. F5 trang sau 5 phút → Vẫn authenticated ✅
3. F5 trang sau 30 phút → Vẫn authenticated ✅
4. F5 trang sau 59 phút → Vẫn authenticated ✅
```

### Test 2: Token tự động refresh sau 1 giờ
```bash
1. Login → Access token expires after 1h
2. Đợi 61 phút → Access token hết hạn
3. Gọi bất kỳ API nào → Frontend tự động gọi /auth/refresh
4. Nhận access token mới → Retry API gốc → Thành công ✅
```

### Test 3: Refresh token expires sau 7 ngày
```bash
1. Login (không tick "Ghi nhớ") → Refresh token expires after 7d
2. Đợi 7 ngày + 1 phút
3. Gọi /auth/refresh → 401 Unauthorized
4. Frontend redirect về /login ✅
```

## 📅 **Date Fixed**
December 11, 2025

## 👤 **Fixed By**
GitHub Copilot

---

## 🔗 **Related Files**

- `BackEnd/.env` - Token expiry configuration
- `BackEnd/src/modules/modules/auth/auth.module.ts` - JWT module config
- `BackEnd/src/modules/modules/auth/auth.service.ts` - Token generation
- `BackEnd/src/modules/modules/auth/auth.controller.ts` - Cookie management
- `FrontEnd/src/services/api.js` - Auto refresh interceptor
- `FrontEnd/src/hooks/useAuthRestore.js` - Session restore on F5
