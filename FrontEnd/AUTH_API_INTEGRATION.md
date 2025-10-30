# 🔐 Authentication API Integration

## ✅ Hoàn thành

Đã tích hợp API authentication cho trang Login và Register với backend NestJS.

---

## 📁 Files đã tạo/sửa

### **Services mới:**
- `src/services/api.js` - Axios instance với interceptors (auto refresh token)
- `src/services/authService.js` - Service xử lý authentication APIs

### **Components đã cập nhật:**
- `src/pages/common/Login.jsx` - Kết nối API login
- `src/pages/common/Register.jsx` - Kết nối API register  
- `src/Styles/login-register/login.css` - Thêm style cho button disabled

---

## 🚀 Tính năng

### **1. Đăng ký (Register)**
- ✅ Validate email format
- ✅ Validate password match (password === confirmPassword)
- ✅ Validate password length (min 6 ký tự)
- ✅ Gọi API `POST /auth/register`
- ✅ Hiển thị error message khi thất bại
- ✅ Redirect về `/login` khi thành công
- ✅ Loading state khi submit

**API Endpoint:** `POST http://localhost:3000/auth/register`
```json
{
  "email": "user@example.com",
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "role": "1"
}
```

### **2. Đăng nhập (Login)**
- ✅ Gọi API `POST /auth/login`
- ✅ Lưu accessToken, refreshToken, userId vào localStorage
- ✅ Hiển thị error message khi thất bại
- ✅ Redirect về `/` (home) khi thành công
- ✅ Loading state khi submit

**API Endpoint:** `POST http://localhost:3000/auth/login`
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "UserID": 1,
    "Email": "user@example.com",
    "FullName": "Nguyễn Văn A"
  }
}
```

### **3. Auto Refresh Token**
- ✅ Axios interceptor tự động detect 401 Unauthorized
- ✅ Gọi API `POST /auth/refresh` để lấy token mới
- ✅ Retry request với token mới
- ✅ Logout + redirect `/login` nếu refresh thất bại

### **4. Đăng xuất (Logout)**
- ✅ Gọi API `POST /auth/logout` (cần access token)
- ✅ Xóa tokens khỏi localStorage
- ✅ Có thể gọi qua `authService.logout()`

---

## 🔧 LocalStorage Keys

Sau khi đăng nhập thành công, các keys được lưu:
- `accessToken` - JWT access token (15 phút)
- `refreshToken` - JWT refresh token (7 ngày)
- `userId` - ID của user
- `userEmail` - Email của user
- `userFullName` - Tên đầy đủ của user

---

## 📝 Cách sử dụng authService

```javascript
import authService from './services/authService';

// Đăng ký
const result = await authService.register(email, password, fullName);

// Đăng nhập
const result = await authService.login(email, password);

// Đăng xuất
await authService.logout();

// Kiểm tra đã login chưa
const isLoggedIn = authService.isAuthenticated();

// Lấy thông tin user hiện tại
const user = authService.getCurrentUser();
// { userId, email, fullName }
```

---

## 🎨 UI Features

- ✅ Error message box màu đỏ khi có lỗi
- ✅ Loading state trên button (text thay đổi)
- ✅ Button disabled khi đang submit
- ✅ Validation messages rõ ràng
- ✅ Responsive design (đã có từ trước)

---

## ⚙️ Backend Requirements

Backend phải chạy ở `http://localhost:3000` với các endpoints:

1. **POST /auth/register** - Đăng ký user mới
2. **POST /auth/login** - Đăng nhập, trả về tokens
3. **POST /auth/refresh** - Refresh access token
4. **POST /auth/logout** - Đăng xuất (protected route)

---

## 🧪 Testing

### Test Đăng ký:
1. Vào `/register`
2. Nhập thông tin (email, password, confirm password, fullName)
3. Click "ĐĂNG KÝ"
4. Nếu thành công → redirect `/login`
5. Nếu thất bại → hiện error message

### Test Đăng nhập:
1. Vào `/login`
2. Nhập email + password
3. Click "ĐĂNG NHẬP"
4. Nếu thành công → redirect `/` + lưu tokens
5. Nếu thất bại → hiện error message

### Test Auto Refresh:
1. Đăng nhập thành công
2. Đợi access token hết hạn (15 phút)
3. Gọi bất kỳ protected API nào
4. Axios tự động refresh và retry request

---

## 🔒 Security Notes

- ✅ Passwords không được log ra console
- ✅ Tokens được lưu trong localStorage (có thể upgrade lên httpOnly cookie)
- ✅ Auto refresh token khi hết hạn
- ✅ Clear tokens khi logout hoặc refresh thất bại
- ✅ CORS phải được config đúng ở backend

---

## 🐛 Troubleshooting

### Lỗi CORS:
Backend cần enable CORS cho `http://localhost:5173` (Vite dev server)

### Lỗi 401 liên tục:
- Kiểm tra token có được lưu đúng không
- Kiểm tra JWT_SECRET giống nhau giữa login và refresh

### API không response:
- Kiểm tra backend có chạy ở port 3000 không
- Kiểm tra network tab trong DevTools

---

## 📦 Next Steps

- [ ] Thêm "Remember Me" functionality
- [ ] Thêm "Forgot Password" flow
- [ ] Thêm Google/Facebook OAuth
- [ ] Protected routes (redirect nếu chưa login)
- [ ] User profile page
- [ ] Token refresh trước khi hết hạn (proactive refresh)

---

**Created:** October 30, 2025  
**Status:** ✅ Production Ready
