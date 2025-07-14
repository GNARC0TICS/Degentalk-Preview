#!/usr/bin/env tsx
/**
 * Set Mission Sort Order
 * 
 * Update sort order for missions to control display order
 * Usage: pnpm tsx scripts/missions/set-sort-order.ts
 */

import { db } from '../db';
import { missions } from '../db/schema';
import { logger } from '../server/src/core/logger';
import { eq, sql } from 'drizzle-orm';

// Define sort order by mission title or type
const SORT_ORDER_CONFIG = [
	// Daily missions (0-99)
	{ title: 'Daily Contributor', sortOrder: 10 },
	{ title: 'Engagement Boost', sortOrder: 20 },
	{ title: 'Quality Content', sortOrder: 30 },
	{ title: 'Generous Tipper', sortOrder: 40 },
	{ title: 'Problem Solver', sortOrder: 50 },
	
	// Weekly missions (100-199)
	{ title: 'Thread Master', sortOrder: 110 },
	{ title: 'Reputation Builder', sortOrder: 120 },
	{ title: 'Forum Explorer', sortOrder: 130 },
	
	// Milestone missions (200-299)
	{ title: 'First Steps', sortOrder: 210 },
	{ title: 'Double Digits', sortOrder: 220 },
	{ title: 'DGT Whale', sortOrder: 230 },
	
	// Stacking missions (300-399)
	{ title: 'Posting Streak', sortOrder: 310 },
	{ title: 'Community Builder', sortOrder: 320 }
];

async function setSortOrder() {
	logger.info('Starting mission sort order update');

	try {
		const results = {
			updated: 0,
			notFound: 0,
			errors: 0
		};

		for (const config of SORT_ORDER_CONFIG) {
			try {
				const result = await db
					.update(missions)
					.set({ 
						sortOrder: config.sortOrder,
						updatedAt: new Date()
					})
					.where(eq(missions.title, config.title));

				if (result.rowCount && result.rowCount > 0) {
					logger.info({ 
						title: config.title, 
						sortOrder: config.sortOrder 
					}, 'Mission sort order updated');
					results.updated++;
				} else {
					logger.warn({ title: config.title }, 'Mission not found');
					results.notFound++;
				}
			} catch (error) {
				logger.error({ error, config }, 'Failed to update mission sort order');
				results.errors++;
			}
		}

		// Set default sort order for any missions not in config
		const defaultResult = await db
			.execute(sql`
				UPDATE missions 
				SET sort_order = 999 
				WHERE sort_order = 0 OR sort_order IS NULL
			`);

		logger.info({
			...results,
			defaulted: defaultResult.rowCount
		}, 'Mission sort order update completed');
		
		process.exit(0);
	} catch (error) {
		logger.error({ error }, 'Mission sort order update failed');
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	setSortOrder();
}

export { setSortOrder };