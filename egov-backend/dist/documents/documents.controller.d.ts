import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { DigitalizeDocumentDto } from './dto/digitalize-document.dto';
import { VerifyStatusDto } from './dto/verify-status.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getDocuments(req: any, status?: string): Promise<any>;
    digitalizeDocument(req: any, file: Express.Multer.File, dto: DigitalizeDocumentDto): Promise<any>;
    downloadFile(id: string, res: Response): Promise<void>;
    getFileInfo(id: string): Promise<any>;
    submitDocument(req: any, submitDto: SubmitDocumentRequestDto): Promise<any>;
    getDocumentById(id: string): Promise<any>;
    verifyStatus(id: string, verifyDto: VerifyStatusDto): Promise<any>;
    submitRequest(req: any, submitDto: SubmitDocumentRequestDto): Promise<any>;
    submitReport(req: any, reportDto: SubmitReportDto): Promise<any>;
    getRequests(req: any): Promise<any>;
    getReports(req: any): Promise<any>;
    getAdminReports(status?: string): Promise<any>;
    updateReportStatus(id: string, body: {
        status: string;
    }): Promise<any>;
}
