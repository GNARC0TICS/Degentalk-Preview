#!/usr/bin/env tsx
/**
 * Deactivate All Missions
 * 
 * Utility to deactivate all missions (useful for maintenance)
 * Usage: pnpm tsx scripts/missions/deactivate-all.ts [--reactivate]
 */

import { db } from '@db';
import { missions } from '@schema';
import { logger } from '@core/logger';
import { sql } from 'drizzle-orm';

async function deactivateAllMissions(reactivate: boolean = false) {
	const action = reactivate ? 'reactivating' : 'deactivating';
	logger.info(`Starting mission ${action}`);

	try {
		const result = await db
			.update(missions)
			.set({ 
				isActive: reactivate,
				updatedAt: new Date()
			});

		const count = result.rowCount || 0;
		logger.info({ count, action }, `Missions ${action} completed`);
		
		process.exit(0);
	} catch (error) {
		logger.error({ error }, `Mission ${action} failed`);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	const reactivate = process.argv.includes('--reactivate');
	deactivateAllMissions(reactivate);
}

export { deactivateAllMissions };