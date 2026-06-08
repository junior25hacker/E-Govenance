import { TrackingRequest } from './request.entity';
export declare class RequestLog {
    id: string;
    timestamp: Date;
    actionType: string;
    previousStatus: string;
    newStatus: string;
    performedBy: string;
    description: string;
    request: TrackingRequest;
}
