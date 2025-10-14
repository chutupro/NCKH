# Hướng dẫn Truy cập API từ Mạng LAN/WiFi

## Cấu hình Server

Ứng dụng đã được cấu hình để lắng nghe trên `0.0.0.0`, cho phép truy cập từ tất cả các thiết bị trong cùng mạng.

---

## Cách Tìm IP Address của Server

### Trên Windows:

```powershell
ipconfig
```

Tìm dòng **IPv4 Address** trong phần WiFi hoặc Ethernet:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### Trên macOS/Linux:

```bash
ifconfig
# hoặc
ip addr show
```

Tìm địa chỉ IP (thường bắt đầu với 192.168.x.x hoặc 10.0.x.x)

### Cách nhanh hơn (Windows PowerShell):

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"} | Select-Object IPAddress
```

---

## Truy cập từ Thiết bị Khác

### 1. Đảm bảo Server đang chạy

```bash
npm run start:dev
```

Bạn sẽ thấy thông báo:
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Application is running on:                            ║
║                                                            ║
║   ➜ Local:            http://localhost:3000/api/docs      ║
║   ➜ Network:          http://<your-ip>:3000/api/docs      ║
║                                                            ║
║   📚 API Documentation is available at /api/docs          ║
║   🔐 Use Bearer token for authentication                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### 2. Từ các thiết bị khác trong cùng WiFi/LAN

Giả sử IP của server là `192.168.1.100` và port là `3000`:

#### Truy cập Swagger UI:
```
http://192.168.1.100:3000/api/docs
```

#### Gọi API trực tiếp:
```
http://192.168.1.100:3000/api/auth/login
http://192.168.1.100:3000/api/articles
```

---

## Cấu hình Firewall (Nếu không truy cập được)

### Windows Firewall:

#### Cách 1: Cho phép qua GUI
1. Mở **Windows Defender Firewall**
2. Click **Advanced settings**
3. Click **Inbound Rules** → **New Rule**
4. Chọn **Port** → Next
5. Chọn **TCP** và nhập port `3000` → Next
6. Chọn **Allow the connection** → Next
7. Chọn **Domain, Private, Public** → Next
8. Đặt tên: `NestJS API` → Finish

#### Cách 2: Qua PowerShell (Run as Administrator)
```powershell
New-NetFirewallRule -DisplayName "NestJS API" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### macOS Firewall:

```bash
# Thường macOS không block outgoing connections
# Nếu cần, vào System Preferences > Security & Privacy > Firewall
```

### Linux (Ubuntu/Debian):

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

---

## Test Kết nối

### Từ Server (localhost):

```bash
curl http://localhost:3000/api/docs
```

### Từ thiết bị khác trong mạng:

```bash
curl http://192.168.1.100:3000/api/docs
```

hoặc mở trình duyệt và truy cập:
```
http://192.168.1.100:3000/api/docs
```

---

## Ví dụ Sử dụng từ Mobile/Tablet

### 1. Kết nối cùng WiFi với server

### 2. Mở trình duyệt trên điện thoại

### 3. Truy cập:
```
http://192.168.1.100:3000/api/docs
```

### 4. Sử dụng Swagger UI như bình thường:
- Đăng nhập để lấy token
- Authorize với Bearer token
- Test các endpoints

---

## Ví dụ Code từ Frontend/Mobile App

### JavaScript/React (Cùng mạng):

```javascript
const API_BASE_URL = 'http://192.168.1.100:3000/api';

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  return data.accessToken;
}

// Get articles
async function getArticles(token) {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
}
```

### React Native:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to all requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const articles = await apiClient.get('/articles');
```

### Flutter/Dart:

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://192.168.1.100:3000/api';
  
  Future<String> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );
    
    final data = json.decode(response.body);
    return data['accessToken'];
  }
  
  Future<List> getArticles(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/articles'),
      headers: {'Authorization': 'Bearer $token'},
    );
    
    return json.decode(response.body);
  }
}
```

---

## Troubleshooting

### Vấn đề 1: Không kết nối được từ thiết bị khác

**Kiểm tra:**
1. Cả 2 thiết bị có cùng WiFi không?
2. Server có đang chạy không?
3. Firewall có block port 3000 không?
4. IP address có đúng không?

**Giải pháp:**
```bash
# Test từ chính server
curl http://localhost:3000/api/docs

# Test với IP của server
curl http://192.168.1.100:3000/api/docs

# Nếu curl thành công nhưng browser không được, clear browser cache
```

### Vấn đề 2: CORS Error

Ứng dụng đã cấu hình `CORS_ORIGIN = true`, cho phép tất cả origins. Nếu vẫn gặp lỗi CORS:

**Kiểm tra trong `src/main.ts`:**
```typescript
app.enableCors({
  origin: true,  // Cho phép tất cả origins
  credentials: true,
});
```

### Vấn đề 3: Connection Timeout

**Nguyên nhân:**
- Firewall block
- Network isolation (Guest network)
- VPN interference

**Giải pháp:**
```bash
# Test ping trước
ping 192.168.1.100

# Test telnet port
telnet 192.168.1.100 3000
# hoặc
Test-NetConnection -ComputerName 192.168.1.100 -Port 3000
```

### Vấn đề 4: IP thay đổi khi restart router

**Giải pháp:** Cấu hình Static IP trong router hoặc sử dụng hostname:

```bash
# Windows: Tìm hostname
hostname

# Truy cập bằng hostname thay vì IP
http://MY-COMPUTER-NAME:3000/api/docs
```

---

## Best Practices

### 1. Sử dụng Environment Variables

Thay vì hardcode IP, dùng biến môi trường:

```javascript
// .env.local (Frontend)
REACT_APP_API_URL=http://192.168.1.100:3000/api

// Code
const API_BASE_URL = process.env.REACT_APP_API_URL;
```

### 2. Development vs Production

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.yourproduction.com'
  : 'http://192.168.1.100:3000/api';
```

### 3. Auto-detect IP

```javascript
// Tự động detect server IP nếu cùng mạng
const getServerIP = async () => {
  try {
    const response = await fetch('http://192.168.1.100:3000/api/docs');
    return '192.168.1.100:3000';
  } catch (error) {
    return 'localhost:3000'; // Fallback to localhost
  }
};
```

---

## Security Notes

⚠️ **LƯU Ý BẢO MẬT:**

1. **KHÔNG expose production server với 0.0.0.0** ra internet công cộng
2. Chỉ dùng `0.0.0.0` trong môi trường development/LAN
3. Production nên dùng:
   - Reverse proxy (nginx)
   - HTTPS/SSL
   - API Gateway
   - Rate limiting
   - IP whitelist

4. Đảm bảo WiFi có mật khẩu mạnh
5. Không chia sẻ token JWT với người khác
6. Logout khi không sử dụng

---

## Các Port Phổ biến

- `3000` - Backend API (NestJS)
- `3001` - Frontend (React)
- `4200` - Frontend (Angular)
- `5173` - Frontend (Vite)
- `8080` - Alternative backend

Đảm bảo không có conflict port giữa các service.

---

## Kiểm tra Server có đang lắng nghe 0.0.0.0 không

### Windows PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object LocalAddress, LocalPort, State
```

Kết quả mong muốn:
```
LocalAddress LocalPort State
------------ --------- -----
0.0.0.0      3000      Listen
```

### Linux/macOS:

```bash
netstat -tuln | grep 3000
# hoặc
lsof -i :3000
```

---

## Tóm tắt

1. ✅ Server đã cấu hình lắng nghe trên `0.0.0.0`
2. ✅ Tìm IP của server: `ipconfig` (Windows) hoặc `ifconfig` (macOS/Linux)
3. ✅ Truy cập từ thiết bị khác: `http://<server-ip>:3000/api/docs`
4. ✅ Mở firewall port 3000 nếu cần
5. ✅ Cùng WiFi/LAN để kết nối được

**Chúc bạn phát triển thành công! 🚀**
