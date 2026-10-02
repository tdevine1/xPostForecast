/**
 * server.js
 *
 * Entry point: loads configuration, checks it, and starts the HTTP server.
 * The app itself (middleware and routes) is built in app.js.
 */
import './config/env.js'; // must be first: loads .env before other modules read process.env
import app from './app.js';

// Fail fast with a clear message instead of failing later in a confusing way
const required = ['FRONTEND_URL', 'JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Locally: copy .env.example to .env and fill it in. On Azure: add them under App Service > Environment variables.');
  process.exit(1);
}

// Locally PORT is unset or 5175. Azure App Service sets PORT for us.
const PORT = Number(process.env.PORT) || 5175;

console.log('Configured FRONTEND_URL =', process.env.FRONTEND_URL);
console.log('NODE_ENV =', process.env.NODE_ENV);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
