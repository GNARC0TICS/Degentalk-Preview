#!/usr/bin/env node
/**
 * Migration: Convert zones to forums with featured flag
 * 
 * - Primary zones → Featured forums (isFeatured: true)
 * - Regular zones → Top-level forums (isFeatured: false)
 * - Remove 'zone' type entirely
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import { forumStructure } from '@db/schema';
import { logger } from '@core/logger';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function migrateZonesToFeaturedForums() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL
	});

	const db = drizzle(pool);

	try {
		logger.info('Starting zones → featured forums migration...');

		// Get all zones
		const zones = await db
			.select()
			.from(forumStructure)
			.where(eq(forumStructure.type, 'zone'));

		logger.info(`Found ${zones.length} zones to migrate`);

		let featuredCount = 0;
		let regularCount = 0;

		for (const zone of zones) {
			const isPrimaryZone = (zone.pluginData as any)?.configZoneType === 'primary';
			
			// Update zone to forum with featured flag
			await db
				.update(forumStructure)
				.set({ 
					type: 'forum',
					// Ensure it remains top-level
					parentId: null,
					parentForumSlug: null,
					// Update pluginData with featured flag
					pluginData: {
						...(zone.pluginData as any || {}),
						// Primary zones become featured forums
						isFeatured: isPrimaryZone,
						isPrimary: isPrimaryZone, // Keep for backward compatibility
						// Remove zone-specific fields
						configZoneType: undefined,
						isZone: undefined
					},
					updatedAt: new Date()
				})
				.where(eq(forumStructure.id, zone.id));

			if (isPrimaryZone) {
				logger.info(`✨ Converted primary zone "${zone.name}" to FEATURED forum`);
				featuredCount++;
			} else {
				logger.info(`📁 Converted zone "${zone.name}" to regular top-level forum`);
				regularCount++;
			}
		}

		// Verify migration
		const remainingZones = await db
			.select()
			.from(forumStructure)
			.where(eq(forumStructure.type, 'zone'));

		if (remainingZones.length === 0) {
			logger.info('✅ Migration complete!');
			logger.info(`   - ${featuredCount} featured forums created`);
			logger.info(`   - ${regularCount} regular top-level forums created`);
			
			// Show featured forums
			const featuredForums = await db
				.select({
					name: forumStructure.name,
					slug: forumStructure.slug
				})
				.from(forumStructure)
				.where(eq(forumStructure.type, 'forum'))
				.where(eq(forumStructure.parentId, null));
				
			const featured = featuredForums.filter(f => {
				const data = f.pluginData as any;
				return data?.isFeatured === true;
			});
			
			logger.info('\nFeatured Forums:');
			featured.forEach(f => {
				logger.info(`   ⭐ ${f.name} (/${f.slug})`);
			});
			
		} else {
			throw new Error(`${remainingZones.length} zones still exist after migration`);
		}

	} catch (error) {
		logger.error('Migration failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run the migration
migrateZonesToFeaturedForums().catch(error => {
	logger.error('Migration failed:', error);
	process.exit(1);
});