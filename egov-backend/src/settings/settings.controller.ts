import { Controller, Get, Post, Put, Delete, Body, UseGuards, Req, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { SettingsService } from './settings.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req): Promise<any> {
    console.log('[SETTINGS] Fetch profile for user:', req.user.id);
    const settings = await this.settingsService.getSettings(req.user.id);
    return {
      status: 'success',
      data: settings,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto): Promise<any> {
    console.log('[SETTINGS] Update profile for user:', req.user.id);
    const updated = await this.settingsService.updateProfile(req.user.id, updateProfileDto);
    return {
      status: 'success',
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto): Promise<any> {
    console.log('[SETTINGS] Change password for user:', req.user.id);
    const result = await this.settingsService.changePassword(req.user.id, changePasswordDto);
    return {
      status: result.status,
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('preferences')
  async updatePreferences(@Req() req, @Body() updatePreferencesDto: UpdatePreferencesDto): Promise<any> {
    console.log('[SETTINGS] Update preferences for user:', req.user.id);
    const updated = await this.settingsService.updatePreferences(req.user.id, updatePreferencesDto);
    return {
      status: 'success',
      message: 'Preferences updated successfully',
      data: updated.preferences,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportData(@Req() req, @Query('format') format: string = 'json'): Promise<any> {
    console.log('[SETTINGS] Export data for user:', req.user.id, 'Format:', format);
    const data = await this.settingsService.exportData(req.user.id, format as any);
    return {
      status: 'success',
      message: `Data exported as ${format}`,
      data: data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@Req() req): Promise<any> {
    console.log('[SETTINGS] Delete account for user:', req.user.id);
    const result = await this.settingsService.deleteAccount(req.user.id);
    return {
      status: result.status,
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  }))
  async uploadAvatar(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    console.log('[SETTINGS] Upload avatar for user:', req.user.id);

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const filename = `avatar_${req.user.citizenId}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);

    // Update user profile with relative path
    const avatarUrl = `/uploads/avatars/${filename}`;
    const updated = await this.settingsService.uploadAvatar(req.user.id, avatarUrl);

    return {
      status: 'success',
      message: 'Avatar updated successfully',
      data: { avatarUrl },
    };
  }
}
