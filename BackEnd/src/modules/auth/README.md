# Authentication Module

## 🔐 Overview
This module handles user authentication, JWT token management, and security features.

## 📁 Structure
```
src/modules/auth/
├── auth.module.ts          # Main auth module
├── auth.controller.ts      # Auth endpoints
├── auth.service.ts         # Auth business logic
├── guards/
│   ├── jwt-auth.guard.ts  # JWT authentication guard
│   ├── local-auth.guard.ts # Local authentication guard
│   └── roles.guard.ts     # Role-based authorization guard
├── strategies/
│   ├── jwt.strategy.ts    # JWT passport strategy
│   └── local.strategy.ts  # Local passport strategy
├── dto/
│   ├── login.dto.ts       # Login request DTO
│   ├── register.dto.ts    # Registration request DTO
│   └── auth-response.dto.ts # Auth response DTO
└── decorators/
    └── roles.decorator.ts # Role decorator for endpoints
```

## 🚀 Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (requires JWT)
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### Features
- JWT token authentication
- Password hashing with bcrypt
- Role-based authorization
- Token refresh mechanism
- User profile management

## 🔧 Usage

### Protecting Routes
```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
async protectedRoute() {
  // This route requires JWT authentication
}
```

### Role-based Authorization
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin-only')
async adminRoute() {
  // This route requires admin role
}
```

## 🛡️ Security Features
- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration
- Role-based access control
- Input validation with class-validator
- SQL injection protection with TypeORM
