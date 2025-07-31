import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@shared', replacement: path.resolve(projectRoot, 'shared') }
    ],
    dedupe: ['react', 'react-dom']
  },
  root: path.resolve(projectRoot, 'client'),
  server: {
    host: true,
    port: 5173
  },
  build: {
    minify: false,
    target: 'es2015',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});