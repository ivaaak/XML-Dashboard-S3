import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS setup
    this.app.use(cors());
    
    // Request logging
    this.app.use(morgan('dev'));
    
    // JSON parsing
    this.app.use(express.json({ limit: '10mb' })); // Increased limit for XML uploads
    this.app.use(express.urlencoded({ extended: true }));
  }

  private configureRoutes(): void {
    // API routes
    this.app.use('/api', apiRoutes);
    
    // Basic health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // Root route
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        name: 'XML S3 Search API',
        version: '1.0.0',
        description: 'API for searching XML files in S3 buckets',
      });
    });
  }

  private configureErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    });
    
    // Global error handler
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', err);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message,
      });
    });
  }
}

export default new App().app;