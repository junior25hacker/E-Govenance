import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
export interface UserSettings {
    userId: string;
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
    initializeSettings(userId: string, citizenId: string, email: string): UserSettings;
    getSettings(userId: string): UserSettings;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserSettings>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        status: string;
        message: string;
    }>;
    updatePreferences(userId: string, updatePreferencesDto: UpdatePreferencesDto): Promise<UserSettings>;
    exportData(userId: string, format: 'json' | 'pdf' | 'zip'): any;
    deleteAccount(userId: string): {
        status: string;
        message: string;
    };
}
