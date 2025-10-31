import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- Bước 1: Gửi OTP để đăng ký ---
  @Post('send-otp')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@gmail.com' },
      },
    },
  })
  async sendOTP(@Body() body: { email: string }) {
    return this.authService.sendOTPForRegistration(body.email);
  }

  // --- Bước 2: Xác thực OTP và hoàn tất đăng ký ---
  @Post('verify-otp')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@gmail.com' },
        otpCode: { type: 'string', example: '123456' },
        password: { type: 'string', example: 'Password123!' },
        fullName: { type: 'string', example: 'Lê Văn Nghĩa' },
        role: { type: 'string', example: '1' },
      },
    },
  })
  async verifyOTP(@Body() body: { email: string; otpCode: string; password: string; fullName?: string; role?: string }) {
    return this.authService.verifyOTPAndRegister(body.email, body.otpCode, body.password, body.fullName, body.role);
  }

  // --- Đăng ký (legacy - không dùng OTP) ---
  @Post('register')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@gmail.com' },
        password: { type: 'string', example: 'Password123!' },
        fullName: { type: 'string', example: 'Lê Văn Nghĩa' },
        role: { type: 'string', example: '1' },
      },
    },
  })
  async register(@Body() body: RegisterDto) {
    const { email, password, fullName, role } = body;
    // Quay lại dùng register() thông thường (không cần email verification)
    return this.authService.register(email, password, fullName, role);
  }

  // --- Đăng nhập ---
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@gmail.com' },
        password: { type: 'string', example: '123456' },
      },
    },
  })
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  // --- Refresh token ---
  @Post('refresh')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async refresh(@Body() body: { userId: number; refresh_token: string }) {
    const { userId, refresh_token } = body;
    return this.authService.refreshTokens(userId, refresh_token);
  }

  // --- Đăng xuất ---
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    await this.authService.logout(userId);
    return { message: 'Đăng xuất thành công' };
  }
}
