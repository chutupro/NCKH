import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { AuthController } from '../controllers/auth.controller';
import { JwtStrategy } from '../../../common/passport/jwt.strategy';
import { AuthService } from '../services/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
