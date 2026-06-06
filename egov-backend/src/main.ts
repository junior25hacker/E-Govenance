import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
const cookieParser = require('cookie-parser');
const hbs = require('hbs');

// Load .env early (ConfigModule handles it for DI, but we need it for bootstrap)
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  // Increase body size limits — documents may be uploaded as base64 in JSON
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global structured error handler
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS — accept traffic from web browser and JavaFX desktop client
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (desktop apps, curl, etc.)
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        // In development, allow all origins
        if (process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('[BACKEND] 📁 Created uploads directory:', uploadsDir);
  }

  // Serve uploaded documents publicly at /uploads/*
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Register Handlebars helpers
  hbs.registerHelper('eq', (a: any, b: any) => a === b);
  hbs.registerHelper('ne', (a: any, b: any) => a !== b);
  hbs.registerHelper('gt', (a: any, b: any) => a > b);
  hbs.registerHelper('lt', (a: any, b: any) => a < b);
  hbs.registerHelper('and', (a: any, b: any) => a && b);
  hbs.registerHelper('or', (a: any, b: any) => a || b);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`[BACKEND] 🚀 E-Governance Backend & Portal running on: http://localhost:${port}`);
  console.log(`[BACKEND] 📦 Database: ${process.env.DB_PATH || './database.sqlite'}`);
  console.log(`[BACKEND] 🔐 JWT Secret: ${process.env.JWT_SECRET ? '(from .env)' : '(default)'}`);
  console.log(`[BACKEND] 🌐 CORS Origins: ${corsOrigins.join(', ')}`);
}
bootstrap();