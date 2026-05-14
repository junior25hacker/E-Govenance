import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {

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
}
