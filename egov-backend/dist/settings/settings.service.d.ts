import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { User } from '../auth/entities/user.entity';
export declare class SettingsService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    initializeSettings(userId: number, citizenId: string, email: string): Promise<void>;
    private parsePreferences;
    getSettings(userId: number): Promise<any>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        status: string;
        message: string;
    }>;
    updatePreferences(userId: number, updatePreferencesDto: UpdatePreferencesDto): Promise<any>;
    exportData(userId: number, format: 'json' | 'pdf' | 'zip'): Promise<any>;
    deleteAccount(userId: number): Promise<{
        status: string;
        message: string;
    }>;
    uploadAvatar(userId: number, avatarPath: string): Promise<any>;
}
