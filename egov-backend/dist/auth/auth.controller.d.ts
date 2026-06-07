import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDocumentDto } from './dto/verify-document.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    seed(): Promise<{
        status: string;
        message: string;
    }>;
    register(registerDto: RegisterDto, res: express.Response): Promise<{
        status: string;
        citizenId: string;
        token: string;
    }>;
    citizenLogin(loginDto: LoginDto, res: express.Response): Promise<{
        status: string;
        token: string;
        citizen: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    login(loginDto: LoginDto, res: express.Response): Promise<{
        status: string;
        token: string;
        citizen: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    private _handleLogin;
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
        citizenId: string;
        email: string;
        fullName: string;
        phone: string;
        nationalId: string;
        avatar: string;
        preferences: string;
        profileComplete: boolean;
        verificationDocType: string;
        verificationDocPath: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getThirdPartyIdentity(citizenId: string): Promise<{
        id: number;
        citizenId: string;
        email: string;
        fullName: string;
        phone: string;
        nationalId: string;
        avatar: string;
        preferences: string;
        profileComplete: boolean;
        verificationDocType: string;
        verificationDocPath: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(res: express.Response): Promise<{
        status: string;
    }>;
}
