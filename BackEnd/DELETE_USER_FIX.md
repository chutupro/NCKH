# FIX: Delete User Foreign Key Constraint Error

## 🐛 Vấn đề
Khi xóa user trong Admin Dashboard, gặp lỗi:
```
Cannot delete or update a parent row: a foreign key constraint fails
```

## ✅ Giải pháp đã áp dụng

### 1. Cập nhật `admin-users.service.ts`

Thêm logic xóa **TẤT CẢ** dữ liệu liên quan đến user theo đúng thứ tự, với **try-catch** cho từng bảng để tránh lỗi khi bảng không tồn tại:

```typescript
async deleteUser(id: number) {
  // Xóa theo thứ tự:
  // 1. Feedback ✅
  // 2. Notifications (skip if not exists)
  // 3. Likes (skip if not exists)
  // 4. Comments (skip if not exists)
  // 5. Contributions (skip if not exists)
  // 6. Moderation Logs (skip if not exists)
  // 7. Articles (skip if not exists)
  // 8. User Profile ✅
  // 9. User (cuối cùng) ✅
}
```

### 2. Cập nhật `admin.module.ts`

Thêm `Feedback` entity vào imports:
```typescript
imports: [TypeOrmModule.forFeature([Users, UserProfiles, Feedback])]
```

## 📋 Các bảng được xử lý khi xóa user

| Bảng | Foreign Key | Hành động | Trạng thái |
|------|-------------|-----------|------------|
| `feedback` | UserID | DELETE | ✅ Required |
| `notifications` | UserID | DELETE | ⚠️ Optional |
| `likes` | UserID | DELETE | ⚠️ Optional |
| `comments` | UserID | DELETE | ⚠️ Optional |
| `contributions` | UserID | DELETE | ⚠️ Optional |
| `moderation_logs` | ModeratorID | DELETE | ⚠️ Optional |
| `articles` | UserID | DELETE | ⚠️ Optional |
| `user_profiles` | UserID | DELETE | ✅ Required |

**Note:** Các bảng đánh dấu "Optional" sẽ được skip nếu không tồn tại trong database.

## 🚀 Cách sử dụng

Sau khi áp dụng fix, bạn có thể xóa user bình thường từ Admin Dashboard mà không gặp lỗi foreign key constraint hoặc table not found.

## 🔧 Xử lý lỗi

Code đã được cải tiến để:
- ✅ Xử lý gracefully khi bảng không tồn tại
- ✅ Log thông báo khi skip bảng
- ✅ Rollback nếu có lỗi không mong muốn
- ✅ Trả về message rõ ràng

## ⚠️ Lưu ý

- Việc xóa user sẽ **XÓA VĨNH VIỄN** tất cả dữ liệu liên quan (bài viết, comment, like, feedback...)
- Nên có confirmation dialog trước khi xóa
- Có thể cân nhắc thêm tính năng "soft delete" (deactivate) thay vì xóa hoàn toàn

## 🔄 Alternative: Soft Delete

Nếu muốn giữ lại dữ liệu, có thể thêm:
```typescript
// Thêm column vào User entity
@Column({ type: 'boolean', default: false })
IsDeleted: boolean;

// Thay vì xóa, chỉ cần:
user.IsDeleted = true;
await this.userRepo.save(user);
```

Sau đó filter user khi query:
```typescript
where: { IsDeleted: false }
```
