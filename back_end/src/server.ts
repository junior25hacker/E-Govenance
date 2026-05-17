import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import { AppDataSource } from './config/database'; 

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Emergence-Connect API is online.' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);

// Initialize Database connection
AppDataSource.initialize()
  .then(() => {
    console.log('[DATABASE] 🐘 PostgreSQL Connected Successfully!');
    
    app.listen(PORT, () => {
      console.log(`[SERVER] 🚀 Core API is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('[DATABASE] ❌ Connection failed:', error);
  });