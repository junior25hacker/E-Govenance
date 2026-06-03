"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
let SettingsService = class SettingsService {
    userSettings = new Map();
    initializeSettings(userId, citizenId, email) {
        const settings = {
            userId,
            citizenId,
            email,
            avatar: null,
            registeredDate: new Date(),
            preferences: {
                emailNotifications: true,
                smsNotifications: true,
                publicProfile: false,
                shareWithAgencies: true,
                twoFactorAuth: false,
            },
            updatedAt: new Date(),
        };
        this.userSettings.set(userId, settings);
        console.log('[SETTINGS] User settings initialized for:', userId);
        return settings;
    }
    getSettings(userId) {
        const settings = this.userSettings.get(userId);
        if (!settings) {
            throw new common_1.UnauthorizedException('User settings not found');
        }
        return settings;
    }
    async updateProfile(userId, updateProfileDto) {
        const settings = this.userSettings.get(userId);
        if (!settings) {
            throw new common_1.UnauthorizedException('User settings not found');
        }
        if (updateProfileDto.fullName)
            settings.fullName = updateProfileDto.fullName;
        if (updateProfileDto.email)
            settings.email = updateProfileDto.email;
        if (updateProfileDto.phone)
            settings.phone = updateProfileDto.phone;
        if (updateProfileDto.nationalId)
            settings.nationalId = updateProfileDto.nationalId;
        settings.updatedAt = new Date();
        this.userSettings.set(userId, settings);
        console.log('[SETTINGS] Profile updated for user:', userId);
        return settings;
    }
    async changePassword(userId, changePasswordDto) {
        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        if (changePasswordDto.newPassword.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        console.log('[SETTINGS] Password changed for user:', userId);
        return {
            status: 'success',
            message: 'Password changed successfully. Please log in again.',
        };
    }
    async updatePreferences(userId, updatePreferencesDto) {
        const settings = this.userSettings.get(userId);
        if (!settings) {
            throw new common_1.UnauthorizedException('User settings not found');
        }
        if (updatePreferencesDto.emailNotifications !== undefined) {
            settings.preferences.emailNotifications = updatePreferencesDto.emailNotifications;
        }
        if (updatePreferencesDto.smsNotifications !== undefined) {
            settings.preferences.smsNotifications = updatePreferencesDto.smsNotifications;
        }
        if (updatePreferencesDto.publicProfile !== undefined) {
            settings.preferences.publicProfile = updatePreferencesDto.publicProfile;
        }
        if (updatePreferencesDto.shareWithAgencies !== undefined) {
            settings.preferences.shareWithAgencies = updatePreferencesDto.shareWithAgencies;
        }
        if (updatePreferencesDto.twoFactorAuth !== undefined) {
            settings.preferences.twoFactorAuth = updatePreferencesDto.twoFactorAuth;
        }
        settings.updatedAt = new Date();
        this.userSettings.set(userId, settings);
        console.log('[SETTINGS] Preferences updated for user:', userId);
        return settings;
    }
    exportData(userId, format) {
        const settings = this.userSettings.get(userId);
        if (!settings) {
            throw new common_1.UnauthorizedException('User settings not found');
        }
        const exportData = {
            profile: {
                citizenId: settings.citizenId,
                email: settings.email,
                fullName: settings.fullName,
                phone: settings.phone,
                nationalId: settings.nationalId,
                registeredDate: settings.registeredDate,
            },
            preferences: settings.preferences,
            exportDate: new Date(),
            format: format,
        };
        console.log('[SETTINGS] Data exported for user:', userId, 'Format:', format);
        return exportData;
    }
    deleteAccount(userId) {
        if (!this.userSettings.has(userId)) {
            throw new common_1.UnauthorizedException('User not found');
        }
        this.userSettings.delete(userId);
        console.log('[SETTINGS] Account deleted for user:', userId);
        return {
            status: 'success',
            message: 'Account deleted successfully',
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)()
], SettingsService);
//# sourceMappingURL=settings.service.js.map