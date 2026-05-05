import { Router } from 'express';
import {
  createBirthDeclaration,
  uploadBirthDocuments,
  getBirthDeclaration,
  getBirthDeclarationsByCitizen,
  updateBirthDeclarationStatus,
} from '../controllers/birthDeclarationController';
import { requireAdminAuth } from '../middlewares/authMiddleware';

const router = Router();

// Public routes (citizen)
router.post('/', createBirthDeclaration); // Submit Step 1
router.post('/:declarationId/upload', uploadBirthDocuments); // Submit Step 2 (document upload)
router.get('/:declarationId', getBirthDeclaration); // Get declaration status
router.get('/citizen/:citizenId', getBirthDeclarationsByCitizen); // Get all declarations for citizen

// Admin routes
router.patch('/:declarationId/status', requireAdminAuth, updateBirthDeclarationStatus); // Verify & update status

export default router;