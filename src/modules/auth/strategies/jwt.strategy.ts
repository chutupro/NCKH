import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../models/types/jwt-payload.type';

/**
 * JWT authentication strategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validates JWT payload and returns user
   */
  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { userId: payload.sub },
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      userId: user.userId,
      email: user.email,
      role: user.role.roleName,
    };
  }
}

