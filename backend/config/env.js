/**
 * config/env.js
 *
 * Loads backend/.env into process.env for LOCAL development, using Node's
 * built-in loader (no dotenv package needed). Import this file first.
 *
 * On Azure App Service there is no .env file: values come from the App
 * Service "Environment variables" settings instead, so a missing file is fine.
 */
try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch (err) {
  if (err.code !== 'ENOENT') throw err; // a malformed .env should still fail loudly
}
