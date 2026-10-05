import path from 'node:path';
import { existsSync } from 'node:fs';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config, rootDir } from './config.js';
import { requireAuth, requirePackage, requireRole } from './middleware/auth.js';
import { errorHandler } from './middleware/http.js';
import sessionRoutes from './routes/session.js';
import memberRoutes from './routes/members.js';
import deskRoutes from './routes/desk.js';
import insightRoutes from './routes/insights.js';
import coachRoutes from './routes/coach.js';
import portalRoutes from './routes/portal.js';
import addonRoutes, { payRouter } from './routes/addons.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.isProd) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          // Only force https where the site is actually served over https.
          upgradeInsecureRequests: config.isProd ? [] : null,
        },
      },
    }),
  );

  const api = express.Router();
  api.use(rateLimit({ windowMs: 5 * 60 * 1000, limit: 900, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests. Please slow down.', code: 'rate_limited' } }));
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
  api.use(sessionRoutes);

  // Everything below needs a signed-in user; each router adds its own role checks.
  api.use('/coach', requireAuth, requirePackage('performance'), coachRoutes);
  api.use('/portal', requireAuth, requirePackage('performance'), requireRole('member'), portalRoutes);
  api.use('/addons', requireAuth, requirePackage('growth'), addonRoutes);
  api.use(requireAuth, requirePackage('growth'), memberRoutes, deskRoutes, insightRoutes);
  api.use((_req, res) => res.status(404).json({ error: 'Not found.', code: 'not_found' }));

  app.use('/api', api);

  // In production the same server also serves the built site, so there is one deployment.
  const dist = path.join(rootDir, 'dist');
  if (existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist, { index: false, maxAge: config.isProd ? '1h' : 0 }));
    app.use((req, res, next) => (req.method === 'GET' || req.method === 'HEAD' ? res.sendFile(path.join(dist, 'index.html')) : next()));
  }

  app.use(errorHandler);
  return app;
}
