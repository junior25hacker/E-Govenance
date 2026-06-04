import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import { AppDataSource } from './config/database'; 

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from parent directory
const frontendPath = path.join(__dirname, '../../');
app.use(express.static(frontendPath));

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Emergence-Connect API is online.' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);

// Initialize Database connection
AppDataSource.initialize()
  .then(() => {
    console.log('[DATABASE] 🐘 PostgreSQL Connected Successfully!');
    startServer();
  })
  .catch((error) => {
    console.warn('[DATABASE] ⚠️ PostgreSQL Connection failed (using mock data):', error.message);
    startServer();
  });

function startServer() {
  app.listen(PORT, () => {
    console.log(`[SERVER] 🚀 Core API is running on http://localhost:${PORT}`);
  });
}