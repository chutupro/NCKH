import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../../common/redis.service';

const cookieExtractor = (req: any) => {
  try {
    if (!req) return null;

    if (req.cookies && req.cookies['access_token']) {
      console.log('✅ [AccessTokenStrategy] Token found in cookie, length=', String(req.cookies['access_token']).length);
      return req.cookies['access_token'];
    }

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

      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, 
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),

      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET', 'access_secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {

    const userId = payload.sub;
    const jti = payload.jti;

    if (!jti) {
      console.error('❌ [AccessTokenStrategy] Token missing JTI claim - REJECTED');
      throw new UnauthorizedException('Invalid access token: missing JTI');
    }

    const validJti = await this.redis.getAccessJti(userId);

    if (!validJti) {
      console.error(`❌ [AccessTokenStrategy] No valid JTI in Redis for user ${userId} - REJECTED (logged out or expired)`);
      throw new UnauthorizedException('Access token has been revoked');
    }

    if (jti !== validJti) {
      console.error(`❌ [AccessTokenStrategy] JTI mismatch for user ${userId}:
        Token JTI: ${jti}
        Valid JTI: ${validJti}
        → OLD TOKEN REJECTED (new token was issued)`);
      throw new UnauthorizedException('Access token has been revoked');
    }

    console.log(`✅ [AccessTokenStrategy] JTI validated successfully for user ${userId}`);

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
