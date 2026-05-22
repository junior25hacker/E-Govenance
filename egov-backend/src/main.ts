import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { UnauthorizedExceptionFilter } from './common/filters/unauthorized-exception.filter';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`[BACKEND] 🚀 E-Governance Backend & Portal running on: http://localhost:${port}`);
}
bootstrap();