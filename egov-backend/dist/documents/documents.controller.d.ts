import { DocumentsService } from './documents.service';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getUserDocuments(req: any): Promise<any>;
    submitRequest(req: any, submitDto: SubmitDocumentRequestDto): Promise<any>;
    submitReport(req: any, reportDto: SubmitReportDto): Promise<any>;
    getRequests(req: any): Promise<any>;
    getReports(req: any): Promise<any>;
}
