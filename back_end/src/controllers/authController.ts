import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  // TODO: Replace this with a real PostgreSQL database query later
  if (username === 'admin' && password === 'gov_secure_2026') {
    
    // The payload is the data we securely pack inside the JWT
    const payload = {
      id: 'admin_001',
      role: 'GOVERNMENT_OFFICIAL',
      jurisdiction: 'Yaoundé IV'
    };

    // Sign the token using your secret key from the .env file
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '8h' 
    });

    res.status(200).json({
      status: 'success',
      token: token,
      message: 'Authentication successful. Welcome, Official.'
    });
  } else {
    // If credentials don't match, reject them with a 401 Unauthorized
    res.status(401).json({ 
      status: 'error', 
      message: 'Invalid administrative credentials' 
    });
  }
};