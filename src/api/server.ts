import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import * as dotenv from 'dotenv';

// Import our services
import { FreeDataService } from '../services/data-service';
import { EligibilityChecker } from '../services/eligibility-checker';
import { LiveUpdatesService } from '../services/live-updates';
import { RateLimiter } from '../utils/rate-limiter';
import { DataCache } from '../utils/cache';

// Import routes
import gamesRouter from './routes/games';
import teamsRouter from './routes/teams';
import rankingsRouter from './routes/rankings';
import eligibilityRouter from './routes/eligibility';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const rateLimiter = new RateLimiter();
const cache = new DataCache();
const dataService = new FreeDataService();
const eligibilityChecker = new EligibilityChecker();
const liveUpdatesService = new LiveUpdatesService(dataService, rateLimiter, cache);

// Make services available to routes
app.locals.dataService = dataService;
app.locals.eligibilityChecker = eligibilityChecker;
app.locals.liveUpdatesService = liveUpdatesService;
app.locals.cache = cache;
app.locals.rateLimiter = rateLimiter;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      cfbd: process.env.CFBD_API_KEY ? 'configured' : 'not configured',
      cache: 'active',
      liveUpdates: liveUpdatesService['isRunning'] ? 'running' : 'stopped'
    }
  });
});

// API Routes
app.use('/api/games', gamesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/eligibility', eligibilityRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'College Football Fantasy API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      games: '/api/games',
      teams: '/api/teams',
      rankings: '/api/rankings',
      eligibility: '/api/eligibility'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏈 College Football Fantasy API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Start live updates for current games
  liveUpdatesService.startPolling().catch(console.error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  liveUpdatesService.destroy();
  cache.destroy();
  process.exit(0);
});

export default app;