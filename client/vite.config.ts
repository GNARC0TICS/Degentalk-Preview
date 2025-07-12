import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  optimizeDeps: {
    exclude: [
      '@tiptap/core',
      '@tiptap/pm',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/suggestion',
      '@tiptap/extension-bold',
      '@tiptap/extension-code-block-lowlight',
      '@tiptap/extension-color',
      '@tiptap/extension-font-family',
      '@tiptap/extension-heading',
      '@tiptap/extension-image',
      '@tiptap/extension-italic',
      '@tiptap/extension-link',
      '@tiptap/extension-mention',
      '@tiptap/extension-paragraph',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-text-align',
      '@tiptap/extension-text-style',
      '@tiptap/extension-underline',
      '@monaco-editor/react',
      '@lottiefiles/dotlottie-react',
      'lottie-react',
      'canvas-confetti',
      'gsap',
    ],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
    ],
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
}); 