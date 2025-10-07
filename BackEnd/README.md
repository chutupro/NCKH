# Dự án Backend Node.js + TypeScript

Một dự án backend Node.js hiện đại với TypeScript, Express và các công cụ phát triển.

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống
- Node.js (v16 trở lên)
- npm hoặc yarn

### Cài Đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Khởi chạy server development:
```bash
npm run dev
```

3. Build cho production:
```bash
npm run build
```

4. Khởi chạy server production:
```bash
npm start
```

## 📁 Cấu Trúc Dự Án

```
nodejs-typescript/
├── dist/                    # File JavaScript đã compile
├── src/                     # File TypeScript nguồn
│   ├── constants/          # Hằng số ứng dụng
│   │   ├── enum.ts
│   │   ├── httpStatus.ts
│   │   └── message.ts
│   ├── controllers/        # Controller xử lý route
│   │   └── users.controller.ts
│   ├── middlewares/        # Express middlewares
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/            # Model và interface dữ liệu
│   │   └── User.ts
│   ├── routes/            # API routes
│   │   └── users.route.ts
│   ├── services/          # Logic nghiệp vụ
│   │   └── users.service.ts
│   ├── utils/             # Hàm tiện ích
│   │   ├── jwt.ts
│   │   └── helpers.ts
│   ├── index.ts           # Điểm khởi đầu ứng dụng
│   └── type.d.ts          # Định nghĩa kiểu TypeScript
├── .editorconfig          # Cấu hình editor
├── .env                   # Biến môi trường
├── .eslintignore          # Pattern bỏ qua ESLint
├── .eslintrc              # Cấu hình ESLint
├── .gitignore             # Pattern bỏ qua Git
├── .prettierignore        # Pattern bỏ qua Prettier
├── .prettierrc            # Cấu hình Prettier
├── nodemon.json           # Cấu hình Nodemon
├── package.json           # Dependencies và scripts
├── tsconfig.json          # Cấu hình TypeScript
└── yarn.lock              # File lock Yarn
```

## 🛠️ Scripts Có Sẵn

- `npm run dev` - Khởi chạy server development với hot reload
- `npm run build` - Build dự án cho production
- `npm start` - Khởi chạy server production
- `npm run lint` - Chạy ESLint
- `npm run lint:fix` - Tự động sửa lỗi ESLint
- `npm run prettier` - Kiểm tra format code
- `npm run prettier:fix` - Tự động format code

## 🔧 Công Cụ Phát Triển

- **TypeScript** - JavaScript với kiểu dữ liệu an toàn
- **Express** - Framework web
- **ESLint** - Kiểm tra lỗi code
- **Prettier** - Format code
- **Nodemon** - Server development với hot reload

## 📝 API Endpoints

- `GET /api/users` - Lấy danh sách tất cả users

## 🌟 Tính Năng

- Hỗ trợ TypeScript với strict mode
- ESLint và Prettier để đảm bảo chất lượng code
- Hot reload trong quá trình development
- Middleware xử lý lỗi
- Middleware validation
- Tiện ích JWT
- Hàm helper
- Định nghĩa kiểu dữ liệu
- Cấu trúc dự án hiện đại

## 📋 Quy Tắc Code

### 1. **Cấu Trúc File và Thư Mục**
- Sử dụng camelCase cho tên file (ví dụ: `userService.ts`)
- Tên thư mục sử dụng lowercase (ví dụ: `controllers`, `services`)
- Mỗi file chỉ export một class/function chính
- Sử dụng index.ts để export các module con

### 2. **Naming Convention**
- **Variables & Functions**: camelCase (`getUserById`, `isValidEmail`)
- **Classes**: PascalCase (`UserController`, `AuthService`)
- **Constants**: UPPER_SNAKE_CASE (`HTTP_STATUS`, `API_VERSION`)
- **Interfaces**: PascalCase với prefix I (`IUser`, `IResponse`)
- **Types**: PascalCase (`UserRole`, `ResponseStatus`)

### 3. **TypeScript Best Practices**
```typescript
// ✅ Tốt - Sử dụng interface cho object
interface User {
  id: number
  name: string
  email: string
}

// ✅ Tốt - Sử dụng type cho union types
type UserRole = 'admin' | 'user' | 'moderator'

// ✅ Tốt - Sử dụng generic
interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

// ❌ Tránh - Sử dụng any
const user: any = getUser() // Không nên

// ✅ Tốt - Sử dụng unknown hoặc specific type
const user: User = getUser()
```

### 4. **Error Handling**
```typescript
// ✅ Tốt - Sử dụng try-catch với specific error types
try {
  const user = await userService.findById(id)
  res.json(user)
} catch (error) {
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message })
  } else {
    res.status(500).json({ message: 'Internal server error' })
  }
}
```

### 5. **Async/Await**
```typescript
// ✅ Tốt - Sử dụng async/await
export const getUserById = async (id: number): Promise<User> => {
  const user = await userRepository.findById(id)
  return user
}

// ❌ Tránh - Sử dụng Promise chains
export const getUserById = (id: number): Promise<User> => {
  return userRepository.findById(id)
    .then(user => user)
    .catch(error => {
      throw error
    })
}
```

### 6. **Code Organization**
- **Controllers**: Chỉ xử lý HTTP request/response
- **Services**: Chứa business logic
- **Models**: Định nghĩa cấu trúc dữ liệu
- **Utils**: Hàm tiện ích tái sử dụng
- **Constants**: Hằng số toàn cục

### 7. **Comments và Documentation**
```typescript
/**
 * Lấy thông tin user theo ID
 * @param id - ID của user
 * @returns Promise<User> - Thông tin user
 * @throws {NotFoundError} - Khi không tìm thấy user
 */
export const getUserById = async (id: number): Promise<User> => {
  // Implementation
}
```

### 8. **Import/Export**
```typescript
// ✅ Tốt - Named exports
export const getUserById = (id: number) => { }
export const createUser = (userData: CreateUserDto) => { }

// ✅ Tốt - Default export cho main class
export default class UserController { }

// ✅ Tốt - Import specific functions
import { getUserById, createUser } from './userService'
```

### 9. **Environment Variables**
```typescript
// ✅ Tốt - Validate environment variables
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required')
}
```

### 10. **Testing Standards**
- Mỗi function/service phải có unit test
- Sử dụng describe/it cho test structure
- Mock external dependencies
- Test cả success và error cases

### 11. **Code Style**
- Sử dụng single quotes thay vì double quotes
- Không sử dụng semicolon ở cuối dòng
- Sử dụng 2 spaces cho indentation
- Luôn có trailing comma trong objects/arrays
- Sử dụng arrow functions cho callbacks

### 12. **Security Best Practices**
- Luôn validate input data
- Sử dụng environment variables cho sensitive data
- Implement proper error handling
- Sử dụng HTTPS trong production
- Implement rate limiting
- Sanitize user input

### 13. **Performance Guidelines**
- Sử dụng async/await thay vì callbacks
- Implement caching khi cần thiết
- Optimize database queries
- Sử dụng connection pooling
- Implement pagination cho large datasets

### 14. **Git Workflow**
- Sử dụng meaningful commit messages
- Tạo feature branches cho mỗi feature
- Sử dụng pull requests cho code review
- Squash commits trước khi merge
- Sử dụng conventional commits format
