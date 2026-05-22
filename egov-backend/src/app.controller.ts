import { Controller, Get, Render, Query, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
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
  @Render('index')
  root() {
    return { title: 'CitizenNode | Home' };
  }

  @Get('login')
  @Render('login')
  login() {
    return { title: 'CitizenNode | Login' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  @Render('dashboard')
  async dashboard(@Req() req) {
    const userProfile = await this.authService.getUserProfile(req.user.id);
    const documents = await this.documentsService.findByCitizen(userProfile.citizenId);
    
    return {
      title: 'CitizenNode | Dashboard',
      user: userProfile,
      documents: documents,
      documentCount: documents.length,
    };
  }

  @Get('civil-status')
  @Render('civil-status')
  civilStatus() {
    return { title: 'CitizenNode | Civil Status' };
  }

  // FIXED: Using express.Response explicitly so the decorator metadata can safely generate
  @Get('api/lost-doc-schema')
  getLostDocumentSchema(@Query('type') type: string, @Res() res: express.Response) {
    const dataSchema = this.appService.getDocumentSchema(type);
    return res.status(HttpStatus.OK).json(dataSchema);
  }
}