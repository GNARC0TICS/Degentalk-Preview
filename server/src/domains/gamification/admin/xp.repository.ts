import { db } from '@db';
import type { UserId, AdminId } from '@shared/types/ids';
import {
	users,
	levels,
	economySettings,
	badges,
	titles,
	xpAdjustmentLogs,
	xpReputationSettings
} from '@schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { BaseRepository } from '@core/repositories/base.repository';
import type { DatabaseTransaction } from '@shared/types';

export class XpAdminRepository extends BaseRepository<typeof levels> {
	constructor() {
		super(levels, 'XpAdmin');
	}

	// --- Level Management ---
	async getAllLevels(options?: { tx?: DatabaseTransaction }) {
		const dbClient = options?.tx || db;
		return await dbClient.select().from(levels).orderBy(levels.level);
	}

	async createLevel(levelData: {
		level: number;
		minXp: number;
		name?: string | null;
		rewardDgt?: number;
		rewardTitleId?: string | null;
		description?: string | null;
		iconUrl?: string | null;
		frameUrl?: string | null;
		colorTheme?: string | null;
		animationEffect?: string | null;
		rarity?: string;
		unlocks?: any;
	}, options?: { tx?: DatabaseTransaction }) {
		const dbClient = options?.tx || db;
		const [inserted] = await dbClient
			.insert(levels)
			.values({
				level: levelData.level,
				minXp: levelData.minXp,
				name: levelData.name,
				rewardDgt: levelData.rewardDgt || 0,
				rewardTitleId: levelData.rewardTitleId,
				description: levelData.description,
				iconUrl: levelData.iconUrl,
				frameUrl: levelData.frameUrl,
				colorTheme: levelData.colorTheme,
				animationEffect: levelData.animationEffect,
				rarity: levelData.rarity || 'common',
				unlocks: levelData.unlocks || {}
			})
			.onConflictDoNothing()
			.returning();
		return inserted;
	}

	async updateLevel(levelNumber: number, levelData: {
		minXp?: number;
		name?: string | null;
		rewardDgt?: number;
		description?: string | null;
		iconUrl?: string | null;
		frameUrl?: string | null;
		colorTheme?: string | null;
		animationEffect?: string | null;
		rarity?: string;
		unlocks?: any;
	}, options?: { tx?: DatabaseTransaction }) {
		const dbClient = options?.tx || db;
		const [updated] = await dbClient
			.update(levels)
			.set({
				minXp: levelData.minXp,
				name: levelData.name,
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
		return updated;
	}

	// --- Badge Management ---
	async getAllBadges(options?: { tx?: DatabaseTransaction }) {
		const dbClient = options?.tx || db;
		return await dbClient.select().from(badges);
	}

	// --- Title Management ---
	async getAllTitles(options?: { tx?: DatabaseTransaction }) {
		const dbClient = options?.tx || db;
		return await dbClient.select().from(titles);
	}

	// --- XP Adjustment Logs ---
	async getXpAdjustmentLogs(params: {
		userId?: UserId;
		limit?: number;
		offset?: number;
	}, options?: { tx?: DatabaseTransaction }) {
		const { userId, limit = 50, offset = 0 } = params;
		const dbClient = options?.tx || db;

		const queryConditions = userId ? [eq(xpAdjustmentLogs.userId, userId)] : [];

		return await dbClient
			.select()
			.from(xpAdjustmentLogs)
			.where(and(...queryConditions))
			.orderBy(desc(xpAdjustmentLogs.createdAt))
			.limit(limit)
			.offset(offset);
	}
}

export const xpAdminRepository = new XpAdminRepository();