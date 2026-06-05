import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { SettingsService } from '../settings/settings.service';
export declare class AuthService {
    private readonly userRepository;
    private jwtService;
    private settingsService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, settingsService: SettingsService);
    generateCitizenId(): Promise<string>;
    register(dto: RegisterDto): Promise<{
        status: string;
        citizenId: string;
        token: string;
    }>;
    login(citizenId: string, password: string): Promise<{
        status: string;
        token: string;
        citizen: {
            id: string;
            email: string;
            role: string;
        };
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
