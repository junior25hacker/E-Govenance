import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentRequest } from './entities/document-request.entity';
import { Report } from './entities/report.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
export declare class DocumentsService {
    private readonly documentRepository;
    private readonly requestRepository;
    private readonly reportRepository;
    constructor(documentRepository: Repository<Document>, requestRepository: Repository<DocumentRequest>, reportRepository: Repository<Report>);
    private generateVerificationHash;
    create(citizenId: string, dto: CreateDocumentDto): Promise<Document>;
    uploadDocument(citizenId: string, file: Express.Multer.File, meta: {
        documentType: string;
        documentName?: string;
        councilJurisdiction?: string;
        citizenFullName?: string;
    }): Promise<Document>;
    submitDocument(citizenId: string, dto: SubmitDocumentRequestDto): Promise<Document>;
    findByCitizen(citizenId: string): Promise<Document[]>;
    findById(id: string): Promise<Document | null>;
    findByUserId(userId: string): Promise<{
        id: string;
        name: string;
        documentType: string;
        status: string;
        url: string | null;
        verificationHash: string | null;
        councilJurisdiction: string;
        uploadedAt: Date;
        issuedDate: string | null;
    }[]>;
    findByStatus(status: string): Promise<Document[]>;
    updateVerifyStatus(id: string, status: string, verifiedBy: string): Promise<Document>;
    getMetrics(citizenId?: string): Promise<{
        totalDocuments: number;
        approvedDocuments: number;
        pendingActions: number;
        rejectedDocuments: number;
    }>;
    private generateRequestId;
    submitRequest(citizenId: string, dto: SubmitDocumentRequestDto): Promise<DocumentRequest>;
    getRequests(citizenId: string): Promise<DocumentRequest[]>;
    private generateReportId;
    submitReport(citizenId: string, dto: SubmitReportDto): Promise<Report>;
    getReports(citizenId: string): Promise<Report[]>;
}
