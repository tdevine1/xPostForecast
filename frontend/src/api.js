/**
 * api.js
 *
 * One preconfigured axios instance for ALL calls from the frontend to our
 * backend. Every page imports this instead of configuring axios itself, so the
 * base URL and cookie setting live in exactly one place.
 *
 * Usage:
 *   import api from '../api';
 *   const { data } = await api.get('/temperature/2020-07-01');
 *   await api.post('/auth/login', { username, password });
 */

import axios from 'axios';

const api = axios.create({
  // Backend base URL from frontend/.env (Sprint 4: set at build time by GitHub Actions)
  baseURL: import.meta.env.VITE_BACKEND_API_URL,

  // Send and accept the HTTP-only auth cookie on every request
  withCredentials: true,
});

export default api;
