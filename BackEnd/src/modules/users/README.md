# Users Module

## 👥 Overview
This module handles user management, profile operations, and user administration.

## 📁 Structure
```
src/modules/users/
├── users.module.ts         # Main users module
├── users.controller.ts     # User endpoints
├── users.service.ts        # User business logic
└── dto/
    ├── create-user.dto.ts  # Create user request DTO
    ├── update-user.dto.ts  # Update user request DTO
    └── user-response.dto.ts # User response DTO
```

## 🚀 Endpoints

### User Management
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (admin only)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin only)
- `GET /users/:id/role` - Get user role (admin only)
- `PUT /users/:id/role` - Update user role (admin only)

### Features
- User CRUD operations
- Role management
- Profile updates
- Password hashing
- Email uniqueness validation

## 🔧 Usage

### Get User Profile
```typescript
GET /users/123
Authorization: Bearer <jwt-token>
```

### Update User
```typescript
PUT /users/123
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "fullName": "New Name",
  "email": "newemail@example.com"
}
```

## 🛡️ Security Features
- Users can only view/update their own profile
- Admin can manage all users
- Password hashing with bcrypt
- Email uniqueness validation
- Role-based access control
