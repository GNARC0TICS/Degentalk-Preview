console.log(
	'🚨 VITE CONFIG LOADED - If you see this during backend startup, you have a ghost import!'
);

// ESM-safe safeguard against backend imports
if (typeof process !== 'undefined' && process?.env?.VITE_CONFIG_CONTEXT === 'backend') {
	throw new Error('Vite config was imported in backend context.');
}

/**
 * @file config/vite.config.ts
 * @description Vite configuration file for the Degentalk frontend application.
 * @purpose Configures the development server, build process, and module resolution for the client-side application.
 * @dependencies
 * - vite: Core build tool.
 * - @vitejs/plugin-react: Vite plugin for React support.
 * - path: Node.js path module for resolving file paths.
 * - url: Node.js URL module for handling file URLs.
 * - @replit/vite-plugin-runtime-error-modal: Plugin for displaying runtime error overlays.
 * - @replit/vite-plugin-cartographer: (Conditional) Plugin for Replit-specific development tooling.
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
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
// import tsconfigPaths from 'vite-tsconfig-paths'; // Temporarily remove this plugin

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export default defineConfig(async () => {
	const plugins = [react(), runtimeErrorOverlay()]; // New line without tsconfigPaths

	if (process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined) {
		try {
			const { cartographer } = await import('@replit/vite-plugin-cartographer');
			plugins.push(cartographer());
		} catch (e) {
			console.warn('Failed to load cartographer plugin:', e);
		}
	}

	return {
		plugins,
		resolve: {
			alias: [
				{ find: '@', replacement: path.resolve(projectRoot, 'client/src') },
				{ find: '@shared', replacement: path.resolve(projectRoot, 'shared') },
				{ find: '@assets', replacement: path.resolve(projectRoot, 'attached_assets') },
				{ find: '@db', replacement: path.resolve(projectRoot, 'db/index.ts') },
				{ find: '@db_types', replacement: path.resolve(projectRoot, 'db/types') },
				{ find: '@schema', replacement: path.resolve(projectRoot, 'db/schema/index.ts') },
				{ find: /^@schema\/(.*)/, replacement: path.resolve(projectRoot, 'db/schema/$1') }
			]
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
	};
});
