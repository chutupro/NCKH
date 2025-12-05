# 🔧 Hướng Dẫn Sửa Lỗi Auth & Database

## 📋 Tổng Quan Các Lỗi Đã Fix

### 1. ❌ Lỗi Database: `Unknown column 'article.Moderation'`
**Nguyên nhân:** Cột `Moderation` chưa tồn tại trong bảng `Articles` của database.

**Giải pháp:** Đã tạo migration file để thêm cột này.

### 2. ❌ Lỗi Auth: Bị logout sau 5-15 phút
**Nguyên nhân:** 
- Access token bị hardcode `expiresIn: '15m'` thay vì dùng giá trị từ `.env`
- Redis TTL cho JTI cũng bị hardcode 900 giây (15 phút)

**Giải pháp:** 
- Đã sửa code để sử dụng `JWT_ACCESS_EXPIRES=3600` từ `.env` (1 giờ)
- Redis TTL cho JTI giờ đây khớp với access token expiry

---

## 🚀 Các Bước Thực Hiện

### Bước 1: Chạy Migration SQL

Bạn có **2 cách** để chạy migration:

#### **Cách 1: Chạy qua MySQL Workbench / phpMyAdmin (Khuyến nghị)**

1. Mở MySQL Workbench hoặc phpMyAdmin
2. Kết nối đến database `DaNangDynamicVault`
3. Mở file: `BackEnd/src/migrations/20241205-add-moderation-column.sql`
4. Chạy SQL sau:

```sql
ALTER TABLE Articles 
ADD COLUMN Moderation JSON NULL
COMMENT 'Stores AI moderation results in JSON format';
```

**Lưu ý:** Nếu MySQL của bạn không hỗ trợ kiểu `JSON` (phiên bản cũ), dùng lệnh này:

```sql
ALTER TABLE Articles 
ADD COLUMN Moderation TEXT NULL
COMMENT 'Stores AI moderation results in JSON format';
```

#### **Cách 2: Chạy qua Terminal/Command Line**

```powershell
# Di chuyển đến thư mục BackEnd
cd E:\NCKH\DUAN\NCKH\BackEnd

# Chạy migration
mysql -u root -p DaNangDynamicVault < src/migrations/20241205-add-moderation-column.sql
```

### Bước 2: Kiểm Tra Cột Đã Được Thêm

Chạy query sau trong MySQL:

```sql
DESCRIBE Articles;
```

Bạn phải thấy cột `Moderation` với kiểu `JSON` hoặc `TEXT`.

### Bước 3: Restart Backend Server

```powershell
# Tắt server hiện tại (Ctrl+C)

# Di chuyển đến BackEnd
cd E:\NCKH\DUAN\NCKH\BackEnd

# Khởi động lại
npm run start:dev
```

### Bước 4: Clear Redis Cache (Tùy chọn nhưng khuyến nghị)

Để đảm bảo không còn token cũ với TTL sai:

```powershell
# Chạy script clear Redis
node scripts/clear-redis.js
```

Hoặc dùng Redis CLI:

```bash
redis-cli
FLUSHDB
exit
```

### Bước 5: Test Lại

1. **Logout** khỏi tất cả tài khoản hiện tại
2. **Login** lại
3. Kiểm tra:
   - ✅ Không bị logout sau 5 phút
   - ✅ Có thể truy cập admin panel mà không bị đá ra
   - ✅ Không còn lỗi `Unknown column 'Moderation'`

---

## ⚙️ Cấu Hình Đã Thay Đổi

### File: `.env`
```env
# Access token giờ đây có hiệu lực 1 giờ (3600 giây)
JWT_ACCESS_EXPIRES=3600

# Refresh token: 30 ngày (2592000 giây)
JWT_REFRESH_EXPIRES=2592000
```

### File: `auth.service.ts`
- ✅ Sử dụng `JWT_ACCESS_EXPIRES` từ `.env` thay vì hardcode `'15m'`
- ✅ Redis TTL cho JTI động theo `accessTokenExpiry`

### File: `redis.service.ts`
- ✅ `setAccessJti()` giờ nhận tham số `ttlSeconds` (mặc định 3600)

---

## 🧪 Test Cases

### Test 1: Access Token Expiry
```
1. Login vào hệ thống
2. Đợi 20 phút (> 15 phút cũ, < 1 giờ mới)
3. Refresh trang hoặc gọi API
4. ✅ Kỳ vọng: Vẫn đăng nhập, không bị logout
```

### Test 2: Database Query
```
1. Truy cập /collections
2. Truy cập /articles_post
3. ✅ Kỳ vọng: Không còn lỗi "Unknown column 'Moderation'"
```

### Test 3: Admin Panel
```
1. Login với tài khoản admin
2. Vào trang quản lý contributions
3. Đợi 20 phút
4. Click vào tab khác trong admin
5. ✅ Kỳ vọng: Vẫn truy cập được, không bị đá về login
```

---

## 📝 Ghi Chú Quan Trọng

### Về Thời Gian Token

| Loại Token | Thời Gian Cũ | Thời Gian Mới | Mục Đích |
|-----------|--------------|---------------|----------|
| Access Token | 15 phút | **1 giờ** | Tránh logout liên tục |
| Refresh Token (không remember) | 7 ngày | 7 ngày | Không đổi |
| Refresh Token (remember me) | 30 ngày | 30 ngày | Không đổi |

### Về Redis TTL

- **Access Token JTI:** 3600 giây (1 giờ) - khớp với JWT expiry
- **Refresh Token Hash:** 
  - 7 ngày (604800s) nếu không chọn "Ghi nhớ đăng nhập"
  - 30 ngày (2592000s) nếu chọn "Ghi nhớ đăng nhập"

### Tùy Chỉnh Thời Gian (Nếu Cần)

Nếu bạn muốn thay đổi thời gian, chỉ cần sửa file `.env`:

```env
# Ví dụ: Access token 2 giờ
JWT_ACCESS_EXPIRES=7200

# Ví dụ: Access token 30 phút
JWT_ACCESS_EXPIRES=1800
```

**Không cần** sửa code, hệ thống sẽ tự động áp dụng!

---

## 🐛 Troubleshooting

### Vẫn bị logout sau vài phút?

1. Kiểm tra Redis có đang chạy không:
   ```powershell
   redis-cli ping
   # Phải trả về: PONG
   ```

2. Clear Redis cache:
   ```powershell
   cd BackEnd
   node scripts/clear-redis.js
   ```

3. Logout và login lại

### Vẫn còn lỗi "Unknown column 'Moderation'"?

1. Kiểm tra lại migration đã chạy chưa:
   ```sql
   DESCRIBE Articles;
   ```

2. Nếu chưa có cột, chạy lại lệnh ALTER TABLE ở Bước 1

3. Restart backend server

### Redis connection error?

Kiểm tra `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## ✅ Checklist Hoàn Thành

- [ ] Đã chạy migration thêm cột `Moderation`
- [ ] Đã restart backend server
- [ ] Đã clear Redis cache
- [ ] Đã logout và login lại
- [ ] Không còn lỗi database
- [ ] Không bị logout sau 5-15 phút
- [ ] Admin panel hoạt động bình thường

---

## 📞 Hỗ Trợ

Nếu vẫn gặp vấn đề, cung cấp thông tin sau:

1. Output của `DESCRIBE Articles;`
2. Log từ backend terminal (lỗi nếu có)
3. Thời gian bị logout (nếu vẫn xảy ra)
4. Phiên bản MySQL/MariaDB: `SELECT VERSION();`
