import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    // You could also add decoded data to req, e.g., (req as any).admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};
