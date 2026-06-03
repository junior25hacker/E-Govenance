import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';

export interface DocumentItem {
  id: string;
  citizenId: string;
  documentType: string;
  councilJurisdiction: string;
  data: string;
  status: string;
  createdAt: Date;
}

export interface DocumentRequest {
  id: string;
  citizenId: string;
  referenceId: string;
  documentType: string;
  fullName?: string;
  nationalId?: string;
  email?: string;
  phone?: string;
  purpose?: string;
  status: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  citizenId: string;
  referenceId: string;
  category: string;
  priority: string;
  location: string;
  description: string;
  phone?: string;
  status: string;
  createdAt: Date;
}

@Injectable()
export class DocumentsService {
  private documents: DocumentItem[] = [];
  private requests: DocumentRequest[] = [];
  private reports: Report[] = [];
  private nextDocId = 1;
  private nextReqId = 1;
  private nextRptId = 1;

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
    const doc: DocumentItem = {
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

  async findByCitizen(citizenId: string) {
    return this.documents
      .filter(d => d.citizenId === citizenId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async submitRequest(citizenId: string, dto: SubmitDocumentRequestDto) {
    const referenceId = this.generateRequestId();
    const req: DocumentRequest = {
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

  async submitReport(citizenId: string, dto: SubmitReportDto) {
    const referenceId = this.generateReportId();
    const rpt: Report = {
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

  async getRequests(citizenId: string) {
    return this.requests
      .filter(r => r.citizenId === citizenId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReports(citizenId: string) {
    return this.reports
      .filter(r => r.citizenId === citizenId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
