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
    completeProfile(userId: string, docType: string, docPath: string): Promise<{
        status: string;
        message: string;
    }>;
    skipVerification(userId: string): Promise<{
        status: string;
        message: string;
    }>;
    getUserProfile(userId: string): Promise<{
        id: string;
        citizenId: string;
        fullName: string;
        email: string;
        phone: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
