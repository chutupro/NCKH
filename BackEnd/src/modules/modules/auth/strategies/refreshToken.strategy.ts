import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// 🔐 Custom extractor: ĐỌC REFRESH TOKEN TỪ COOKIE (chuẩn 2025)
const refreshTokenCookieExtractor = (req: any) => {
  try {
    if (!req || !req.cookies) {
      console.log('❌ [RefreshTokenStrategy] No cookies in request');
      return null;
    }
    
    const refreshToken = req.cookies['refresh_token'];
    
    if (refreshToken) {
      console.log('✅ [RefreshTokenStrategy] Refresh token found in cookie');
      return refreshToken;
    }
    
    console.log('❌ [RefreshTokenStrategy] No refresh_token cookie found');
    return null;
  } catch (err) {
    console.error('❌ [RefreshTokenStrategy] Error extracting refresh token:', err);
    return null;
  }
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      // 🔥 CHỈ ĐỌC TỪ COOKIE - KHÔNG ĐỌC TỪ BODY HAY HEADER
      jwtFromRequest: ExtractJwt.fromExtractors([refreshTokenCookieExtractor]),
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET', 'refresh_secret'),
      passReqToCallback: true, // ✅ Cần để lấy req trong validate()
    });
  }

  async validate(req: any, payload: any) {
    // Trả về payload + refresh token từ cookie
    const refreshToken = req.cookies?.refresh_token;
    
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role,
      refreshToken, // ✅ Pass refresh token để service xử lý rotation
    };
  }
}
