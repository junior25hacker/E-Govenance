import { Router } from 'express';
import {
  verifyDocument,
  getUserDocuments,
  submitDocumentRequest,
  getDocumentRequests,
  submitReport,
  getUserReports,
  downloadDocument,
} from '../controllers/documentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public verification endpoint (anyone can check a document by id)
router.get('/:id/verify', verifyDocument);

// Protected: user document operations
router.get('/', authMiddleware, getUserDocuments);
router.post('/submit', authMiddleware, submitDocumentRequest);
router.get('/requests', authMiddleware, getDocumentRequests);

// Reports
router.post('/report', authMiddleware, submitReport);
router.get('/reports', authMiddleware, getUserReports);

// Download
router.get('/:id/download', authMiddleware, downloadDocument);

export default router;