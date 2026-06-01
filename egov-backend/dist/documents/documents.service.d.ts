import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentRequest } from './entities/document-request.entity';
import { Report } from './entities/report.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
export declare class DocumentsService {
    private documentRepository;
    private requestRepository;
    private reportRepository;
    constructor(documentRepository: Repository<Document>, requestRepository: Repository<DocumentRequest>, reportRepository: Repository<Report>);
    private generateRequestId;
    private generateReportId;
    create(citizenId: string, dto: CreateDocumentDto): Promise<Document>;
    findByCitizen(citizenId: string): Promise<Document[]>;
    submitRequest(citizenId: string, dto: SubmitDocumentRequestDto): Promise<DocumentRequest>;
    submitReport(citizenId: string, dto: SubmitReportDto): Promise<Report>;
    getRequests(citizenId: string): Promise<DocumentRequest[]>;
    getReports(citizenId: string): Promise<Report[]>;
}
