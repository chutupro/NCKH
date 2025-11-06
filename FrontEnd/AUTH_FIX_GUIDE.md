# 🔐 Hướng dẫn Fix: F5 Logout & Error Message Flickering

## 🎯 Tóm tắt Vấn đề

### Vấn đề 1: F5/Refresh → Mất Session (401 Unauthorized)
**Nguyên nhân:**
- JWT `accessToken` chỉ lưu trong React state (memory)
- Khi F5, tất cả React state bị reset → mất token
- App không có logic restore session khi mount

**Giải pháp:**
- ✅ Sử dụng **HttpOnly cookie** cho `refresh_token` (đã có)
- ✅ Thêm **Session Recovery** khi app khởi động
- ✅ Gọi `/auth/refresh` để lấy token mới từ cookie

### Vấn đề 2: Error Message nháy rồi mất
**Nguyên nhân:**
- Navigate quá nhanh sau login thành công
- Toast notification không đủ thời gian hiển thị

**Giải pháp:**
- ✅ Sử dụng **Toast notifications** (react-toastify)
- ✅ Delay navigate để user thấy message
- ✅ Inline error + Toast cho UX tốt hơn

---

## 🔧 Code Changes

### 1. **Frontend: Session Restore Hook**

**File:** `src/hooks/useAuthRestore.js` (MỚI)

```javascript
import { useEffect, useContext, useRef } from 'react';
import AppContext from '../context/context';
import authService from '../services/authService';

export const useAuthRestore = () => {
  const { setUser, setIsAuthenticated, setAccessToken } = useContext(AppContext);
  const hasAttemptedRestore = useRef(false);

  useEffect(() => {
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      try {
        console.log('[Auth Restore] Attempting to restore session...');

        const response = await authService.refreshToken();

        if (!response?.accessToken) {
          console.log('[Auth Restore] No valid refresh token found');
          return;
        }

        const { accessToken, user } = response;
        
        const normalizedUser = {
          userId: user?.userId || user?.UserID || null,
          email: user?.email || user?.Email || '',
          fullName: user?.fullName || user?.FullName || '',
          roleId: user?.roleId || user?.RoleID || null,
        };

        setAccessToken(accessToken);
        setUser(normalizedUser);
        setIsAuthenticated(true);

        console.log('[Auth Restore] Session restored successfully', normalizedUser);
      } catch (error) {
        console.log('[Auth Restore] No valid session to restore', error.message);
      }
    };

    restoreSession();
  }, [setUser, setIsAuthenticated, setAccessToken]);
};
```

**Cách hoạt động:**
1. Hook chạy **1 lần** khi App mount (sử dụng `useRef`)
2. Gọi `/auth/refresh` với HttpOnly cookie
3. Nếu có cookie hợp lệ → restore user + token vào state
4. Nếu không → giữ trạng thái logout (không redirect)

---

### 2. **Frontend: App.jsx - Sử dụng Hook**

**File:** `src/App.jsx`

```javascript
import React from 'react'
import "./App.css";
import AppRoutes from "./routes/Routee";
import { useSetupApiAuth } from "./hooks/useSetupApiAuth";
import { useAuthRestore } from "./hooks/useAuthRestore"; // ✅ THÊM
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useSetupApiAuth();
  useAuthRestore(); // ✅ RESTORE SESSION SAU REFRESH
  
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  )
}

export default App;
```

---

### 3. **Frontend: Login.jsx - Toast Notifications**

**File:** `src/pages/common/Login.jsx`

**Thay đổi:**
1. Import `toast` từ `react-toastify`
2. Thêm toast cho từng loại error (validation, API error)
3. Delay navigate 500ms để toast hiện ra

```javascript
import { toast } from 'react-toastify'

const onSubmit = async (e) => {
  e.preventDefault()
  
  // Validation với toast
  if (!email.trim() || !password.trim()) {
    setError('Không được để trống.')
    toast.error('Không được để trống.', {
      position: 'top-right',
      autoClose: 5000,
    })
    return
  }

  // ... other validations

  try {
    const response = await authService.login(email, password)
    
    // Normalize user
    const normalizedUser = { ... };

    setAccessToken(response.accessToken);
    setUser(normalizedUser);
    setIsAuthenticated(true);
    
    // ✅ TOAST SUCCESS
    toast.success(`Chào mừng trở lại, ${normalizedUser.fullName || normalizedUser.email}!`, {
      position: 'top-right',
      autoClose: 3000,
    })
    
    window.dispatchEvent(new Event('userLoggedIn'))
    
    // ✅ DELAY NAVIGATE để toast hiện
    setTimeout(() => {
      navigate('/')
    }, 500)
  } catch (err) {
    const errorMessage = err?.message || 'Email hoặc mật khẩu không đúng.'
    
    setError(errorMessage)
    // ✅ TOAST ERROR - PERSIST TRÊN MÀN HÌNH
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      pauseOnHover: true,
    })
  } finally {
    setLoading(false)
  }
}
```

---

### 4. **Backend: auth.controller.ts - Trả về User trong Refresh**

**File:** `src/modules/modules/auth/auth.controller.ts`

```typescript
@Post('refresh')
async refresh(
  @Req() req: any,
  @Res({ passthrough: true }) res: Response,
  @Headers('user-agent') userAgent: string,
) {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token không tồn tại');
  }

  const decoded: any = this.authService['jwtService'].decode(refreshToken);
  const userId = decoded?.sub;

  const result = await this.authService.refreshTokens(userId, refreshToken, userAgent);

  // Set cookies
  res.cookie('access_token', result.accessToken, { ... });
  res.cookie('refresh_token', result.refreshToken, { ... });

  // ✅ TRẢ VỀ USER INFO
  return {
    accessToken: result.accessToken,
    user: result.user, // ✅ THÊM
    message: 'Token refreshed successfully',
  };
}
```

---

### 5. **Backend: auth.service.ts - Update refreshTokens**

**File:** `src/modules/modules/auth/auth.service.ts`

```typescript
async refreshTokens(userId: number, refreshToken: string, deviceInfo?: string) {
  // ... validation logic ...

  const user = await this.userService.findById(userId);
  if (!user) throw new UnauthorizedException('Không tìm thấy user');

  // ... token rotation logic ...

  const newTokens = await this.getTokens(user);
  
  // ... save to Redis ...

  // ✅ TRẢ VỀ CẢ USER INFO
  return { 
    accessToken: newTokens.access_token, 
    refreshToken: newTokens.refresh_token,
    user: {
      userId: user.UserID,
      email: user.Email,
      fullName: user.FullName,
      roleId: user.RoleID,
    }
  };
}
```

---

## 🧪 Test Cases

### Test 1: Session Restore sau F5
```javascript
// Bước 1: Đăng nhập thành công
1. Mở http://localhost:5173/login
2. Nhập email + password đúng
3. Submit → Redirect về trang chủ
4. Kiểm tra console: "Login successful"
5. Kiểm tra Application > Cookies → Có refresh_token

// Bước 2: Test F5
6. Ấn F5 hoặc Ctrl+R
7. Kiểm tra console: "[Auth Restore] Attempting to restore session..."
8. Nếu thành công: "[Auth Restore] Session restored successfully"
9. User vẫn đăng nhập, không bị redirect về /login

// Bước 3: Test sau khi hết hạn
10. Xóa cookie refresh_token (Application > Cookies > Delete)
11. Ấn F5
12. Console: "[Auth Restore] No valid session to restore"
13. User ở trạng thái logout (navbar hiện "Đăng nhập")
```

**Console Log mong đợi:**
```
[Auth Restore] Attempting to restore session...
✅ [AuthController] Cookies set for login: { ... }
[Auth Restore] Session restored successfully { userId: 1, email: 'test@gmail.com', ... }
```

### Test 2: Error Message Persistence
```javascript
// Test với sai password
1. Mở /login
2. Nhập email đúng, password SAI
3. Submit
4. Kiểm tra:
   - Toast error hiện ở góc phải màn hình (5 giây)
   - Inline error box hiện dưới tiêu đề "Đăng nhập"
   - Form KHÔNG reload (giữ nguyên email đã nhập)

// Test validation error
5. Xóa hết email và password
6. Submit
7. Kiểm tra:
   - Toast error: "Không được để trống."
   - Inline error box hiện
   - Form vẫn giữ nguyên

// Test thành công
8. Nhập email + password ĐÚNG
9. Submit
10. Kiểm tra:
    - Toast success: "Chào mừng trở lại, [Name]!"
    - Delay 500ms trước khi redirect
    - Redirect về trang chủ
```

**UI mong đợi:**

**Error State:**
```
┌─────────────────────────────────────────┐
│  Đăng nhập                               │
├─────────────────────────────────────────┤
│  ⚠️ Email hoặc mật khẩu không đúng.      │ ← Inline error
│                                          │
│  Email: test@gmail.com                   │
│  Password: ••••••                        │
│  [ĐĂNG NHẬP]                             │
└─────────────────────────────────────────┘

🔴 Toast (top-right): Email hoặc mật khẩu không đúng. ← Persist 5s
```

---

## 🔒 Security Checklist

- [x] **HttpOnly cookies** cho refresh_token (XSS protection)
- [x] **Token rotation** mỗi lần refresh (invalidate old token)
- [x] **Redis TTL** cho refresh token (7 ngày)
- [x] **CORS credentials: true** (allow cookies cross-origin)
- [x] **No JWT in localStorage** (tránh XSS)
- [x] **Generic error messages** ("Email hoặc mật khẩu không đúng" - không lộ email tồn tại)

### ⚠️ Lưu ý Bảo mật

1. **Không decode JWT ở client để lấy user info:**
   - ❌ SAI: `parseJWT(accessToken)` ở client
   - ✅ ĐÚNG: Backend trả về user info trong `/auth/refresh`

2. **HttpOnly cookie không truy cập được từ JavaScript:**
   ```javascript
   // ❌ Không hoạt động
   document.cookie; // Không thấy refresh_token

   // ✅ Cookie tự động gửi trong request
   fetch('/auth/refresh', { credentials: 'include' })
   ```

3. **CSRF Protection:**
   - Production: Dùng `sameSite: 'strict'` hoặc `'lax'`
   - Dev: Dùng `'lax'` cho localhost cross-port

---

## 🚀 Deployment Notes

### Development (.env)
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
```

### Production (.env.production)
```env
NODE_ENV=production
FRONTEND_URL=https://danang-history.com
BACKEND_URL=https://api.danang-history.com
JWT_SECRET=<strong-random-key-256-bit>
REFRESH_TOKEN_SECRET=<another-strong-key>
```

**Cookie Settings Production:**
```javascript
{
  httpOnly: true,
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  domain: '.danang-history.com', // Share subdomain
}
```

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER LOGIN FLOW                       │
└─────────────────────────────────────────────────────────┘

1. User submit login form
   ↓
2. POST /auth/login → Backend
   ↓
3. Backend validate → Generate JWT + Refresh Token
   ↓
4. Set HttpOnly cookies:
   - access_token (15 min)
   - refresh_token (7 days)
   ↓
5. Return to client: { accessToken, user }
   ↓
6. Frontend save to React State:
   - setAccessToken(accessToken)
   - setUser(user)
   - setIsAuthenticated(true)
   ↓
7. Navigate to home page
   ↓
8. ✅ USER LOGGED IN

┌─────────────────────────────────────────────────────────┐
│                 F5 REFRESH FLOW                          │
└─────────────────────────────────────────────────────────┘

1. User press F5
   ↓
2. React State RESET (all state → initial)
   ↓
3. App.jsx mount → useAuthRestore() hook runs
   ↓
4. POST /auth/refresh (cookie auto-sent)
   ↓
5. Backend verify refresh_token from cookie
   ↓
6. Generate new access_token + rotate refresh_token
   ↓
7. Return: { accessToken, user }
   ↓
8. Frontend restore state:
   - setAccessToken(accessToken)
   - setUser(user)
   - setIsAuthenticated(true)
   ↓
9. ✅ SESSION RESTORED (user still logged in)
```

---

## 🐛 Troubleshooting

### Vấn đề: F5 vẫn logout
**Kiểm tra:**
```javascript
// 1. Kiểm tra cookie tồn tại
console.log(document.cookie); // Không thấy refresh_token? → OK (HttpOnly)

// 2. Kiểm tra Network tab
// - Request /auth/refresh có Cookie header?
// - Response status 200 hay 401?

// 3. Kiểm tra console log
// - "[Auth Restore] Attempting to restore session..." có hiện?
// - "[Auth Restore] Session restored successfully" có hiện?

// 4. Kiểm tra backend cookie settings
// - domain: 'localhost' (dev) hoặc '.yourdomain.com' (prod)
// - sameSite: 'lax' (dev) hoặc 'strict' (prod)
```

### Vấn đề: Toast không hiện
**Kiểm tra:**
```javascript
// 1. Đã import ToastContainer?
// App.jsx:
<ToastContainer />

// 2. Đã import CSS?
import 'react-toastify/dist/ReactToastify.css';

// 3. Kiểm tra toast config
toast.error('Test', {
  position: 'top-right',
  autoClose: 5000,
});
```

### Vấn đề: CORS error với cookie
**Backend fix:**
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // ✅ QUAN TRỌNG
});
```

**Frontend fix:**
```javascript
// api.js
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // ✅ QUAN TRỌNG
});
```

---

## 📈 Performance Tips

1. **Lazy load useAuthRestore:**
   - Chỉ chạy khi cần (useRef prevents re-run)
   - Không block UI rendering

2. **Toast configuration:**
   ```javascript
   <ToastContainer
     position="top-right"
     autoClose={5000}
     limit={3} // Max 3 toasts cùng lúc
     newestOnTop
   />
   ```

3. **Cache user profile:**
   - Lưu user profile vào localStorage (non-sensitive data)
   - Restore nhanh hơn khi F5

---

## ✅ Checklist Hoàn thành

- [x] Tạo `useAuthRestore` hook
- [x] Update `App.jsx` để sử dụng hook
- [x] Update `Login.jsx` với toast notifications
- [x] Update backend `/auth/refresh` trả về user
- [x] Update `authService.js` để parse user từ refresh
- [x] Test F5 không logout
- [x] Test error messages persist
- [x] Viết tài liệu đầy đủ

---

## 🎓 Best Practices Summary

1. **Token Storage:**
   - ✅ Access token: React state (memory)
   - ✅ Refresh token: HttpOnly cookie
   - ❌ Không dùng localStorage cho tokens

2. **Error Handling:**
   - ✅ Inline error + Toast (dual approach)
   - ✅ Generic messages cho security
   - ✅ Auto-clear error khi user type

3. **Session Management:**
   - ✅ Auto-restore on mount
   - ✅ Token rotation on refresh
   - ✅ Redis để invalidate tokens

4. **UX:**
   - ✅ Toast cho feedback nhanh
   - ✅ Loading states
   - ✅ Smooth transitions (delay navigate)

---

## 📚 Tài liệu Tham khảo

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [React Toastify Docs](https://fkhadra.github.io/react-toastify/introduction)
- [HttpOnly Cookies Security](https://owasp.org/www-community/HttpOnly)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

