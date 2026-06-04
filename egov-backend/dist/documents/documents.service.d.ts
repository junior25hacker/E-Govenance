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
export declare class DocumentsService {
    private documents;
    private requests;
    private reports;
    private nextDocId;
    private nextReqId;
    private nextRptId;
    private generateRequestId;
    private generateReportId;
    create(citizenId: string, dto: CreateDocumentDto): Promise<DocumentItem>;
    findByCitizen(citizenId: string): Promise<DocumentItem[]>;
    submitRequest(citizenId: string, dto: SubmitDocumentRequestDto): Promise<DocumentRequest>;
    submitReport(citizenId: string, dto: SubmitReportDto): Promise<Report>;
    getRequests(citizenId: string): Promise<DocumentRequest[]>;
    getReports(citizenId: string): Promise<Report[]>;
}
