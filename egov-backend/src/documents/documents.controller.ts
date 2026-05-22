import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submit(@Req() req, @Body() createDocumentDto: CreateDocumentDto) {
    const result = await this.documentsService.create(req.user.citizenId, createDocumentDto);
    return {
      status: 'success',
      message: 'Document submitted successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-documents')
  async getMyDocuments(@Req() req) {
    const documents = await this.documentsService.findByCitizen(req.user.citizenId);
    return {
      status: 'success',
      data: documents,
    };
  }
}
