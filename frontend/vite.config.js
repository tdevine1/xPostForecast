import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // the backend's FRONTEND_URL (added in Sprint 2) expects this port
  },
  test: {
    environment: 'jsdom', // simulated browser DOM for component tests
  },
})
