// src/api.js
//
// This module creates and exports a preconfigured Axios instance for the frontend.
// It is used for ALL communication between the React app and the backend API.
//
// Why this matters in Sprint 4:
// ------------------------------------------
// The frontend is deployed to Azure Static Web Apps (SWA).
// The backend is deployed to Azure App Service.
// In production, the frontend MUST know the correct backend URL.
//
// We do NOT hard-code the backend URL in the source code.
// Instead, we set it at build time using an environment variable:
//
//     VITE_BACKEND_API_URL
//
// During local development:
//     VITE_BACKEND_API_URL = http://localhost:5175
//
// During GitHub Actions CI/CD:
//     VITE_BACKEND_API_URL is injected through a GitHub secret

import axios from 'axios';

// Log the API base URL so we can confirm the value during local dev
// AND after production deployments. If this prints "undefined", then
// the GitHub Actions workflow did NOT inject the secret correctly.
console.log("Frontend API Base URL:", import.meta.env.VITE_BACKEND_API_URL);

// Create an Axios instance with common configuration for all requests.
const api = axios.create({
  // Base URL for all API calls (e.g. /auth/login, /temperature/query, etc.)
  // This is built from the environment variable above.
  baseURL: import.meta.env.VITE_BACKEND_API_URL,

  // Required so cookies (sessions/JWT cookies) are included with requests.
  // Without this, login would not persist.
  withCredentials: true,
});

// Export the configured Axios client.
// Import this in your pages or components:
//     import api from "../api";
//     api.post("/auth/login", { ... })
export default api;
