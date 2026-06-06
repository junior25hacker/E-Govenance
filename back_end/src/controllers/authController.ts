import { Request, Response } from 'express';
import { generateJWT } from '../utils/jwtUtils';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

export const login = async (req: Request, res: Response) => {
  try {
    console.log('[AUTH] Login attempt for:', req.body.citizenId);
    const { citizenId, password } = req.body;

    if (!citizenId || !password) {
      return res.status(400).json({ status: 'fail', message: 'Citizen ID and password are required' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { citizenId } });

    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Invalid Citizen ID or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid Citizen ID or password' });
    }

    const token = generateJWT({ id: user.id, citizenId: user.citizenId, email: user.email }, process.env.JWT_EXPIRY || '7d');

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: { id: user.id, citizenId: user.citizenId, email: user.email, fullName: user.fullName }
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm, phone } = req.body;

    if (!firstName || !lastName || !password || !passwordConfirm) {
      return res.status(400).json({ status: 'fail', message: 'Name and password fields are required' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ status: 'fail', message: 'Passwords do not match' });
    }

    const userRepository = AppDataSource.getRepository(User);
    
    if (email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ status: 'fail', message: 'Email already registered' });
      }
    }

    const citizenId = `CITIZEN-${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`;

    const newUser = userRepository.create({
      citizenId,
      fullName,
      email,
      phone,
      passwordHash
    });

    await userRepository.save(newUser);

    const token = generateJWT({ id: newUser.id, citizenId: newUser.citizenId, email: newUser.email }, process.env.JWT_EXPIRY || '7d');

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: { id: newUser.id, citizenId: newUser.citizenId, email: newUser.email, fullName: newUser.fullName }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        citizenId: user.citizenId,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const { fullName, email, phone, currentPassword, newPassword } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Optional password update
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await userRepository.save(user);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        citizenId: user.citizenId,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
