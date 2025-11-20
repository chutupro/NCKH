# 🔐 TEST BẢO MẬT AUTH - HƯỚNG DẪN CHI TIẾT

## ⚠️ QUAN TRỌNG: PHẢI LÀM ĐÚNG THỨ TỰ!

### BƯỚC 1: RESTART SERVER

```powershell
# Stop server hiện tại (Ctrl+C)
cd E:\NCKH\DUAN\NCKH\BackEnd
npm run dev
```

**Đợi thấy log:**
```
✅ Redis Connected
✅ Database Connected
[Nest] INFO [NestApplication] Nest application successfully started
```

---

### BƯỚC 2: XÓA SẠCH COOKIES VÀ TOKENS

#### 2.1. Xóa cookies trong Browser (nếu dùng browser test)
1. Mở DevTools (F12)
2. Application tab → Cookies → `http://localhost:3000`
3. Click chuột phải → Clear
4. Reload trang (F5)

#### 2.2. Xóa token trong Swagger
1. Mở Swagger: `http://localhost:3000/api`
2. Bấm nút **Authorize** 🔓 (góc phải)
3. Nếu có token → bấm **Logout**
4. Đóng popup

---

### BƯỚC 3: TEST ROUTE /users/me (CHƯA LOGIN)

**Trạng thái:** 🔴 CHƯA LOGIN, CHƯA AUTHORIZE

1. Tìm endpoint: **GET /users/me**
2. Bấm **Try it out**
3. Bấm **Execute**

**KẾT QUẢ MONG ĐỢI:**
```
❌ Response Code: 401 Unauthorized (ĐỎ)

Response Body:
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**NẾU RA 200 OK → LỖI NGHIÊM TRỌNG! BÁO NGAY!**

---

### BƯỚC 4: TEST ROUTE /users/profile/me (CHƯA LOGIN)

**Trạng thái:** 🔴 CHƯA LOGIN, CHƯA AUTHORIZE

1. Tìm endpoint: **GET /users/profile/me**
2. Bấm **Try it out**
3. Bấm **Execute**

**KẾT QUẢ MONG ĐỢI:**
```
❌ Response Code: 401 Unauthorized (ĐỎ)

Response Body:
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**NẾU RA 200 OK → LỖI NGHIÊM TRỌNG! BÁO NGAY!**

---

### BƯỚC 5: LOGIN VÀ AUTHORIZE

#### 5.1. Login
1. Tìm endpoint: **POST /auth/login**
2. Bấm **Try it out**
3. Điền:
   ```json
   {
     "email": "lvnghia2809@gmail.com",
     "password": "1212Nghia."
   }
   ```
4. Bấm **Execute**
5. Copy `accessToken` từ response

#### 5.2. Authorize trong Swagger
1. Bấm nút **Authorize** 🔓 (góc phải)
2. Paste `accessToken` vào ô **Value**
3. Bấm **Authorize**
4. Bấm **Close**

---

### BƯỚC 6: TEST ROUTE /users/me (ĐÃ LOGIN)

**Trạng thái:** 🟢 ĐÃ LOGIN, ĐÃ AUTHORIZE

1. Tìm endpoint: **GET /users/me**
2. Bấm **Try it out**
3. Bấm **Execute**

**KẾT QUẢ MONG ĐỢI:**
```
✅ Response Code: 200 OK (XANH)

Response Body:
{
  "UserID": 123,
  "Email": "lvnghia2809@gmail.com",
  "FullName": "Lê Văn Nghĩa",
  "RoleID": 1,
  "CreatedAt": "2025-11-20...",
  "IsEmailVerified": true
  
  // ✅ KIỂM TRA: KHÔNG CÓ "PasswordHash" TRONG RESPONSE!
}
```

**NẾU CÓ `PasswordHash` TRONG RESPONSE → LỖI BẢO MẬT! BÁO NGAY!**

---

### BƯỚC 7: TEST ROUTE /users/profile/me (ĐÃ LOGIN)

**Trạng thái:** 🟢 ĐÃ LOGIN, ĐÃ AUTHORIZE

1. Tìm endpoint: **GET /users/profile/me**
2. Bấm **Try it out**
3. Bấm **Execute**

**KẾT QUẢ MONG ĐỢI:**
```
✅ Response Code: 200 OK (XANH)

Response Body:
{
  "userId": 123,
  "email": "lvnghia2809@gmail.com",
  "fullName": "Lê Văn Nghĩa",
  "isEmailVerified": true,
  "createdAt": "2025-11-20...",
  "profile": {
    "avatar": "/img/default-avatar.png",
    "bio": "...",
    "totalContributions": 0,
    "totalEdits": 0,
    "totalLikes": 0
  }
  
  // ✅ KIỂM TRA: KHÔNG CÓ "PasswordHash" TRONG RESPONSE!
}
```

---

## 📋 CHECKLIST KẾT QUẢ

### ✅ PHẢI ĐẠT TẤT CẢ CÁC ĐIỀU SAU:

- [ ] **CHƯA LOGIN** → `/users/me` → **401 Unauthorized ❌**
- [ ] **CHƯA LOGIN** → `/users/profile/me` → **401 Unauthorized ❌**
- [ ] **ĐÃ LOGIN** → `/users/me` → **200 OK ✅** + KHÔNG CÓ PasswordHash
- [ ] **ĐÃ LOGIN** → `/users/profile/me` → **200 OK ✅** + KHÔNG CÓ PasswordHash

### ❌ NẾU CÓ BẤT KỲ ĐIỀU NÀO SAI:

1. **Chưa login mà ra 200 OK:**
   - Kiểm tra lại browser cookies (có thể vẫn còn token cũ)
   - Clear cookies và test lại
   - Kiểm tra Swagger Authorize đã logout chưa

2. **Response có PasswordHash:**
   - Kiểm tra UserService.sanitizeUser() có được gọi không
   - Xem log console có lỗi gì không

3. **Đã login mà vẫn 401:**
   - Kiểm tra Redis có chạy không: `redis-cli ping`
   - Xem log backend có lỗi JTI validation không

---

## 🚨 CÁC LỖI THƯỜNG GẶP

### Lỗi 1: "No valid JTI in Redis"
**Nguyên nhân:** Login xong nhưng JTI chưa được lưu vào Redis

**Giải pháp:**
1. Kiểm tra Redis có chạy: `redis-cli ping` → phải trả về `PONG`
2. Login lại
3. Check Redis: `redis-cli KEYS "access_jti:*"`

### Lỗi 2: "Token missing JTI claim"
**Nguyên nhân:** Đang dùng token cũ (được tạo trước khi thêm JTI)

**Giải pháp:**
1. Xóa cookies
2. Logout trong Swagger
3. Login lại → lấy token mới

### Lỗi 3: Chưa login mà vẫn 200 OK
**Nguyên nhân:** Browser/Swagger vẫn còn token/cookie cũ

**Giải pháp:**
1. Clear cookies hoàn toàn
2. Logout trong Swagger
3. Restart browser
4. Test lại

---

## 📸 CHỤP ẢNH ĐỂ XÁC NHẬN

**CẦN CHỤP 2 ẢNH:**

### Ảnh 1: 401 khi chưa login
- Route: `/users/me` và `/users/profile/me`
- Trạng thái: Chưa Authorize
- Response: **401 Unauthorized** (màu đỏ)

### Ảnh 2: 200 khi đã login (không có PasswordHash)
- Route: `/users/me`
- Trạng thái: Đã Authorize
- Response: **200 OK** + highlight phần response **KHÔNG CÓ** PasswordHash

**Gửi 2 ảnh này để xác nhận bảo mật đã OK!**

---

## 🎯 KẾT LUẬN

Nếu tất cả các test trên đều PASS:
- ✅ Hệ thống auth an toàn
- ✅ Không thể bypass guard
- ✅ Không lộ PasswordHash
- ✅ Sẵn sàng deploy production

Nếu có bất kỳ test nào FAIL:
- ❌ **KHÔNG DEPLOY**
- ❌ **TÌM VÀ SỬA BUG NGAY**
- ❌ **TEST LẠI TỪ ĐẦU**
