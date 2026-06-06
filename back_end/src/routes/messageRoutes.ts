import { Router } from 'express';
import { getMessages, sendMessage, markMessageRead } from '../controllers/messageController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getMessages);
router.post('/', authMiddleware, sendMessage);
router.put('/:id/read', authMiddleware, markMessageRead);

export default router;
