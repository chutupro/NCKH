import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { UserModule } from '../user/user.module';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { OTP } from '../../entities/otp.entity';
import { Users } from '../../entities/user.entity'; // 🔥 NEW

@Module({
  imports: [
    ConfigModule,
    UserModule,
    TypeOrmModule.forFeature([OTP, Users]), // 🔥 Thêm Users
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_ACCESS_SECRET') || 'access_secret',
        signOptions: { expiresIn: cs.get<number>('JWT_ACCESS_EXPIRES') || 900 }, // 900s = 15 phút
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  // JwtStrategy removed to avoid duplicate 'jwt' strategy registration — AccessTokenStrategy is used
  ],
  exports: [AuthService],
})
export class AuthModule {}
