import { AppService } from './app.service';
import * as express from 'express';
import { AuthService } from './auth/auth.service';
import { DocumentsService } from './documents/documents.service';
export declare class AppController {
    private readonly appService;
    private readonly authService;
    private readonly documentsService;
    constructor(appService: AppService, authService: AuthService, documentsService: DocumentsService);
    root(res: express.Response): void;
    landing(res: express.Response): void;
    login(): {
        title: string;
    };
    dashboard(req: any): Promise<any>;
    civilStatus(): {
        title: string;
    };
    documentsView(req: any): Promise<any>;
    requestView(req: any): Promise<any>;
    reportView(req: any): Promise<any>;
    settingsView(req: any): Promise<any>;
    helpView(): {
        title: string;
    };
    submitView(): {
        title: string;
    };
    getCitizenMetrics(req: any): Promise<{
        status: string;
        data: {
            totalDocuments: number;
            approvedDocuments: number;
            pendingActions: number;
            rejectedDocuments: number;
        };
    }>;
    getLostDocumentSchema(type: string): any;
}
