import { Router, Request, Response } from 'express';

const router = Router();

// FIXED: Inline handler resolves the missing authController path error
const loginAdmin = (req: Request, res: Response) => {
  const { citizenId, email } = req.body;
  
  if (citizenId && email) {
    return res.status(200).json({
      status: 'success',
      token: 'mock-secured-jwt-token-xyz-12345',
      citizen: {
        id: citizenId,
        email: email
      }
    });
  }
  
  return res.status(400).json({ 
    status: 'fail', 
    message: 'Authentication failed. Please provide a valid Citizen ID and Email.' 
  });
};

// Define URL: POST /api/v1/auth/login
router.post('/citizen/login', loginAdmin);
router.post('/login', loginAdmin);

export default router;