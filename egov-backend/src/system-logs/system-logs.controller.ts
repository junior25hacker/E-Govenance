import { Controller, Get, Render, UseGuards, Req, Res, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SystemLogsService } from './system-logs.service';
import { AuthService } from '../auth/auth.service';

@Controller()
export class SystemLogsController {
  constructor(
    private readonly systemLogsService: SystemLogsService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('system-activity')
  @Render('system-activity')
  async activityView(@Req() req): Promise<any> {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    return { title: 'CitizenNode | System Activity Log', user: userProfile, token: req.cookies?.token };
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/v1/system-logs')
  async getLogs(@Req() req) {
    try {
      const logs = await this.systemLogsService.getLogsByUser(req.user.citizenId);
      return { status: 'success', data: logs };
    } catch (e) {
      return { status: 'error', message: 'Failed to fetch logs' };
    }
  }
}
