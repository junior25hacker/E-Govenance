import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';
import { DocumentRequest } from './entities/document-request.entity';
import { Report } from './entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentRequest, Report]),
    MulterModule.register({
      // Use memory storage — the service handles writing to disk with UUID naming
      storage: undefined, // defaults to memory storage
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
      },
    }),
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule { }
