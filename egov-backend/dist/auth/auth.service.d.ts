import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
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
        citizenId: string;
        email: string;
        fullName: string;
        profileComplete: boolean;
        verificationDocType: string;
        verificationDocPath: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
