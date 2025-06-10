/**
 * @file config/vite.config.ts
 * @description Vite configuration file for the Degentalk™ frontend application.
 * @purpose Configures the development server, build process, and module resolution for the client-side application.
 * @dependencies
 * - vite: Core build tool.
 * - @vitejs/plugin-react: Vite plugin for React support.
 * - path: Node.js path module for resolving file paths.
 * - url: Node.js URL module for handling file URLs.
 * - @replit/vite-plugin-runtime-error-modal: Plugin for displaying runtime error overlays.
 * - @replit/vite-plugin-cartographer: (Conditional) Plugin for Replit-specific development tooling.
 * - vite-tsconfig-paths: Plugin for resolving paths in tsconfig.json.
 * @environment Frontend build and development environment.
 * @important_notes
 * - Defines path aliases (`@`, `@shared`, `@assets`) for easier module imports.
 * - Configures the development server proxy to forward API requests to the backend.
 * - Specifies the build output directory and PostCSS configuration.
 * @status Stable.
 * @last_reviewed 2025-06-01
 * @owner Cline
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
<<<<<<< HEAD
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// Get the directory name from the URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This is /Users/gnarcotic/Degentalk/ForumFusion/config
const projectRoot = path.resolve(__dirname, '..'); // This will be /Users/gnarcotic/Degentalk/ForumFusion

export default defineConfig({
	plugins: [
		react(),
		runtimeErrorOverlay(),
		...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined
			? [await import('@replit/vite-plugin-cartographer').then((m) => m.cartographer())]
			: [])
	],
	resolve: {
		alias: {
			'@': path.resolve(projectRoot, 'client', 'src'),
			'@shared': path.resolve(projectRoot, 'shared'),
			'@assets': path.resolve(projectRoot, 'attached_assets')
		}
	},
	root: path.resolve(projectRoot, 'client'),
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:5001',
				changeOrigin: true,
				secure: false
			}
		}
	},
	build: {
		outDir: path.resolve(projectRoot, 'dist/public'),
		emptyOutDir: true
	},
	css: {
		postcss: path.resolve(projectRoot, 'config/postcss.config.js')
	}
=======
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tsconfigPaths from 'vite-tsconfig-paths';

// Get the directory name from the URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This is /Users/gnarcotic/Degentalk™/ForumFusion/config
const projectRoot = path.resolve(__dirname, ".."); // This will be /Users/gnarcotic/Degentalk™/ForumFusion

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tsconfigPaths(), // This plugin reads paths from tsconfig.json automatically
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  // Removed manual resolve.alias - using tsconfigPaths() plugin instead
  root: path.resolve(projectRoot, "client"),
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: path.resolve(projectRoot, "dist/public"),
    emptyOutDir: true,
  },
  css: {
    postcss: path.resolve(projectRoot, 'config/postcss.config.js')
  }
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
});
