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

    return this.authService.register(email, password, fullName, role);
  }

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

    console.log('🔐 [AuthController] Login request:', { email, rememberMe });

    const result = await this.authService.login(email, password, userAgent, rememberMe);

    const refreshTokenMaxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 ngày
      : 7 * 24 * 60 * 60 * 1000;  // 7 ngày (default)

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

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

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

    const userId = req.user?.userId;
    const refreshToken = req.user?.refreshToken; // Từ strategy

    if (!userId || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.jwtService.decode(refreshToken) as any;
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - currentTime;

    const rememberMe = remainingTime > 14 * 24 * 60 * 60;

    console.log('🔐 [AuthController] Refresh token analysis:', {
      userId,
      remainingTime: `${Math.floor(remainingTime / 86400)} days`,
      rememberMe,
    });

    const result = await this.authService.refreshTokens(userId, refreshToken, userAgent, rememberMe);

    const refreshTokenMaxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 ngày
      : 7 * 24 * 60 * 60 * 1000;  // 7 ngày

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
    } as const;

    res.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge, // ← ĐỔI THEO rememberMe
    });

    console.log('✅ [AuthController] Tokens refreshed and cookies set:', {
      userId,
      rememberMe,
      refreshTokenMaxAge: rememberMe ? '30 days' : '7 days',
    });

    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const refreshToken = req.cookies?.refresh_token;

    await this.authService.logout(userId, refreshToken);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Đăng xuất thành công' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout-all')
  async logoutAllDevices(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.sub || req.user?.userId;

    await this.authService.logout(userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Đã đăng xuất khỏi tất cả thiết bị' };
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req: any) {

  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user);

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

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const userData = encodeURIComponent(JSON.stringify(result.user));
  const token = encodeURIComponent(result.accessToken);
  res.redirect(`${frontendUrl}/oauth/google/success?user=${userData}&token=${token}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req: any) {

  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.facebookLogin(req.user);

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
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days - Facebook OAuth mặc định rememberMe=true
    });

    console.log('✅ [AuthController] Cookies set for Facebook login (30-day session):', {
      accessTokenLength: result.accessToken.length,
      domain: cookieOptions.domain,
      sameSite: cookieOptions.sameSite,
    });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const userData = encodeURIComponent(JSON.stringify(result.user));
  const token = encodeURIComponent(result.accessToken);
  res.redirect(`${frontendUrl}/oauth/facebook/success?user=${userData}&token=${token}`);
  }

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
