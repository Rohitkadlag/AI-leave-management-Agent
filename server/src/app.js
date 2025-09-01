import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler, notFound } from './middleware/error.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import routes from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API rate limiting
app.use('/api', apiRateLimit);

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Leave Management API',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Leave Management API',
    version: '1.0.0',
    docs: `${env.APP_BASE_URL}/docs`,
    health: `${env.APP_BASE_URL}/api/health`
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;