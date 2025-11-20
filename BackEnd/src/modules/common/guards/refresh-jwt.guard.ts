import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 🔐 RefreshTokenCookieGuard
 * 
 * Guard cho route /auth/refresh
 * - Sử dụng RefreshTokenStrategy (jwt-refresh)
 * - Đọc refresh_token từ HttpOnly cookie
 * - Không cần body hay header
 */
@Injectable()
export class RefreshJwtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
