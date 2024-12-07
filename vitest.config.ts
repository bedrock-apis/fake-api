import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['html'],
      include: ['./scripts/src/**/*.ts'],
      exclude: [
        'scripts/src/lib/assets/**',
        'scripts/src/lib/bds/**',
        'scripts/src/test/**',
        '**/node_modules/**',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
