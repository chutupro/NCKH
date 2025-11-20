import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 🔐 GoogleOAuthGuard
 * 
 * Custom guard cho Google OAuth với prompt: 'select_account'
 * Bắt buộc hiện popup chọn tài khoản mỗi lần login (chuẩn Shopee/Tiki/Netflix)
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    return {
      // 🔥 BẮT BUỘC HIỆN POPUP CHỌN TÀI KHOẢN
      prompt: 'select_account',
      // access_type: 'offline', // Nếu cần refresh token từ Google
    };
  }
}
