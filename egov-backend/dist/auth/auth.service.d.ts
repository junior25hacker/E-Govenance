import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { SettingsService } from '../settings/settings.service';
import { SystemLogsService } from '../system-logs/system-logs.service';
export declare class AuthService {
    private readonly userRepository;
    private jwtService;
    private settingsService;
    private systemLogsService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, settingsService: SettingsService, systemLogsService: SystemLogsService);
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
    getVerifiedCitizenProfileByCitizenId(citizenId: string): Promise<{
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
    seedAdmins(): Promise<void>;
}
