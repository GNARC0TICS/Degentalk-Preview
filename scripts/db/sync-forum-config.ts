#!/usr/bin/env tsx
import 'dotenv/config';
import { forumStructureService } from '@server/src/domains/forum/services/structure.service';
import { logger } from '@server/src/core/logger';

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