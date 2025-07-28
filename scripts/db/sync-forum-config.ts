#!/usr/bin/env tsx
import 'dotenv/config';
import { forumStructureService } from '../../server/src/domains/forum/services/structure.service.js';

// Simple console logger for scripts
const logger = {
	info: (...args: any[]) => console.log('[INFO]', ...args),
	error: (...args: any[]) => console.error('[ERROR]', ...args)
};

async function runSync() {
	const isDryRun = process.argv.includes('--dry-run');
	logger.info(`Starting forum sync process... (Dry Run: ${isDryRun})`);

	try {
		const result = await forumStructureService.syncFromConfig(isDryRun);
		logger.info('Sync process completed successfully.', result);
		process.exit(0);
	} catch (error) {
		logger.error('Failed to sync forum configuration.', { error });
		process.exit(1);
	}
}

runSync(); 