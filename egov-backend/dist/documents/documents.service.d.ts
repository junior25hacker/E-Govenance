import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentRequest } from './entities/document-request.entity';
import { Report } from './entities/report.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { DigitalizeDocumentDto } from './dto/digitalize-document.dto';
export declare class DocumentsService {
    private readonly documentRepository;
    private readonly requestRepository;
    private readonly reportRepository;
    constructor(documentRepository: Repository<Document>, requestRepository: Repository<DocumentRequest>, reportRepository: Repository<Report>);
    private ensureUploadsDirExists;
    create(citizenId: string, dto: CreateDocumentDto): Promise<Document>;
    submitDocument(citizenId: string, dto: SubmitDocumentRequestDto): Promise<Document>;
    digitalizeDocument(citizenId: string, dto: DigitalizeDocumentDto, file: Express.Multer.File): Promise<Document>;
    getDocumentFile(id: number): Promise<{
        filePath: string;
        doc: Document;
    }>;
    findByCitizen(citizenId: string): Promise<Document[]>;
    findById(id: number): Promise<Document | null>;
    findByStatus(status: string): Promise<Document[]>;
    updateVerifyStatus(id: number, status: string, verifiedBy: string): Promise<Document>;
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
    findAllReports(status?: string): Promise<Report[]>;
    updateReportStatus(id: number, status: string): Promise<Report>;
}
