import { Controller, Post, Body, Get, UseGuards, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserDocuments(@Req() req) {
    console.log('[DOCUMENTS] Fetch user documents for:', req.user.citizenId);
    const documents = await this.documentsService.findByCitizen(req.user.citizenId);
    return {
      status: 'success',
      data: documents,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitRequest(@Req() req, @Body() submitDto: SubmitDocumentRequestDto) {
    console.log('[DOCUMENTS] Submit request received:', submitDto);
    const result = await this.documentsService.submitRequest(req.user.citizenId, submitDto);
    return {
      status: 'success',
      message: 'Document request submitted successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('report')
  async submitReport(@Req() req, @Body() reportDto: SubmitReportDto) {
    console.log('[REPORTS] Submit report received:', reportDto);
    const result = await this.documentsService.submitReport(req.user.citizenId, reportDto);
    return {
      status: 'success',
      message: 'Report submitted successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests')
  async getRequests(@Req() req) {
    console.log('[DOCUMENTS] Fetch requests for:', req.user.citizenId);
    const requests = await this.documentsService.getRequests(req.user.citizenId);
    return {
      status: 'success',
      data: requests,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports')
  async getReports(@Req() req) {
    console.log('[REPORTS] Fetch reports for:', req.user.citizenId);
    const reports = await this.documentsService.getReports(req.user.citizenId);
    return {
      status: 'success',
      data: reports,
    };
  }
}
