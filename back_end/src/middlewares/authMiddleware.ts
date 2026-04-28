import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to hold the decoded user info
export interface AuthRequest extends Request {
  user?: any;
}

export const requireAdminAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Get the token from the header (Format: "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // 3. Attach the user payload to the request and move to the next function
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ status: 'error', message: 'Forbidden: Invalid or expired token' });
  }
};