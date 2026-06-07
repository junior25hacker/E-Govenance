import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { User } from '../auth/entities/user.entity';

const DEFAULT_PREFS = {
  emailNotifications: true,
  smsNotifications: true,
  publicProfile: false,
  shareWithAgencies: true,
  twoFactorAuth: false,
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Initialize user settings (called from auth service on registration)
  async initializeSettings(userId: number, citizenId: string, email: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (user) {
      user.preferences = JSON.stringify(DEFAULT_PREFS);
      await this.userRepository.save(user);
      console.log('[SETTINGS] User settings initialized for:', userId);
    }
  }

  private parsePreferences(prefsString: string | null) {
    if (!prefsString) return { ...DEFAULT_PREFS };
    try {
      return { ...DEFAULT_PREFS, ...JSON.parse(prefsString) };
    } catch (e) {
      return { ...DEFAULT_PREFS };
    }
  }

  // Get user settings
  async getSettings(userId: number): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.id,
      citizenId: user.citizenId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      nationalId: user.nationalId,
      avatar: user.avatar,
      registeredDate: user.createdAt,
      preferences: this.parsePreferences(user.preferences),
      updatedAt: user.updatedAt,
    };
  }

  // Update profile
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (updateProfileDto.fullName !== undefined) user.fullName = updateProfileDto.fullName;
    if (updateProfileDto.email !== undefined) user.email = updateProfileDto.email;
    if (updateProfileDto.phone !== undefined) user.phone = updateProfileDto.phone;
    if (updateProfileDto.nationalId !== undefined) user.nationalId = updateProfileDto.nationalId;

    await this.userRepository.save(user);
    console.log('[SETTINGS] Profile updated for user:', userId);
    return this.getSettings(userId);
  }

  // Change password
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ status: string; message: string }> {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (changePasswordDto.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
    if (!passwordMatch) {
      throw new BadRequestException('Invalid current password');
    }

    const salt = await bcrypt.genSalt();
    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);
    await this.userRepository.save(user);

    console.log('[SETTINGS] Password changed for user:', userId);
    return {
      status: 'success',
      message: 'Password changed successfully. Please log in again.',
    };
  }

  // Update preferences
  async updatePreferences(userId: number, updatePreferencesDto: UpdatePreferencesDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const prefs = this.parsePreferences(user.preferences);

    if (updatePreferencesDto.emailNotifications !== undefined) prefs.emailNotifications = updatePreferencesDto.emailNotifications;
    if (updatePreferencesDto.smsNotifications !== undefined) prefs.smsNotifications = updatePreferencesDto.smsNotifications;
    if (updatePreferencesDto.publicProfile !== undefined) prefs.publicProfile = updatePreferencesDto.publicProfile;
    if (updatePreferencesDto.shareWithAgencies !== undefined) prefs.shareWithAgencies = updatePreferencesDto.shareWithAgencies;
    if (updatePreferencesDto.twoFactorAuth !== undefined) prefs.twoFactorAuth = updatePreferencesDto.twoFactorAuth;

    user.preferences = JSON.stringify(prefs);
    await this.userRepository.save(user);

    console.log('[SETTINGS] Preferences updated for user:', userId);
    return this.getSettings(userId);
  }

  // Export user data
  async exportData(userId: number, format: 'json' | 'pdf' | 'zip'): Promise<any> {
    const settings = await this.getSettings(userId);

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
  async deleteAccount(userId: number): Promise<{ status: string; message: string }> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.userRepository.remove(user);
    console.log('[SETTINGS] Account deleted for user:', userId);
    return {
      status: 'success',
      message: 'Account deleted successfully',
    };
  }

  // Upload avatar
  async uploadAvatar(userId: number, avatarPath: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.avatar = avatarPath;
    await this.userRepository.save(user);
    console.log('[SETTINGS] Avatar updated for user:', userId);
    return this.getSettings(userId);
  }
}
