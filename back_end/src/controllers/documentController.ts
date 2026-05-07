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

export const verifyDocumentWithAI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const documentRepository = AppDataSource.getRepository(Document);
    const document = await documentRepository.findOneBy({ id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // AI MOCK FALLBACK
    if (!apiKey) {
      console.log('[AI] No Gemini API Key found. Using Mock Fallback.');
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return res.status(200).json({
        success: true,
        aiResult: {
          status: 'MATCH',
          confidence: 98,
          message: 'MOCK AI: The hospital record visually matches the submitted citizen data perfectly.'
        }
      });
    }

    // REAL GEMINI API CALL (When you get the key)
    // Here we would typically read the image file from document.filePath,
    // convert it to base64, and send it to the Gemini REST API along with the prompt.
    // For now, returning success structure to guide future implementation.
    
    return res.status(200).json({
      success: true,
      aiResult: {
        status: 'PENDING_REAL_CALL',
        message: 'API Key found. Implement real fetch to https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent here.'
      }
    });

  } catch (error) {
    console.error('Error verifying document with AI:', error);
    res.status(500).json({ success: false, message: 'Internal server error during AI verification' });
  }
};

