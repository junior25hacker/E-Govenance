"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const request_entity_1 = require("./entities/request.entity");
const request_log_entity_1 = require("./entities/request-log.entity");
const document_request_entity_1 = require("../documents/entities/document-request.entity");
const document_entity_1 = require("../documents/entities/document.entity");
let RequestsService = class RequestsService {
    requestRepo;
    logRepo;
    docRequestRepo;
    documentRepo;
    constructor(requestRepo, logRepo, docRequestRepo, documentRepo) {
        this.requestRepo = requestRepo;
        this.logRepo = logRepo;
        this.docRequestRepo = docRequestRepo;
        this.documentRepo = documentRepo;
    }
    stageSequence = [
        request_entity_1.RequestStage.PENDING,
        request_entity_1.RequestStage.UNDER_REVIEW,
        request_entity_1.RequestStage.APPROVED,
        request_entity_1.RequestStage.REJECTED
    ];
    async createRequest(dto, performedBy = 'System') {
        const request = this.requestRepo.create({
            userId: dto.userId,
            title: dto.title,
            description: dto.description,
            currentStatus: request_entity_1.RequestStage.PENDING,
        });
        const savedRequest = await this.requestRepo.save(request);
        await this.logTransition(savedRequest, 'CREATE_REQUEST', null, request_entity_1.RequestStage.PENDING, performedBy, 'Request automatically added to tracking system upon creation.');
        return savedRequest;
    }
    async getRequestById(id, userId) {
        await this.syncPendingRequests();
        const request = await this.requestRepo.findOne({
            where: { requestId: id, userId: userId },
            relations: { logs: true },
        });
        if (!request) {
            throw new common_1.NotFoundException(`Request with ID ${id} not found.`);
        }
        return request;
    }
    async getAllTrackedRequests(userId) {
        await this.syncPendingRequests();
        const requests = await this.requestRepo.find({
            where: { userId: userId },
            order: { updatedAt: 'DESC' },
        });
        if (!requests || requests.length === 0) {
            return { message: 'No active tracking available', data: [] };
        }
        return { data: requests };
    }
    async getPendingRequests(userId) {
        await this.syncPendingRequests();
        const pendingRequests = await this.requestRepo.find({
            where: { currentStatus: request_entity_1.RequestStage.PENDING, userId: userId },
            order: { createdAt: 'DESC' },
        });
        if (!pendingRequests || pendingRequests.length === 0) {
            return { message: 'No pending requests found.', data: [] };
        }
        return { data: pendingRequests };
    }
    async nextStage(id, explicitStatus, performedBy, description) {
        const request = await this.requestRepo.findOneBy({ requestId: id });
        if (!request) {
            throw new common_1.NotFoundException(`Request with ID ${id} not found.`);
        }
        let newStatus = request.currentStatus;
        if (request.currentStatus === request_entity_1.RequestStage.PENDING) {
            newStatus = request_entity_1.RequestStage.UNDER_REVIEW;
        }
        else if (request.currentStatus === request_entity_1.RequestStage.UNDER_REVIEW) {
            if (!explicitStatus) {
                throw new common_1.BadRequestException('Must provide explicit status (APPROVED or REJECTED) when advancing from UNDER REVIEW.');
            }
            const upperStatus = explicitStatus.toUpperCase();
            if (upperStatus !== request_entity_1.RequestStage.APPROVED && upperStatus !== request_entity_1.RequestStage.REJECTED) {
                throw new common_1.BadRequestException('Status must be APPROVED or REJECTED.');
            }
            newStatus = upperStatus;
        }
        else {
            throw new common_1.BadRequestException('Request is already completed (APPROVED/REJECTED). Cannot advance further.');
        }
        const previousStatus = request.currentStatus;
        request.currentStatus = newStatus;
        const savedRequest = await this.requestRepo.save(request);
        await this.logTransition(savedRequest, 'STAGE_PROGRESSION', previousStatus, newStatus, performedBy || 'System', description || `Request automatically moved to ${newStatus} stage.`);
        return savedRequest;
    }
    async getLogs(id, userId) {
        const request = await this.requestRepo.findOne({
            where: { requestId: id, userId: userId },
            relations: { logs: true },
        });
        if (!request) {
            throw new common_1.NotFoundException(`Request with ID ${id} not found.`);
        }
        request.logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return request.logs;
    }
    async logTransition(request, actionType, previousStatus, newStatus, performedBy, description) {
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
    async syncPendingRequests() {
        const pendingDocRequests = await this.docRequestRepo.find({
            where: { status: 'PENDING' }
        });
        for (const docReq of pendingDocRequests) {
            const existing = await this.requestRepo.findOneBy({ title: docReq.referenceId });
            if (!existing) {
                await this.createRequest({
                    userId: docReq.citizenId,
                    title: docReq.referenceId,
                    description: `Document Request for ${docReq.documentType}`,
                }, 'System Sync');
            }
        }
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
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(request_entity_1.TrackingRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(request_log_entity_1.RequestLog)),
    __param(2, (0, typeorm_1.InjectRepository)(document_request_entity_1.DocumentRequest)),
    __param(3, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RequestsService);
//# sourceMappingURL=requests.service.js.map