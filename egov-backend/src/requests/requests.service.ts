import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { TrackingRequest, RequestStage } from './entities/request.entity';
import { RequestLog } from './entities/request-log.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { DocumentRequest } from '../documents/entities/document-request.entity';
import { Document } from '../documents/entities/document.entity';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { LogSeverity, SourceModule } from '../system-logs/entities/system-log.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(TrackingRequest)
    private readonly requestRepo: Repository<TrackingRequest>,
    @InjectRepository(RequestLog)
    private readonly logRepo: Repository<RequestLog>,
    @InjectRepository(DocumentRequest)
    private readonly docRequestRepo: Repository<DocumentRequest>,
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    private readonly systemLogsService: SystemLogsService,
  ) {}

  // The allowed progression sequence
  private readonly stageSequence = [
    RequestStage.PENDING,
    RequestStage.UNDER_REVIEW,
    RequestStage.APPROVED,
    RequestStage.REJECTED
  ];

  async createRequest(dto: CreateRequestDto, performedBy: string = 'System') {
    const request = this.requestRepo.create({
      userId: dto.userId,
      title: dto.title,
      description: dto.description,
      currentStatus: RequestStage.PENDING,
    });

    const savedRequest = await this.requestRepo.save(request);

    // Auto add to tracking by logging the initial state
    await this.logTransition(
      savedRequest,
      'CREATE_REQUEST',
      null,
      RequestStage.PENDING,
      performedBy,
      'Request automatically added to tracking system upon creation.'
    );

    await this.systemLogsService.createLog({
      title: 'Request Created',
      description: `Request '${dto.title}' was submitted successfully.`,
      userId: dto.userId,
      performedBy: dto.userId,
      sourceModule: SourceModule.REQUESTS,
      severity: LogSeverity.LOW,
      referenceId: savedRequest.requestId,
    });

    return savedRequest;
  }

  async getRequestById(id: string, userId: string) {
    await this.syncPendingRequests();

    const request = await this.requestRepo.findOne({
      where: { requestId: id, userId: userId },
      relations: { logs: true },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found.`);
    }

    return request;
  }

  async getAllTrackedRequests(userId: string) {
    // 1. Sync any new documents or document_requests
    await this.syncPendingRequests();

    // 2. Return all tracked requests for this user
    const requests = await this.requestRepo.find({
      where: { userId: userId },
      order: { updatedAt: 'DESC' },
    });

    if (!requests || requests.length === 0) {
      return { message: 'No active tracking available', data: [] };
    }

    return { data: requests };
  }

  async getPendingRequests(userId: string) {
    await this.syncPendingRequests();

    const pendingRequests = await this.requestRepo.find({
      where: { currentStatus: RequestStage.PENDING, userId: userId },
      order: { createdAt: 'DESC' },
    });

    if (!pendingRequests || pendingRequests.length === 0) {
      return { message: 'No pending requests found.', data: [] };
    }

    return { data: pendingRequests };
  }

  async nextStage(id: string, explicitStatus?: string, performedBy?: string, description?: string) {
    const request = await this.requestRepo.findOneBy({ requestId: id });
    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found.`);
    }

    let newStatus = request.currentStatus;

    if (request.currentStatus === RequestStage.PENDING) {
      newStatus = RequestStage.UNDER_REVIEW;
    } else if (request.currentStatus === RequestStage.UNDER_REVIEW) {
      if (!explicitStatus) {
        throw new BadRequestException('Must provide explicit status (APPROVED or REJECTED) when advancing from UNDER REVIEW.');
      }
      const upperStatus = explicitStatus.toUpperCase() as RequestStage;
      if (upperStatus !== RequestStage.APPROVED && upperStatus !== RequestStage.REJECTED) {
        throw new BadRequestException('Status must be APPROVED or REJECTED.');
      }
      newStatus = upperStatus;
    } else {
      throw new BadRequestException('Request is already completed (APPROVED/REJECTED). Cannot advance further.');
    }

    const previousStatus = request.currentStatus;
    request.currentStatus = newStatus;
    // updatedAt is automatically updated by @UpdateDateColumn
    const savedRequest = await this.requestRepo.save(request);

    // Save transition history
    await this.logTransition(
      savedRequest,
      'STAGE_PROGRESSION',
      previousStatus,
      newStatus,
      performedBy || 'System',
      description || `Request automatically moved to ${newStatus} stage.`
    );

    await this.systemLogsService.createLog({
      title: `Request ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase().replace('_', ' ')}`,
      description: `Request '${savedRequest.title}' status changed from ${previousStatus} to ${newStatus}.`,
      userId: savedRequest.userId,
      performedBy: performedBy || 'System',
      sourceModule: SourceModule.REQUESTS,
      severity: newStatus === RequestStage.REJECTED ? LogSeverity.HIGH : LogSeverity.MEDIUM,
      referenceId: savedRequest.requestId,
    });

    return savedRequest;
  }

  async getLogs(id: string, userId: string) {
    const request = await this.requestRepo.findOne({
      where: { requestId: id, userId: userId },
      relations: { logs: true },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found.`);
    }

    // Sort logs by timestamp ascending
    request.logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return request.logs;
  }

  private async logTransition(
    request: TrackingRequest,
    actionType: string,
    previousStatus: string | null,
    newStatus: string,
    performedBy: string,
    description: string
  ) {
    const log = this.logRepo.create({
      request,
      actionType,
      previousStatus: previousStatus || undefined,
      newStatus,
      performedBy,
      description,
    });
    await this.logRepo.save(log);
  }

  /**
   * Integration logic: detect requests in Pending queue, Review queue, Processing queue.
   * Auto-add to tracking pipeline if missing.
   */
  private async syncPendingRequests() {
    // Check DocumentRequests
    const pendingDocRequests = await this.docRequestRepo.find({
      where: { status: 'PENDING' }
    });

    for (const docReq of pendingDocRequests) {
      // Use referenceId as title to map it
      const existing = await this.requestRepo.findOneBy({ title: docReq.referenceId });
      if (!existing) {
        await this.createRequest({
          userId: docReq.citizenId,
          title: docReq.referenceId,
          description: `Document Request for ${docReq.documentType}`,
        }, 'System Sync');
      }
    }

    // Check Documents (digitalized items)
    const pendingDocs = await this.documentRepo.find({
      where: { status: 'pending' }
    });

    for (const doc of pendingDocs) {
      const docTitle = `DOC-${doc.id}-${doc.documentType}`;
      const existing = await this.requestRepo.findOneBy({ title: docTitle });
      if (!existing) {
        await this.createRequest({
          userId: doc.citizenId,
          title: docTitle,
          description: `Digitalized Document: ${doc.originalFilename || doc.documentType}`,
        }, 'System Sync');
      }
    }
  }
}
