# Roles Module

## 🎭 Overview
This module handles role management and role-based access control.

## 📁 Structure
```
src/modules/roles/
├── roles.module.ts         # Main roles module
├── roles.controller.ts     # Role endpoints
├── roles.service.ts        # Role business logic
└── dto/
    ├── create-role.dto.ts  # Create role request DTO
    ├── update-role.dto.ts  # Update role request DTO
    └── role-response.dto.ts # Role response DTO
```

## 🚀 Endpoints

### Role Management
- `GET /roles` - Get all roles (admin only)
- `GET /roles/:id` - Get role by ID (admin only)
- `POST /roles` - Create new role (admin only)
- `PUT /roles/:id` - Update role (admin only)
- `DELETE /roles/:id` - Delete role (admin only)

### Features
- Role CRUD operations
- Role name uniqueness validation
- Role description management
- Admin-only access

## 🔧 Usage

### Create Role
```typescript
POST /roles
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "roleName": "moderator",
  "description": "Content moderator role"
}
```

### Update Role
```typescript
PUT /roles/2
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "roleName": "editor",
  "description": "Content editor role"
}
```

## 🛡️ Security Features
- Admin-only access to all endpoints
- Role name uniqueness validation
- JWT authentication required
- Role-based authorization
