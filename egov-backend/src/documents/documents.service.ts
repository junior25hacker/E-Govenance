import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async create(citizenId: string, dto: CreateDocumentDto) {
    const document = this.documentRepository.create({
      citizenId,
      documentType: dto.documentType,
      councilJurisdiction: dto.councilJurisdiction,
      data: dto.filePath, // We'll store the extra info here
      status: 'PENDING',
    });
    return this.documentRepository.save(document);
  }

  async findByCitizen(citizenId: string) {
    return this.documentRepository.find({
      where: { citizenId },
      order: { createdAt: 'DESC' },
    });
  }
}
