import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private jwtService;
    private users;
    private nextUserId;
    constructor(jwtService: JwtService);
    generateCitizenId(): Promise<string>;
    register(dto: RegisterDto): Promise<{
        status: string;
        citizenId: string;
        token: string;
    }>;
    login(citizenId: string, password: string): Promise<{
        status: string;
        token: string;
    } | null>;
    completeProfile(userId: number, docType: string, docPath: string): Promise<{
        status: string;
        message: string;
    }>;
    skipVerification(userId: number): Promise<{
        status: string;
        message: string;
    }>;
    getUserProfile(userId: number): Promise<{
        id: number;
        email: string;
        citizenId: string;
        profileComplete: boolean;
        verificationDocType?: string;
        verificationDocPath?: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
