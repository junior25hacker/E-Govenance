import { Router } from 'express';
import { login, register, logout, getProfile } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

export default router;