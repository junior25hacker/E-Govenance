import { Controller, Get, Post, Put, Delete, Body, UseGuards, Req, Query } from '@nestjs/common';
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
    const settings = this.settingsService.getSettings(req.user.id);
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
    const data = this.settingsService.exportData(req.user.id, format as any);
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
    const result = this.settingsService.deleteAccount(req.user.id);
    return {
      status: result.status,
      message: result.message,
    };
  }
}
