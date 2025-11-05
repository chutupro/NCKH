import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Custom extractor to read JWT from cookie (fall back to Authorization header)
const cookieExtractor = (req: any) => {
  try {
    if (!req) return null;
    // If using a proxy or server that attaches cookies, they appear on req.cookies
    if (req.cookies && req.cookies['access_token']) {
      // Log presence (do not print token value)
      console.log('[JwtStrategy] access_token cookie found, length=', String(req.cookies['access_token']).length);
      return req.cookies['access_token'];
    }
    // Fallback: Authorization header
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      console.log('[JwtStrategy] Authorization header found');
      return authHeader.split(' ')[1];
    }
    return null;
  } catch (err) {
    return null;
  }
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      // Try cookie first, then Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'access_secret',
    });
  }

  async validate(payload: any) {
    // payload chính là dữ liệu bạn mã hóa trong token
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
