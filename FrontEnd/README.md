# Dự án Frontend React + JavaScript

## Yêu Cầu Hệ Thống

-Node.js (v16 trở lên)
-npm

## Cài Đặt

Dependencies
react: ^19.1.1 - Thư viện chính để xây dựng giao diện người dùng.
react-dom: ^19.1.1 - Thư viện để render React components vào DOM.
@fortawesome/fontawesome-svg-core: ^7.1.0 - Core library cho FontAwesome icons.
@fortawesome/free-brands-svg-icons: ^7.1.0 - Bộ icons thương hiệu của FontAwesome.
@fortawesome/free-solid-svg-icons: ^7.1.0 - Bộ icons solid của FontAwesome.
@fortawesome/react-fontawesome: ^3.1.0 - Component React để sử dụng FontAwesome icons.
react-router-dom: ^6.27.0 - Thư viện điều hướng client-side (giả định đã cài để dùng BrowserRouter).

DevDependencies
@vitejs/plugin-react: ^5.0.3 - Plugin Vite để hỗ trợ React với hot reload.
eslint: ^9.36.0 - Công cụ kiểm tra lỗi code.
@eslint/js: ^9.36.0 - Cấu hình ESLint cơ bản cho JavaScript.
eslint-plugin-react-hooks: ^5.2.0 - Plugin ESLint để kiểm tra Rules of Hooks.
eslint-plugin-react-refresh: ^0.4.20 - Plugin ESLint để hỗ trợ React Refresh trong Vite.
globals: ^16.4.0 - Cung cấp danh sách globals cho ESLint.
vite: ^7.1.9 - Công cụ build nhanh và hiện đại.

## cài đặt và chạy dự án

1. Cài đặt dependencies:

```bash
npm install
```

2. Khởi chạy server development:

```bash
cd FrontEnd
npm run dev
```

## 📁 Cấu Trúc Dự Án

NCKH/
├── BackEnd/ # Thư mục backend (nếu có)
├── FrontEnd/ # Thư mục frontend
│ ├── node_modules/ # Thư viện đã cài đặt
│ ├── public/ # File tĩnh (favicon, images,...)
│ ├── src/ # Source code React
│ │ ├── component/ # Các component React tái sử dụng
│ │ ├── context/ # Bap phủ các State, Effect
│ │ ├── Layout/ # Chứa các pages
│ │ ├── pages/ # Các trang (Home, About,...)
│ │ ├── routes/ # Định nghĩa routes cho react-router-dom
│ │ ├── Styles/ # CSS files (tên thư mục viết hoa)
│ │ ├── App.css # Styles cho App component
│ │ ├── App.jsx # Component chính
│ │ ├── index.css # Global styles
│ │ └── main.jsx # Điểm khởi đầu ứng dụng
│ ├── .eslintconfig.js # Cấu hình ESLint
│ ├── .gitignore # Pattern bỏ qua Git
│ ├── index.html # File HTML gốc
│ ├── package-lock.json # File lock npm
│ ├── package.json # Dependencies và scripts
│ ├── README.md # File hướng dẫn dự án
│ ├── vite.config.js # Cấu hình Vite
│ └── node_modules/ # Thư viện đã cài đặt (có thể trùng với cấp cao hơn)
├── .gitignore # Pattern bỏ qua Git (cấp cao hơn)
└── .vscode/ # Cấu hình VS Code (nếu có)

## Scripts Có Sẵn

npm run dev - Khởi chạy server development với hot reload
npm run build - Build dự án cho production
npm run preview - Xem trước bản build production
npm run lint - Chạy ESLint để kiểm tra lỗi code
npm run lint:fix - Tự động sửa lỗi ESLint
npm run prettier - Kiểm tra format code với Prettier
npm run prettier:fix - Tự động format code với Prettier

## Công Cụ Phát Triển

React - Thư viện xây dựng giao diện người dùng
Vite - Công cụ build nhanh và hiện đại
react-router-dom - Điều hướng client-side
FontAwesome - Icon library cho giao diện
ESLint - Kiểm tra lỗi code
Prettier - Format code
React Refresh - Hỗ trợ hot reload trong development

## Tính Năng

Điều hướng client-side với react-router-dom
Icon giao diện với FontAwesome
ESLint và Prettier để đảm bảo chất lượng code
Hot reload trong quá trình development
Cấu trúc dự án module hóa
Build nhanh với Vite
Hỗ trợ React 19

## 📝 Quy Tắc Code

### React Best Practices
```javascript
function UserCard({ user }) {
  return <div>{user.name}</div>
}

// ❌ Tránh - Sử dụng class component trừ khi cần thiết
class UserCard extends React.Component {
  render() {
    return <div>{this.props.user.name}</div>
  }
}
```
### React Hooks
```javascript
function MyComponent() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    // Logic
  }, [])

  return <div>{count}</div>
}

// ❌ Tránh - Hooks trong điều kiện
function MyComponent() {
  if (condition) {
    const [count, setCount] = useState(0) // Lỗi
  }
}
```
### Error Handling
```javascript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error.message)
    } else {
      console.error('Unknown error:', error)
    }
  }
}
```

###  Code Organization
component/: Chứa các component React tái sử dụng
pages/: Chứa các trang hoàn chỉnh (route components)
context/: Chứa cá State, eFEct
Layout/: Chứa các pages
routes/: Định nghĩa điều hướng với react-router-dom
Styles/: CSS cho styling
App.jsx: Component chính
main.jsx: Điểm khởi đầu ứng dụng

### Import/Export
```javascript
export const formatDate = (date) => { }
export const fetchUser = (id) => { }

// ✅ Tốt - Default export cho components
export default function UserCard() { }

// ✅ Tốt - Import specific components
import UserCard from './component/UserCard'
import { formatDate } from './utils/helpers'
```
### Environment Variables

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

if (!API_URL) {
  throw new Error('VITE_API_URL is required')
}
````