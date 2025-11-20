import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../../common/redis.service';

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
  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
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
    // 🔐 CRITICAL SECURITY CHECK: VERIFY JTI
    const userId = payload.sub;
    const jti = payload.jti;

    // 1. Check if JTI exists in token
    if (!jti) {
      console.error('❌ [AccessTokenStrategy] Token missing JTI claim - REJECTED');
      throw new UnauthorizedException('Invalid access token: missing JTI');
    }

    // 2. Get current valid JTI from Redis
    const validJti = await this.redis.getAccessJti(userId);

    // 3. If no JTI in Redis → user logged out or token expired
    if (!validJti) {
      console.error(`❌ [AccessTokenStrategy] No valid JTI in Redis for user ${userId} - REJECTED (logged out or expired)`);
      throw new UnauthorizedException('Access token has been revoked');
    }

    // 4. Compare JTI from token with JTI in Redis
    if (jti !== validJti) {
      console.error(`❌ [AccessTokenStrategy] JTI mismatch for user ${userId}:
        Token JTI: ${jti}
        Valid JTI: ${validJti}
        → OLD TOKEN REJECTED (new token was issued)`);
      throw new UnauthorizedException('Access token has been revoked');
    }

    // ✅ JTI valid → allow access
    console.log(`✅ [AccessTokenStrategy] JTI validated successfully for user ${userId}`);
    
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
