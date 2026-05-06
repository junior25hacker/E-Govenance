import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Document } from '../entities/Document';

export const getDocumentForVerification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const documentRepository = AppDataSource.getRepository(Document);
    const document = await documentRepository.findOneBy({ id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
