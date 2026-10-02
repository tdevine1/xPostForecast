/**
 * app.js
 *
 * Builds the Express app: middleware first, then routes, then the 404 and
 * error handlers. It does NOT start listening. server.js does that, and the
 * tests import this app directly so they can send requests without a server.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();

// Behind Azure App Service's proxy, trust X-Forwarded-* headers so Express
// knows the original request was HTTPS (needed for Secure cookies) and sees
// the real client IP (needed for rate limiting).
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS: allow ONLY our frontend's origin, and allow it to send cookies.
// Must come before the routes.
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());   // parse JSON request bodies into req.body
app.use(cookieParser());   // parse cookies into req.cookies

// Simple request logger, handy during setup and in the Azure log stream
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — Origin: ${req.headers.origin || 'n/a'}`);
    next();
  });
}

// Health check: confirms the server is up without touching the database
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.use('/auth', authRoutes);

// 404 for any route not matched above
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Error handler: Express sends errors here (it is recognized by its 4 arguments)
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
