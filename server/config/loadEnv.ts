import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from "../src/core/logger";

// ESM equivalent for __dirname
// __filename will be /Users/gnarcotic/Degentalk/server/config/loadEnv.ts (or similar based on execution)
// __dirname will be /Users/gnarcotic/Degentalk/server/config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to env.local in the project root
// We are in server/config, so we need to go up two levels to the project root.
const projectRoot = path.resolve(__dirname, '..', '..');
const envLocalPath = path.resolve(projectRoot, 'env.local');
const dotEnvPath = path.resolve(projectRoot, '.env');

logger.info('LOAD_ENV', 'Script executing. Attempting to load env files from project root', { projectRoot });

// Load env.local first
logger.info('LOAD_ENV', 'Attempting to load env file', { envLocalPath });
const envLocalResult = dotenv.config({ path: envLocalPath });

if (envLocalResult.error) {
	logger.error('LOAD_ENV', 'Error loading env.local', { envLocalPath, error: envLocalResult.error });
} else {
	if (envLocalResult.parsed) {
		logger.info('LOAD_ENV', 'Successfully parsed env.local', { envLocalPath, keys: Object.keys(envLocalResult.parsed) });
	} else {
		logger.info('LOAD_ENV', 'Parsed env.local but it was empty', { envLocalPath });
	}
}

// Then load .env for defaults (dotenv doesn't override by default)
logger.info('LOAD_ENV', 'Attempting to load default .env file', { dotEnvPath });
const dotEnvResult = dotenv.config({ path: dotEnvPath }); // Explicitly path to .env in root

if (dotEnvResult.error) {
	// It's okay if .env doesn't exist, as env.local might be the primary
	if ((dotEnvResult.error as any).code !== 'ENOENT') {
		logger.error('LOAD_ENV', 'Error loading .env', { dotEnvPath, error: dotEnvResult.error });
	} else {
		logger.info('LOAD_ENV', '.env not found, which is acceptable', { dotEnvPath });
	}
} else {
	if (dotEnvResult.parsed) {
		logger.info('LOAD_ENV', 'Successfully parsed .env', { dotEnvPath, keys: Object.keys(dotEnvResult.parsed) });
	} else {
		logger.info('LOAD_ENV', 'Parsed .env but it was empty', { dotEnvPath });
	}
}

// Final check of the critical environment variables
logger.info('LOAD_ENV', 'DATABASE_URL after all attempts', { databaseUrl: process.env.DATABASE_URL });
logger.info('LOAD_ENV', 'DATABASE_PROVIDER after all attempts', { databaseProvider: process.env.DATABASE_PROVIDER });

if (!process.env.DATABASE_URL) {
	logger.error('[LOAD_ENV] CRITICAL: DATABASE_URL is still not set after loading attempts!');
}
