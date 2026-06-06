import { Router } from 'express';
import { getNotifications, markNotificationRead } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markNotificationRead);

export default router;
