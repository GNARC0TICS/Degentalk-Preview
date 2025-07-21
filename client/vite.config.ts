import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export default defineConfig(async () => {
	try {
		const plugins = [react(), runtimeErrorOverlay()];

		if (process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined) {
			try {
				const { cartographer } = await import('@replit/vite-plugin-cartographer');
				plugins.push(cartographer());
			} catch (e) {
				// Failed to load cartographer plugin (production build)
			}
		}

		return {
			base: '/',
			plugins,
			define: {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
			},
			resolve: {
				alias: [
					{ find: '@', replacement: path.resolve(projectRoot, 'client/src') },
					{ find: '@shared/types/ids', replacement: path.resolve(projectRoot, 'shared/types/ids.ts') },
					{ find: '@shared/types/index', replacement: path.resolve(projectRoot, 'shared/types/index.ts') },
					{ find: '@shared/types/entities', replacement: path.resolve(projectRoot, 'shared/types/entities/index.ts') },
					{ find: '@shared/config/zoneThemes.config', replacement: path.resolve(projectRoot, 'shared/config/zoneThemes.config.ts') },
					{ find: '@shared/utils/id', replacement: path.resolve(projectRoot, 'shared/utils/id.ts') },
					{ find: '@shared', replacement: path.resolve(projectRoot, 'shared') },
					{ find: '@assets', replacement: path.resolve(projectRoot, 'attached_assets') },
					{ find: '@db', replacement: path.resolve(projectRoot, 'db/index.ts') },
					{ find: '@db_types', replacement: path.resolve(projectRoot, 'db/types') },
					{ find: '@schema', replacement: path.resolve(projectRoot, 'db/schema/index.ts') },
					{ find: /^@schema\/(.*)/, replacement: path.resolve(projectRoot, 'db/schema/$1') }
				],
				 dedupe: ['react', 'react-dom']
			},
			optimizeDeps: {
				exclude: ['@lottiefiles/dotlottie-react'],
				include: ['react-lottie-player']
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
			css: {
				// PostCSS config will be loaded from postcss.config.js
			},
			build: {
				// Disable some optimizations that might cause issues
				minify: false,
				target: 'esnext',
				sourcemap: false,
				rollupOptions: {
					output: {
						manualChunks: undefined
					},
					treeshake: false
				}
			}
		};
	} catch (err) {
		console.error('Vite config error:', err);
		throw err;
	}
});
