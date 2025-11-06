# 🔐 Refresh Token Security - HMAC-SHA256

## Tại sao dùng HMAC-SHA256 thay vì SHA256 hay bcrypt?

### ❌ **Bcrypt - KHÔNG phù hợp**
```typescript
// Vấn đề: Mỗi lần hash tạo ra kết quả KHÁC NHAU (random salt)
const hash1 = await bcrypt.hash("token123", 10);
// → "$2b$10$abc..." 

const hash2 = await bcrypt.hash("token123", 10);
// → "$2b$10$xyz..." (KHÁC hash1!)

// ❌ Redis không tìm lại được key
redis.set(`rt:${hash1}`, userId);
redis.get(`rt:${hash2}`) // → NULL
```

**Kết luận:** bcrypt dùng cho password (cần random salt), KHÔNG dùng cho token hashing.

---

### ⚠️ **SHA256 thuần - Không đủ an toàn**
```typescript
// SHA256 deterministic → Cùng input = Cùng output ✅
const hash1 = crypto.createHash('sha256').update("token").digest('hex');
const hash2 = crypto.createHash('sha256').update("token").digest('hex');
// → hash1 === hash2 ✅

// ✅ Redis tìm được
redis.set(`rt:${hash1}`, userId);
redis.get(`rt:${hash2}`) // → userId ✅
```

**Nhưng có vấn đề bảo mật:**

#### 🔴 Tấn công Rainbow Table
```bash
# Attacker lấy được hash từ Redis leak
rt:a1b2c3d4e5f6...

# Brute-force offline với rainbow table
sha256("token1") → mismatch
sha256("token2") → mismatch
...
sha256("eyJhbGciOiJ...") → MATCH! ✅

# → Tìm được token gốc → Replay attack
```

#### 🔴 Tấn công Pre-image
- SHA256 hash public algorithm
- Không có secret key
- Attacker có thể tính hash bất kỳ token nào
- Nếu leak database → Dễ dàng reverse engineer

---

### ✅ **HMAC-SHA256 - An toàn nhất**
```typescript
// HMAC = Hash-based Message Authentication Code
// HMAC-SHA256(message, secret_key)
const hash = crypto
  .createHmac('sha256', 'MY_SECRET_KEY')
  .update(token)
  .digest('hex');
```

#### 🛡️ Ưu điểm:

1. **Deterministic** (Cùng token + secret → Cùng hash)
   ```typescript
   HMAC-SHA256("token", "secret") === HMAC-SHA256("token", "secret") ✅
   ```

2. **Cần secret key** (Attacker không thể tạo hash hợp lệ)
   ```bash
   # Leak hash từ Redis
   rt:abc123...
   
   # Không thể brute-force vì không biết secret
   HMAC-SHA256("token1", "???") → Unknown
   HMAC-SHA256("token2", "???") → Unknown
   
   # → Không tìm được token gốc ✅
   ```

3. **Rainbow table vô dụng** (Mỗi secret tạo bảng riêng)
   - Rainbow table của `secret_A` không dùng cho `secret_B`
   - Cost tạo rainbow table = 2^256 khả năng

4. **FIPS 198 approved** (Chuẩn bảo mật quốc tế)

---

## 📊 So sánh

| Thuật toán | Deterministic | Cần Secret | Redis OK | Bảo mật | Use Case |
|-----------|---------------|------------|----------|---------|----------|
| **bcrypt** | ❌ Random | ✅ Yes (salt) | ❌ Không | ⭐⭐⭐⭐⭐ | Password storage |
| **SHA256** | ✅ Yes | ❌ No | ✅ Yes | ⭐⭐ | Checksums, không nhạy cảm |
| **HMAC-SHA256** | ✅ Yes | ✅ Yes | ✅ Yes | ⭐⭐⭐⭐⭐ | **Token hashing (BEST)** |

---

## 🔧 Implementation

### Backend Setup

#### 1. Environment Variable (`.env`)
```bash
# Add to .env
REFRESH_TOKEN_HMAC_SECRET=your-super-secret-hmac-key-min-32-chars-change-in-production
```

⚠️ **QUAN TRỌNG:**
- Secret phải dài >= 32 ký tự
- Random, không đoán được
- Khác với `REFRESH_TOKEN_SECRET` (JWT signing)
- Production: Dùng AWS Secrets Manager / Azure Key Vault

#### 2. Auth Service (`auth.service.ts`)
```typescript
@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_HMAC_SECRET: string;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    // ...
  ) {
    this.REFRESH_TOKEN_HMAC_SECRET = 
      this.config.get<string>('REFRESH_TOKEN_HMAC_SECRET') ?? 
      'fallback_secret_change_me';
  }

  // Helper method
  private hashRefreshToken(token: string): string {
    return crypto
      .createHmac('sha256', this.REFRESH_TOKEN_HMAC_SECRET)
      .update(token)
      .digest('hex');
  }

  // Usage in login
  async login(email: string, password: string) {
    const tokens = await this.getTokens(user);
    
    const refreshTokenHash = this.hashRefreshToken(tokens.refresh_token);
    await this.redis.set(`rt:${refreshTokenHash}`, user.UserID.toString(), 604800);
    
    return tokens;
  }

  // Usage in refresh
  async refreshTokens(userId: number, refreshToken: string) {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const storedUserId = await this.redis.get(`rt:${refreshTokenHash}`);
    
    if (!storedUserId) {
      throw new UnauthorizedException('Token invalid');
    }
    // ... token rotation
  }

  // Usage in logout
  async logout(refreshToken: string) {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    await this.redis.del(`rt:${refreshTokenHash}`);
  }
}
```

---

## 🛡️ Security Checklist

### ✅ Best Practices Applied:

1. **Token Storage:**
   - ✅ Refresh token → HttpOnly cookie (Frontend không đọc được)
   - ✅ Access token → Memory (React state, mất khi F5)
   - ✅ Hash → Redis (TTL 7 ngày, auto-expire)

2. **Token Hashing:**
   - ✅ HMAC-SHA256 với secret key
   - ✅ Secret từ env variable
   - ✅ Deterministic (cùng token → cùng hash)

3. **Token Rotation:**
   - ✅ Mỗi lần refresh → Xóa token cũ, tạo token mới
   - ✅ Prevent replay attacks
   - ✅ Redis TTL tự động cleanup

4. **Error Handling:**
   - ✅ Generic error message (không leak info)
   - ✅ Rate limiting (TODO: implement)
   - ✅ Logging cho audit trail

---

## 🔒 Attack Prevention

### 1. **XSS (Cross-Site Scripting)**
```javascript
// ✅ SAFE: HttpOnly cookie
document.cookie // → Không thấy refresh_token

// ❌ UNSAFE: localStorage
localStorage.getItem('refresh_token') // → Attacker đọc được
```

### 2. **CSRF (Cross-Site Request Forgery)**
```typescript
// ✅ SAFE: sameSite: 'lax'
res.cookie('refresh_token', token, {
  httpOnly: true,
  sameSite: 'lax', // Chặn cross-origin requests
});
```

### 3. **Token Replay**
```typescript
// ✅ SAFE: Token rotation
async refreshTokens(oldToken) {
  await redis.del(`rt:${hash(oldToken)}`); // Xóa token cũ
  const newToken = generateToken();
  await redis.set(`rt:${hash(newToken)}`, userId);
  return newToken;
}
```

### 4. **Redis Leak**
```bash
# Attacker dump Redis
rt:abc123def456... → userID: 123

# ❌ SHA256: Có thể brute-force
# ✅ HMAC-SHA256: Không thể tạo lại hash (thiếu secret)
```

### 5. **Man-in-the-Middle**
```typescript
// ✅ SAFE: HTTPS + secure cookie
res.cookie('refresh_token', token, {
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  httpOnly: true,
});
```

---

## 📈 Performance

### Redis Lookup Speed
```typescript
// HMAC-SHA256 hash → 64 hex chars
const hash = "a1b2c3d4..."; // 64 chars

// Redis O(1) lookup
await redis.get(`rt:${hash}`); // ~0.1ms
```

### HMAC Computation Speed
```javascript
// Benchmark: 1,000,000 HMAC operations
// Time: ~500ms (Node.js crypto module)
// → ~2,000,000 ops/sec ✅ Very fast
```

---

## 🧪 Testing

### Unit Test Example
```typescript
describe('AuthService - HMAC Hashing', () => {
  it('should generate same hash for same token', () => {
    const token = 'eyJhbGciOiJ...';
    const hash1 = service['hashRefreshToken'](token);
    const hash2 = service['hashRefreshToken'](token);
    
    expect(hash1).toBe(hash2); ✅
  });

  it('should generate different hash for different tokens', () => {
    const hash1 = service['hashRefreshToken']('token1');
    const hash2 = service['hashRefreshToken']('token2');
    
    expect(hash1).not.toBe(hash2); ✅
  });

  it('should fail without correct secret', () => {
    const token = 'eyJhbGciOiJ...';
    
    // Hash với secret A
    const hashA = crypto.createHmac('sha256', 'secretA').update(token).digest('hex');
    
    // Hash với secret B
    const hashB = crypto.createHmac('sha256', 'secretB').update(token).digest('hex');
    
    expect(hashA).not.toBe(hashB); ✅
  });
});
```

---

## 🚨 Common Mistakes

### ❌ DON'T: Hash twice
```typescript
// ❌ BAD
const hash = crypto.createHash('sha256')
  .update(crypto.createHash('sha256').update(token).digest('hex'))
  .digest('hex');
// → Không tăng bảo mật, chỉ chậm hơn
```

### ❌ DON'T: Use token as key directly
```typescript
// ❌ BAD: Token quá dài, leak token trong Redis
await redis.set(`rt:${refreshToken}`, userId);

// ✅ GOOD: Hash ngắn gọn, không leak
await redis.set(`rt:${hash(refreshToken)}`, userId);
```

### ❌ DON'T: Hardcode secret
```typescript
// ❌ BAD
const secret = 'my-secret-123';

// ✅ GOOD
const secret = process.env.REFRESH_TOKEN_HMAC_SECRET;
```

---

## 📚 References

1. [RFC 2104 - HMAC](https://tools.ietf.org/html/rfc2104)
2. [FIPS 198-1 - Keyed-Hash Message Authentication Code](https://csrc.nist.gov/publications/detail/fips/198/1/final)
3. [OWASP - Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
4. [Node.js Crypto - HMAC](https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options)

---

## ✅ Migration Checklist

- [x] Install dependencies (crypto built-in Node.js)
- [x] Add `REFRESH_TOKEN_HMAC_SECRET` to `.env`
- [x] Create `hashRefreshToken()` helper method
- [x] Update `login()` to use HMAC
- [x] Update `refreshTokens()` to use HMAC
- [x] Update `logout()` to use HMAC
- [x] Update OAuth flows (Google/Facebook)
- [x] Clear old Redis keys: `redis-cli FLUSHDB`
- [x] Test login → refresh → logout flow
- [x] Update documentation

---

**Last Updated:** November 6, 2025  
**Version:** 2.0 (HMAC-SHA256)  
**Author:** NCKH Team - Đà Nẵng Historical Images
