import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Message } from '../entities/Message';

export const getMessages = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

    const repo = AppDataSource.getRepository(Message);
    const messages = await repo.find({
      where: [{ receiverId: req.user.citizenId }, { senderId: req.user.citizenId }],
      order: { createdAt: 'DESC' }
    });

    res.status(200).json({ status: 'success', data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

    const { receiverId, subject, body } = req.body;
    if (!receiverId || !subject || !body) {
      return res.status(400).json({ status: 'fail', message: 'Missing fields' });
    }

    const repo = AppDataSource.getRepository(Message);
    const newMessage = repo.create({
      senderId: req.user.citizenId,
      receiverId,
      subject,
      body
    });

    await repo.save(newMessage);

    res.status(201).json({ status: 'success', data: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const markMessageRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

    const { id } = req.params;
    const repo = AppDataSource.getRepository(Message);
    const message = await repo.findOne({ where: { id, receiverId: req.user.citizenId } });

    if (!message) {
      return res.status(404).json({ status: 'fail', message: 'Message not found' });
    }

    message.isRead = true;
    await repo.save(message);

    res.status(200).json({ status: 'success', data: message });
  } catch (error) {
    console.error('Mark message error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
