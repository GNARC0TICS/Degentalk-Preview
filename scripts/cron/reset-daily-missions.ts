#!/usr/bin/env tsx
/**
 * Daily Mission Reset Cron Job
 * 
 * Resets daily missions and assigns new ones to active users
 * Run daily at 00:00 UTC via cron:
 * 0 0 * * * cd /path/to/degentalk && pnpm tsx scripts/cron/reset-daily-missions.ts
 */

import { db } from '../../db';
import { users } from '../../db/schema';
import { missionService } from '../../server/src/domains/gamification/services/mission.service';
import { missionConfig } from '../../config/missions.config';
import { logger } from '../../server/src/core/logger';
import { gte, sql } from 'drizzle-orm';

async function resetDailyMissions() {
	const startTime = Date.now();
	logger.info('Starting daily mission reset');

	try {
		// Step 1: Reset all daily mission progress
		await missionService.resetDailyMissions();
		logger.info('Daily mission progress reset complete');

		// Step 2: Get active users (logged in within last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const activeUsers = await db
			.select({ id: users.id })
			.from(users)
			.where(gte(users.lastSeen, thirtyDaysAgo));

		logger.info({ userCount: activeUsers.length }, 'Found active users for mission assignment');

		// Step 3: Assign daily missions to each active user
		const assignmentResults = {
			success: 0,
			failed: 0,
			skipped: 0
		};

		// Process in batches to avoid overwhelming the database
		const BATCH_SIZE = 100;
		for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
			const batch = activeUsers.slice(i, i + BATCH_SIZE);
			
			const batchResults = await Promise.allSettled(
				batch.map(async (user) => {
					try {
						const assigned = await missionService.assignDailyMissions(
							user.id,
							missionConfig.daily.poolSize
						);
						
						if (assigned.length > 0) {
							return { userId: user.id, status: 'success', count: assigned.length };
						} else {
							return { userId: user.id, status: 'skipped', reason: 'No missions assigned' };
						}
					} catch (error) {
						logger.error({ error, userId: user.id }, 'Failed to assign daily missions');
						return { userId: user.id, status: 'failed', error };
					}
				})
			);

			// Count results
			batchResults.forEach(result => {
				if (result.status === 'fulfilled') {
					const value = result.value;
					if (value.status === 'success') {
						assignmentResults.success++;
					} else if (value.status === 'skipped') {
						assignmentResults.skipped++;
					}
				} else {
					assignmentResults.failed++;
				}
			});

			// Log batch progress
			logger.info({ 
				batch: Math.floor(i / BATCH_SIZE) + 1, 
				totalBatches: Math.ceil(activeUsers.length / BATCH_SIZE),
				processed: Math.min(i + BATCH_SIZE, activeUsers.length)
			}, 'Batch processed');
		}

		// Step 4: Log summary
		const duration = Date.now() - startTime;
		logger.info({
			duration,
			totalUsers: activeUsers.length,
			...assignmentResults
		}, 'Daily mission reset completed');

		// Step 5: Send monitoring metrics (if monitoring is set up)
		if (process.env.MONITORING_ENABLED === 'true') {
			// Send metrics to monitoring service
			// Example: statsd.gauge('missions.daily_reset.duration', duration);
			// Example: statsd.increment('missions.daily_reset.success', assignmentResults.success);
		}

		process.exit(0);
	} catch (error) {
		logger.error({ error }, 'Daily mission reset failed');
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	resetDailyMissions();
}

export { resetDailyMissions };