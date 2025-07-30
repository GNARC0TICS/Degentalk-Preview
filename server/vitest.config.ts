import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@domains': path.resolve(__dirname, './src/domains'),
      '@middleware': path.resolve(__dirname, './src/middleware'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@db': path.resolve(__dirname, '../db'),
      '@schema': path.resolve(__dirname, '../db/schema'),
    },
  },
});