
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const resp: any = exception.getResponse()
    const error =(resp && resp.error) ||exception.name ||  'Error';
    let message: string | string[] = (resp && resp.message) || exception.message;
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        error,
        message,
        path:request.method+ request.url,
      });
  }
}