import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ForbiddenException('No token provided');
    }
    
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.role !== 'admin' && decoded.role != 'super_admin') {
        throw new ForbiddenException('Super admin access required');
      }
      request.user = decoded;
      return true;
    } catch {
      throw new ForbiddenException('Invalid or insufficient permissions');
    }
  }
}
