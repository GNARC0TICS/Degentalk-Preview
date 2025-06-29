import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: path.resolve(__dirname, './src/test/setup.ts')
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@/*': path.resolve(__dirname, './src/*'),
			'@shared': path.resolve(__dirname, '../shared'),
			'@shared/*': path.resolve(__dirname, '../shared/*')
		}
	}
});
