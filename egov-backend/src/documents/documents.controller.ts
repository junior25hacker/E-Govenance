import { Controller, Post, Body, Get, UseGuards, Req, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { VerifyStatusDto } from './dto/verify-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    if (!req.user) {
      throw new HttpException(
        { status: 'error', message: 'Authentication required', code: 'AUTH_REQUIRED' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log('[DOCUMENTS] Fetch user documents for:', req.user.citizenId);
    const documents = await this.documentsService.findByCitizen(req.user.citizenId);
    return {
      status: 'success',
      data: documents,
    };
  }

  /**
   * POST /api/v1/documents/submit
   * Wired to the frontend "Digitize New Document" button.
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
    
    // In a real app we'd fetch this specific document by ID. 
    // Since DocumentsService lacks findById, let's fetch all and filter for now (or implement findById).
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
}
