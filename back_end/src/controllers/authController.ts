import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ role: 'admin', username }, jwtSecret, { expiresIn: '8h' });
    return res.status(200).json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
};
