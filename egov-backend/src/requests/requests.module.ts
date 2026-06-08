import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { TrackingRequest } from './entities/request.entity';
import { RequestLog } from './entities/request-log.entity';
import { DocumentRequest } from '../documents/entities/document-request.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrackingRequest, RequestLog, DocumentRequest, Document])
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService]
})
export class RequestsModule {}
