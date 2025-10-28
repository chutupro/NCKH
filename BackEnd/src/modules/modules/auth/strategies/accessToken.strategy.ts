import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
