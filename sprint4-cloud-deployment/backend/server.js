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
import stacRoutes from './routes/stac.js'; // STAC routes, including temperature data

// Log key env for quick sanity check (safe to show)
console.log('Configured FRONTEND_URL =', process.env.FRONTEND_URL);
console.log('NODE_ENV =', process.env.NODE_ENV);

const app = express();

// Resolve port with a safe default for local dev
const PORT = Number(process.env.PORT) || 5175;

// In production behind a proxy (Azure App Service, nginx, etc.),
// let Express trust the X-Forwarded-* headers so secure cookies behave correctly.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/**
 * CORS
 * Allow the Vite dev server (local) and the deployed SWA frontend.
 * We log origins for debugging and use a whitelist.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,      // Deployed SWA URL in Azure
  'http://localhost:5173',       // Local dev frontend
];

app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS origin check:', origin);

    // Allow non-browser tools (like curl, Postman) with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Handle preflight requests for all routes
app.options('*', cors({
  origin: (origin, callback) => {
    console.log('CORS preflight origin check:', origin);

    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn('CORS preflight blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
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
app.use('/temperature', stacRoutes); // Routes for accessing temperature data

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
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
