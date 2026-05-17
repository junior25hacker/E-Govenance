import { AppService } from './app.service';
import * as express from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    root(): {
        title: string;
    };
    login(): {
        title: string;
    };
    dashboard(): {
        title: string;
    };
    civilStatus(): {
        title: string;
    };
    getLostDocumentSchema(type: string, res: express.Response): express.Response<any, Record<string, any>>;
}
