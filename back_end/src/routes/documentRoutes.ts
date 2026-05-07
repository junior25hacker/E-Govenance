import { Router } from 'express';
import { getDocumentForVerification, verifyDocumentWithAI } from '../controllers/documentController';
import { requireAdminAuth } from '../middlewares/authMiddleware';

const router = Router();

// Notice how requireAdminAuth sits right in the middle! This means that before we even get to the getDocumentForVerification function, the requireAdminAuth middleware will run first to check if the user is an authenticated admin. If they are not, it will block access and return an error response. If they are authenticated, it will allow the request to proceed to the controller function.
router.get('/:id/verify', requireAdminAuth, getDocumentForVerification);
router.post('/:id/ai-verify', requireAdminAuth, verifyDocumentWithAI);

export default router;