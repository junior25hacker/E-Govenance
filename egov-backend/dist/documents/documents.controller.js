"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const submit_document_request_dto_1 = require("./dto/submit-document-request.dto");
const submit_report_dto_1 = require("./dto/submit-report.dto");
const digitalize_document_dto_1 = require("./dto/digitalize-document.dto");
const verify_status_dto_1 = require("./dto/verify-status.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const fs = __importStar(require("fs"));
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
        const citizenId = req.user?.citizenId || req.query.citizenId;
        if (!citizenId) {
            throw new common_1.HttpException({ status: 'error', message: 'Authentication or citizenId required', code: 'AUTH_REQUIRED' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('[DOCUMENTS] Fetch user documents for:', citizenId);
        const documents = await this.documentsService.findByCitizen(citizenId);
        return {
            status: 'success',
            data: documents,
        };
    }
    async digitalizeDocument(req, file, dto) {
        console.log('[DOCUMENTS] Digitalize request received:', {
            citizenId: req.user.citizenId,
            documentType: dto.documentType,
            fullName: dto.fullName,
            fileName: file?.originalname,
            fileSize: file?.size,
        });
        const result = await this.documentsService.digitalizeDocument(req.user.citizenId, dto, file);
        return {
            status: 'success',
            message: 'Document submitted for digitalization. You can track its status in My Documents.',
            trackingId: result.id,
            data: {
                id: result.id,
                documentType: result.documentType,
                fullName: result.fullName,
                originalFilename: result.originalFilename,
                fileSize: result.fileSize,
                mimeType: result.mimeType,
                status: result.status,
                createdAt: result.createdAt,
            },
        };
    }
    async downloadFile(id, res) {
        const documentId = parseInt(id, 10);
        if (isNaN(documentId)) {
            throw new common_1.HttpException({ status: 'error', message: 'Invalid document ID', code: 'INVALID_ID' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const { filePath, doc } = await this.documentsService.getDocumentFile(documentId);
        res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.originalFilename || 'document'}"`);
        res.setHeader('Content-Length', doc.fileSize?.toString() || '0');
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
    async getFileInfo(id) {
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
            data: {
                id: doc.id,
                documentType: doc.documentType,
                fullName: doc.fullName,
                nationalId: doc.nationalId,
                originalFilename: doc.originalFilename,
                mimeType: doc.mimeType,
                fileSize: doc.fileSize,
                fileSizeFormatted: doc.fileSize
                    ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`
                    : null,
                hasFile: !!doc.storedFilename,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            },
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
    async getAdminReports(status) {
        console.log(`[REPORTS] Admin fetching reports, status filter: ${status}`);
        const reports = await this.documentsService.findAllReports(status);
        return {
            status: 'success',
            count: reports.length,
            data: reports,
        };
    }
    async updateReportStatus(id, body) {
        const reportId = parseInt(id, 10);
        if (isNaN(reportId)) {
            throw new common_1.HttpException({ status: 'error', message: 'Invalid report ID', code: 'INVALID_ID' }, common_1.HttpStatus.BAD_REQUEST);
        }
        console.log(`[REPORTS] Update status for report ${reportId} to ${body.status}`);
        const result = await this.documentsService.updateReportStatus(reportId, body.status);
        return {
            status: 'success',
            message: `Report status updated to ${body.status} successfully`,
            data: result,
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('digitalize'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 20 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, digitalize_document_dto_1.DigitalizeDocumentDto]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "digitalizeDocument", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)(':id/file-info'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getFileInfo", null);
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
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reports/admin'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getAdminReports", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reports/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "updateReportStatus", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('api/v1/documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map