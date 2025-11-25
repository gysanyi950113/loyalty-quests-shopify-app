import express from 'express';
import helmet from 'helmet';
import { config } from './config/environment';
import { logger } from './utils/logger';
import authRoutes from './api/auth/auth.routes';
import webhookRoutes from './api/webhooks/webhook.routes';
import questRoutes from './api/quests/quest.routes';
import rewardRoutes from './api/rewards/reward.routes';
import publicRoutes from './api/public/public.routes';
import analyticsRoutes from './api/analytics/analytics.routes';
import { startWorkers, stopWorkers } from './workers';

const app = express();

// Security middleware
app.use(helmet());

// Body parsing middleware
// Note: Webhooks need raw body for HMAC verification
app.use('/api/webhooks', express.json({ verify: (req: any, _res, buf) => {
  req.rawBody = buf.toString();
}}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.app.environment,
    version: '0.1.0',
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    app: 'Loyalty Quests',
    description: 'Shopify app for gamified loyalty quests',
    version: '0.1.0',
    documentation: 'https://github.com/gysanyi950113/loyalty-quests-shopify-app',
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', webhookRoutes);
app.use('/api', questRoutes);
app.use('/api', rewardRoutes);
app.use('/api', analyticsRoutes);
app.use('/', publicRoutes); // Public routes (no /api prefix)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });

  res.status(500).json({
    error: 'Internal Server Error',
    message: config.app.isDevelopment ? err.message : 'An unexpected error occurred',
  });
});

// Start server
const server = app.listen(config.app.port, config.app.host, () => {
  logger.info(`🚀 Loyalty Quests server running on http://${config.app.host}:${config.app.port}`);
  logger.info(`📊 Environment: ${config.app.environment}`);
  logger.info(`✨ Features enabled:`, config.features);

  // Start BullMQ workers
  if (config.features.webhookAutomation) {
    startWorkers();
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await stopWorkers();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await stopWorkers();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { app };
