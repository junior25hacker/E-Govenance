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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const documents_service_1 = require("./documents.service");
const submit_document_request_dto_1 = require("./dto/submit-document-request.dto");
const submit_report_dto_1 = require("./dto/submit-report.dto");
const verify_status_dto_1 = require("./dto/verify-status.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async getDocuments(req, status) {
        if (status) {
            console.log(`[DOCUMENTS] Admin extraction for status: ${status}`);
            const documents = await this.documentsService.findByStatus(status);
            return {
                status: 'success',
                count: documents.length,
                data: documents,
            };
        }
        if (!req.user) {
            throw new common_1.HttpException({ status: 'error', message: 'Authentication required', code: 'AUTH_REQUIRED' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('[DOCUMENTS] Fetch user documents for:', req.user.citizenId);
        const documents = await this.documentsService.findByCitizen(req.user.citizenId);
        return {
            status: 'success',
            data: documents,
        };
    }
    async submitDocument(req, submitDto) {
        console.log('[DOCUMENTS] Submit document received:', submitDto);
        const citizenId = req.user?.citizenId || submitDto.citizenId || 'ANONYMOUS';
        const result = await this.documentsService.submitDocument(citizenId, submitDto);
        return {
            status: 'success',
            message: 'Document submitted for verification',
            trackingId: result.id,
            data: result,
        };
    }
    async getDocumentById(id) {
        const documentId = parseInt(id, 10);
        if (isNaN(documentId)) {
            throw new common_1.HttpException({ status: 'error', message: 'Invalid document ID', code: 'INVALID_ID' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const doc = await this.documentsService.findById(documentId);
        if (!doc) {
            throw new common_1.HttpException({ status: 'error', message: `Document with ID ${documentId} not found`, code: 'NOT_FOUND' }, common_1.HttpStatus.NOT_FOUND);
        }
        return {
            status: 'success',
            data: doc,
        };
    }
    async verifyStatus(id, verifyDto) {
        console.log(`[DOCUMENTS] Verify status for document ${id}:`, verifyDto);
        const documentId = parseInt(id, 10);
        if (isNaN(documentId)) {
            throw new common_1.HttpException({ status: 'error', message: 'Invalid document ID', code: 'INVALID_ID' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const result = await this.documentsService.updateVerifyStatus(documentId, verifyDto.status, verifyDto.verifiedBy);
        return {
            status: 'success',
            message: `Document ${verifyDto.status} successfully`,
            data: result,
        };
    }
    async submitRequest(req, submitDto) {
        console.log('[DOCUMENTS] Submit request received:', submitDto);
        const result = await this.documentsService.submitRequest(req.user.citizenId, submitDto);
        return {
            status: 'success',
            message: 'Document request submitted successfully',
            data: result,
        };
    }
    async submitReport(req, reportDto) {
        console.log('[REPORTS] Submit report received:', reportDto);
        const result = await this.documentsService.submitReport(req.user.citizenId, reportDto);
        return {
            status: 'success',
            message: 'Report submitted successfully',
            data: result,
        };
    }
    async getRequests(req) {
        console.log('[DOCUMENTS] Fetch requests for:', req.user.citizenId);
        const requests = await this.documentsService.getRequests(req.user.citizenId);
        return {
            status: 'success',
            data: requests,
        };
    }
    async getReports(req) {
        console.log('[REPORTS] Fetch reports for:', req.user.citizenId);
        const reports = await this.documentsService.getReports(req.user.citizenId);
        return {
            status: 'success',
            data: reports,
        };
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_document_request_dto_1.SubmitDocumentRequestDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "submitDocument", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocumentById", null);
__decorate([
    (0, common_1.Post)(':id/verify-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, verify_status_dto_1.VerifyStatusDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "verifyStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_document_request_dto_1.SubmitDocumentRequestDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "submitRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_report_dto_1.SubmitReportDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "submitReport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getRequests", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getReports", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('api/v1/documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map