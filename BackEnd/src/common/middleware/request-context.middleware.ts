import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    const id = randomUUID();
    console.log(`[${id}] ${req.method} ${req.originalUrl}`);
    next();
  }
}
