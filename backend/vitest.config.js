import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      // Run with `npm run test:coverage`. SonarQube reads the lcov report (see sonar-project.properties).
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['**/*.js'],
      exclude: ['tests/**', 'server.js', 'vitest.config.js', 'coverage/**'],
    },
  },
})
