import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SubmitDocumentRequestDto } from './dto/submit-document-request.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
import { VerifyStatusDto } from './dto/verify-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Multer storage config ───────────────────────────────────────────────────

const multerStorage = diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const multerFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowed = /pdf|jpeg|jpg|png|gif|bmp|tiff|doc|docx/i;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`File type .${ext} is not allowed.`), false);
  }
};

// ─── Controller ─────────────────────────────────────────────────────────────

@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

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
      count: documents.length,
      data: documents,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard-stats')
  async getDashboardStats(@Req() req): Promise<any> {
    console.log('[DOCUMENTS] Fetch dashboard stats for:', req.user.citizenId);
    const metrics = await this.documentsService.getMetrics(req.user.citizenId);
    return {
      status: 'success',
      data: metrics,
    };
  }

  /**
   * GET /api/v1/documents/user/:userId
   * External endpoint for teammate / JavaFX desktop integration.
   * Returns a clean, consistent JSON structure.
   * No auth required so the desktop app can call it directly.
   */
  @Get('user/:userId')
  async getDocumentsByUserId(@Param('userId') userId: string): Promise<any> {
    if (!userId) {
      throw new HttpException(
        { success: false, message: 'userId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(`[DOCUMENTS] External fetch for userId: ${userId}`);
    const documents = await this.documentsService.findByUserId(userId);

    return {
      success: true,
      count: documents.length,
      data: documents,
    };
  }

  /**
   * POST /api/v1/documents/upload
   * Upload a physical/scanned document and persist it to the database.
   * multipart/form-data fields:
   *   file                — the document file (required)
   *   documentType        — e.g. "birth-cert" (required)
   *   documentName        — human label e.g. "Birth Certificate"
   *   councilJurisdiction — e.g. "Yaounde City Council"
   *   citizenFullName     — citizen's full name
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
      fileFilter: multerFileFilter,
    }),
  )
  async uploadDocument(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!body.documentType) {
      throw new BadRequestException('documentType is required');
    }

    const citizenId: string = req.user?.citizenId || 'ANONYMOUS';
    console.log(`[DOCUMENTS] Upload received from ${citizenId}: ${file.originalname}`);

    const saved = await this.documentsService.uploadDocument(citizenId, file, {
      documentType: body.documentType,
      documentName: body.documentName,
      councilJurisdiction: body.councilJurisdiction,
      citizenFullName: body.citizenFullName,
    });

    return {
      status: 'success',
      message: 'Document uploaded and saved for verification',
      data: {
        id: String(saved.id),
        documentName: saved.documentName,
        documentType: saved.documentType,
        fileUrl: saved.fileUrl,
        status: saved.status,
        verificationHash: saved.verificationHash,
        uploadedAt: saved.createdAt,
      },
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
    const documentId = id;

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

    const documentId = id;

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
   * POST /api/v1/documents/request
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
