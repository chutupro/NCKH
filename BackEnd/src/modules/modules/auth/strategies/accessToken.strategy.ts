import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Custom extractor to read JWT from cookie OR Authorization header
const cookieExtractor = (req: any) => {
  try {
    if (!req) return null;
    
    // 1. Try cookie first (for OAuth and regular login with cookies)
    if (req.cookies && req.cookies['access_token']) {
      console.log('✅ [AccessTokenStrategy] Token found in cookie, length=', String(req.cookies['access_token']).length);
      return req.cookies['access_token'];
    }
    
    // 2. Fallback: Authorization header (for API clients)
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      console.log('✅ [AccessTokenStrategy] Token found in Authorization header');
      return authHeader.split(' ')[1];
    }
    
    console.log('❌ [AccessTokenStrategy] No token found in cookie or header');
    return null;
  } catch (err) {
    console.error('❌ [AccessTokenStrategy] Error extracting token:', err);
    return null;
  }
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      // Support both cookie and header-based authentication
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, 
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      // Use same env key as AuthService.getTokens
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET', 'access_secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // Stateless validation: payload was already verified by passport-jwt
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
