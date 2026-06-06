import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Document } from './entities/document.entity';
import { DocumentRequest } from './entities/document-request.entity';
import { Report } from './entities/report.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentRequest)
    private readonly requestRepository: Repository<DocumentRequest>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────────

  private generateVerificationHash(citizenId: string, filename: string): string {
    return crypto
      .createHash('sha256')
      .update(`${citizenId}:${filename}:${Date.now()}`)
      .digest('hex')
      .slice(0, 16);
  }

  // ── Document CRUD ─────────────────────────────────────────────────────────

  async create(citizenId: string, dto: CreateDocumentDto) {
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

  /**
   * Upload and persist a digitalized document (with actual file from disk)
   * Called by POST /api/v1/documents/upload
   */
  async uploadDocument(
    citizenId: string,
    file: Express.Multer.File,
    meta: {
      documentType: string;
      documentName?: string;
      councilJurisdiction?: string;
      citizenFullName?: string;
    },
  ) {
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

  /**
   * Submit a document from the frontend "Digitize New Document" modal
   * or from the JavaFX admin panel. Accepts citizenId in the DTO body
   * so external clients can specify the citizen.
   */
  async submitDocument(citizenId: string, dto: SubmitDocumentRequestDto) {
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

  async findByCitizen(citizenId: string) {
    return this.documentRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    return this.documentRepository.findOneBy({ id });
  }

  // ── External / Teammate API ────────────────────────────────────────────────

  /**
   * GET /api/v1/documents/user/:userId
   * Returns the clean JSON structure expected by the JavaFX desktop app / teammate system
   */
  async findByUserId(userId: string) {
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

  // ── JavaFX Admin API Bridge ────────────────────────────────────────────────

  /**
   * GET /api/v1/documents?status=pending
   * Fetches all documents matching a given status (for admin extraction)
   */
  async findByStatus(status: string) {
    return this.documentRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * POST /api/v1/documents/:id/verify-status
   * Admin decision — approve or reject a document
   */
  async updateVerifyStatus(id: string, status: string, verifiedBy: string) {
    const doc = await this.documentRepository.findOneBy({ id });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    doc.status = status;
    doc.verifiedBy = verifiedBy;
    // updatedAt is handled automatically by @UpdateDateColumn

    const saved = await this.documentRepository.save(doc);
    console.log(`[DOCUMENTS] Document ${id} status updated to ${status} by ${verifiedBy}`);
    return saved;
  }

  // ── Metrics (for dashboard KPI cards) ─────────────────────────────────────

  async getMetrics(citizenId?: string) {
    const whereClause = citizenId ? { citizenId } : {};

    const totalDocuments = await this.documentRepository.count({ where: whereClause });
    const verifiedDocuments = await this.documentRepository.count({
      where: { ...whereClause, status: 'VERIFIED' },
    });
    const pendingRequests = await this.requestRepository.count({
      where: { ...whereClause, status: 'PENDING' },
    });
    const activeReports = await this.reportRepository.count({
      where: { ...whereClause, status: 'OPEN' },
    });

    return {
      totalDocuments,
      verifiedDocuments,
      pendingRequests,
      activeReports,
    };
  }

  // ── Document Requests ──────────────────────────────────────────────────────

  private generateRequestId(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REQ-2026-${random}`;
  }

  async submitRequest(citizenId: string, dto: SubmitDocumentRequestDto) {
    const referenceId = this.generateRequestId();
    const req = this.requestRepository.create({
      citizenId,
      // referenceId, // Not in Express schema, using standard id
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

  async getRequests(citizenId: string) {
    return this.requestRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  private generateReportId(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RPT-2026-${random}`;
  }

  async submitReport(citizenId: string, dto: SubmitReportDto) {
    const referenceId = this.generateReportId();
    const rpt = this.reportRepository.create({
      citizenId,
      // referenceId, // removed, uses standard id
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

  async getReports(citizenId: string) {
    return this.reportRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }
}
