// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __PORTAL__: JSON.stringify('dev'),
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/**/*.test.js'],
  },
});
