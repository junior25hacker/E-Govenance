import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Move the frontend to Port 4000 to prevent collisions
  const port = process.env.FRONTEND_PORT ?? 4000;
  await app.listen(port);

  const url = `http://localhost:${port}`;
  console.log(`[FRONTEND] 🚀 Citizen Web Portal is running on: ${url}`);

  // Automatically open the landing page
  const { exec } = require('child_process');
  const startCommand = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${startCommand} ${url}`);
}
bootstrap();