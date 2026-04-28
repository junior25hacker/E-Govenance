import { Router } from 'express';
import { getDocumentForVerification } from '../controllers/documentController';
import { requireAdminAuth } from '../middlewares/authMiddleware';

const router = Router();

// Notice how requireAdminAuth sits right in the middle! 
// Express will run the auth check FIRST. If it fails, it stops. If it passes, it runs the controller.
router.get('/:id/verify', requireAdminAuth, getDocumentForVerification);

export default router;