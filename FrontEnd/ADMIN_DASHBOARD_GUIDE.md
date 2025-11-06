# 🎛️ ADMIN DASHBOARD - HƯỚNG DẪN SỬ DỤNG

## 📋 Tổng Quan

Admin Dashboard hiện đại cho dự án "Hành trình Đà Nẵng qua thời gian" với đầy đủ tính năng quản lý.

### ✅ Đã Tạo

#### Components
- `AdminLayout.jsx` - Layout chính với sidebar + navbar
- `AdminSidebar.jsx` - Sidebar menu responsive
- `AdminNavbar.jsx` - Top navbar với search, notifications, user menu
- `StatsCard.jsx` - Card thống kê tái sử dụng

#### Pages
1. **AdminDashboard.jsx** - Dashboard chính
   - Stats cards (người dùng, bài viết, chờ duyệt, lượt xem)
   - Bảng bài viết gần đây
   - Hoạt động gần đây
   - Thao tác nhanh

2. **UserManagement.jsx** - Quản lý người dùng ✅
   - Bảng danh sách user (ID, tên, email, vai trò, trạng thái)
   - Gán vai trò: Viewer, Editor, Moderator, Admin
   - Khóa/mở khóa tài khoản
   - Xóa user
   - Stats: Tổng user, hoạt động, bị khóa, moderator

3. **ContentModeration.jsx** - Quản lý nội dung ✅
   - Bảng bài viết (tiêu đề, tác giả, danh mục, trạng thái, lượt xem)
   - Duyệt bài viết (Approve)
   - Từ chối bài viết (Reject với lý do)
   - Xóa bài viết
   - Filter: All, Pending, Approved, Rejected
   - Stats: Tổng bài viết, chờ duyệt, đã duyệt, từ chối

4. **AIModels.jsx** - Quản lý AI Models ✅
   - **PLACEHOLDER** - Tính năng đang phát triển
   - Banner cảnh báo
   - Bảng danh sách model (name, version, status, accuracy, last trained)
   - Start/Stop model (fake action)
   - View metrics, config
   - Stats: Tổng models, running, stopped, avg accuracy

5. **SystemMonitor.jsx** - Giám sát hệ thống ✅
   - Real-time stats: CPU, RAM, Disk, Network (auto-update 3s)
   - Progress bars hiển thị usage
   - Services status (Web Server, Database, Redis, Media Service, AI Service)
   - Start/Stop/Restart services
   - System logs (Error, Warning, Info)
   - **Restart Docker** button (fake action)

6. **RolePermissions.jsx** - Phân quyền & RBAC ✅
   - Hiển thị role hiện tại của admin
   - Danh sách vai trò: Admin, Moderator, Editor, Viewer
   - Chi tiết quyền cho từng role
   - Permissions matrix (Content, Users, System, AI)
   - Checkbox enable/disable permissions
   - Giải thích RBAC + code examples

#### Styles
- `AdminDashboard.css` - Full responsive CSS với:
  - Sidebar: Dark gradient, collapsible (260px → 80px)
  - Navbar: Fixed top, search, notifications, user dropdown
  - Stats cards: Gradient icons, hover effects
  - Data tables: Striped, hover, status badges
  - Responsive breakpoints (mobile, tablet, desktop)

#### Routes
```jsx
/admin                    → Dashboard chính
/admin/users              → Quản lý người dùng
/admin/content            → Quản lý nội dung
/admin/ai-models          → AI Models (placeholder)
/admin/system-monitor     → Giám sát hệ thống
/admin/permissions        → Phân quyền
```

---

## 🚀 Cách Sử Dụng

### 1. Truy Cập Admin Dashboard

```
http://localhost:5173/admin
```

**Yêu cầu:** User phải đăng nhập và có vai trò `Admin` hoặc `Moderator`.

### 2. Navigation

**Sidebar Menu:**
- Click vào menu items để chuyển trang
- Click nút `←` ở header sidebar để thu gọn
- Menu tự động highlight active page

**Navbar:**
- 🔍 Search: Tìm kiếm nhanh
- 🔔 Notifications: Thông báo (badge hiển thị số lượng)
- 💬 Messages: Tin nhắn
- User Menu: Click avatar → Dropdown (Hồ sơ, Cài đặt, Đăng xuất)

### 3. Quản Lý Người Dùng

**Gán vai trò:**
```jsx
// Dropdown trong bảng → Chọn role mới
// Backend API cần có:
PATCH /admin/users/:userId/role
Body: { role: 'Editor' }
```

**Khóa/Mở tài khoản:**
```jsx
// Click nút "🔒 Khóa" hoặc "🔓 Mở"
// Backend API:
PATCH /admin/users/:userId/status
Body: { status: 'inactive' | 'active' }
```

**Xóa user:**
```jsx
// Click nút "🗑️" → Confirm dialog
// Backend API:
DELETE /admin/users/:userId
```

### 4. Quản Lý Nội Dung

**Duyệt bài viết:**
```jsx
// Click "✅ Duyệt" trong bảng
// Backend API:
PATCH /admin/articles/:articleId/approve
```

**Từ chối bài viết:**
```jsx
// Click "❌ Từ chối" → Nhập lý do
// Backend API:
PATCH /admin/articles/:articleId/reject
Body: { reason: 'Nội dung không phù hợp' }
```

**Filter:**
```jsx
// Dropdown: All, Pending, Approved, Rejected
// Tự động fetch data theo filter
```

### 5. AI Models (Placeholder)

**Hiện tại:**
- UI đầy đủ nhưng chỉ là **placeholder**
- Start/Stop buttons có sẵn (disabled hoặc fake action)
- Chuẩn bị cho tích hợp AI sau này

**Khi tích hợp thật:**
```jsx
// Start model:
POST /admin/ai-models/:modelId/start

// Stop model:
POST /admin/ai-models/:modelId/stop

// View metrics:
GET /admin/ai-models/:modelId/metrics
```

### 6. Giám Sát Hệ Thống

**Real-time Stats:**
- CPU, RAM, Disk, Network tự động update mỗi 3s
- Progress bars thay đổi màu khi vượt ngưỡng (>80% → đỏ)

**Services Management:**
```jsx
// Start service:
POST /admin/services/:serviceName/start

// Stop service:
POST /admin/services/:serviceName/stop

// Restart Docker (fake action hiện tại):
POST /admin/docker/restart
```

**Logs:**
- Filter theo level: All, Errors, Warnings, Info
- Download logs: Click "📥 Download"
- Refresh: Click "🔄 Refresh"

### 7. Phân Quyền (RBAC)

**Xem quyền:**
- Click vào role card để xem chi tiết permissions
- Checkbox hiển thị quyền hiện tại

**Chỉnh sửa quyền:**
```jsx
// Toggle checkbox → Click "💾 Lưu thay đổi"
// Backend API:
PATCH /admin/roles/:roleName/permissions
Body: { permissions: ['content.read', 'content.create', ...] }
```

**Áp dụng RBAC trong code:**
```jsx
// Frontend:
{user.hasPermission('content.delete') && (
  <button onClick={deletePost}>Xóa bài viết</button>
)}

// Backend (NestJS):
@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('content.delete')
async deleteArticle(@Param('id') id: number) {
  // Logic xóa
}
```

---

## 🔌 Tích Hợp Backend API

### User Management

```typescript
// BackEnd/src/modules/admin/admin-users.controller.ts
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class AdminUsersController {
  
  @Get()
  async getAllUsers(@Query('search') search?: string) {
    // Trả về danh sách users với filter
  }

  @Patch(':userId/role')
  async updateRole(@Param('userId') userId: number, @Body() dto: { role: string }) {
    // Cập nhật vai trò
  }

  @Patch(':userId/status')
  async toggleStatus(@Param('userId') userId: number, @Body() dto: { status: string }) {
    // Khóa/mở tài khoản
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: number) {
    // Xóa user
  }
}
```

### Content Moderation

```typescript
// BackEnd/src/modules/admin/admin-content.controller.ts
@Controller('admin/articles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class AdminContentController {

  @Get()
  async getAllArticles(@Query('status') status?: string) {
    // Trả về danh sách articles với filter status
  }

  @Patch(':articleId/approve')
  async approveArticle(@Param('articleId') articleId: number) {
    // Duyệt bài viết
    // Update status = 'approved', CreatedAt = now
  }

  @Patch(':articleId/reject')
  async rejectArticle(
    @Param('articleId') articleId: number,
    @Body() dto: { reason: string }
  ) {
    // Từ chối bài viết
    // Update status = 'rejected', lưu lý do
    // Gửi email thông báo cho tác giả
  }

  @Delete(':articleId')
  async deleteArticle(@Param('articleId') articleId: number) {
    // Xóa bài viết + images liên quan
  }
}
```

### System Monitor

```typescript
// BackEnd/src/modules/admin/admin-system.controller.ts
@Controller('admin/system')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminSystemController {

  @Get('stats')
  async getSystemStats() {
    // Trả về CPU, RAM, Disk, Network usage
    // Sử dụng: os-utils, systeminformation packages
  }

  @Get('services')
  async getServicesStatus() {
    // Trả về status của các services
    // Check Docker containers, Database connections, etc.
  }

  @Get('logs')
  async getLogs(@Query('level') level?: string) {
    // Trả về system logs từ file hoặc database
  }

  @Post('docker/restart')
  async restartDocker() {
    // Execute: docker-compose restart
    // CẢNH BÁO: Hệ thống sẽ downtime vài giây
  }
}
```

---

## 🎨 Customization

### Thay Đổi Màu Sắc

File: `FrontEnd/src/Styles/Admin/AdminDashboard.css`

```css
:root {
  --admin-primary: #3b82f6;        /* Màu chính */
  --admin-secondary: #8b5cf6;      /* Màu phụ */
  --admin-success: #10b981;         /* Màu thành công */
  --admin-warning: #f59e0b;         /* Màu cảnh báo */
  --admin-danger: #ef4444;          /* Màu nguy hiểm */
  --sidebar-width: 260px;           /* Chiều rộng sidebar */
  --navbar-height: 70px;            /* Chiều cao navbar */
}
```

### Thêm Menu Item Mới

File: `FrontEnd/src/Component/admin/AdminSidebar.jsx`

```jsx
const menuItems = [
  // ...
  {
    section: 'Custom Section',
    items: [
      { path: '/admin/custom', icon: '🎨', label: 'Custom Page', badge: null },
    ],
  },
];
```

### Thêm Trang Admin Mới

1. **Tạo component:**
```jsx
// FrontEnd/src/pages/admin/CustomPage.jsx
import React from 'react';

const CustomPage = () => {
  return (
    <div>
      <h1>Custom Page</h1>
      {/* Your content */}
    </div>
  );
};

export default CustomPage;
```

2. **Thêm route:**
```jsx
// FrontEnd/src/routes/Routee.jsx
import CustomPage from "../pages/admin/CustomPage";

<Route path="/admin" element={<AdminLayout />}>
  {/* ... */}
  <Route path="custom" element={<CustomPage />} />
</Route>
```

---

## 🔐 RBAC Implementation

### Frontend: Permission Check

```jsx
// FrontEnd/src/hooks/usePermission.js
import { useAppContext } from '../context/useAppContext';

export const usePermission = () => {
  const { user } = useAppContext();

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.Role === 'Admin') return true; // Admin bypass
    
    // Check permissions từ API hoặc local state
    return user.permissions?.includes(permission);
  };

  return { hasPermission };
};
```

**Sử dụng:**
```jsx
import { usePermission } from '../../hooks/usePermission';

const Component = () => {
  const { hasPermission } = usePermission();

  return (
    <>
      {hasPermission('content.delete') && (
        <button onClick={handleDelete}>Xóa</button>
      )}
    </>
  );
};
```

### Backend: Permission Guard

```typescript
// BackEnd/src/modules/common/decorators/require-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (permission: string) => 
  SetMetadata(PERMISSION_KEY, permission);
```

```typescript
// BackEnd/src/modules/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) return true;

    const { user } = context.switchToHttp().getRequest();
    
    // Admin bypass
    if (user.role === 'Admin') return true;

    // Check permission
    return user.permissions?.includes(requiredPermission);
  }
}
```

**Sử dụng:**
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('content.delete')
async deleteArticle(@Param('id') id: number) {
  // Chỉ user có permission 'content.delete' mới vào được
}
```

---

## 📱 Responsive Design

- **Desktop (>768px):** Full sidebar + content
- **Tablet:** Sidebar collapsible
- **Mobile (<768px):** 
  - Sidebar hidden, show overlay khi mở
  - Stats cards: 1 column
  - Tables: Horizontal scroll

---

## 🐛 Troubleshooting

### Sidebar không hiển thị
- Check CSS import trong `AdminLayout.jsx`
- Verify routes trong `Routee.jsx`

### Stats không cập nhật
- Check `useEffect` dependencies
- Verify API endpoints

### RBAC không hoạt động
- Check user context có đúng role không
- Verify backend guard configuration

---

## 🎉 Next Steps

1. ✅ **Tích hợp API thật** - Thay mock data bằng real API calls
2. ✅ **Implement RBAC đầy đủ** - Backend + Frontend permissions
3. ✅ **Real-time updates** - WebSocket cho notifications, stats
4. ✅ **Export/Import** - Excel, PDF reports
5. ✅ **Advanced filters** - Date range, multi-select
6. ✅ **Audit logs** - Track admin actions
7. ✅ **Dark mode** - Theme switcher

---

**Admin Dashboard đã sẵn sàng sử dụng!** 🚀

Access: `http://localhost:5173/admin`
