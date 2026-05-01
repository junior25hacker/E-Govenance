import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet'; // Added for extra security headers

// Routes
import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import applicationRoutes from "./routes/applicationRoutes"; 

// Configuration & Middleware
import { AppDataSource } from './config/database'; 
import { authenticateToken } from './middleware/auth'; 

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// --- Global Middleware ---
app.use(helmet()); // Protects against common web vulnerabilities
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Emergence-Connect API is online.',
    timestamp: new Date().toISOString()
  });
});

// --- API Routes ---

// Public Routes
app.use('/api/v1/auth', authRoutes);

// Protected Routes
app.use('/api/v1/documents', authenticateToken, documentRoutes);
app.use('/api/v1/applications', authenticateToken, applicationRoutes);

// --- Error & 404 Handling ---

// Catch-all for non-existent routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ status: 'fail', message: 'Endpoint not found' });
});

// Global error handler (must have 4 arguments for Express to recognize it)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// --- Database Initialization & Server Start ---
AppDataSource.initialize()
  .then(() => {
    console.log('[DATABASE] 🐘 PostgreSQL Connected Successfully!');
    
    app.listen(PORT, () => {
      console.log(`[SERVER] 🚀 Core API is running on http://localhost:${PORT}`);
      console.log(`[AI] 🤖 LangChain Routing Agent Active.`);
    });
  })
  .catch((error) => {
    console.error('[DATABASE] ❌ Connection failed during startup:', error);
    // Exit the process so the environment (like Railway or Docker) can restart it
    process.exit(1); 
  });