import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

    const repo = AppDataSource.getRepository(Notification);
    const notifications = await repo.find({
      where: { citizenId: req.user.citizenId },
      order: { createdAt: 'DESC' }
    });

    res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Unauthorized' });

    const { id } = req.params;
    const repo = AppDataSource.getRepository(Notification);
    const notification = await repo.findOne({ where: { id, citizenId: req.user.citizenId } });

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Notification not found' });
    }

    notification.isRead = true;
    await repo.save(notification);

    res.status(200).json({ status: 'success', data: notification });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
