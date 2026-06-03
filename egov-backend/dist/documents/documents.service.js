"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
let DocumentsService = class DocumentsService {
    documents = [];
    requests = [];
    reports = [];
    nextDocId = 1;
    nextReqId = 1;
    nextRptId = 1;
    generateRequestId() {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `REQ-2026-${random}`;
    }
    generateReportId() {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `RPT-2026-${random}`;
    }
    async create(citizenId, dto) {
        const doc = {
            id: `doc-${this.nextDocId++}`,
            citizenId,
            documentType: dto.documentType,
            councilJurisdiction: dto.councilJurisdiction,
            data: dto.filePath,
            status: 'PENDING',
            createdAt: new Date(),
        };
        this.documents.push(doc);
        console.log('[DOCUMENTS] Document created:', doc.id);
        return doc;
    }
    async findByCitizen(citizenId) {
        return this.documents
            .filter(d => d.citizenId === citizenId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async submitRequest(citizenId, dto) {
        const referenceId = this.generateRequestId();
        const req = {
            id: `req-${this.nextReqId++}`,
            citizenId,
            referenceId,
            documentType: dto.documentType,
            fullName: dto.fullName,
            nationalId: dto.nationalId,
            email: dto.email,
            phone: dto.phone,
            purpose: dto.purpose,
            status: 'PENDING',
            createdAt: new Date(),
        };
        this.requests.push(req);
        console.log('[DOCUMENTS] Request submitted with ID:', referenceId);
        return req;
    }
    async submitReport(citizenId, dto) {
        const referenceId = this.generateReportId();
        const rpt = {
            id: `rpt-${this.nextRptId++}`,
            citizenId,
            referenceId,
            category: dto.category,
            priority: dto.priority,
            location: dto.location,
            description: dto.description,
            phone: dto.phone,
            status: 'OPEN',
            createdAt: new Date(),
        };
        this.reports.push(rpt);
        console.log('[REPORTS] Report submitted with ID:', referenceId);
        return rpt;
    }
    async getRequests(citizenId) {
        return this.requests
            .filter(r => r.citizenId === citizenId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getReports(citizenId) {
        return this.reports
            .filter(r => r.citizenId === citizenId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)()
], DocumentsService);
//# sourceMappingURL=documents.service.js.map