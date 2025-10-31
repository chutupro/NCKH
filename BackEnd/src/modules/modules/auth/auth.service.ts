import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';
import { OTP } from '../../entities/otp.entity';
import { Users } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(OTP)
    private readonly otpRepo: Repository<OTP>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

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

    // 3. Xóa các OTP cũ của email này (nếu có)
    await this.otpRepo.delete({ Email: email });

    // 4. Tạo OTP mới
    const otpCode = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Hết hạn sau 10 phút

    const otp = this.otpRepo.create({
      Email: email,
      Code: otpCode,
      ExpiresAt: expiresAt,
      IsUsed: false,
    });

    await this.otpRepo.save(otp);
    console.log('✅ [AuthService] OTP created:', { email, code: otpCode, expiresAt });

    // 5. Gửi email OTP
    console.log('📧 [AuthService] Attempting to send email...');
    const emailResult = await this.emailService.sendOTPEmail(email, otpCode);
    
    console.log('📧 [AuthService] Email service returned:', {
      success: emailResult.success,
      error: emailResult.error
    });
    
    if (!emailResult.success) {
      // Xóa OTP vì gửi email thất bại
      console.log('❌ [AuthService] Email send failed, deleting OTP...');
      await this.otpRepo.delete({ Email: email });
      
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
    // 1. Tìm OTP hợp lệ
    const otp = await this.otpRepo.findOne({
      where: {
        Email: email,
        Code: otpCode,
        IsUsed: false,
      },
    });

    if (!otp) {
      throw new BadRequestException('Mã OTP không hợp lệ.');
    }

    // 2. Kiểm tra OTP đã hết hạn chưa
    if (new Date() > otp.ExpiresAt) {
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    // 3. Đánh dấu OTP đã sử dụng
    otp.IsUsed = true;
    await this.otpRepo.save(otp);

    // 4. Tạo tài khoản người dùng
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

    // 3. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours expiry

    console.log('🔑 [AuthService] Generated verification token');

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user with unverified status
    const user = this.userRepo.create({
      Email: email,
      PasswordHash: hashedPassword,
      FullName: fullName || 'User',
      RoleID: role ? parseInt(role) : 2, // 🔥 Default role: 2 (User)
      IsEmailVerified: false,
      EmailVerificationToken: verificationToken,
      EmailVerificationExpiry: tokenExpiry,
    });

    await this.userRepo.save(user);
    console.log('✅ [AuthService] User created with verification token');

    // 6. Create UserProfile automatically
    await this.userService.createUserProfile(user.UserID);
    console.log('✅ [AuthService] UserProfile created');

    // 7. Send verification email
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    console.log('📧 [AuthService] Sending verification email...');
    const emailResult = await this.emailService.sendVerificationEmail(email, verificationLink, fullName || 'User');

    if (!emailResult.success) {
      // Delete user if email fails
      console.log('❌ [AuthService] Email failed, deleting user...');
      await this.userRepo.delete({ UserID: user.UserID });
      throw new BadRequestException(emailResult.error || 'Không thể gửi email xác thực.');
    }

    console.log('✅ [AuthService] Email confirmation registration completed');
    return {
      message: 'Chúng tôi đã gửi link xác thực đến email của bạn. Vui lòng check email để hoàn tất đăng ký.',
    };
  }

  // 🔥 NEW: Verify Email Token
  async verifyEmailToken(token: string): Promise<{ message: string; user: any }> {
    console.log('🔵 [AuthService] Verifying email token');

    // Find user with this token
    const user = await this.userRepo.findOne({
      where: { EmailVerificationToken: token },
    });

    if (!user) {
      console.log('❌ [AuthService] Invalid token');
      throw new BadRequestException('Link xác thực không hợp lệ hoặc đã hết hạn.');
    }

    // Check if already verified
    if (user.IsEmailVerified) {
      console.log('⚠️ [AuthService] Email already verified');
      return {
        message: 'Email đã được xác thực trước đó. Bạn có thể đăng nhập.',
        user: {
          id: user.UserID,
          email: user.Email,
          fullName: user.FullName,
        },
      };
    }

    // Check token expiry
    if (user.EmailVerificationExpiry && new Date() > user.EmailVerificationExpiry) {
      console.log('❌ [AuthService] Token expired');
      throw new BadRequestException('Link xác thực đã hết hạn. Vui lòng đăng ký lại.');
    }

    // Mark email as verified
    user.IsEmailVerified = true;
    user.EmailVerificationToken = null;
    user.EmailVerificationExpiry = null;
    await this.userRepo.save(user);

    console.log('✅ [AuthService] Email verified successfully');
    return {
      message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.',
      user: {
        id: user.UserID,
        email: user.Email,
        fullName: user.FullName,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email không tồn tại');

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) throw new UnauthorizedException('Mật khẩu không đúng');

    return user;
  }

  async getTokens(user: any) {
    const payload = {
      sub: user.UserID,
      email: user.Email,
      role: user.RoleID,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET') ?? 'access_secret',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 'refresh_secret',
      expiresIn: '7d',
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = await this.getTokens(user);
    // Hash and store refresh token for revocation control
    const hash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userService.setRefreshTokenHash(user.UserID, hash);
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: {
        UserID: user.UserID,
        Email: user.Email,
        FullName: user.FullName,
        RoleID: user.RoleID,
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
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

    const storedHash = await this.userService.getRefreshTokenHash(userId);
    if (!storedHash) throw new UnauthorizedException('Refresh token không hợp lệ');

    const match = await bcrypt.compare(refreshToken, storedHash);
    if (!match) throw new UnauthorizedException('Refresh token không hợp lệ');

    // rotate refresh token: issue new refresh token and replace hash in DB
    const newTokens = await this.getTokens(user);
    const newHash = await bcrypt.hash(newTokens.refresh_token, 10);
    await this.userService.setRefreshTokenHash(user.UserID, newHash);

    return { 
      accessToken: newTokens.access_token, 
      refreshToken: newTokens.refresh_token 
    };
  }

  async logout(userId: number) {
    // Remove stored refresh token hash so refresh token is revoked
    await this.userService.setRefreshTokenHash(userId, null);
    return { message: 'Đăng xuất thành công' };
  }

  // Cleanup expired OTPs (chạy định kỳ hoặc gọi manual)
  async cleanupExpiredOTPs() {
    const result = await this.otpRepo.delete({
      ExpiresAt: LessThan(new Date()),
    });
    console.log(`Cleaned up ${result.affected} expired OTPs`);
    return { deleted: result.affected };
  }
}
