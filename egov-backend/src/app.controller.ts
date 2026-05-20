import { Controller, Get, Render, Query, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import * as express from 'express'; // FIXED: Swapped to a namespace import to satisfy isolatedModules rules

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @Get('dashboard')
  @Render('dashboard')
  dashboard() {
    return { title: 'CitizenNode | Dashboard' };
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