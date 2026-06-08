import { Repository } from 'typeorm';
import { TrackingRequest } from './entities/request.entity';
import { RequestLog } from './entities/request-log.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { DocumentRequest } from '../documents/entities/document-request.entity';
import { Document } from '../documents/entities/document.entity';
export declare class RequestsService {
    private readonly requestRepo;
    private readonly logRepo;
    private readonly docRequestRepo;
    private readonly documentRepo;
    constructor(requestRepo: Repository<TrackingRequest>, logRepo: Repository<RequestLog>, docRequestRepo: Repository<DocumentRequest>, documentRepo: Repository<Document>);
    private readonly stageSequence;
    createRequest(dto: CreateRequestDto, performedBy?: string): Promise<TrackingRequest>;
    getRequestById(id: string, userId: string): Promise<TrackingRequest>;
    getAllTrackedRequests(userId: string): Promise<{
        message: string;
        data: never[];
    } | {
        data: TrackingRequest[];
        message?: undefined;
    }>;
    getPendingRequests(userId: string): Promise<{
        message: string;
        data: never[];
    } | {
        data: TrackingRequest[];
        message?: undefined;
    }>;
    nextStage(id: string, explicitStatus?: string, performedBy?: string, description?: string): Promise<TrackingRequest>;
    getLogs(id: string, userId: string): Promise<RequestLog[]>;
    private logTransition;
    private syncPendingRequests;
}
