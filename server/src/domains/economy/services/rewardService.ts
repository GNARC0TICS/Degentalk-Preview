import { db } from '@server/src/core/db';
import type { UserId } from '@db/types';
import { economySettings } from '@schema/economy/settings';
import { eq } from 'drizzle-orm';
import { XpLevelService } from '../../../../services/xp-level-service';
import { dgtService } from '../../wallet/dgt.service';
import { logger } from '@server/src/core/logger';

const xpService = new XpLevelService();

async function getSettingInt(key: string, defaultVal: number = 0): Promise<number> {
	const row = await db
		.select({ value: economySettings.value })
		.from(economySettings)
		.where(eq(economySettings.key, key))
		.limit(1);
	return row.length ? row[0].value : defaultVal;
}

export async function awardXShareReward(userId: UserId) {
	const xpReward = await getSettingInt('X_SHARE_XP', 10);
	const dgtReward = await getSettingInt('X_SHARE_DGT', 0);

	if (xpReward > 0) {
		await xpService.awardXp(userId, 'X_SHARE_XP', {});
	}
	if (dgtReward > 0) {
		await dgtService.addDgt(userId, BigInt(dgtReward), 'REWARD', {
			reason: 'x_share_reward'
		});
	}

	logger.info('RewardService', 'Issued X share reward', { userId, xpReward, dgtReward });
}

export async function awardXReferralReward(userId: UserId) {
	const xpReward = await getSettingInt('X_REFERRAL_XP', 50);
	const dgtReward = await getSettingInt('X_REFERRAL_DGT', 100);

	if (xpReward > 0) {
		await xpService.awardXp(userId, 'X_REFERRAL_XP', {});
	}
	if (dgtReward > 0) {
		await dgtService.addDgt(userId, BigInt(dgtReward), 'REWARD', {
			reason: 'x_referral_reward'
		});
	}

	logger.info('RewardService', 'Issued X referral reward', { userId, xpReward, dgtReward });
}
