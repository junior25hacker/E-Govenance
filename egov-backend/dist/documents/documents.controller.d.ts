import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    submit(req: any, createDocumentDto: CreateDocumentDto): Promise<{
        status: string;
        message: string;
        data: import("./entities/document.entity").Document;
    }>;
    getMyDocuments(req: any): Promise<{
        status: string;
        data: import("./entities/document.entity").Document[];
    }>;
}
