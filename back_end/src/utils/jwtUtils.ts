import jwt from 'jsonwebtoken';

export const generateJWT = (payload: any, expiresIn: string = '7d'): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJWT = (token: string): any => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeJWT = (token: string): any => {
  return jwt.decode(token);
};
