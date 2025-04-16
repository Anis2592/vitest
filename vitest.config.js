import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
   // setupFiles: ['./tests/setup.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    // Add globals if needed
    globals: true
  },
});