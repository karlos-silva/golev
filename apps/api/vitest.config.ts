import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    // Testes de integração (DB real) rodam só via vitest.integration.config.ts.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.integration.test.ts',
      '**/*.integration.spec.ts',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
