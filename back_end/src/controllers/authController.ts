import { Request, Response } from 'express';
import { generateJWT } from '../utils/jwtUtils';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';

// Mock user database (in production, use TypeORM repository)
const users: any[] = [
  {
    id: 1,
    citizenId: 'CITIZEN-1234',
    email: 'john.okonkwo@example.com',
    password: 'password123', // In production: hashed with bcrypt
    firstName: 'John',
    lastName: 'Okonkwo',
  },
  {
    id: 2,
    citizenId: '202401001',
    email: 'test.citizen@example.com',
    password: '1234',
    firstName: 'Test',
    lastName: 'User',
  },
];

export const login = async (req: Request, res: Response) => {
  try {
    console.log('[AUTH] Login attempt with body:', req.body);
    const { citizenId, password } = req.body;

    // Validation
    if (!citizenId || !password) {
      console.log('[AUTH] Missing citizenId or password');
      return res.status(400).json({
        status: 'fail',
        message: 'Citizen ID and password are required',
      });
    }

    // Find user by citizenId
    const user = users.find((u) => u.citizenId === citizenId);

    if (!user || user.password !== password) {
      console.log('[AUTH] User not found or password mismatch');
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid Citizen ID or password',
      });
    }

    // Generate JWT
    const token = generateJWT(
      {
        id: user.id,
        citizenId: user.citizenId,
        email: user.email,
      },
      process.env.JWT_EXPIRY || '7d'
    );

    console.log('[AUTH] Login successful for', citizenId);
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          citizenId: user.citizenId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters',
      });
    }

    // Check if user exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already registered',
      });
    }

    // Create citizen ID
    const citizenId = `CITIZEN-${Math.floor(Math.random() * 10000)}`;

    // Create new user
    const newUser = {
      id: users.length + 1,
      citizenId,
      email,
      password, // In production: use bcrypt.hash()
      firstName,
      lastName,
    };

    users.push(newUser);

    // Generate token
    const token = generateJWT(
      {
        id: newUser.id,
        citizenId: newUser.citizenId,
        email: newUser.email,
      },
      process.env.JWT_EXPIRY || '7d'
    );

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: newUser.id,
          citizenId: newUser.citizenId,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const logout = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const getProfile = (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }

    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        citizenId: user.citizenId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
