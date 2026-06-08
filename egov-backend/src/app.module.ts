import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { RequestsModule } from './requests/requests.module';

// Entity imports for TypeORM registration
import { User } from './auth/entities/user.entity';
import { Document } from './documents/entities/document.entity';
import { DocumentRequest } from './documents/entities/document-request.entity';
import { Report } from './documents/entities/report.entity';
import { TrackingRequest } from './requests/entities/request.entity';
import { RequestLog } from './requests/entities/request-log.entity';

@Module({
  imports: [
    // Load .env file globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Dynamic database connection (Postgres for Render, SQLite for local fallback)
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_URL ? 'postgres' : 'better-sqlite3',
      url: process.env.DATABASE_URL,
      database: process.env.DATABASE_URL ? undefined : (process.env.DB_PATH || './database.sqlite'),
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      entities: [User, Document, DocumentRequest, Report, TrackingRequest, RequestLog],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables ONLY in development
      logging: process.env.NODE_ENV === 'development',
    }),

    SettingsModule,
    AuthModule,
    DocumentsModule,
    RequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
