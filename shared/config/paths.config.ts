/**
 * Shared path configuration for both frontend and backend
 * This file can be safely imported by both sides without Vite dependencies
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory and resolve to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Path aliases that work in both frontend and backend contexts
 */
export const paths = {
	// Project structure
	root: projectRoot,
	client: path.resolve(projectRoot, 'client'),
	server: path.resolve(projectRoot, 'server'),
	shared: path.resolve(projectRoot, 'shared'),
	db: path.resolve(projectRoot, 'db'),

	// Specific files
	dbIndex: path.resolve(projectRoot, 'db/index.ts'),
	schemaIndex: path.resolve(projectRoot, 'db/schema/index.ts'),

	// Client specific
	clientSrc: path.resolve(projectRoot, 'client/src'),
	clientAssets: path.resolve(projectRoot, 'attached_assets'),

	// Server specific
	serverUtils: path.resolve(projectRoot, 'server/utils'),
	serverServices: path.resolve(projectRoot, 'server/services')
};

/**
 * Path mapping compatible with TypeScript path mapping
 */
export const pathMapping = {
	'@/*': [path.relative(projectRoot, paths.clientSrc) + '/*'],
	'@shared/*': [path.relative(projectRoot, paths.shared) + '/*'],
	'@server/*': [path.relative(projectRoot, paths.server) + '/*'],
	'@db': [path.relative(projectRoot, paths.dbIndex)],
	'@schema': [path.relative(projectRoot, paths.schemaIndex)],
	'@schema/*': [path.relative(projectRoot, path.resolve(projectRoot, 'db/schema')) + '/*']
};

export default paths;
