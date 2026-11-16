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
    coverage: {
      // Run with `npm run test:coverage`. SonarQube reads the lcov report (see sonar-project.properties).
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/main.jsx'],
    },
  },
})
