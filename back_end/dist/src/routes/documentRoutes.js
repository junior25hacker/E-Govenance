"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("../controllers/documentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
// ─── Multer storage config ──────────────────────────────────────────────────
const storage = multer_1.default.diskStorage({
    destination: path_1.default.join(__dirname, '../../uploads'),
    filename: (req, file, cb) => {
        // Sanitize filename: replace spaces, keep extension
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueName = `${Date.now()}-${baseName}${ext}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (_req, file, cb) => {
        // Accept PDFs, images, and common document types
        const allowed = /pdf|jpeg|jpg|png|gif|bmp|tiff|doc|docx/i;
        const ext = path_1.default.extname(file.originalname).toLowerCase().slice(1);
        if (allowed.test(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type .${ext} is not allowed. Use PDF, images, or Word documents.`));
        }
    },
});
// ─── Router ─────────────────────────────────────────────────────────────────
const router = (0, express_1.Router)();
// ── Public endpoints ─────────────────────────────────────────────────────────
/** Public document verification (scan QR / share link) */
router.get('/:id/verify', documentController_1.verifyDocument);
/**
 * External API for teammate / JavaFX desktop integration
 * Returns clean JSON structure: { success, count, data: [...] }
 * Can use optionalAuth so it also works for authenticated users
 */
router.get('/user/:userId', authMiddleware_1.optionalAuth, documentController_1.getDocumentsByUserId);
// ── Authenticated citizen endpoints ──────────────────────────────────────────
/** List all documents for the logged-in citizen */
router.get('/', authMiddleware_1.authMiddleware, documentController_1.getUserDocuments);
/** Get aggregated stats for the dashboard */
router.get('/dashboard-stats', authMiddleware_1.authMiddleware, documentController_1.getDashboardStats);
/**
 * Upload + digitalize a document
 * multipart/form-data fields:
 *   file           — the document file (required)
 *   documentType   — e.g. "birth-cert" (required)
 *   documentName   — human label e.g. "Birth Certificate"
 *   councilJurisdiction — e.g. "Yaounde City Council"
 *   citizenFullName — citizen's full name
 */
router.post('/upload', authMiddleware_1.authMiddleware, upload.single('file'), documentController_1.uploadAndSaveDocument);
/** Submit a service request (no file) */
router.post('/submit', authMiddleware_1.authMiddleware, documentController_1.submitDocumentRequest);
/** Get the citizen's own service requests */
router.get('/requests', authMiddleware_1.authMiddleware, documentController_1.getDocumentRequests);
/** Submit an issue / complaint report */
router.post('/report', authMiddleware_1.authMiddleware, documentController_1.submitReport);
/** Get the citizen's own reports */
router.get('/reports', authMiddleware_1.authMiddleware, documentController_1.getUserReports);
/** Generate download link for a specific document */
router.get('/:id/download', authMiddleware_1.authMiddleware, documentController_1.downloadDocument);
exports.default = router;
