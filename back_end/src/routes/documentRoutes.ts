import { Router } from 'express';
import {
  verifyDocument,
  getUserDocuments,
  uploadAndSaveDocument,
  getDocumentsByUserId,
  submitDocumentRequest,
  getDocumentRequests,
  submitReport,
  getUserReports,
  downloadDocument,
} from '../controllers/documentController';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware';

import path from 'path';
import multer from 'multer';

// ─── Multer storage config ──────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    // Sanitize filename: replace spaces, keep extension
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    // Accept PDFs, images, and common document types
    const allowed = /pdf|jpeg|jpg|png|gif|bmp|tiff|doc|docx/i;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} is not allowed. Use PDF, images, or Word documents.`));
    }
  },
});

// ─── Router ─────────────────────────────────────────────────────────────────

const router = Router();

// ── Public endpoints ─────────────────────────────────────────────────────────

/** Public document verification (scan QR / share link) */
router.get('/:id/verify', verifyDocument);

/**
 * External API for teammate / JavaFX desktop integration
 * Returns clean JSON structure: { success, count, data: [...] }
 * Can use optionalAuth so it also works for authenticated users
 */
router.get('/user/:userId', optionalAuth, getDocumentsByUserId);

// ── Authenticated citizen endpoints ──────────────────────────────────────────

/** List all documents for the logged-in citizen */
router.get('/', authMiddleware, getUserDocuments);

/**
 * Upload + digitalize a document
 * multipart/form-data fields:
 *   file           — the document file (required)
 *   documentType   — e.g. "birth-cert" (required)
 *   documentName   — human label e.g. "Birth Certificate"
 *   councilJurisdiction — e.g. "Yaounde City Council"
 *   citizenFullName — citizen's full name
 */
router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  uploadAndSaveDocument,
);

/** Submit a service request (no file) */
router.post('/submit', authMiddleware, submitDocumentRequest);

/** Get the citizen's own service requests */
router.get('/requests', authMiddleware, getDocumentRequests);

/** Submit an issue / complaint report */
router.post('/report', authMiddleware, submitReport);

/** Get the citizen's own reports */
router.get('/reports', authMiddleware, getUserReports);

/** Generate download link for a specific document */
router.get('/:id/download', authMiddleware, downloadDocument);

export default router;