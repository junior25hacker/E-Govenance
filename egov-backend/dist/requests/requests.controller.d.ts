import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    create(createRequestDto: CreateRequestDto): Promise<{
        status: string;
        data: import("./entities/request.entity").TrackingRequest;
    }>;
    getAllTracked(req: any): Promise<{
        message: string;
        data: never[];
    } | {
        data: import("./entities/request.entity").TrackingRequest[];
        message?: undefined;
    }>;
    getPendingRequests(req: any): Promise<{
        message: string;
        data: never[];
    } | {
        data: import("./entities/request.entity").TrackingRequest[];
        message?: undefined;
    }>;
    getTrackingData(id: string, req: any): Promise<{
        status: string;
        data: import("./entities/request.entity").TrackingRequest;
    }>;
    findOne(id: string, req: any): Promise<{
        status: string;
        data: import("./entities/request.entity").TrackingRequest;
    }>;
    nextStage(id: string, status?: string, performedBy?: string, description?: string): Promise<{
        status: string;
        message: string;
        data: import("./entities/request.entity").TrackingRequest;
    }>;
    getLogs(id: string, req: any): Promise<{
        status: string;
        data: import("./entities/request-log.entity").RequestLog[];
    }>;
}
