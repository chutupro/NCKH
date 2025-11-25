import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const cookieExtractor = (req: any) => {
  try {
    if (!req) return null;

    if (req.cookies && req.cookies['access_token']) {

      console.log('[JwtStrategy] access_token cookie found, length=', String(req.cookies['access_token']).length);
      return req.cookies['access_token'];
    }

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

      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'access_secret',
    });
  }

  async validate(payload: any) {

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
