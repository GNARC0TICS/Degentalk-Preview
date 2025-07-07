import { db } from '@db';
import type { UserId } from '@shared/types/ids';
import {
	users,
	levels,
	economySettings,
	badges,
	titles,
	xpAdjustmentLogs,
	xpCloutSettings
} from '@schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { logger } from '../../../../core/logger';
import type { AdminId } from '@shared/types/ids';
import { UserId } from "@shared/types/ids";

// Import core XP service once refactored, e.g.:
// import { coreXpService } from '../../../xp/xp.service';

export class XpAdminService {
	constructor() {
		// Ensure the xp_adjustment_logs table exists (for development/testing)
		this.ensureTableExists().catch((err) => {
			logger.error('Error ensuring xp_adjustment_logs table exists:', err);
		});
	}

	/**
	 * Ensure the xp_adjustment_logs table exists - for development/testing
	 */
	private async ensureTableExists() {
		// Only do this in development mode
		if (process.env.NODE_ENV !== 'development') return;

		try {
			// Use more direct approach with pool.query
			const { pool } = await import('../../../../core/db');

			logger.info('XP_ADMIN_SERVICE', 'Creating xp_adjustment_logs table if not exists...');

			// Create the table
			await pool.query(`
        CREATE TABLE IF NOT EXISTS xp_adjustment_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          admin_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
          adjustment_type VARCHAR(20) NOT NULL,
          amount INTEGER NOT NULL,
          reason TEXT NOT NULL,
          old_xp INTEGER NOT NULL,
          new_xp INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        -- Create indexes if they don't exist
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_xp_adjustment_logs_user_id') THEN
            CREATE INDEX idx_xp_adjustment_logs_user_id ON xp_adjustment_logs(user_id);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_xp_adjustment_logs_admin_id') THEN
            CREATE INDEX idx_xp_adjustment_logs_admin_id ON xp_adjustment_logs(admin_id);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_xp_adjustment_logs_created_at') THEN
            CREATE INDEX idx_xp_adjustment_logs_created_at ON xp_adjustment_logs(created_at);
          END IF;
        END
        $$;
      `);

			logger.info('XP_ADMIN_SERVICE', 'xp_adjustment_logs table setup completed');
		} catch (error) {
			logger.error(
				'XP_ADMIN_SERVICE',
				'Error setting up xp_adjustment_logs table:',
				error instanceof Error ? error.message : String(error)
			);
			// Don't throw, just log the error and continue
		}
	}

	// --- XP Settings Management (Economy Settings & xpCloutSettings) ---
	async getXpSettings() {
		// TODO: Fetch relevant settings from economySettings and xpCloutSettings
		// e.g., xp_per_post, daily_xp_cap, clout_per_helpful etc.
		logger.info('XP_ADMIN_SERVICE', 'Get XP Settings called - not implemented');
		return { message: 'Get XP Settings not implemented' };
	}

	async updateXpSettings(settings: Array<{ key: string; value: any }>) {
		// TODO: Update settings in economySettings or xpCloutSettings table
		// Ensure proper validation and typing
		logger.info('XP_ADMIN_SERVICE', 'Update XP Settings called - not implemented', { settings });
		return { message: 'Update XP Settings not implemented' };
	}

	// --- Level Management ---
	async getLevels() {
		logger.info('XP_ADMIN_SERVICE', 'Get Levels called - not implemented');
		return await db.select().from(levels).orderBy(levels.level);
	}

	async createLevel(levelData: any) {
		// Insert a new level row; if level already exists, throw error
		logger.info('XP_ADMIN_SERVICE', 'Creating level', { levelData });
		try {
			const inserted = await db
				.insert(levels)
				.values({
					level: levelData.level,
					minXp: levelData.xpRequired,
					name: levelData.rewardTitle || levelData.title || null,
					rewardDgt: levelData.rewardDgt || 0,
					rewardTitleId: levelData.rewardTitleId,
					description: levelData.description || null,
					iconUrl: levelData.iconUrl,
					frameUrl: levelData.frameUrl,
					colorTheme: levelData.colorTheme,
					animationEffect: levelData.animationEffect,
					rarity: levelData.rarity || 'common',
					unlocks: levelData.unlocks || {}
				})
				.onConflictDoNothing()
				.returning();
			return inserted[0];
		} catch (err) {
			logger.error('XP_ADMIN_SERVICE', 'Error creating level', err);
			throw err;
		}
	}

	async updateLevel(levelNumber: number, levelData: any) {
		logger.info('XP_ADMIN_SERVICE', 'Updating level', { levelNumber, levelData });
		try {
			const updated = await db
				.update(levels)
				.set({
					minXp: levelData.xpRequired,
					name: levelData.rewardTitle || levelData.title || null,
					rewardDgt: levelData.rewardDgt,
					description: levelData.description,
					iconUrl: levelData.iconUrl,
					frameUrl: levelData.frameUrl,
					colorTheme: levelData.colorTheme,
					animationEffect: levelData.animationEffect,
					rarity: levelData.rarity,
					unlocks: levelData.unlocks
				})
				.where(eq(levels.level, levelNumber))
				.returning();
			return updated[0];
		} catch (err) {
			logger.error('XP_ADMIN_SERVICE', 'Error updating level', err);
			throw err;
		}
	}

	async deleteLevel(levelNumber: number) {
		logger.info('XP_ADMIN_SERVICE', 'Delete Level called - not implemented', { levelNumber });
		// await db.delete(levels).where(eq(levels.level, levelNumber));
		return { message: 'Delete Level not implemented' };
	}

	// --- Badge Management ---
	async getBadges() {
		logger.info('XP_ADMIN_SERVICE', 'Get Badges called - not implemented');
		return await db.select().from(badges);
	}

	async createBadge(badgeData: any) {
		logger.info('XP_ADMIN_SERVICE', 'Create Badge called - not implemented', { badgeData });
		// const newBadge = await db.insert(badges).values(badgeData).returning();
		// return newBadge[0];
		return { message: 'Create Badge not implemented' };
	}

	async updateBadge(badgeId: string, badgeData: any) {
		logger.info('XP_ADMIN_SERVICE', 'Update Badge called - not implemented', {
			badgeId,
			badgeData
		});
		// const updatedBadge = await db.update(badges).set(badgeData).where(eq(badges.id, badgeId)).returning();
		// return updatedBadge[0];
		return { message: 'Update Badge not implemented' };
	}

	async deleteBadge(badgeId: string) {
		logger.info('XP_ADMIN_SERVICE', 'Delete Badge called - not implemented', { badgeId });
		// await db.delete(badges).where(eq(badges.id, badgeId));
		return { message: 'Delete Badge not implemented' };
	}

	// --- Title Management ---
	async getTitles() {
		logger.info('XP_ADMIN_SERVICE', 'Get Titles called - not implemented');
		return await db.select().from(titles);
	}

	async createTitle(titleData: any) {
		logger.info('XP_ADMIN_SERVICE', 'Create Title called - not implemented', { titleData });
		// const newTitle = await db.insert(titles).values(titleData).returning();
		// return newTitle[0];
		return { message: 'Create Title not implemented' };
	}

	async updateTitle(titleId: string, titleData: any) {
		logger.info('XP_ADMIN_SERVICE', 'Update Title called - not implemented', {
			titleId,
			titleData
		});
		// const updatedTitle = await db.update(titles).set(titleData).where(eq(titles.id, titleId)).returning();
		// return updatedTitle[0];
		return { message: 'Update Title not implemented' };
	}

	async deleteTitle(titleId: string) {
		logger.info('XP_ADMIN_SERVICE', 'Delete Title called - not implemented', { titleId });
		// await db.delete(titles).where(eq(titles.id, titleId));
		return { message: 'Delete Title not implemented' };
	}

	// --- User XP Adjustment ---
	async adjustUserXp(
		userId: UserId,
		amount: number,
		reason: string,
		adjustmentType: 'add' | 'subtract' | 'set',
		adminId: AdminId
	) {
		logger.info('XP_ADMIN_SERVICE', 'Admin adjust user XP called', {
			userId,
			amount,
			reason,
			adjustmentType,
			adminId
		});

		if (!userId || typeof amount !== 'number' || !reason || !adjustmentType || !adminId) {
			throw new Error('Missing required parameters for XP adjustment.');
		}

		// Use the core XP service for XP adjustments
		const { xpService } = await import('../../../../domains/xp/xp.service');

		// Use the core service to perform the update
		const result = await xpService.updateUserXp(userId, amount, adjustmentType, {
			reason,
			adminId,
			logAdjustment: true
		});

		return result;
	}

	async getXpAdjustmentLogs(params: { userId?: UserId; limit?: number; offset?: number }) {
		const { userId, limit = 50, offset = 0 } = params; // Default limit to 50 as per your plan
		logger.info('XP_ADMIN_SERVICE', 'Get XP Adjustment Logs called', params);

		const queryConditions = userId ? [eq(xpAdjustmentLogs.userId, userId)] : [];

		const logs = await db
			.select()
			.from(xpAdjustmentLogs)
			.where(and(...queryConditions))
			.orderBy(desc(xpAdjustmentLogs.createdAt))
			.limit(limit)
			.offset(offset);

		return logs;
	}
}

export const xpAdminService = new XpAdminService();
