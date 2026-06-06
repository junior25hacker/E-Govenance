import { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';

// ─── In-memory fallback stores (used when DB is unavailable) ──────────────────

const mockDocuments: any[] = [
  {
    id: 'DOC-001',
    citizenId: 'CITIZEN-1234',
    documentType: 'birth-cert',
    documentName: 'Birth Certificate',
    councilJurisdiction: 'Yaounde City Council',
    filePath: 'uploads/birth-cert-001.pdf',
    fileUrl: '/uploads/birth-cert-001.pdf',
    originalFilename: 'birth-cert-001.pdf',
    status: 'VERIFIED',
    issuedDate: '2026-04-10',
    expiryDate: null,
    verificationHash: 'hash_abc123xyz',
    createdAt: new Date('2026-04-10'),
  },
  {
    id: 'DOC-002',
    citizenId: 'CITIZEN-1234',
    documentType: 'origin-cert',
    documentName: 'Certificate of Origin',
    councilJurisdiction: 'Douala City Council',
    filePath: 'uploads/origin-cert-002.pdf',
    fileUrl: '/uploads/origin-cert-002.pdf',
    originalFilename: 'origin-cert-002.pdf',
    status: 'VERIFIED',
    issuedDate: '2026-02-05',
    expiryDate: null,
    verificationHash: 'hash_def456uvw',
    createdAt: new Date('2026-02-05'),
  },
];

// In-memory requests fallback
const mockRequests: any[] = [
  {
    id: 'REQ-2026-ABC123',
    citizenId: 'CITIZEN-1234',
    documentType: 'birth-cert',
    status: 'APPROVED',
    submittedDate: new Date('2026-05-10'),
    approvalDate: new Date('2026-05-15'),
  },
];

// In-memory reports fallback
const mockReports: any[] = [
  {
    id: 'RPT-2026-001',
    citizenId: 'CITIZEN-1234',
    category: 'Road',
    priority: 'High',
    location: 'Main Street',
    description: 'Pothole on Main Street',
    status: 'In Progress',
    submittedDate: new Date('2026-05-20'),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isDbReady(): boolean {
  try {
    return AppDataSource.isInitialized;
  } catch {
    return false;
  }
}

function generateVerificationHash(content: string): string {
  return crypto.createHash('sha256').update(content + Date.now()).digest('hex').slice(0, 16);
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * Verify a document by ID (public)
 * GET /api/v1/documents/:id/verify
 */
export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbReady()) {
      const repo = AppDataSource.getRepository(Document);
      const doc = await repo.findOneBy({ id });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: 'Document not found' });
      }
      return res.status(200).json({
        status: 'success',
        data: {
          id: doc.id,
          documentType: doc.documentType,
          documentName: doc.documentName,
          status: doc.status,
          issuedDate: doc.issuedDate,
          verificationHash: doc.verificationHash,
          isValid: doc.status === 'VERIFIED',
        },
      });
    }

    // Fallback
    const doc = mockDocuments.find((d) => d.id === id);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Document not found' });
    return res.status(200).json({
      status: 'success',
      data: { id: doc.id, documentType: doc.documentType, documentName: doc.documentName,
        status: doc.status, issuedDate: doc.issuedDate, verificationHash: doc.verificationHash, isValid: true },
    });
  } catch (error) {
    console.error('[DOCUMENTS] Verify error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Get all documents for the authenticated user
 * GET /api/v1/documents
 */
export const getUserDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const citizenId = req.user.citizenId;

    if (isDbReady()) {
      const repo = AppDataSource.getRepository(Document);
      const docs = await repo.find({
        where: { citizenId },
        order: { createdAt: 'DESC' },
      });
      return res.status(200).json({ status: 'success', count: docs.length, data: docs });
    }

    // Fallback
    const userDocs = mockDocuments.filter((d) => d.citizenId === citizenId);
    return res.status(200).json({ status: 'success', count: userDocs.length, data: userDocs });
  } catch (error) {
    console.error('[DOCUMENTS] Get user documents error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Upload and digitalize a document — saves file to disk AND persists metadata to DB
 * POST /api/v1/documents/upload   (multipart/form-data)
 * Fields: file (required), documentType, documentName, councilJurisdiction, citizenFullName
 */
export const uploadAndSaveDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    const { documentType, documentName, councilJurisdiction, citizenFullName } = req.body;

    if (!documentType) {
      return res.status(400).json({ status: 'fail', message: 'documentType is required' });
    }

    const citizenId: string = req.user.citizenId;
    const filePath = req.file.path.replace(/\\/g, '/');        // normalize Windows paths
    const fileUrl = `/uploads/${req.file.filename}`;
    const originalFilename = req.file.originalname;
    const verificationHash = generateVerificationHash(citizenId + originalFilename);
    const resolvedDocName = documentName || documentType;

    if (isDbReady()) {
      const repo = AppDataSource.getRepository(Document);
      const doc = repo.create({
        citizenId,
        citizenFullName: citizenFullName || '',
        documentType,
        documentName: resolvedDocName,
        councilJurisdiction: councilJurisdiction || 'Central Registry',
        filePath,
        fileUrl,
        originalFilename,
        status: 'PENDING_VERIFICATION',
        verificationHash,
      });
      const saved = await repo.save(doc);
      console.log('[DOCUMENTS] ✅ Document saved to DB:', saved.id);
      return res.status(201).json({
        status: 'success',
        message: 'Document uploaded and saved for verification',
        data: {
          id: saved.id,
          documentName: saved.documentName,
          documentType: saved.documentType,
          fileUrl: saved.fileUrl,
          status: saved.status,
          verificationHash: saved.verificationHash,
          uploadedAt: saved.createdAt,
        },
      });
    }

    // Fallback — in-memory only
    const newDoc: any = {
      id: `DOC-${Date.now()}`,
      citizenId,
      citizenFullName: citizenFullName || '',
      documentType,
      documentName: resolvedDocName,
      councilJurisdiction: councilJurisdiction || 'Central Registry',
      filePath,
      fileUrl,
      originalFilename,
      status: 'PENDING_VERIFICATION',
      verificationHash,
      issuedDate: null,
      expiryDate: null,
      createdAt: new Date(),
    };
    mockDocuments.push(newDoc);
    console.log('[DOCUMENTS] ⚠️ DB not ready — stored in memory only:', newDoc.id);
    return res.status(201).json({
      status: 'success',
      message: 'Document uploaded (note: DB not connected — stored in memory only)',
      data: {
        id: newDoc.id,
        documentName: newDoc.documentName,
        documentType: newDoc.documentType,
        fileUrl: newDoc.fileUrl,
        status: newDoc.status,
        verificationHash: newDoc.verificationHash,
        uploadedAt: newDoc.createdAt,
      },
    });
  } catch (error) {
    console.error('[DOCUMENTS] Upload error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * External API endpoint for teammate / JavaFX integration
 * GET /api/v1/documents/user/:userId
 * Returns clean JSON structure the external system expects
 */
export const getDocumentsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    let documents: any[] = [];

    if (isDbReady()) {
      const repo = AppDataSource.getRepository(Document);
      const dbDocs = await repo.find({
        where: { citizenId: userId },
        order: { createdAt: 'DESC' },
      });
      documents = dbDocs.map((doc) => ({
        id: doc.id,
        name: doc.documentName || doc.documentType,
        documentType: doc.documentType,
        status: doc.status,
        url: doc.fileUrl || null,
        verificationHash: doc.verificationHash,
        councilJurisdiction: doc.councilJurisdiction,
        uploadedAt: doc.createdAt,
        issuedDate: doc.issuedDate,
      }));
    } else {
      // Fallback mock
      documents = mockDocuments
        .filter((d) => d.citizenId === userId)
        .map((doc) => ({
          id: doc.id,
          name: doc.documentName || doc.documentType,
          documentType: doc.documentType,
          status: doc.status,
          url: doc.fileUrl || null,
          verificationHash: doc.verificationHash,
          councilJurisdiction: doc.councilJurisdiction,
          uploadedAt: doc.createdAt,
          issuedDate: doc.issuedDate,
        }));
    }

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error('[DOCUMENTS] getDocumentsByUserId error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching documents',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Submit a new document request
 * POST /api/v1/documents/submit
 */
export const submitDocumentRequest = async (req: Request, res: Response) => {
  try {
    console.log('[DOCUMENTS] Submit request received:', req.body);
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const { documentType, councilJurisdiction, purpose } = req.body;

    if (!documentType || !councilJurisdiction) {
      return res.status(400).json({
        status: 'fail',
        message: 'Document type and council jurisdiction are required',
      });
    }

    const requestId = `REQ-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newRequest = {
      id: requestId,
      citizenId: req.user.citizenId,
      documentType,
      councilJurisdiction,
      purpose: purpose || 'Personal',
      status: 'SUBMITTED',
      submittedDate: new Date(),
      approvalDate: null,
    };

    mockRequests.push(newRequest);
    console.log('[DOCUMENTS] Request submitted with ID:', requestId);

    return res.status(201).json({
      status: 'success',
      message: 'Document request submitted successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error('[DOCUMENTS] Submit request error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Get document requests for authenticated user
 * GET /api/v1/documents/requests
 */
export const getDocumentRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    // FIX: was using 'req' as filter callback param — shadowing Express Request
    const citizenId = req.user.citizenId;
    const userRequests = mockRequests.filter((r) => r.citizenId === citizenId);

    return res.status(200).json({ status: 'success', count: userRequests.length, data: userRequests });
  } catch (error) {
    console.error('[DOCUMENTS] Get requests error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Submit an issue report
 * POST /api/v1/documents/report
 */
export const submitReport = async (req: Request, res: Response) => {
  try {
    console.log('[REPORTS] Submit report received:', req.body);
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const { category, priority, location, description, phone } = req.body;

    if (!category || !location || !description) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category, location, and description are required',
      });
    }

    const reportId = `RPT-2026-${Math.floor(Math.random() * 100000)}`;
    const newReport = {
      id: reportId,
      citizenId: req.user.citizenId,
      category,
      priority: priority || 'Medium',
      location,
      description,
      phone: phone || null,
      status: 'OPEN',
      submittedDate: new Date(),
      resolvedDate: null,
    };

    mockReports.push(newReport);
    console.log('[REPORTS] Report submitted with ID:', reportId);

    return res.status(201).json({ status: 'success', message: 'Report submitted successfully', data: newReport });
  } catch (error) {
    console.error('[REPORTS] Submit report error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Get issue reports for authenticated user
 * GET /api/v1/documents/reports
 */
export const getUserReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const citizenId = req.user.citizenId;
    const userReports = mockReports.filter((r) => r.citizenId === citizenId);

    return res.status(200).json({ status: 'success', count: userReports.length, data: userReports });
  } catch (error) {
    console.error('[REPORTS] Get reports error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Download a document
 * GET /api/v1/documents/:id/download
 */
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const { id } = req.params;
    const citizenId = req.user.citizenId;

    if (isDbReady()) {
      const repo = AppDataSource.getRepository(Document);
      const doc = await repo.findOneBy({ id, citizenId });
      if (!doc) {
        return res.status(404).json({ status: 'fail', message: 'Document not found or access denied' });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Download link generated',
        data: {
          downloadUrl: doc.fileUrl,
          fileName: doc.originalFilename || `${doc.documentName}.pdf`,
          expiresIn: '24h',
        },
      });
    }

    // Fallback
    const doc = mockDocuments.find((d) => d.id === id && d.citizenId === citizenId);
    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'Document not found or access denied' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Download link generated',
      data: {
        downloadUrl: doc.fileUrl,
        fileName: doc.originalFilename || `${doc.documentName}.pdf`,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    console.error('[DOCUMENTS] Download error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
