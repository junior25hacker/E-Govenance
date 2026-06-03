import { SettingsService } from './settings.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<any>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<any>;
    updatePreferences(req: any, updatePreferencesDto: UpdatePreferencesDto): Promise<any>;
    exportData(req: any, format?: string): Promise<any>;
    deleteAccount(req: any): Promise<any>;
}
