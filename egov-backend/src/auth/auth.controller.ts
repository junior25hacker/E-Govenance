import { Controller, Post, Body, Get, Req, UseGuards, UnauthorizedException, Res } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDocumentDto } from './dto/verify-document.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ── Citizen Auth Routes (at /api/v1/auth/citizen/*) ──

    @Post('citizen/register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.authService.register(registerDto);
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        return { status: 'success', citizenId: result.citizenId };
    }

    @Post('citizen/login')
    async citizenLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        return this._handleLogin(loginDto, res);
    }

    // ── Alias Route: /api/v1/auth/login (for JavaFX admin client) ──

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        return this._handleLogin(loginDto, res);
    }

    private async _handleLogin(loginDto: LoginDto, res: express.Response) {
        const result = await this.authService.login(loginDto.citizenId, loginDto.password);
        if (!result) {
            throw new UnauthorizedException('Invalid citizen ID or password');
        }
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000
        });
        return { status: 'success', token: result.token, citizen: result.citizen };
    }

    @UseGuards(JwtAuthGuard)
    @Post('citizen/verify-document')
    async verifyDocument(@Req() req, @Body() verifyDto: VerifyDocumentDto) {
        return this.authService.completeProfile(req.user.id, verifyDto.docType, verifyDto.docPath);
    }

    @UseGuards(JwtAuthGuard)
    @Post('citizen/skip-verification')
    async skipVerification(@Req() req) {
        return this.authService.skipVerification(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('citizen/profile')
    async getProfile(@Req() req) {
        return this.authService.getUserProfile(req.user.id);
    }

    @Post('citizen/logout')
    @Post('logout')
    async logout(@Res({ passthrough: true }) res: express.Response) {
        res.clearCookie('token');
        return { status: 'success' };
    }
}
