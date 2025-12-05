import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';
import { Users } from '../../entities/user.entity';
import { RedisService } from '../../../common/redis.service';

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_HMAC_SECRET: string;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    private readonly redis: RedisService,
  ) {
    // 🔐 HMAC secret từ env, fallback về refresh token secret
    this.REFRESH_TOKEN_HMAC_SECRET = 
      this.config.get<string>('REFRESH_TOKEN_HMAC_SECRET') ?? 
      this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 
      'default_hmac_secret_change_in_production';
  }

  // 🔐 Helper: HMAC-SHA256 hash (deterministic + secure)
  private hashRefreshToken(token: string): string {
    return crypto
      .createHmac('sha256', this.REFRESH_TOKEN_HMAC_SECRET)
      .update(token)
      .digest('hex');
  }

  // Tạo mã OTP 6 số ngẫu nhiên
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Bước 1: Gửi OTP để đăng ký
  async sendOTPForRegistration(email: string): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Starting OTP registration for:', email);
    
    // 1. Kiểm tra email đã tồn tại trong DB chưa
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      console.log('❌ [AuthService] Email already exists in database:', email);
      throw new BadRequestException('Email đã được sử dụng.');
    }

    // 2. Kiểm tra email có tồn tại thật không (deep validation)
    console.log('🔍 [AuthService] Verifying email exists:', email);
    const emailValidation = await this.emailService.verifyEmailExists(email);
    if (!emailValidation.valid) {
      console.log('❌ [AuthService] Email validation failed:', email, '-', emailValidation.reason);
      throw new BadRequestException(emailValidation.reason || 'Email không hợp lệ hoặc không thể nhận thư. Vui lòng kiểm tra lại.');
    }
    console.log('✅ [AuthService] Email validation passed:', email);

    // 🔥 3. Tạo OTP → LƯU REDIS (KHÔNG DB)
    const otpCode = this.generateOTP();
    const redisKey = `otp:${email}`;
    
    // redis.set('otp:email', code, 'EX', 600) - 10 phút = 600 seconds
    await this.redis.set(redisKey, otpCode, 600);
    
    console.log('✅ [AuthService] OTP created in Redis:', { email, code: otpCode, ttl: '10 minutes' });

    // 4. Gửi email OTP
    console.log('📧 [AuthService] Attempting to send email...');
    const emailResult = await this.emailService.sendOTPEmail(email, otpCode);
    
    console.log('📧 [AuthService] Email service returned:', {
      success: emailResult.success,
      error: emailResult.error
    });
    
    if (!emailResult.success) {
      // 🔥 Xóa OTP từ Redis vì gửi email thất bại
      console.log('❌ [AuthService] Email send failed, deleting OTP from Redis...');
      await this.redis.del(`otp:${email}`);
      
      console.log('🚫 [AuthService] Throwing BadRequestException with message:', emailResult.error);
      throw new BadRequestException(emailResult.error || 'Không thể gửi email. Vui lòng thử lại.');
    }

    console.log('✅ [AuthService] OTP registration completed successfully');
    return {
      message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
    };
  }

  // Bước 2: Xác thực OTP và đăng ký tài khoản
  async verifyOTPAndRegister(
    email: string,
    otpCode: string,
    password: string,
    fullName?: string,
    role?: string,
  ) {
    console.log('🔵 [AuthService] Starting OTP verification for:', email);

    // 🔥 1. ĐỌC OTP TỪ REDIS
    const redisKey = `otp:${email}`;
    const storedOTP = await this.redis.get(redisKey);

    console.log('🔍 [AuthService] Redis OTP check:', {
      email,
      providedOTP: otpCode,
      storedOTP: storedOTP || 'NOT_FOUND',
      match: storedOTP === otpCode,
    });

    if (!storedOTP) {
      console.log('❌ [AuthService] OTP not found in Redis (expired or never sent)');
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.');
    }

    if (storedOTP !== otpCode) {
      console.log('❌ [AuthService] OTP mismatch');
      throw new BadRequestException('Mã OTP không đúng. Vui lòng kiểm tra lại.');
    }

    console.log('✅ [AuthService] OTP verified successfully');

    // 🔥 2. XÓA OTP SAU KHI SỬ DỤNG (tránh reuse)
    await this.redis.del(redisKey);
    console.log('✅ [AuthService] OTP deleted from Redis');

    // 🔥 3. TẠO TÀI KHOẢN VỚI IsEmailVerified = true
    console.log('📝 [AuthService] Creating user account...');
    const user = await this.userService.createUser(email, password, fullName, role);

    // 🔥 4. UPDATE IsEmailVerified = true (QUAN TRỌNG - FIX BUG)
    user.IsEmailVerified = true;
    await this.userRepo.save(user);

    console.log('✅ [AuthService] User created and email verified:', {
      userId: user.UserID,
      email: user.Email,
      isEmailVerified: user.IsEmailVerified,
    });

    return {
      message: 'Đăng ký thành công. Email đã được xác thực.',
      user: {
        id: user.UserID,
        email: user.Email,
        fullName: user.FullName,
        isEmailVerified: user.IsEmailVerified,
      },
    };
  }

  // Đăng ký (giữ lại cho backward compatibility - sẽ deprecated)
  async register(email: string, password: string, fullName?: string, role?: string) {
    const user = await this.userService.createUser(email, password, fullName, role);
    return {
      message: 'Đăng ký thành công',
      user: {
        id: user.UserID,
        email: user.Email,
        fullName: user.FullName,
      },
    };
  }

  // 🔥 NEW: Email Confirmation Registration (replaces OTP)
  async registerWithEmailConfirmation(
    email: string,
    password: string,
    fullName?: string,
    role?: string
  ): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Starting email confirmation registration for:', email);

    // 1. Check if email already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      console.log('❌ [AuthService] Email already exists:', email);
      throw new BadRequestException('Email đã được sử dụng.');
    }

    // 2. Basic email validation (format, MX, disposable only)
    console.log('🔍 [AuthService] Validating email:', email);
    const emailValidation = await this.emailService.verifyEmailExists(email);
    if (!emailValidation.valid) {
      console.log('❌ [AuthService] Email validation failed:', email);
      throw new BadRequestException(emailValidation.reason || 'Email không hợp lệ.');
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user with unverified status
    const user = this.userRepo.create({
      Email: email,
      PasswordHash: hashedPassword,
      FullName: fullName || 'User',
      RoleID: role ? parseInt(role) : 2, // 🔥 Default role: 2 (User)
      IsEmailVerified: false,
    });

    await this.userRepo.save(user);
    console.log('✅ [AuthService] User created successfully');

    // 5. Create UserProfile automatically
    await this.userService.createUserProfile(user.UserID);
    console.log('✅ [AuthService] UserProfile created');

    console.log('✅ [AuthService] Email confirmation registration completed');
    return {
      message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.',
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email hoặc Mật khẩu không đúng ');

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) throw new UnauthorizedException('Email hoặc Mật khẩu không đúng');

    // ✅ Query role relation để dùng trong getTokens()
    const userWithRole = await this.userRepo.findOne({
      where: { UserID: user.UserID },
      relations: ['role'],
    });

    return userWithRole || user;
  }

  async getTokens(user: any, rememberMe: boolean = false) {
    // 🔥 LẤY ROLE NAME TỪ DATABASE
    const userWithRole = await this.userRepo.findOne({
      where: { UserID: user.UserID },
      relations: ['role'],
    });

    const roleName = userWithRole?.role?.RoleName || 'User';

    // 🔐 TẠO JTI (JWT ID) - UUID v4 NGẪU NHIÊN
    const jti = randomUUID();

    const payload = {
      sub: user.UserID,
      email: user.Email,
      role: roleName,
      jti, // ✅ THÊM JTI VÀO ACCESS TOKEN
    };

    // 🔐 SỬ DỤNG GIÁ TRỊ TỪ .ENV (mặc định 3600 = 1 giờ)
    const accessTokenExpiry = this.config.get<number>('JWT_ACCESS_EXPIRES') || 3600;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET') ?? 'access_secret',
      expiresIn: `${accessTokenExpiry}s`, // ✅ Thêm 's' để chỉ rõ là SECONDS
    });

    // 🔐 GHI NHỚ ĐĂNG NHẬP: Refresh token EXPIRES IN theo rememberMe
    const refreshTokenExpiry = rememberMe ? '30d' : '7d';
    
    // Refresh token KHÔNG CẦN JTI (vì đã có hash-based revocation)
    const refreshPayload = {
      sub: user.UserID,
      email: user.Email,
      role: roleName,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 'refresh_secret',
      expiresIn: refreshTokenExpiry, // ← ĐỔI THEO rememberMe
    });

    // 🔥 LƯU JTI VÀO REDIS - TTL khớp với access token expiry
    // Key: access_jti:{userId} → Value: jti
    await this.redis.setAccessJti(user.UserID, jti, accessTokenExpiry);

    console.log(`✅ [AuthService] Created tokens for user ${user.UserID}:`, {
      jti,
      accessExpiry: `${accessTokenExpiry}s`,
      refreshExpiry: refreshTokenExpiry,
      rememberMe,
    });

    return { access_token: accessToken, refresh_token: refreshToken, jti, refreshTokenExpiry };
  }

  async login(email: string, password: string, deviceInfo?: string, rememberMe: boolean = false) {
    const user = await this.validateUser(email, password);
    const tokens = await this.getTokens(user, rememberMe); // ← Truyền rememberMe
    
    // 🔐 GHI NHỚ ĐĂNG NHẬP: Redis TTL khớp với JWT expiresIn
    const redisTTL = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 ngày hoặc 7 ngày (seconds)
    
    // 🔐 HMAC-SHA256 (deterministic + secure with secret)
    const refreshTokenHash = this.hashRefreshToken(tokens.refresh_token);
    const redisKey = `rt:${refreshTokenHash}`;
    
    // 🔥 redis.set('rt:hash', userId, 'EX', TTL theo rememberMe)
    await this.redis.set(redisKey, user.UserID.toString(), redisTTL);
    
    console.log(`✅ [AuthService] Login successful for user ${user.UserID}:`, {
      rememberMe,
      refreshTokenExpiry: tokens.refreshTokenExpiry,
      redisTTL: `${redisTTL}s (${rememberMe ? '30d' : '7d'})`,
    });
    
    // ✅ Load user profile để lấy avatar
    const userWithProfile = await this.userRepo.findOne({
      where: { UserID: user.UserID },
      relations: ['role', 'profile'],
    });
    
    // user đã có role relation từ validateUser()
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: {
        userId: user.UserID,
        email: user.Email,
        fullName: user.FullName ?? '',
        roleId: user.RoleID,
        Role: user?.role?.RoleName || 'User', // ✅ Đổi thành Role (capital R) để match frontend
        profile: {
          avatar: userWithProfile?.profile?.Avatar || '/img/default-avatar.png',
        },
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string, deviceInfo?: string, rememberMe: boolean = false) {
    // Verify refresh token signature first
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 'refresh_secret',
      });
    } catch (err) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    if (!payload || payload.sub !== userId) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('Không tìm thấy user');

    // Query role relation để dùng trong getTokens()
    const userWithRole = await this.userRepo.findOne({
      where: { UserID: userId },
      relations: ['role', 'profile'], // ✅ Thêm profile
    });

    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const redisKey = `rt:${refreshTokenHash}`;
    
    const storedUserId = await this.redis.get(redisKey);
    
    if (!storedUserId || parseInt(storedUserId) !== userId) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // 🔥 TOKEN ROTATION: XÓA KEY CŨ, TẠO TOKEN MỚI
    await this.redis.del(redisKey);

    const newTokens = await this.getTokens(userWithRole || user, rememberMe); // ← Truyền rememberMe
    const newHash = this.hashRefreshToken(newTokens.refresh_token);
    const newRedisKey = `rt:${newHash}`;
    
    // 🔐 GHI NHỚ ĐĂNG NHẬP: LƯu token mới với TTL theo rememberMe
    const redisTTL = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // seconds
    await this.redis.set(newRedisKey, user.UserID.toString(), redisTTL);
    
    console.log(`✅ [AuthService] Tokens refreshed for user ${userId}:`, {
      rememberMe,
      refreshTokenExpiry: newTokens.refreshTokenExpiry,
      redisTTL: `${redisTTL}s (${rememberMe ? '30d' : '7d'})`,
    });

    // userWithRole đã được query ở trên
    return { 
      accessToken: newTokens.access_token, 
      refreshToken: newTokens.refresh_token,
      user: {
        userId: user.UserID,
        email: user.Email,
        fullName: user.FullName,
        roleId: user.RoleID,
        role: userWithRole?.role?.RoleName || 'User',
        profile: {
          avatar: userWithRole?.profile?.Avatar || '/img/default-avatar.png',
        },
      }
    };
  }

  async logout(userId: number, refreshToken?: string) {
    // 🔥 XÓA ACCESS JTI - REVOKE TẤT CẢ ACCESS TOKENS NGAY LẬP TỨC
    await this.redis.deleteAccessJti(userId);
    console.log(`✅ [AuthService] Revoked all access tokens for user ${userId}`);

    // 🔥 XÓA REFRESH TOKEN
    if (refreshToken) {
      const refreshTokenHash = this.hashRefreshToken(refreshToken);
      const redisKey = `rt:${refreshTokenHash}`;
      await this.redis.del(redisKey);
    } else {
      // Xóa tất cả refresh tokens của user (tìm theo pattern)
      await this.redis.delByPattern(`rt:*`);
    }
    return { message: 'Đăng xuất thành công' };
  }

  // ✅ GOOGLE OAUTH LOGIN
  async googleLogin(googleUser: any) {
    const { email, fullName, avatar, googleId } = googleUser;

    console.log('🔵 [AuthService] Google login for:', email);

    // Tìm user theo email
    let user = await this.userService.findByEmail(email);

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      console.log('📝 [AuthService] Creating new user for Google login');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      user = await this.userService.createUser(email, randomPassword, fullName, '2'); // Role 2 = User

      // Tự động xác thực email
      user.IsEmailVerified = true;
      await this.userRepo.save(user);
      console.log('✅ [AuthService] User created and email verified');

      // 🔥 TẠO USERPROFILE (quan trọng!)
      await this.userService.createUserProfile(user.UserID);
      console.log('✅ [AuthService] UserProfile created for Google user');
    } else {
      console.log('✅ [AuthService] Existing user found');
    }

    // Generate tokens - Mặc định rememberMe=true cho Google OAuth (30 ngày)
    const tokens = await this.getTokens(user, true);

    // Lưu refresh token vào Redis (HMAC-SHA256 - Google OAuth) - 30 ngày
    const refreshTokenHash = this.hashRefreshToken(tokens.refresh_token);
    await this.redis.set(`rt:${refreshTokenHash}`, user.UserID.toString(), 30 * 24 * 60 * 60); // 30 days
    
    console.log(`✅ [AuthService] Google login successful for user ${user.UserID} with 30-day session`);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: {
        userId: user.UserID,
        email: user.Email,
        fullName: user.FullName,
        isEmailVerified: user.IsEmailVerified,
      },
    };
  }

  // ✅ FACEBOOK OAUTH LOGIN
  async facebookLogin(facebookUser: any) {
    const { email, fullName, avatar, facebookId } = facebookUser;

    console.log('🔵 [AuthService] Facebook login for:', email);

    // ✅ Email luôn có (đã tạo từ Facebook ID trong strategy nếu không có email thật)
    // Tìm user theo email
    let user = await this.userService.findByEmail(email);

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      console.log('📝 [AuthService] Creating new user for Facebook login');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      user = await this.userService.createUser(email, randomPassword, fullName || 'Facebook User', '2'); // Role 2 = User

      // Tự động xác thực email
      user.IsEmailVerified = true;
      await this.userRepo.save(user);
      console.log('✅ [AuthService] User created and email verified');

      // 🔥 TẠO USERPROFILE (quan trọng!)
      await this.userService.createUserProfile(user.UserID);
      console.log('✅ [AuthService] UserProfile created for Facebook user');
    } else {
      console.log('✅ [AuthService] Existing user found');
    }

    // Generate tokens - Mặc định rememberMe=true cho Facebook OAuth (30 ngày)
    const tokens = await this.getTokens(user, true);

    // Lưu refresh token vào Redis (HMAC-SHA256 - Facebook OAuth) - 30 ngày
    const refreshTokenHash = this.hashRefreshToken(tokens.refresh_token);
    await this.redis.set(`rt:${refreshTokenHash}`, user.UserID.toString(), 30 * 24 * 60 * 60); // 30 days
    
    console.log(`✅ [AuthService] Facebook login successful for user ${user.UserID} with 30-day session`);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: {
        userId: user.UserID,
        email: user.Email,
        fullName: user.FullName,
        isEmailVerified: user.IsEmailVerified,
      },
    };
  }

  // ✅ QUÊN MẬT KHẨU - Bước 1: Gửi OTP
  async sendOTPForPasswordReset(email: string): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Starting password reset for:', email);

    // 1. Kiểm tra email có tồn tại trong DB không
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log('❌ [AuthService] Email not found:', email);
      throw new BadRequestException('Email không tồn tại trong hệ thống.');
    }

    // 2. Tạo OTP → Lưu Redis
    const otpCode = this.generateOTP();
    const redisKey = `password-reset-otp:${email}`;
    
    // Lưu OTP với TTL 10 phút
    await this.redis.set(redisKey, otpCode, 600);
    
    console.log('✅ [AuthService] Password reset OTP created:', { email, code: otpCode });

    // 3. Gửi email OTP
    const emailResult = await this.emailService.sendPasswordResetOTP(email, otpCode);
    
    if (!emailResult.success) {
      // Xóa OTP nếu gửi email thất bại
      await this.redis.del(redisKey);
      throw new BadRequestException(emailResult.error || 'Không thể gửi email. Vui lòng thử lại.');
    }

    console.log('✅ [AuthService] Password reset OTP sent successfully');
    return {
      message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
    };
  }

  // ✅ QUÊN MẬT KHẨU - Bước 2: Xác thực OTP và đặt lại mật khẩu
  async resetPasswordWithOTP(
    email: string,
    otpCode: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Verifying OTP and resetting password for:', email);

    // 1. Đọc OTP từ Redis
    const redisKey = `password-reset-otp:${email}`;
    const storedOTP = await this.redis.get(redisKey);

    if (!storedOTP || storedOTP !== otpCode) {
      console.log('❌ [AuthService] Invalid or expired OTP');
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    // 2. Tìm user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    // 3. Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Cập nhật mật khẩu
    user.PasswordHash = hashedPassword;
    await this.userRepo.save(user);

    // 5. Xóa OTP sau khi sử dụng
    await this.redis.del(redisKey);

    console.log('✅ [AuthService] Password reset successfully');
    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
    };
  }
} 