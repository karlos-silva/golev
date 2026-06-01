import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts', 'src/**/*.integration.spec.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
