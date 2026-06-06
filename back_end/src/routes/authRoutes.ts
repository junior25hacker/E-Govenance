import { Router } from 'express';
import { login, register, logout, getProfile, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/update', authMiddleware, updateProfile);

export default router;