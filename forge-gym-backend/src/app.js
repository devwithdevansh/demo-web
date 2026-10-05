import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config.js';
import { requireAuth, requirePackage, requireRole } from './middleware/auth.js';
import { errorHandler } from './middleware/http.js';
import sessionRoutes from './routes/session.js';
import memberRoutes from './routes/members.js';
import deskRoutes from './routes/desk.js';
import insightRoutes from './routes/insights.js';
import coachRoutes from './routes/coach.js';
import portalRoutes from './routes/portal.js';
import addonRoutes, { payRouter } from './routes/addons.js';
import webhookRoutes from './routes/webhooks.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.isProd) app.set('trust proxy', 1);

  app.use(helmet());

  const api = express.Router();
  // The site is hosted separately, so only the configured site addresses may call the API from a browser.
  api.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && config.corsOrigins.includes(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        Vary: 'Origin',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE',
        'Access-Control-Max-Age': '600',
      });
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  api.use(rateLimit({ windowMs: 5 * 60 * 1000, limit: 900, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests. Please slow down.', code: 'rate_limited' } }));
  // Webhooks get their own parser: the raw body is kept so signatures can be checked against exactly
  // what was sent, and the limit is higher because a chat-history sync arrives in large batches.
  api.use('/webhooks', express.json({ limit: '5mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
  api.use(express.json({ limit: '50kb' }));
  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  api.get('/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' }));
  api.use((_req, res, next) => {
    if (mongoose.connection.readyState === 1) return next();
    res.status(503).json({ error: 'The service is temporarily unavailable. Please try again shortly.', code: 'unavailable' });
  });

  // Public and session endpoints
  api.use('/public/pay', payRouter);
  api.use('/webhooks', webhookRoutes);
  api.use('/admin', adminRoutes);
  api.use(sessionRoutes);

  // Everything below needs a signed-in user; each router adds its own role checks.
  api.use('/coach', requireAuth, requirePackage('performance'), coachRoutes);
  api.use('/portal', requireAuth, requirePackage('performance'), requireRole('member'), portalRoutes);
  api.use('/addons', requireAuth, requirePackage('growth'), addonRoutes);
  api.use(requireAuth, requirePackage('growth'), memberRoutes, deskRoutes, insightRoutes);
  api.use((_req, res) => res.status(404).json({ error: 'Not found.', code: 'not_found' }));

  app.use('/api', api);

  // This service is the API only. The site lives in ../forge-gym and is hosted on its own.
  app.get('/', (_req, res) => res.json({ service: 'FORGE API', health: '/api/health' }));
  app.use((_req, res) => res.status(404).json({ error: 'Not found.', code: 'not_found' }));

  app.use(errorHandler);
  return app;
}
