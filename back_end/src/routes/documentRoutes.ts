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

import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

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

router.post('/upload', authMiddleware, upload.single('file'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  }
  const fileInfo = {
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  };
  res.status(201).json({ status: 'success', message: 'File uploaded', data: fileInfo });
});
export default router;