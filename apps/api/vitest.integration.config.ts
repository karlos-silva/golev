import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts', 'src/**/*.integration.spec.ts'],
    // Operações de DB real podem exceder o default de 5s (conexão/transação).
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
