import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      // Use same env key as AuthService.getTokens
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET', 'refresh_secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // simply return payload; additional checks done in service
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
