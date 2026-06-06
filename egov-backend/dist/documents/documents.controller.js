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
const multer_1 = require("multer");
const path = __importStar(require("path"));
const documents_service_1 = require("./documents.service");
const submit_document_request_dto_1 = require("./dto/submit-document-request.dto");
const submit_report_dto_1 = require("./dto/submit-report.dto");
const verify_status_dto_1 = require("./dto/verify-status.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const multerStorage = (0, multer_1.diskStorage)({
    destination: path.join(process.cwd(), 'uploads'),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${Date.now()}-${baseName}${ext}`);
    },
});
const multerFileFilter = (_req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|gif|bmp|tiff|doc|docx/i;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) {
        cb(null, true);
    }
    else {
        cb(new common_1.BadRequestException(`File type .${ext} is not allowed.`), false);
    }
};
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
            count: documents.length,
            data: documents,
        };
    }
    async getDocumentsByUserId(userId) {
        if (!userId) {
            throw new common_1.HttpException({ success: false, message: 'userId is required' }, common_1.HttpStatus.BAD_REQUEST);
        }
        console.log(`[DOCUMENTS] External fetch for userId: ${userId}`);
        const documents = await this.documentsService.findByUserId(userId);
        return {
            success: true,
            count: documents.length,
            data: documents,
        };
    }
    async uploadDocument(req, file, body) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!body.documentType) {
            throw new common_1.BadRequestException('documentType is required');
        }
        const citizenId = req.user?.citizenId || 'ANONYMOUS';
        console.log(`[DOCUMENTS] Upload received from ${citizenId}: ${file.originalname}`);
        const saved = await this.documentsService.uploadDocument(citizenId, file, {
            documentType: body.documentType,
            documentName: body.documentName,
            councilJurisdiction: body.councilJurisdiction,
            citizenFullName: body.citizenFullName,
        });
        return {
            status: 'success',
            message: 'Document uploaded and saved for verification',
            data: {
                id: String(saved.id),
                documentName: saved.documentName,
                documentType: saved.documentType,
                fileUrl: saved.fileUrl,
                status: saved.status,
                verificationHash: saved.verificationHash,
                uploadedAt: saved.createdAt,
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
        const documentId = id;
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
        const documentId = id;
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
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocumentsByUserId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multerStorage,
        limits: { fileSize: 100 * 1024 * 1024 },
        fileFilter: multerFileFilter,
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadDocument", null);
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