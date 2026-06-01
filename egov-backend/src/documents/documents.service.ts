import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentRequest)
    private requestRepository: Repository<DocumentRequest>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) { }

  // Generate unique reference ID for requests
  private generateRequestId(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REQ-2026-${random}`;
  }

  // Generate unique reference ID for reports
  private generateReportId(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RPT-2026-${random}`;
  }

  async create(citizenId: string, dto: CreateDocumentDto) {
    const document = this.documentRepository.create({
      citizenId,
      documentType: dto.documentType,
      councilJurisdiction: dto.councilJurisdiction,
      data: dto.filePath, // We'll store the extra info here
      status: 'PENDING',
    });
    return this.documentRepository.save(document);
  }

  async findByCitizen(citizenId: string) {
    return this.documentRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }

  async submitRequest(citizenId: string, dto: SubmitDocumentRequestDto) {
    const referenceId = this.generateRequestId();
    const request = this.requestRepository.create({
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
    const saved = await this.requestRepository.save(request);
    console.log('[DOCUMENTS] Request submitted with ID:', referenceId);
    return saved;
  }

  async submitReport(citizenId: string, dto: SubmitReportDto) {
    const referenceId = this.generateReportId();
    const report = this.reportRepository.create({
      citizenId,
      referenceId,
      category: dto.category,
      priority: dto.priority,
      location: dto.location,
      description: dto.description,
      phone: dto.phone,
      status: 'OPEN',
    });
    const saved = await this.reportRepository.save(report);
    console.log('[REPORTS] Report submitted with ID:', referenceId);
    return saved;
  }

  async getRequests(citizenId: string) {
    return this.requestRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }

  async getReports(citizenId: string) {
    return this.reportRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }
}
