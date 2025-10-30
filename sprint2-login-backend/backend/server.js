/**
 * server.js
 *
 * Main entry point for the backend. Sets up the Express server,
 * establishes a connection to the database, and configures routes
 * and middleware for production deployment.
 *
 * IMPORTANT:
 * - Frontend calls use cookie-based auth and hit /auth/* endpoints.
 * - Ensure FRONTEND_URL and JWT_SECRET are set in .env.
 */

import 'dotenv/config'; // loads .env early
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js'; // Authentication routes (expects /auth/*)

// Log key env for quick sanity check (safe to show)
console.log('Configured FRONTEND_URL =', process.env.FRONTEND_URL);
console.log('NODE_ENV =', process.env.NODE_ENV);

const app = express();

// Resolve port with a safe default for local dev
const BACKEND_PORT = Number(process.env.BACKEND_PORT) || 5175;

// In production behind a proxy (Azure App Service, nginx, etc.),
// let Express trust the X-Forwarded-* headers so secure cookies behave correctly.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/**
 * CORS
 * Allow the Vite dev server (or your deployed frontend) to send cookies.
 * - origin: FRONTEND_URL (e.g., http://localhost:5173)
 * - credentials: true to allow cookie-based auth
 *
 * NOTE: Place CORS before your routes.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

/**
 * Core middleware
 * - JSON body parser for application/json
 * - cookieParser so we can read req.cookies.token in auth flows
 */
app.use(express.json());
app.use(cookieParser());

// Simple request logger: handy during setup/debug
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — Origin: ${req.headers.origin || 'n/a'}`);
  next();
});

/**
 * Health route (optional)
 * Quick way to confirm the server is alive without hitting /auth.
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

/**
 * Route setup
 * Mount auth routes at /auth so the frontend can call:
 *   - POST   /auth/register
 *   - POST   /auth/login
 *   - GET    /auth/test
 *   - POST   /auth/logout
 */
app.use('/auth', authRoutes);

/**
 * 404 handler for unmapped routes
 * Keep after your route mounts.
 */
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

/**
 * Basic error handler
 * Catches unexpected errors and returns a consistent JSON shape.
 */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(BACKEND_PORT, () => {
  console.log(`Server is running on ${BACKEND_PORT}`);
});
