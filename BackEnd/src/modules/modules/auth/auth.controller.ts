import { Controller, Post, Body, UseGuards, Req, Get, Query, Res, Headers, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
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
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
  ) {
    const { email, password } = body;
    const result = await this.authService.login(email, password, userAgent);

    // 🔥 SET CẢ ACCESS_TOKEN VÀ REFRESH_TOKEN VÀO HTTPONLY COOKIE
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 🔥 KHÔNG TRẢ TOKENS VỀ BODY - CHỈ TRẢ USER INFO
    return {
      user: result.user,
    };
  }

  // --- Refresh token ---
  @Post('refresh')
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string,
  ) {
    // 🔥 ĐỌC REFRESH_TOKEN TỪ COOKIE
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    // Decode để lấy userId
    const decoded: any = this.authService['jwtService'].decode(refreshToken);
    const userId = decoded?.sub;

    const result = await this.authService.refreshTokens(userId, refreshToken, userAgent);

    // 🔥 SET CẢ 2 TOKENS MỚI VÀO COOKIE (ROTATION)
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 🔥 KHÔNG TRẢ GÌ VỀ BODY
    return {
      message: 'Token refreshed successfully',
    };
  }

  // --- Đăng xuất ---
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const refreshToken = req.cookies?.refresh_token;
    
    // 🔥 XÓA KEY TRONG REDIS
    await this.authService.logout(userId, refreshToken);
    
    // 🔥 CLEAR CẢ 2 COOKIES
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return { message: 'Đăng xuất thành công' };
  }

  // ✅ GOOGLE OAUTH - REDIRECT TO GOOGLE
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Guard sẽ redirect đến Google
  }

  // ✅ GOOGLE OAUTH - CALLBACK
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user);

    // Set cookies
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect về frontend với token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/google/success?user=${encodeURIComponent(JSON.stringify(result.user))}`);
  }

  // ✅ FACEBOOK OAUTH - REDIRECT TO FACEBOOK
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req: any) {
    // Guard sẽ redirect đến Facebook
  }

  // ✅ FACEBOOK OAUTH - CALLBACK
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.facebookLogin(req.user);

    // Set cookies
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect về frontend với token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/facebook/success?user=${encodeURIComponent(JSON.stringify(result.user))}`);
  }
}
