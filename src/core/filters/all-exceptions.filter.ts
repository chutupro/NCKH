import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  readonly statusCode: number;
  readonly timestamp: string;
  readonly path: string;
  readonly message: string;
}

/**
 * Catch-all exception filter for unhandled exceptions
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * Catches all unhandled exceptions
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof Error ? exception.message : 'Internal server error';
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };
    response.status(status).json(errorResponse);
  }
}

