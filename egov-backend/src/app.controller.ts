import { Controller, Get, Query, Res, HttpStatus, UseGuards, Req, Render, Param } from '@nestjs/common';
import { join } from 'path';
import { AppService } from './app.service';
import * as express from 'express';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';
import { DocumentsService } from './documents/documents.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly documentsService: DocumentsService,
  ) { }

  @Get()
  root(@Res() res: express.Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('landing')
  landing(@Res() res: express.Response) {
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('login')
  @Render('login')
  login() {
    return { title: 'CitizenNode | Login' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  @Render('dashboard')
  async dashboard(@Req() req): Promise<any> {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    const documents = await this.documentsService.findByCitizen(userProfile.citizenId);
    const metrics = await this.documentsService.getMetrics(userProfile.citizenId);
    
    return {
      title: 'CitizenNode | Dashboard',
      user: userProfile,
      token: req.cookies?.token,
      documents: documents,
      documentCount: documents.length,
      approvedCount: metrics.approvedDocuments,
      pendingCount: metrics.pendingActions,
      rejectedCount: metrics.rejectedDocuments,
    };
  }

  @Get('civil-status')
  @Render('civil-status')
  civilStatus() {
    return { title: 'CitizenNode | Civil Status' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('documents')
  @Render('documents')
  async documentsView(@Req() req): Promise<any> {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    return { title: 'CitizenNode | My Documents', user: userProfile, token: req.cookies?.token };
  }

  @UseGuards(JwtAuthGuard)
  @Get('request')
  @Render('request')
  async requestView(@Req() req): Promise<any> {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    const requestsData = await this.documentsService.getRequests(userProfile.citizenId);
    const requests = requestsData.map(r => ({
      ...r,
      createdAtFormatted: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));
    return { title: 'CitizenNode | New Request', user: userProfile, token: req.cookies?.token, requests };
  }

  @UseGuards(JwtAuthGuard)
  @Get(['track-requests', 'tracking-request', 'tracking-request/:requestId'])
  @Render('track-requests')
  async trackRequestsView(@Req() req, @Param('requestId') requestId?: string): Promise<any> {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    return { title: 'CitizenNode | Track Requests', user: userProfile, token: req.cookies?.token, requestId };
  }

  @UseGuards(JwtAuthGuard)
  @Get('report')
  @Render('report')
  async reportView(@Req() req): Promise<any> {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    return { title: 'CitizenNode | Report Issue', user: userProfile, token: req.cookies?.token };
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  @Render('settings')
  async settingsView(@Req() req): Promise<any> {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    return { title: 'CitizenNode | Settings', user: userProfile, token: req.cookies?.token };
  }

  @Get('help')
  @Render('help')
  helpView() {
    return { title: 'CitizenNode | Help & Support' };
  }

  @Get('submit')
  @Render('submit')
  submitView() {
    return { title: 'CitizenNode | Document Submission' };
  }

  // ── API: Citizen Metrics (for dashboard KPI cards & frontend JS loaders) ──

  @Get('api/v1/citizen/metrics')
  async getCitizenMetrics(@Req() req) {
    try {
      // If authenticated, return user-specific metrics
      const citizenId = req.user?.citizenId || undefined;
      const metrics = await this.documentsService.getMetrics(citizenId);
      return {
        status: 'success',
        data: metrics,
      };
    } catch {
      // Unauthenticated: return global metrics
      const metrics = await this.documentsService.getMetrics();
      return {
        status: 'success',
        data: metrics,
      };
    }
  }

  // FIXED: Using express.Response explicitly so the decorator metadata can safely generate
  @Get('api/lost-doc-schema')
  getLostDocumentSchema(@Query('type') type: string) {
    const dataSchema = this.appService.getDocumentSchema(type);
    return dataSchema;
  }
}