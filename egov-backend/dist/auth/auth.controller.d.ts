import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDocumentDto } from './dto/verify-document.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: express.Response): Promise<{
        status: string;
        citizenId: string;
    }>;
    login(loginDto: LoginDto, res: express.Response): Promise<{
        status: string;
    }>;
    verifyDocument(req: any, verifyDto: VerifyDocumentDto): Promise<{
        status: string;
        message: string;
    }>;
    skipVerification(req: any): Promise<{
        status: string;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        id: number;
        email: string;
        citizenId: string;
        profileComplete: boolean;
        verificationDocType?: string;
        verificationDocPath?: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(res: express.Response): Promise<{
        status: string;
    }>;
}
