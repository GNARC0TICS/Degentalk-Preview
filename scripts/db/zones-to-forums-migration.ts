#!/usr/bin/env node
/**
 * Migration: Convert zones to forums and remove zone type entirely
 * 
 * This script:
 * 1. Converts all existing 'zone' types to 'forum' 
 * 2. Updates hierarchy to allow top-level forums
 * 3. Removes zone-specific logic from pluginData
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import { forumStructure } from '@db/schema';
import { logger } from '@core/logger';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function convertZonesToForums() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL
	});

	const db = drizzle(pool);

	try {
		logger.info('Starting zones → forums conversion...');

		// Get all zones
		const zones = await db
			.select()
			.from(forumStructure)
			.where(eq(forumStructure.type, 'zone'));

		logger.info(`Found ${zones.length} zones to convert to forums`);

		for (const zone of zones) {
			// Update zone to forum
			await db
				.update(forumStructure)
				.set({ 
					type: 'forum',
					// Keep the zone as top-level by ensuring parentId is null
					parentId: null,
					// Update pluginData to mark as featured forum if it was a primary zone
					pluginData: {
						...(zone.pluginData as any || {}),
						isFeaturedForum: (zone.pluginData as any)?.configZoneType === 'primary',
						// Remove zone-specific data
						configZoneType: undefined,
						isZone: undefined
					},
					updatedAt: new Date()
				})
				.where(eq(forumStructure.id, zone.id));

			logger.info(`Converted zone "${zone.name}" to top-level forum`);
		}

		// Verify conversion
		const remainingZones = await db
			.select()
			.from(forumStructure)
			.where(eq(forumStructure.type, 'zone'));

		if (remainingZones.length === 0) {
			logger.info('✅ All zones successfully converted to forums');
			
			// Log summary
			const topLevelForums = await db
				.select()
				.from(forumStructure)
				.where(eq(forumStructure.parentId, null));
				
			logger.info(`Total top-level forums: ${topLevelForums.length}`);
		} else {
			throw new Error(`${remainingZones.length} zones still exist after conversion`);
		}

	} catch (error) {
		logger.error('Failed to convert zones:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run the migration
convertZonesToForums().catch(error => {
	logger.error('Migration failed:', error);
	process.exit(1);
});