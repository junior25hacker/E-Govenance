import { ExceptionFilter, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
export declare class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost): Response<any, Record<string, any>> | undefined;
}
