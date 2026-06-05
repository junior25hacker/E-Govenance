import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * Global exception filter that catches ALL exceptions and returns
 * structured JSON error blocks for API requests.
 * For page requests (non-API), redirects to login on auth errors.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        message = resp.message || resp.error || message;
        code = resp.code || this.statusToCode(status);
        // Handle class-validator array messages
        if (Array.isArray(message)) {
          message = message.join('; ');
        }
      }

      code = this.statusToCode(status);
    } else if (exception instanceof Error) {
      message = exception.message;
      console.error('[ERROR]', exception.stack);
    }

    // For page requests (not API), redirect to login on auth errors
    if (!request.url.startsWith('/api/') && (status === 401 || status === 403)) {
      return response.redirect('/login');
    }

    response.status(status).json({
      status: 'error',
      message: message,
      code: code,
    });
  }

  private statusToCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
