import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // Hosted PostgreSQL adds network round trips to each transaction scenario.
    testTimeout: 30000,
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
