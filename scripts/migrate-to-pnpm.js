#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const backupPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json.backup'), 'utf8'));

// Categorize dependencies
const clientDeps = new Set([
  // React ecosystem
  'react', 'react-dom', 'react-router-dom', 'wouter',
  '@tanstack/react-query', '@tanstack/react-query-devtools', '@tanstack/react-virtual',
  
  // UI libraries
  '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card', '@radix-ui/react-label', '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-progress',
  '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-select',
  '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot',
  '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast',
  '@radix-ui/react-toggle', '@radix-ui/react-toggle-group', '@radix-ui/react-tooltip',
  
  // Tiptap editor
  '@tiptap/extension-bold', '@tiptap/extension-code-block-lowlight', '@tiptap/extension-color',
  '@tiptap/extension-font-family', '@tiptap/extension-heading', '@tiptap/extension-image',
  '@tiptap/extension-italic', '@tiptap/extension-link', '@tiptap/extension-mention',
  '@tiptap/extension-paragraph', '@tiptap/extension-placeholder', '@tiptap/extension-text-align',
  '@tiptap/extension-text-style', '@tiptap/extension-underline', '@tiptap/pm',
  '@tiptap/react', '@tiptap/starter-kit', '@tiptap/suggestion',
  
  // Other UI deps
  'framer-motion', 'gsap', 'lottie-react', '@lottiefiles/dotlottie-react',
  'lucide-react', 'react-icons', 'sonner', 'cmdk', 'vaul',
  'embla-carousel-react', 'recharts', 'react-circular-progressbar',
  'react-colorful', 'react-day-picker', 'react-dropzone', 'react-helmet',
  'react-hook-form', '@hookform/resolvers', 'react-lottie-player',
  'react-resizable-panels', 'react-window', 'react-error-boundary',
  
  // Client utilities
  'axios', 'marked', 'dompurify', 'slugify', 'clsx', 'tailwind-merge',
  'tailwindcss-animate', 'tw-animate-css', 'class-variance-authority',
  'input-otp', 'canvas-confetti', 'blueimp-md5', 'immer', 'zustand',
  'lowlight', 'next-themes',
  
  // Payment
  '@stripe/react-stripe-js', '@stripe/stripe-js',
  
  // Monaco editor
  '@monaco-editor/react'
]);

const serverDeps = new Set([
  // Express & middleware
  'express', 'cors', 'helmet', 'express-rate-limit', 'express-session',
  'connect-pg-simple', 'memorystore', 'rate-limit-redis',
  
  // Auth
  'passport', 'passport-local', 'bcrypt', 'bcryptjs', 'jsonwebtoken',
  
  // Database
  'drizzle-orm', '@neondatabase/serverless', 'ioredis',
  
  // Server utilities
  'multer', 'node-cache', 'node-cron', 'ws', 'crypto-js', 'js-sha256',
  'elliptic', 'csv-parser', 'twitter-api-v2', 'tronweb', 'stripe',
  'tsconfig-paths'
]);

const sharedDeps = new Set([
  'zod', 'zod-validation-error', 'date-fns', 'uuid', '@paralleldrive/cuid2'
]);

const clientDevDeps = new Set([
  '@vitejs/plugin-react', 'vite', 'vitest', '@vitest/ui',
  '@tailwindcss/container-queries', '@tailwindcss/typography',
  'tailwindcss', 'autoprefixer', 'postcss',
  '@testing-library/react', '@testing-library/jest-dom',
  'jsdom', '@playwright/test', 'eslint-plugin-react-hooks',
  '@replit/vite-plugin-cartographer', '@replit/vite-plugin-runtime-error-modal',
  '@types/react', '@types/react-dom', '@types/react-helmet',
  '@types/react-window', '@types/react-dropzone',
  '@types/dompurify', '@types/canvas-confetti', '@types/blueimp-md5'
]);

const serverDevDeps = new Set([
  '@types/express', '@types/cors', '@types/bcrypt', '@types/bcryptjs',
  '@types/connect-pg-simple', '@types/express-session', '@types/passport',
  '@types/passport-local', '@types/ws', '@types/node-cron',
  '@types/jsonwebtoken', '@types/elliptic', '@types/uuid',
  'eslint-plugin-degen'
]);

// Categorize all dependencies
const categorized = {
  client: { dependencies: {}, devDependencies: {} },
  server: { dependencies: {}, devDependencies: {} },
  shared: { dependencies: {}, devDependencies: {} },
  root: { devDependencies: {} }
};

// Process production dependencies
Object.entries(backupPkg.dependencies || {}).forEach(([name, version]) => {
  if (clientDeps.has(name)) {
    categorized.client.dependencies[name] = version;
  } else if (serverDeps.has(name)) {
    categorized.server.dependencies[name] = version;
  } else if (sharedDeps.has(name)) {
    categorized.shared.dependencies[name] = version;
  } else {
    // Default to shared if not categorized
    console.log(`Uncategorized dependency: ${name} - adding to shared`);
    categorized.shared.dependencies[name] = version;
  }
});

// Process dev dependencies
Object.entries(backupPkg.devDependencies || {}).forEach(([name, version]) => {
  if (clientDevDeps.has(name)) {
    categorized.client.devDependencies[name] = version;
  } else if (serverDevDeps.has(name)) {
    categorized.server.devDependencies[name] = version;
  } else {
    // Root-level dev dependencies
    categorized.root.devDependencies[name] = version;
  }
});

// Write categorized dependencies to a file for review
fs.writeFileSync(
  path.join(rootDir, 'dependency-migration-plan.json'),
  JSON.stringify(categorized, null, 2)
);

console.log('✅ Dependency categorization complete!');
console.log('📄 Review dependency-migration-plan.json');
console.log(`
Summary:
- Client deps: ${Object.keys(categorized.client.dependencies).length}
- Server deps: ${Object.keys(categorized.server.dependencies).length}
- Shared deps: ${Object.keys(categorized.shared.dependencies).length}
- Client dev deps: ${Object.keys(categorized.client.devDependencies).length}
- Server dev deps: ${Object.keys(categorized.server.devDependencies).length}
- Root dev deps: ${Object.keys(categorized.root.devDependencies).length}
`);

// Optional: Auto-update package.json files
if (process.argv.includes('--apply')) {
  console.log('Applying categorized dependencies to package.json files...');
  
  // Update client/package.json
  const clientPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'client/package.json'), 'utf8'));
  Object.assign(clientPkg.dependencies, categorized.client.dependencies);
  Object.assign(clientPkg.devDependencies, categorized.client.devDependencies);
  fs.writeFileSync(
    path.join(rootDir, 'client/package.json'),
    JSON.stringify(clientPkg, null, 2) + '\n'
  );
  
  // Update server/package.json
  const serverPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'server/package.json'), 'utf8'));
  Object.assign(serverPkg.dependencies, categorized.server.dependencies);
  Object.assign(serverPkg.devDependencies, categorized.server.devDependencies);
  fs.writeFileSync(
    path.join(rootDir, 'server/package.json'),
    JSON.stringify(serverPkg, null, 2) + '\n'
  );
  
  // Update shared/package.json
  const sharedPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'shared/package.json'), 'utf8'));
  Object.assign(sharedPkg.dependencies, categorized.shared.dependencies);
  fs.writeFileSync(
    path.join(rootDir, 'shared/package.json'),
    JSON.stringify(sharedPkg, null, 2) + '\n'
  );
  
  console.log('✅ Package.json files updated!');
}