import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentRequest } from './entities/document-request.entity';
import { Report } from './entities/report.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { DigitalizeDocumentDto } from './dto/digitalize-document.dto';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

/** Absolute path to the uploads directory */
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'documents');

/** Allowed MIME types for document uploads */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

/** Maximum file size in bytes (20 MB) */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentRequest)
    private readonly requestRepository: Repository<DocumentRequest>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {
    // Ensure the uploads directory exists at service startup
    this.ensureUploadsDirExists();
  }

  /** Create uploads directory if it doesn't exist */
  private ensureUploadsDirExists(): void {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      console.log('[DOCUMENTS] Created uploads directory:', UPLOADS_DIR);
    }
  }

  // ── Legacy Document CRUD ──

  async create(citizenId: string, dto: CreateDocumentDto) {
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
      data: dto.filePath || '',
      status: 'pending',
    });
    const saved = await this.documentRepository.save(doc);
    console.log('[DOCUMENTS] Document submitted for verification:', saved.id);
    return saved;
  }

  // ── Digitalize Document (File Upload) ──

  /**
   * Handles the full digitalization flow:
   * 1. Validates the uploaded file
   * 2. Generates a UUID filename
   * 3. Writes the file to disk
   * 4. Persists metadata to the database
   */
  async digitalizeDocument(
    citizenId: string,
    dto: DigitalizeDocumentDto,
    file: Express.Multer.File,
  ): Promise<Document> {
    // Validate file presence
    if (!file) {
      throw new BadRequestException('No file uploaded. Please attach a document file.');
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed types: PDF, JPEG, PNG.`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed: 20 MB.`,
      );
    }

    // Store the file in the database as a base64 string
    const base64Data = file.buffer.toString('base64');
    
    // Create database record
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
      data: base64Data, // Save file directly to DB!
    });

    const saved = await this.documentRepository.save(doc);
    console.log(`[DOCUMENTS] Document digitalized: ID=${saved.id}, type=${dto.documentType}, citizen=${citizenId}`);
    return saved;
  }

  /**
   * Returns file metadata and base64 string for downloading a document's file.
   * Throws if the document or its file is missing.
   */
  async getDocumentFile(id: number): Promise<{ base64Data: string; doc: Document }> {
    const doc = await this.documentRepository.findOneBy({ id });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (!doc.data) {
      throw new NotFoundException(`Document ${id} has no associated file data`);
    }

    return { base64Data: doc.data, doc };
  }

  // ── Queries ──

  async findByCitizen(citizenId: string) {
    return this.documentRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.documentRepository.findOneBy({ id });
  }

  // ── JavaFX Admin API Bridge ──

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
  async updateVerifyStatus(id: number, status: string, verifiedBy: string) {
    const doc = await this.documentRepository.findOneBy({ id });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    doc.status = status;
    doc.verifiedBy = verifiedBy;
    // updatedAt is handled automatically by @UpdateDateColumn

    // If the document is approved (verified) but has no file data, attach a dummy digitalized file
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
        } catch (err) {
          console.error(`[DOCUMENTS] Failed to copy dummy file for document ${id}:`, err);
        }
      } else {
        console.warn('[DOCUMENTS] dummy.pdf not found in root directory. Cannot attach dummy file.');
      }
    }

    const saved = await this.documentRepository.save(doc);
    console.log(`[DOCUMENTS] Document ${id} status updated to ${status} by ${verifiedBy}`);
    return saved;
  }

  // ── Metrics (for dashboard KPI cards) ──

  async getMetrics(citizenId?: string) {
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

  // ── Document Requests ──

  private generateRequestId(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REQ-2026-${random}`;
  }

  async submitRequest(citizenId: string, dto: SubmitDocumentRequestDto) {
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

  async getRequests(citizenId: string) {
    return this.requestRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Reports ──

  private generateReportId(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RPT-2026-${random}`;
  }

  async submitReport(citizenId: string, dto: SubmitReportDto) {
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

  async getReports(citizenId: string) {
    return this.reportRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllReports(status?: string) {
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

  async updateReportStatus(id: number, status: string) {
    const report = await this.reportRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    const upperStatus = status.toUpperCase();
    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(upperStatus)) {
      throw new BadRequestException(`Invalid report status: ${status}`);
    }
    report.status = upperStatus;
    const saved = await this.reportRepository.save(report);
    console.log(`[REPORTS] Report ${id} status updated to ${upperStatus}`);
    return saved;
  }
}
