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
const document_entity_1 = require("./entities/document.entity");
const document_request_entity_1 = require("./entities/document-request.entity");
const report_entity_1 = require("./entities/report.entity");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'documents');
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
let DocumentsService = class DocumentsService {
    documentRepository;
    requestRepository;
    reportRepository;
    constructor(documentRepository, requestRepository, reportRepository) {
        this.documentRepository = documentRepository;
        this.requestRepository = requestRepository;
        this.reportRepository = reportRepository;
        this.ensureUploadsDirExists();
    }
    ensureUploadsDirExists() {
        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
            console.log('[DOCUMENTS] Created uploads directory:', UPLOADS_DIR);
        }
    }
    async create(citizenId, dto) {
        const doc = this.documentRepository.create({
            citizenId,
            documentType: dto.documentType,
            councilJurisdiction: dto.councilJurisdiction,
            data: dto.filePath,
            status: 'pending',
        });
        const saved = await this.documentRepository.save(doc);
        console.log('[DOCUMENTS] Document created:', saved.id);
        return saved;
    }
    async submitDocument(citizenId, dto) {
        const doc = this.documentRepository.create({
            citizenId: dto.citizenId || citizenId,
            documentType: dto.documentType,
            councilJurisdiction: dto.councilJurisdiction || 'Central Registry',
            data: dto.filePath || '',
            status: 'pending',
        });
        const saved = await this.documentRepository.save(doc);
        console.log('[DOCUMENTS] Document submitted for verification:', saved.id);
        return saved;
    }
    async digitalizeDocument(citizenId, dto, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded. Please attach a document file.');
        }
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, JPEG, PNG.`);
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed: 20 MB.`);
        }
        const base64Data = file.buffer.toString('base64');
        const doc = this.documentRepository.create({
            citizenId,
            documentType: dto.documentType,
            councilJurisdiction: dto.councilJurisdiction || 'Central Registry',
            fullName: dto.fullName,
            nationalId: dto.nationalId,
            originalFilename: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            status: 'pending',
            data: base64Data,
        });
        const saved = await this.documentRepository.save(doc);
        console.log(`[DOCUMENTS] Document digitalized: ID=${saved.id}, type=${dto.documentType}, citizen=${citizenId}`);
        return saved;
    }
    async getDocumentFile(id) {
        const doc = await this.documentRepository.findOneBy({ id });
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        if (!doc.data) {
            throw new common_1.NotFoundException(`Document ${id} has no associated file data`);
        }
        return { base64Data: doc.data, doc };
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
        if (status.toLowerCase() === 'verified' && !doc.data) {
            const dummyPath = path.join(process.cwd(), 'dummy.pdf');
            if (fs.existsSync(dummyPath)) {
                try {
                    const dummyBuffer = fs.readFileSync(dummyPath);
                    doc.data = dummyBuffer.toString('base64');
                    doc.mimeType = 'application/pdf';
                    doc.originalFilename = `${doc.documentType || 'Digitalized_Document'}.pdf`;
                    doc.fileSize = dummyBuffer.length;
                    console.log(`[DOCUMENTS] Automatically digitalized document ${id} with dummy file data.`);
                }
                catch (err) {
                    console.error(`[DOCUMENTS] Failed to copy dummy file for document ${id}:`, err);
                }
            }
            else {
                console.warn('[DOCUMENTS] dummy.pdf not found in root directory. Cannot attach dummy file.');
            }
        }
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
            referenceId,
            documentType: dto.documentType,
            fullName: dto.fullName,
            nationalId: dto.nationalId,
            email: dto.email,
            phone: dto.phone,
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
            referenceId,
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
    async findAllReports(status) {
        if (status) {
            return this.reportRepository.find({
                where: { status: status.toUpperCase() },
                order: { createdAt: 'DESC' },
            });
        }
        return this.reportRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async updateReportStatus(id, status) {
        const report = await this.reportRepository.findOneBy({ id });
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID ${id} not found`);
        }
        const upperStatus = status.toUpperCase();
        if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(upperStatus)) {
            throw new common_1.BadRequestException(`Invalid report status: ${status}`);
        }
        report.status = upperStatus;
        const saved = await this.reportRepository.save(report);
        console.log(`[REPORTS] Report ${id} status updated to ${upperStatus}`);
        return saved;
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