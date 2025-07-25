#!/usr/bin/env node
/**
 * Script to remove 'zone' type from forum_structure table
 * Updates all existing 'zone' types to 'category' and updates dependent code
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import { forumStructure } from '@db/schema';
import { logger } from '@core/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

async function updateZoneTypes() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL
	});

	const db = drizzle(pool);

	try {
		logger.info('Starting zone type removal...');

		// Count existing zones
		const zones = await db
			.select()
			.from(forumStructure)
			.where(eq(forumStructure.type, 'zone'));

		logger.info(`Found ${zones.length} zones to update`);

		if (zones.length > 0) {
			// Update all zones to category type
			const result = await db
				.update(forumStructure)
				.set({ 
					type: 'category',
					updatedAt: new Date()
				})
				.where(eq(forumStructure.type, 'zone'));

			logger.info('Successfully updated all zones to category type');

			// Log the updated structures
			zones.forEach(zone => {
				logger.info(`Updated: ${zone.name} (${zone.slug}) from 'zone' to 'category'`);
			});
		}

		// Verify no zones remain
		const remainingZones = await db
			.select()
			.from(forumStructure)
			.where(eq(forumStructure.type, 'zone'));

		if (remainingZones.length === 0) {
			logger.info('✅ Zone type removal complete - no zones remain');
		} else {
			logger.error(`❌ ${remainingZones.length} zones still exist after update`);
			process.exit(1);
		}

	} catch (error) {
		logger.error('Failed to update zone types:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run the script
updateZoneTypes().catch(error => {
	logger.error('Script failed:', error);
	process.exit(1);
});