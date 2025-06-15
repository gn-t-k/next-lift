import { defineConfig } from 'vitest/config';

export const common = defineConfig({
  test: {
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});
