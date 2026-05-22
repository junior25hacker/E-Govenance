import { User } from '../../auth/entities/user.entity';
export declare class Document {
    id: string;
    citizenId: string;
    documentType: string;
    councilJurisdiction: string;
    data: string;
    status: string;
    createdAt: Date;
    user: User;
}
