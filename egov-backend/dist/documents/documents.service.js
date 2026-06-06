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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const document_entity_1 = require("./entities/document.entity");
const document_request_entity_1 = require("./entities/document-request.entity");
const report_entity_1 = require("./entities/report.entity");
let DocumentsService = class DocumentsService {
    documentRepository;
    requestRepository;
    reportRepository;
    constructor(documentRepository, requestRepository, reportRepository) {
        this.documentRepository = documentRepository;
        this.requestRepository = requestRepository;
        this.reportRepository = reportRepository;
    }
    generateVerificationHash(citizenId, filename) {
        return crypto
            .createHash('sha256')
            .update(`${citizenId}:${filename}:${Date.now()}`)
            .digest('hex')
            .slice(0, 16);
    }
    async create(citizenId, dto) {
        const doc = this.documentRepository.create({
            citizenId,
            documentType: dto.documentType,
            councilJurisdiction: dto.councilJurisdiction,
            filePath: dto.filePath,
            status: 'pending',
        });
        const saved = await this.documentRepository.save(doc);
        console.log('[DOCUMENTS] Document created:', saved.id);
        return saved;
    }
    async uploadDocument(citizenId, file, meta) {
        const filePath = file.path.replace(/\\/g, '/');
        const fileUrl = `/uploads/${file.filename}`;
        const originalFilename = file.originalname;
        const verificationHash = this.generateVerificationHash(citizenId, originalFilename);
        const doc = this.documentRepository.create({
            citizenId,
            citizenFullName: meta.citizenFullName || '',
            documentType: meta.documentType,
            documentName: meta.documentName || meta.documentType,
            councilJurisdiction: meta.councilJurisdiction || 'Central Registry',
            filePath,
            fileUrl,
            originalFilename,
            status: 'pending',
            verificationHash,
        });
        const saved = await this.documentRepository.save(doc);
        console.log('[DOCUMENTS] ✅ Document uploaded and saved to DB:', saved.id, '—', fileUrl);
        return saved;
    }
    async submitDocument(citizenId, dto) {
        const doc = this.documentRepository.create({
            citizenId: dto.citizenId || citizenId,
            documentType: dto.documentType,
            councilJurisdiction: dto.councilJurisdiction || 'Central Registry',
            filePath: dto.filePath || '',
            status: 'pending',
        });
        const saved = await this.documentRepository.save(doc);
        console.log('[DOCUMENTS] Document submitted for verification:', saved.id);
        return saved;
    }
    async findByCitizen(citizenId) {
        return this.documentRepository.find({
            where: { citizenId },
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        return this.documentRepository.findOneBy({ id });
    }
    async findByUserId(userId) {
        const docs = await this.documentRepository.find({
            where: { citizenId: userId },
            order: { createdAt: 'DESC' },
        });
        return docs.map((doc) => ({
            id: String(doc.id),
            name: doc.documentName || doc.documentType,
            documentType: doc.documentType,
            status: doc.status,
            url: doc.fileUrl || null,
            verificationHash: doc.verificationHash || null,
            councilJurisdiction: doc.councilJurisdiction,
            uploadedAt: doc.createdAt,
            issuedDate: doc.issuedDate || null,
        }));
    }
    async findByStatus(status) {
        return this.documentRepository.find({
            where: { status },
            order: { createdAt: 'DESC' },
        });
    }
    async updateVerifyStatus(id, status, verifiedBy) {
        const doc = await this.documentRepository.findOneBy({ id });
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        doc.status = status;
        doc.verifiedBy = verifiedBy;
        const saved = await this.documentRepository.save(doc);
        console.log(`[DOCUMENTS] Document ${id} status updated to ${status} by ${verifiedBy}`);
        return saved;
    }
    async getMetrics(citizenId) {
        const whereClause = citizenId ? { citizenId } : {};
        const totalDocuments = await this.documentRepository.count({ where: whereClause });
        const approvedDocuments = await this.documentRepository.count({
            where: { ...whereClause, status: 'verified' },
        });
        const pendingActions = await this.documentRepository.count({
            where: { ...whereClause, status: 'pending' },
        });
        const rejectedDocuments = await this.documentRepository.count({
            where: { ...whereClause, status: 'rejected' },
        });
        return {
            totalDocuments,
            approvedDocuments,
            pendingActions,
            rejectedDocuments,
        };
    }
    generateRequestId() {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `REQ-2026-${random}`;
    }
    async submitRequest(citizenId, dto) {
        const referenceId = this.generateRequestId();
        const req = this.requestRepository.create({
            citizenId,
            documentType: dto.documentType,
            applicantName: dto.fullName,
            applicantId: dto.nationalId,
            applicantEmail: dto.email,
            applicantPhone: dto.phone,
            purpose: dto.purpose,
            status: 'PENDING',
        });
        const saved = await this.requestRepository.save(req);
        console.log('[DOCUMENTS] Request submitted with ID:', referenceId);
        return saved;
    }
    async getRequests(citizenId) {
        return this.requestRepository.find({
            where: { citizenId },
            order: { createdAt: 'DESC' },
        });
    }
    generateReportId() {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `RPT-2026-${random}`;
    }
    async submitReport(citizenId, dto) {
        const referenceId = this.generateReportId();
        const rpt = this.reportRepository.create({
            citizenId,
            category: dto.category,
            priority: dto.priority,
            location: dto.location,
            description: dto.description,
            phone: dto.phone,
            status: 'OPEN',
        });
        const saved = await this.reportRepository.save(rpt);
        console.log('[REPORTS] Report submitted with ID:', referenceId);
        return saved;
    }
    async getReports(citizenId) {
        return this.reportRepository.find({
            where: { citizenId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, typeorm_1.InjectRepository)(document_request_entity_1.DocumentRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map