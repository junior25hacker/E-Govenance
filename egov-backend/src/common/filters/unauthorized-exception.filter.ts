import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // For API requests, return a 401 JSON
    if (request.url.startsWith('/api/')) {
      return response.status(401).json({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    // For page requests (like /dashboard), redirect to login
    response.redirect('/login');
  }
}
