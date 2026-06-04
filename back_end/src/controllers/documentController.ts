import { Request, Response } from 'express';

// Mock document database (in production, use TypeORM repository)
const documents: any[] = [
  {
    id: 'DOC-001',
    citizenId: 'CITIZEN-1234',
    documentType: 'birth-cert',
    documentName: 'Birth Certificate',
    councilJurisdiction: 'Yaounde City Council',
    filePath: '/uploads/birth-cert-001.pdf',
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
    filePath: '/uploads/origin-cert-002.pdf',
    status: 'VERIFIED',
    issuedDate: '2026-02-05',
    expiryDate: null,
    verificationHash: 'hash_def456uvw',
    createdAt: new Date('2026-02-05'),
  },
];

// Mock requests database
const requests: any[] = [
  {
    id: 'REQ-2026-ABC123',
    citizenId: 'CITIZEN-1234',
    documentType: 'birth-cert',
    status: 'APPROVED',
    submittedDate: new Date('2026-05-10'),
    approvalDate: new Date('2026-05-15'),
  },
];

// Mock reports database
const reports: any[] = [
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

/**
 * Verify a document by ID
 * GET /api/v1/documents/:id/verify
 */
export const verifyDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = documents.find((doc) => doc.id === id);

    if (!document) {
      return res.status(404).json({
        status: 'fail',
        message: 'Document not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: document.id,
        documentType: document.documentType,
        documentName: document.documentName,
        status: document.status,
        issuedDate: document.issuedDate,
        verificationHash: document.verificationHash,
        isValid: true,
      },
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get all documents for authenticated user
 * GET /api/v1/documents
 */
export const getUserDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }

    const userDocuments = documents.filter(
      (doc) => doc.citizenId === req.user.citizenId
    );

    res.status(200).json({
      status: 'success',
      count: userDocuments.length,
      data: userDocuments,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
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
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }

    const { documentType, councilJurisdiction, purpose } = req.body;

    // Validation
    if (!documentType || !councilJurisdiction) {
      return res.status(400).json({
        status: 'fail',
        message: 'Document type and council jurisdiction are required',
      });
    }

    // Generate request ID
    const requestId = `REQ-2026-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

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

    requests.push(newRequest);
    console.log('[DOCUMENTS] Request submitted with ID:', requestId);

    res.status(201).json({
      status: 'success',
      message: 'Document request submitted successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error('[DOCUMENTS] Submit request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get document requests for authenticated user
 * GET /api/v1/documents/requests
 */
export const getDocumentRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }

    const userRequests = requests.filter(
      (req) => req.citizenId === req.user.citizenId
    );

    res.status(200).json({
      status: 'success',
      count: userRequests.length,
      data: userRequests,
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
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
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }

    const { category, priority, location, description, phone } = req.body;

    // Validation
    if (!category || !location || !description) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category, location, and description are required',
      });
    }

    // Generate report ID
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

    reports.push(newReport);
    console.log('[REPORTS] Report submitted with ID:', reportId);

    res.status(201).json({
      status: 'success',
      message: 'Report submitted successfully',
      data: newReport,
    });
  } catch (error) {
    console.error('[REPORTS] Submit report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get issue reports for authenticated user
 * GET /api/v1/documents/reports
 */
export const getUserReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }

    const userReports = reports.filter(
      (report) => report.citizenId === req.user.citizenId
    );

    res.status(200).json({
      status: 'success',
      count: userReports.length,
      data: userReports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Download a document
 * GET /api/v1/documents/:id/download
 */
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const document = documents.find(
      (doc) => doc.id === id && doc.citizenId === req.user.citizenId
    );

    if (!document) {
      return res.status(404).json({
        status: 'fail',
        message: 'Document not found or access denied',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Download link generated',
      data: {
        downloadUrl: document.filePath,
        fileName: `${document.documentName}.pdf`,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
