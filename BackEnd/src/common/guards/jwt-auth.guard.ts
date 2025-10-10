import { Injectable, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw new ForbiddenException('Token không hợp lệ hoặc đã hết hạn');
    }
    return user;
  }
}