import { Router } from 'express';
import { loginAdmin } from '../controllers/authController';

const router = Router();

// Define the exact URL for logging in: POST /api/v1/auth/login
router.post('/login', loginAdmin);

export default router;