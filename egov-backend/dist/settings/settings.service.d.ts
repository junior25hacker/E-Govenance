import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
export interface UserSettings {
    userId: number;
    citizenId: string;
    fullName?: string;
    email: string;
    phone?: string;
    nationalId?: string;
    avatar?: string | null;
    registeredDate: Date;
    preferences: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        publicProfile: boolean;
        shareWithAgencies: boolean;
        twoFactorAuth: boolean;
    };
    updatedAt: Date;
}
export declare class SettingsService {
    private userSettings;
    initializeSettings(userId: number, citizenId: string, email: string): UserSettings;
    getSettings(userId: number): UserSettings;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserSettings>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        status: string;
        message: string;
    }>;
    updatePreferences(userId: number, updatePreferencesDto: UpdatePreferencesDto): Promise<UserSettings>;
    exportData(userId: number, format: 'json' | 'pdf' | 'zip'): any;
    deleteAccount(userId: number): {
        status: string;
        message: string;
    };
}
