import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
export declare class DocumentsService {
    private documentRepository;
    constructor(documentRepository: Repository<Document>);
    create(citizenId: string, dto: CreateDocumentDto): Promise<Document>;
    findByCitizen(citizenId: string): Promise<Document[]>;
}
