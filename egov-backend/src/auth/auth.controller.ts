import { Controller, Post, Body, Get, Req, UseGuards, UnauthorizedException, Res } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDocumentDto } from './dto/verify-document.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/v1/auth/citizen')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.authService.register(registerDto);
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        return res.json({ status: 'success', citizenId: result.citizenId });
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.authService.login(loginDto.citizenId, loginDto.email);
        if (!result) {
            throw new UnauthorizedException('Invalid citizen ID or email');
        }
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        return res.json({ status: 'success' });
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-document')
    async verifyDocument(@Req() req, @Body() verifyDto: VerifyDocumentDto) {
        return this.authService.completeProfile(req.user.id, verifyDto.docType, verifyDto.docPath);
    }

    @UseGuards(JwtAuthGuard)
    @Post('skip-verification')
    async skipVerification(@Req() req) {
        return this.authService.skipVerification(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req) {
        return this.authService.getUserProfile(req.user.id);
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: express.Response) {
        res.clearCookie('token');
        return { status: 'success' };
    }
}
