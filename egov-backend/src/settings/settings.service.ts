import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

@Injectable()
export class SettingsService {
  private userSettings: Map<number, UserSettings> = new Map();

  // Initialize user settings (called from auth service on registration)
  initializeSettings(userId: number, citizenId: string, email: string) {
    const settings: UserSettings = {
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

  // Get user settings
  getSettings(userId: number): UserSettings {
    const settings = this.userSettings.get(userId);
    if (!settings) {
      throw new UnauthorizedException('User settings not found');
    }
    return settings;
  }

  // Update profile
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserSettings> {
    const settings = this.userSettings.get(userId);
    if (!settings) {
      throw new UnauthorizedException('User settings not found');
    }

    if (updateProfileDto.fullName) settings.fullName = updateProfileDto.fullName;
    if (updateProfileDto.email) settings.email = updateProfileDto.email;
    if (updateProfileDto.phone) settings.phone = updateProfileDto.phone;
    if (updateProfileDto.nationalId) settings.nationalId = updateProfileDto.nationalId;

    settings.updatedAt = new Date();
    this.userSettings.set(userId, settings);
    console.log('[SETTINGS] Profile updated for user:', userId);
    return settings;
  }

  // Change password (placeholder - requires auth service integration)
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ status: string; message: string }> {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (changePasswordDto.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // In real implementation, would verify currentPassword against stored hash
    console.log('[SETTINGS] Password changed for user:', userId);
    return {
      status: 'success',
      message: 'Password changed successfully. Please log in again.',
    };
  }

  // Update preferences
  async updatePreferences(userId: number, updatePreferencesDto: UpdatePreferencesDto): Promise<UserSettings> {
    const settings = this.userSettings.get(userId);
    if (!settings) {
      throw new UnauthorizedException('User settings not found');
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

  // Export user data
  exportData(userId: number, format: 'json' | 'pdf' | 'zip'): any {
    const settings = this.userSettings.get(userId);
    if (!settings) {
      throw new UnauthorizedException('User settings not found');
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

  // Delete account
  deleteAccount(userId: number): { status: string; message: string } {
    if (!this.userSettings.has(userId)) {
      throw new UnauthorizedException('User not found');
    }

    this.userSettings.delete(userId);
    console.log('[SETTINGS] Account deleted for user:', userId);
    return {
      status: 'success',
      message: 'Account deleted successfully',
    };
  }
}
