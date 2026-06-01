import { DocumentsService } from './documents.service';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getUserDocuments(req: any): Promise<{
        status: string;
        data: import("./entities/document.entity").Document[];
    }>;
    submitRequest(req: any, submitDto: SubmitDocumentRequestDto): Promise<{
        status: string;
        message: string;
        data: import("./entities/document-request.entity").DocumentRequest;
    }>;
    submitReport(req: any, reportDto: SubmitReportDto): Promise<{
        status: string;
        message: string;
        data: import("./entities/report.entity").Report;
    }>;
    getRequests(req: any): Promise<{
        status: string;
        data: import("./entities/document-request.entity").DocumentRequest[];
    }>;
    getReports(req: any): Promise<{
        status: string;
        data: import("./entities/report.entity").Report[];
    }>;
}
