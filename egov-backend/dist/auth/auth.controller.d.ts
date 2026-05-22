import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDocumentDto } from './dto/verify-document.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    login(loginDto: LoginDto, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
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
        profileComplete: boolean;
        verificationDocType: string;
        verificationDocPath: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logout(res: express.Response): Promise<{
        status: string;
    }>;
}
