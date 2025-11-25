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

    this.REFRESH_TOKEN_HMAC_SECRET = 
      this.config.get<string>('REFRESH_TOKEN_HMAC_SECRET') ?? 
      this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 
      'default_hmac_secret_change_in_production';
  }

  private hashRefreshToken(token: string): string {
    return crypto
      .createHmac('sha256', this.REFRESH_TOKEN_HMAC_SECRET)
      .update(token)
      .digest('hex');
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTPForRegistration(email: string): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Starting OTP registration for:', email);

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      console.log('❌ [AuthService] Email already exists in database:', email);
      throw new BadRequestException('Email đã được sử dụng.');
    }

    console.log('🔍 [AuthService] Verifying email exists:', email);
    const emailValidation = await this.emailService.verifyEmailExists(email);
    if (!emailValidation.valid) {
      console.log('❌ [AuthService] Email validation failed:', email, '-', emailValidation.reason);
      throw new BadRequestException(emailValidation.reason || 'Email không hợp lệ hoặc không thể nhận thư. Vui lòng kiểm tra lại.');
    }
    console.log('✅ [AuthService] Email validation passed:', email);

    const otpCode = this.generateOTP();
    const redisKey = `otp:${email}`;

    await this.redis.set(redisKey, otpCode, 600);

    console.log('✅ [AuthService] OTP created in Redis:', { email, code: otpCode, ttl: '10 minutes' });

    console.log('📧 [AuthService] Attempting to send email...');
    const emailResult = await this.emailService.sendOTPEmail(email, otpCode);

    console.log('📧 [AuthService] Email service returned:', {
      success: emailResult.success,
      error: emailResult.error
    });

    if (!emailResult.success) {

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

  async verifyOTPAndRegister(
    email: string,
    otpCode: string,
    password: string,
    fullName?: string,
    role?: string,
  ) {
    console.log('🔵 [AuthService] Starting OTP verification for:', email);

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

    await this.redis.del(redisKey);
    console.log('✅ [AuthService] OTP deleted from Redis');

    console.log('📝 [AuthService] Creating user account...');
    const user = await this.userService.createUser(email, password, fullName, role);

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

  async registerWithEmailConfirmation(
    email: string,
    password: string,
    fullName?: string,
    role?: string
  ): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Starting email confirmation registration for:', email);

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      console.log('❌ [AuthService] Email already exists:', email);
      throw new BadRequestException('Email đã được sử dụng.');
    }

    console.log('🔍 [AuthService] Validating email:', email);
    const emailValidation = await this.emailService.verifyEmailExists(email);
    if (!emailValidation.valid) {
      console.log('❌ [AuthService] Email validation failed:', email);
      throw new BadRequestException(emailValidation.reason || 'Email không hợp lệ.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      Email: email,
      PasswordHash: hashedPassword,
      FullName: fullName || 'User',
      RoleID: role ? parseInt(role) : 2, // 🔥 Default role: 2 (User)
      IsEmailVerified: false,
    });

    await this.userRepo.save(user);
    console.log('✅ [AuthService] User created successfully');

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

    const userWithRole = await this.userRepo.findOne({
      where: { UserID: user.UserID },
      relations: ['role'],
    });

    return userWithRole || user;
  }

  async getTokens(user: any, rememberMe: boolean = false) {

    const userWithRole = await this.userRepo.findOne({
      where: { UserID: user.UserID },
      relations: ['role'],
    });

    const roleName = userWithRole?.role?.RoleName || 'User';

    const jti = randomUUID();

    const payload = {
      sub: user.UserID,
      email: user.Email,
      role: roleName,
      jti, // ✅ THÊM JTI VÀO ACCESS TOKEN
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET') ?? 'access_secret',
      expiresIn: '15m',
    });

    const refreshTokenExpiry = rememberMe ? '30d' : '7d';

    const refreshPayload = {
      sub: user.UserID,
      email: user.Email,
      role: roleName,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 'refresh_secret',
      expiresIn: refreshTokenExpiry, // ← ĐỔI THEO rememberMe
    });

    await this.redis.setAccessJti(user.UserID, jti);

    console.log(`✅ [AuthService] Created tokens for user ${user.UserID}:`, {
      jti,
      accessExpiry: '15m',
      refreshExpiry: refreshTokenExpiry,
      rememberMe,
    });

    return { access_token: accessToken, refresh_token: refreshToken, jti, refreshTokenExpiry };
  }

  async login(email: string, password: string, deviceInfo?: string, rememberMe: boolean = false) {
    const user = await this.validateUser(email, password);
    const tokens = await this.getTokens(user, rememberMe); // ← Truyền rememberMe

    const redisTTL = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 ngày hoặc 7 ngày (seconds)

    const refreshTokenHash = this.hashRefreshToken(tokens.refresh_token);
    const redisKey = `rt:${refreshTokenHash}`;

    await this.redis.set(redisKey, user.UserID.toString(), redisTTL);

    console.log(`✅ [AuthService] Login successful for user ${user.UserID}:`, {
      rememberMe,
      refreshTokenExpiry: tokens.refreshTokenExpiry,
      redisTTL: `${redisTTL}s (${rememberMe ? '30d' : '7d'})`,
    });

    const userWithProfile = await this.userRepo.findOne({
      where: { UserID: user.UserID },
      relations: ['role', 'profile'],
    });

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: {
        userId: user.UserID,
        email: user.Email,
        fullName: user.FullName ?? '',
        roleId: user.RoleID,
        role: user?.role?.RoleName || 'User',
        profile: {
          avatar: userWithProfile?.profile?.Avatar || '/img/default-avatar.png',
        },
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string, deviceInfo?: string, rememberMe: boolean = false) {

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

    await this.redis.del(redisKey);

    const newTokens = await this.getTokens(userWithRole || user, rememberMe); // ← Truyền rememberMe
    const newHash = this.hashRefreshToken(newTokens.refresh_token);
    const newRedisKey = `rt:${newHash}`;

    const redisTTL = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // seconds
    await this.redis.set(newRedisKey, user.UserID.toString(), redisTTL);

    console.log(`✅ [AuthService] Tokens refreshed for user ${userId}:`, {
      rememberMe,
      refreshTokenExpiry: newTokens.refreshTokenExpiry,
      redisTTL: `${redisTTL}s (${rememberMe ? '30d' : '7d'})`,
    });

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

    await this.redis.deleteAccessJti(userId);
    console.log(`✅ [AuthService] Revoked all access tokens for user ${userId}`);

    if (refreshToken) {
      const refreshTokenHash = this.hashRefreshToken(refreshToken);
      const redisKey = `rt:${refreshTokenHash}`;
      await this.redis.del(redisKey);
    } else {

      await this.redis.delByPattern(`rt:*`);
    }
    return { message: 'Đăng xuất thành công' };
  }

  async googleLogin(googleUser: any) {
    const { email, fullName, avatar, googleId } = googleUser;

    console.log('🔵 [AuthService] Google login for:', email);

    let user = await this.userService.findByEmail(email);

    if (!user) {

      console.log('📝 [AuthService] Creating new user for Google login');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      user = await this.userService.createUser(email, randomPassword, fullName, '2'); // Role 2 = User

      user.IsEmailVerified = true;
      await this.userRepo.save(user);
      console.log('✅ [AuthService] User created and email verified');

      await this.userService.createUserProfile(user.UserID);
      console.log('✅ [AuthService] UserProfile created for Google user');
    } else {
      console.log('✅ [AuthService] Existing user found');
    }

    const tokens = await this.getTokens(user, true);

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

  async facebookLogin(facebookUser: any) {
    const { email, fullName, avatar, facebookId } = facebookUser;

    console.log('🔵 [AuthService] Facebook login for:', email);

    let user = await this.userService.findByEmail(email);

    if (!user) {

      console.log('📝 [AuthService] Creating new user for Facebook login');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      user = await this.userService.createUser(email, randomPassword, fullName || 'Facebook User', '2'); // Role 2 = User

      user.IsEmailVerified = true;
      await this.userRepo.save(user);
      console.log('✅ [AuthService] User created and email verified');

      await this.userService.createUserProfile(user.UserID);
      console.log('✅ [AuthService] UserProfile created for Facebook user');
    } else {
      console.log('✅ [AuthService] Existing user found');
    }

    const tokens = await this.getTokens(user, true);

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

  async sendOTPForPasswordReset(email: string): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Starting password reset for:', email);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log('❌ [AuthService] Email not found:', email);
      throw new BadRequestException('Email không tồn tại trong hệ thống.');
    }

    const otpCode = this.generateOTP();
    const redisKey = `password-reset-otp:${email}`;

    await this.redis.set(redisKey, otpCode, 600);

    console.log('✅ [AuthService] Password reset OTP created:', { email, code: otpCode });

    const emailResult = await this.emailService.sendPasswordResetOTP(email, otpCode);

    if (!emailResult.success) {

      await this.redis.del(redisKey);
      throw new BadRequestException(emailResult.error || 'Không thể gửi email. Vui lòng thử lại.');
    }

    console.log('✅ [AuthService] Password reset OTP sent successfully');
    return {
      message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
    };
  }

  async resetPasswordWithOTP(
    email: string,
    otpCode: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    console.log('🔵 [AuthService] Verifying OTP and resetting password for:', email);

    const redisKey = `password-reset-otp:${email}`;
    const storedOTP = await this.redis.get(redisKey);

    if (!storedOTP || storedOTP !== otpCode) {
      console.log('❌ [AuthService] Invalid or expired OTP');
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.PasswordHash = hashedPassword;
    await this.userRepo.save(user);

    await this.redis.del(redisKey);

    console.log('✅ [AuthService] Password reset successfully');
    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
    };
  }
} 