// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., http://localhost:5080 or https://<api>.azurewebsites.net
  withCredentials: true                  // send/receive HTTP-only auth cookie
});

export default api;
