import {
  Controller, Post, Body, Get, UseGuards, Req, Param, Query, Res,
  HttpException, HttpStatus, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { DigitalizeDocumentDto } from './dto/digitalize-document.dto';
import { VerifyStatusDto } from './dto/verify-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';

@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  /**
   * GET /api/v1/documents
   * - With ?status=pending → Admin extraction (no auth required for JavaFX desktop)
   * - Without status filter → Returns authenticated user's documents
   */
  @Get()
  async getDocuments(@Req() req, @Query('status') status?: string): Promise<any> {
    // Admin extraction mode — JavaFX Civil Registrar fetches pending records
    if (status) {
      console.log(`[DOCUMENTS] Admin extraction for status: ${status}`);
      const documents = await this.documentsService.findByStatus(status);
      return {
        status: 'success',
        count: documents.length,
        data: documents,
      };
    }

    // Authenticated user mode — return user's own documents
    const citizenId = req.user?.citizenId || req.query.citizenId;
    
    if (!citizenId) {
      throw new HttpException(
        { status: 'error', message: 'Authentication or citizenId required', code: 'AUTH_REQUIRED' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log('[DOCUMENTS] Fetch user documents for:', citizenId);
    const documents = await this.documentsService.findByCitizen(citizenId);
    return {
      status: 'success',
      data: documents,
    };
  }

  /**
   * POST /api/v1/documents/digitalize
   * Production endpoint for document digitalization.
   * Accepts multipart/form-data with a file attachment + form fields.
   * Requires JWT authentication — the citizen must be logged in.
   */
  @UseGuards(JwtAuthGuard)
  @Post('digitalize')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  }))
  async digitalizeDocument(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: DigitalizeDocumentDto,
  ): Promise<any> {
    console.log('[DOCUMENTS] Digitalize request received:', {
      citizenId: req.user.citizenId,
      documentType: dto.documentType,
      fullName: dto.fullName,
      fileName: file?.originalname,
      fileSize: file?.size,
    });

    const result = await this.documentsService.digitalizeDocument(
      req.user.citizenId,
      dto,
      file,
    );

    return {
      status: 'success',
      message: 'Document submitted for digitalization. You can track its status in My Documents.',
      trackingId: result.id,
      data: {
        id: result.id,
        documentType: result.documentType,
        fullName: result.fullName,
        originalFilename: result.originalFilename,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
        status: result.status,
        createdAt: result.createdAt,
      },
    };
  }

  /**
   * GET /api/v1/documents/:id/download
   * Serves the uploaded file as a downloadable stream.
   * No auth required — JavaFX admin needs to download files.
   */
  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      throw new HttpException(
        { status: 'error', message: 'Invalid document ID', code: 'INVALID_ID' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { base64Data, doc } = await this.documentsService.getDocumentFile(documentId);

    // Set appropriate headers for file download
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalFilename || 'document'}"`);
    res.setHeader('Content-Length', doc.fileSize?.toString() || '0');

    // Stream the base64 file data directly to the client
    const fileBuffer = Buffer.from(base64Data, 'base64');
    res.end(fileBuffer);
  }

  /**
   * GET /api/v1/documents/:id/file-info
   * Returns file metadata without the actual file content.
   * Useful for JavaFX admin preview before downloading.
   */
  @Get(':id/file-info')
  async getFileInfo(@Param('id') id: string): Promise<any> {
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      throw new HttpException(
        { status: 'error', message: 'Invalid document ID', code: 'INVALID_ID' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const doc = await this.documentsService.findById(documentId);
    if (!doc) {
      throw new HttpException(
        { status: 'error', message: `Document with ID ${documentId} not found`, code: 'NOT_FOUND' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      status: 'success',
      data: {
        id: doc.id,
        documentType: doc.documentType,
        fullName: doc.fullName,
        nationalId: doc.nationalId,
        originalFilename: doc.originalFilename,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        fileSizeFormatted: doc.fileSize
          ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`
          : null,
        hasFile: !!doc.data,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    };
  }

  /**
   * POST /api/v1/documents/submit
   * Legacy endpoint. Wired to the frontend "Digitize New Document" button.
   * Also callable from JavaFX admin with citizenId in body.
   */
  @Post('submit')
  async submitDocument(@Req() req, @Body() submitDto: SubmitDocumentRequestDto): Promise<any> {
    console.log('[DOCUMENTS] Submit document received:', submitDto);
    
    // Determine citizen ID: from JWT user context, or from body (for JavaFX admin)
    const citizenId = req.user?.citizenId || submitDto.citizenId || 'ANONYMOUS';

    const result = await this.documentsService.submitDocument(citizenId, submitDto);
    return {
      status: 'success',
      message: 'Document submitted for verification',
      trackingId: result.id,
      data: result,
    };
  }

  /**
   * GET /api/v1/documents/:id
   * Admin: Fetch a specific document by ID
   */
  @Get(':id')
  async getDocumentById(@Param('id') id: string): Promise<any> {
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      throw new HttpException(
        { status: 'error', message: 'Invalid document ID', code: 'INVALID_ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    
    const doc = await this.documentsService.findById(documentId);
    if (!doc) {
      throw new HttpException(
        { status: 'error', message: `Document with ID ${documentId} not found`, code: 'NOT_FOUND' },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      status: 'success',
      data: doc,
    };
  }

  /**
   * POST /api/v1/documents/:id/verify-status
   * Wired to the JavaFX "Approve" (Green) and "Reject" (Red) desktop buttons.
   */
  @Post(':id/verify-status')
  async verifyStatus(
    @Param('id') id: string,
    @Body() verifyDto: VerifyStatusDto,
  ): Promise<any> {
    console.log(`[DOCUMENTS] Verify status for document ${id}:`, verifyDto);

    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      throw new HttpException(
        { status: 'error', message: 'Invalid document ID', code: 'INVALID_ID' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.documentsService.updateVerifyStatus(
      documentId,
      verifyDto.status,
      verifyDto.verifiedBy,
    );

    return {
      status: 'success',
      message: `Document ${verifyDto.status} successfully`,
      data: result,
    };
  }

  /**
   * POST /api/v1/documents/request  (renamed from old 'submit' to avoid collision)
   * Submit a document request (e.g., request for birth certificate)
   */
  @UseGuards(JwtAuthGuard)
  @Post('request')
  async submitRequest(@Req() req, @Body() submitDto: SubmitDocumentRequestDto): Promise<any> {
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
  async submitReport(@Req() req, @Body() reportDto: SubmitReportDto): Promise<any> {
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
  async getRequests(@Req() req): Promise<any> {
    console.log('[DOCUMENTS] Fetch requests for:', req.user.citizenId);
    const requests = await this.documentsService.getRequests(req.user.citizenId);
    return {
      status: 'success',
      data: requests,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports')
  async getReports(@Req() req): Promise<any> {
    console.log('[REPORTS] Fetch reports for:', req.user.citizenId);
    const reports = await this.documentsService.getReports(req.user.citizenId);
    return {
      status: 'success',
      data: reports,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('reports/admin')
  async getAdminReports(@Query('status') status?: string): Promise<any> {
    console.log(`[REPORTS] Admin fetching reports, status filter: ${status}`);
    const reports = await this.documentsService.findAllReports(status);
    return {
      status: 'success',
      count: reports.length,
      data: reports,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reports/:id/status')
  async updateReportStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ): Promise<any> {
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      throw new HttpException(
        { status: 'error', message: 'Invalid report ID', code: 'INVALID_ID' },
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log(`[REPORTS] Update status for report ${reportId} to ${body.status}`);
    const result = await this.documentsService.updateReportStatus(reportId, body.status);
    return {
      status: 'success',
      message: `Report status updated to ${body.status} successfully`,
      data: result,
    };
  }
}
