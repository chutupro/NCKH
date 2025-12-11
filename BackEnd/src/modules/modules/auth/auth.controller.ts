import { Controller, Post, Body, UseGuards, Req, Get, Query, Res, Headers, UnauthorizedException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RefreshJwtGuard } from '../../common/guards/refresh-jwt.guard';
import { GoogleOAuthGuard } from '../../common/guards/google-oauth.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBody, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService, // ← THÊM ĐỂ DECODE JWT
  ) {}

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
  @ApiHeader({
    name: 'user-agent',
    required: false,
    description: 'User agent string (optional)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@gmail.com' },
        password: { type: 'string', example: '123456' },
        rememberMe: { type: 'boolean', example: true, description: 'Ghi nhớ đăng nhập (30 ngày nếu true, 7 ngày nếu false)' },
      },
    },
  })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent?: string,
  ) {
    const { email, password, rememberMe } = body;
    
    // 🐞 DEBUG: kiểm tra giá trị rememberMe từ frontend
    console.log('🔐 [AuthController] Login request:', { email, rememberMe });
    
    // ← Truyền rememberMe xuống service
    const result = await this.authService.login(email, password, userAgent, rememberMe);

    // 🔐 GHI NHỚ ĐĂNG NHẬP (chuẩn Facebook/Shopee)
    // - Tick "Ghi nhớ" → 30 ngày
    // - Không tick → 7 ngày
    const refreshTokenMaxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 ngày
      : 7 * 24 * 60 * 60 * 1000;  // 7 ngày (default)

    // Cookie options với domain localhost cho dev
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Share cookie across localhost ports
    } as const;

    // 🔥 SET CẢ ACCESS_TOKEN VÀ REFRESH_TOKEN VÀO HTTPONLY COOKIE
    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour (khớp với JWT expiry)
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge, // ← ĐỔI THEO rememberMe
    });

    console.log('✅ [AuthController] Cookies set successfully:', {
      email,
      rememberMe,
      refreshTokenMaxAge: rememberMe ? '30 days' : '7 days',
      cookieMaxAge: `${refreshTokenMaxAge}ms`,
      secure: cookieOptions.secure,
      domain: cookieOptions.domain,
    });

    // 🔥 KHÔNG TRẢ TOKENS VỀ BODY - CHỈ TRẢ USER INFO
    // Also return access token in body to support header-based clients (dev-friendly)
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // --- Refresh token ---
  // 🔐 CHUẨN 2025: KHÔNG TRẢ ACCESS TOKEN TRONG BODY - CHỈ DÙNG HTTPONLY COOKIE
  @Post('refresh')
  @UseGuards(RefreshJwtGuard) // ✅ Dùng guard để tự động verify refresh token từ cookie
  @ApiHeader({
    name: 'user-agent',
    required: false,
    description: 'User agent string (optional)',
  })
  async refresh(
    @Req() req: any,
    @Res() res: Response,
    @Headers('user-agent') userAgent?: string,
  ) {
    // ✅ Refresh token đã được verify bởi RefreshJwtGuard
    const userId = req.user?.userId;
    const refreshToken = req.user?.refreshToken; // Từ strategy

    if (!userId || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 🔐 TỰ ĐỘNG PHÁT HIỆN rememberMe từ refresh token hiện tại
    // Decode JWT để lấy exp (không verify vì đã verify ở guard)
    const payload = this.jwtService.decode(refreshToken) as any;
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - currentTime;
    
    // Nếu token còn > 14 ngày → rememberMe = true (30d token)
    // Nếu token còn <= 14 ngày → rememberMe = false (7d token)
    const rememberMe = remainingTime > 14 * 24 * 60 * 60;
    
    console.log('🔐 [AuthController] Refresh token analysis:', {
      userId,
      remainingTime: `${Math.floor(remainingTime / 86400)} days`,
      rememberMe,
    });

    // 🔥 LẤY TOKENS MỚI (với JTI mới + rotation) - TRUYỀN rememberMe
    const result = await this.authService.refreshTokens(userId, refreshToken, userAgent, rememberMe);

    // 🔐 GHI NHỚ ĐĂNG NHẬP: maxAge khớp với rememberMe
    const refreshTokenMaxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 ngày
      : 7 * 24 * 60 * 60 * 1000;  // 7 ngày

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    } as const;

    // 🔥 SET ACCESS TOKEN VÀO HTTPONLY COOKIE
    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour (khớp với JWT expiry)
    });

    // 🔥 SET REFRESH TOKEN MỚI VÀO HTTPONLY COOKIE (ROTATION)
    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge, // ← ĐỔI THEO rememberMe
    });

    console.log('✅ [AuthController] Tokens refreshed and cookies set:', {
      userId,
      rememberMe,
      refreshTokenMaxAge: rememberMe ? '30 days' : '7 days',
    });

    // 🔥 RESPONSE 204 NO CONTENT - KHÔNG TRẢ ACCESS TOKEN TRONG BODY
    // Frontend sẽ tự động nhận cookie mới
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  // --- Get Access Token from Cookie (for Media Service) ---
  @Get('token')
  async getToken(@Req() req: any) {
    const accessToken = req.cookies?.access_token;
    
    if (!accessToken) {
      throw new UnauthorizedException('Access token không tồn tại. Vui lòng đăng nhập.');
    }
    
    return { access_token: accessToken };
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
    
    // 🔥 XÓA ACCESS JTI + REFRESH TOKEN KEY TRONG REDIS
    await this.authService.logout(userId, refreshToken);
    
    // 🔥 CLEAR CẢ 2 COOKIES
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return { message: 'Đăng xuất thành công' };
  }

  // --- 🔥 BONUS: Đăng xuất tất cả thiết bị ---
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout-all')
  async logoutAllDevices(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    
    // 🔥 XÓA ACCESS JTI → Revoke tất cả access tokens
    await this.authService.logout(userId);
    
    // 🔥 XÓA TẤT CẢ REFRESH TOKENS (pattern matching)
    // Note: Nên improve thành rt:{userId}:* để chỉ xóa của user này
    
    // 🔥 CLEAR COOKIES CỦA DEVICE HIỆN TẠI
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return { message: 'Đã đăng xuất khỏi tất cả thiết bị' };
  }

  // ✅ GOOGLE OAUTH - REDIRECT TO GOOGLE
  // 🔥 Dùng GoogleOAuthGuard để bắt buộc hiện popup chọn tài khoản
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req: any) {
    // Guard sẽ redirect đến Google với prompt=select_account
  }

  // ✅ GOOGLE OAUTH - CALLBACK
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user);

    // Set cookies với domain localhost để share giữa các port
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Share cookie across localhost ports
    } as const;

    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days - Google OAuth mặc định rememberMe=true
    });

    console.log('✅ [AuthController] Cookies set for Google login (30-day session):', {
      accessTokenLength: result.accessToken.length,
      domain: cookieOptions.domain,
      sameSite: cookieOptions.sameSite,
    });

  // Redirect về frontend với token và user data (use /oauth/... to avoid dev proxy collision)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const userData = encodeURIComponent(JSON.stringify(result.user));
  const token = encodeURIComponent(result.accessToken);
  res.redirect(`${frontendUrl}/oauth/google/success?user=${userData}&token=${token}`);
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

    // Cookie options với domain localhost cho dev
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Share cookie across localhost ports
    } as const;

    // Set cookies (consistent with Google OAuth)
    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days - Facebook OAuth mặc định rememberMe=true
    });

    console.log('✅ [AuthController] Cookies set for Facebook login (30-day session):', {
      accessTokenLength: result.accessToken.length,
      domain: cookieOptions.domain,
      sameSite: cookieOptions.sameSite,
    });

  // Redirect về frontend with token (use /oauth/... to avoid dev proxy collision)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const userData = encodeURIComponent(JSON.stringify(result.user));
  const token = encodeURIComponent(result.accessToken);
  res.redirect(`${frontendUrl}/oauth/facebook/success?user=${userData}&token=${token}`);
  }

  // ✅ QUÊN MẬT KHẨU - Gửi OTP
  @Post('forgot-password/send-otp')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  async sendPasswordResetOTP(@Body() body: { email: string }) {
    return this.authService.sendOTPForPasswordReset(body.email);
  }

  // ✅ QUÊN MẬT KHẨU - Xác thực OTP và đặt lại mật khẩu
  @Post('forgot-password/reset')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otpCode: { type: 'string', example: '123456' },
        newPassword: { type: 'string', example: 'NewPassword123!' },
      },
    },
  })
  async resetPassword(@Body() body: { email: string; otpCode: string; newPassword: string }) {
    return this.authService.resetPasswordWithOTP(body.email, body.otpCode, body.newPassword);
  }
}
