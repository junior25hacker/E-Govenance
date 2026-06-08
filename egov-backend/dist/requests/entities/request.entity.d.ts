import { RequestLog } from './request-log.entity';
export declare enum RequestStage {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class TrackingRequest {
    requestId: string;
    userId: string;
    title: string;
    description: string;
    currentStatus: RequestStage;
    createdAt: Date;
    updatedAt: Date;
    logs: RequestLog[];
}
