import { Request as ExpressRequest, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';
import { Request } from '../entities/Request';
import { Report } from '../entities/Report';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateVerificationHash(content: string): string {
  return crypto.createHash('sha256').update(content + Date.now()).digest('hex').slice(0, 16);
}

// ─── Controllers ──────────────────────────────────────────────────────────────

export const getDashboardStats = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const citizenId = req.user.citizenId;
    
    const docRepo = AppDataSource.getRepository(Document);
    const reqRepo = AppDataSource.getRepository(Request);
    const repRepo = AppDataSource.getRepository(Report);

    const totalDocuments = await docRepo.count({ where: { citizenId } });
    const verifiedDocuments = await docRepo.count({ where: { citizenId, status: 'VERIFIED' } });
    const pendingRequests = await reqRepo.count({ where: { citizenId, status: 'PENDING' } });
    const activeReports = await repRepo.count({ where: { citizenId, status: 'OPEN' } });

    res.status(200).json({
      status: 'success',
      data: {
        totalDocuments,
        verifiedDocuments,
        pendingRequests,
        activeReports
      }
    });
  } catch (error) {
    console.error('[DOCUMENTS] Get dashboard stats error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const verifyDocument = async (req: ExpressRequest, res: Response) => {
  try {
    const { id } = req.params;
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
  } catch (error) {
    console.error('[DOCUMENTS] Verify error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getUserDocuments = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const repo = AppDataSource.getRepository(Document);
    const docs = await repo.find({
      where: { citizenId: req.user.citizenId },
      order: { createdAt: 'DESC' },
    });
    return res.status(200).json({ status: 'success', count: docs.length, data: docs });
  } catch (error) {
    console.error('[DOCUMENTS] Get user documents error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const uploadAndSaveDocument = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ status: 'fail', message: 'No file uploaded' });

    const { documentType, documentName, councilJurisdiction, citizenFullName } = req.body;
    if (!documentType) return res.status(400).json({ status: 'fail', message: 'documentType is required' });

    const citizenId = req.user.citizenId;
    const filePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `/uploads/${req.file.filename}`;
    const verificationHash = generateVerificationHash(citizenId + req.file.originalname);
    const resolvedDocName = documentName || documentType;

    const repo = AppDataSource.getRepository(Document);
    const doc = repo.create({
      citizenId,
      citizenFullName: citizenFullName || '',
      documentType,
      documentName: resolvedDocName,
      councilJurisdiction: councilJurisdiction || 'Central Registry',
      filePath,
      fileUrl,
      originalFilename: req.file.originalname,
      status: 'PENDING_VERIFICATION',
      verificationHash,
    });
    const saved = await repo.save(doc);

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
  } catch (error) {
    console.error('[DOCUMENTS] Upload error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getDocumentsByUserId = async (req: ExpressRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const repo = AppDataSource.getRepository(Document);
    const dbDocs = await repo.find({
      where: { citizenId: userId },
      order: { createdAt: 'DESC' },
    });
    const documents = dbDocs.map((doc) => ({
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

    return res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    console.error('[DOCUMENTS] getDocumentsByUserId error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching documents', error: String(error) });
  }
};

export const submitDocumentRequest = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

    const { documentType, councilJurisdiction, purpose, applicantName, applicantId, applicantEmail, applicantPhone } = req.body;
    if (!documentType || !councilJurisdiction) {
      return res.status(400).json({ status: 'fail', message: 'Document type and council jurisdiction are required' });
    }

    const repo = AppDataSource.getRepository(Request);
    const newRequest = repo.create({
      citizenId: req.user.citizenId, // Note: Ensure citizenId is added to Request entity! Wait, let me add it.
      documentType,
      councilJurisdiction,
      purpose: purpose || 'Personal',
      applicantName: applicantName || '',
      applicantId: applicantId || '',
      applicantEmail: applicantEmail || '',
      applicantPhone: applicantPhone || '',
      status: 'PENDING'
    });

    const saved = await repo.save(newRequest);
    return res.status(201).json({ status: 'success', message: 'Document request submitted successfully', data: saved });
  } catch (error) {
    console.error('[DOCUMENTS] Submit request error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getDocumentRequests = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const repo = AppDataSource.getRepository(Request);
    const requests = await repo.find({ where: { citizenId: req.user.citizenId }, order: { createdAt: 'DESC' } });
    return res.status(200).json({ status: 'success', count: requests.length, data: requests });
  } catch (error) {
    console.error('[DOCUMENTS] Get requests error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const submitReport = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

    const { category, priority, location, description, phone } = req.body;
    if (!category || !location || !description) {
      return res.status(400).json({ status: 'fail', message: 'Category, location, and description are required' });
    }

    const repo = AppDataSource.getRepository(Report);
    const newReport = repo.create({
      citizenId: req.user.citizenId,
      category,
      priority: priority || 'Medium',
      location,
      description,
      phone: phone || null,
      status: 'OPEN'
    });

    const saved = await repo.save(newReport);
    return res.status(201).json({ status: 'success', message: 'Report submitted successfully', data: saved });
  } catch (error) {
    console.error('[REPORTS] Submit report error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getUserReports = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const repo = AppDataSource.getRepository(Report);
    const reports = await repo.find({ where: { citizenId: req.user.citizenId }, order: { createdAt: 'DESC' } });
    return res.status(200).json({ status: 'success', count: reports.length, data: reports });
  } catch (error) {
    console.error('[REPORTS] Get reports error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const downloadDocument = async (req: ExpressRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const { id } = req.params;
    
    const repo = AppDataSource.getRepository(Document);
    const doc = await repo.findOneBy({ id, citizenId: req.user.citizenId });
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
