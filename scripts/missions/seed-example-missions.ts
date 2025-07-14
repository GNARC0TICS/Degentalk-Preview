#!/usr/bin/env tsx
/**
 * Seed Example Missions
 * 
 * Creates default missions from templates
 * Usage: pnpm tsx scripts/missions/seed-example-missions.ts
 */

import { db } from '../db';
import { missions } from '../db/schema';
import { defaultMissionTemplates } from '@config/missions.config';
import { logger } from '../server/src/core/logger';
import { eq } from 'drizzle-orm';

async function seedExampleMissions() {
	logger.info('Starting mission seeding');

	try {
		const results = {
			created: 0,
			skipped: 0,
			errors: 0
		};

		for (const template of defaultMissionTemplates) {
			try {
				// Check if mission already exists
				const [existing] = await db
					.select({ id: missions.id })
					.from(missions)
					.where(eq(missions.title, template.title))
					.limit(1);

				if (existing) {
					logger.info({ title: template.title }, 'Mission already exists, skipping');
					results.skipped++;
					continue;
				}

				// Create mission
				const [created] = await db.insert(missions).values({
					title: template.title,
					description: template.description,
					type: template.type,
					requiredAction: template.action,
					requiredCount: template.target,
					xpReward: template.rewards.xp,
					dgtReward: template.rewards.dgt || null,
					badgeReward: template.rewards.badge || null,
					icon: template.icon,
					isDaily: template.type === 'daily',
					isWeekly: template.type === 'weekly',
					isActive: true,
					minLevel: template.minLevel || 1,
					conditions: template.conditions ? JSON.stringify(template.conditions) : null,
					stages: template.stages ? JSON.stringify(template.stages) : null
				}).returning();

				logger.info({ 
					id: created.id, 
					title: created.title, 
					type: created.type 
				}, 'Mission created');
				
				results.created++;
			} catch (error) {
				logger.error({ error, template: template.id }, 'Failed to create mission');
				results.errors++;
			}
		}

		logger.info(results, 'Mission seeding completed');
		process.exit(0);
	} catch (error) {
		logger.error({ error }, 'Mission seeding failed');
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	seedExampleMissions();
}

export { seedExampleMissions };