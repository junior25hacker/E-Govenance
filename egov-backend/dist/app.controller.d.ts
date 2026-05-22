import { AppService } from './app.service';
import * as express from 'express';
import { AuthService } from './auth/auth.service';
import { DocumentsService } from './documents/documents.service';
export declare class AppController {
    private readonly appService;
    private readonly authService;
    private readonly documentsService;
    constructor(appService: AppService, authService: AuthService, documentsService: DocumentsService);
    root(): {
        title: string;
    };
    login(): {
        title: string;
    };
    dashboard(req: any): Promise<{
        title: string;
        user: {
            id: number;
            citizenId: string;
            email: string;
            fullName: string;
            profileComplete: boolean;
            verificationDocType: string;
            verificationDocPath: string;
            createdAt: Date;
            updatedAt: Date;
        };
        documents: import("./documents/entities/document.entity").Document[];
        documentCount: number;
    }>;
    civilStatus(): {
        title: string;
    };
    getLostDocumentSchema(type: string, res: express.Response): express.Response<any, Record<string, any>>;
}
