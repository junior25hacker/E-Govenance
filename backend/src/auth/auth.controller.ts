import { Controller, Post, Body, HttpCode, HttpStatus, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { status: 'OK', message: 'Backend is running' };
  }

  @Get('users/me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() request: Request) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    return this.authService.getUserFromToken(token);
  }
}