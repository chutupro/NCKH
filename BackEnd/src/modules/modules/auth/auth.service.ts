import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Đăng ký
  async register(email: string, password: string, fullName?: string, role?: string) {
    const user = await this.userService.createUser(email, password, fullName, role);
    return {
      message: 'Đăng ký thành công',
      user: {
        id: user.UserID,
        email: user.Email,
        fullName: user.FullName,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email không tồn tại');

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) throw new UnauthorizedException('Mật khẩu không đúng');

    return user;
  }

  async getTokens(user: any) {
    const payload = {
      sub: user.UserID,
      email: user.Email,
      role: user.RoleID,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET') ?? 'access_secret',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 'refresh_secret',
      expiresIn: '7d',
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = await this.getTokens(user);
    // Hash and store refresh token for revocation control
    const hash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userService.setRefreshTokenHash(user.UserID, hash);
    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    // Verify refresh token signature first
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 'refresh_secret',
      });
    } catch (err) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    if (!payload || payload.sub !== userId) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('Không tìm thấy user');

    const storedHash = await this.userService.getRefreshTokenHash(userId);
    if (!storedHash) throw new UnauthorizedException('Refresh token không hợp lệ');

    const match = await bcrypt.compare(refreshToken, storedHash);
    if (!match) throw new UnauthorizedException('Refresh token không hợp lệ');

    // rotate refresh token: issue new refresh token and replace hash in DB
    const newTokens = await this.getTokens(user);
    const newHash = await bcrypt.hash(newTokens.refresh_token, 10);
    await this.userService.setRefreshTokenHash(user.UserID, newHash);

    return { access_token: newTokens.access_token, refresh_token: newTokens.refresh_token };
  }

  async logout(userId: number) {
    // Remove stored refresh token hash so refresh token is revoked
    await this.userService.setRefreshTokenHash(userId, null);
    return { message: 'Đăng xuất thành công' };
  }
}
