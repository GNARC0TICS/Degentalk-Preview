import { db } from '@db';
import type { UserId } from '@shared/types/ids';
import { economySettings } from '@schema';
import { eq } from 'drizzle-orm';
import { dgtService } from '../../wallet/dgt.service';
import { logger } from '../../../core/logger';

async function getSettingInt(key: string, defaultVal: number = 0): Promise<number> {
	try {
		const row = await db
			.select({ value: economySettings.value })
			.from(economySettings)
			.where(eq(economySettings.key, key))
			.limit(1);
		return row.length ? Number(row[0].value) : defaultVal;
	} catch (error) {
		logger.warn('Failed to get economy setting:', { key, error });
		return defaultVal;
	}
}

export async function awardXShareReward(userId: UserId) {
	try {
		const xpReward = await getSettingInt('X_SHARE_XP', 10);
		const dgtReward = await getSettingInt('X_SHARE_DGT', 0);

		if (dgtReward > 0) {
			await dgtService.addDgt(userId, BigInt(dgtReward), 'REWARD', {
				reason: 'x_share_reward'
			});
		}

		logger.info('RewardService', 'Issued X share reward', { userId, xpReward, dgtReward });
	} catch (error) {
		logger.error('Failed to award X share reward:', { userId, error });
	}
}

export async function awardXReferralReward(userId: UserId) {
	try {
		const xpReward = await getSettingInt('X_REFERRAL_XP', 50);
		const dgtReward = await getSettingInt('X_REFERRAL_DGT', 100);

		if (dgtReward > 0) {
			await dgtService.addDgt(userId, BigInt(dgtReward), 'REWARD', {
				reason: 'x_referral_reward'
			});
		}

		logger.info('RewardService', 'Issued X referral reward', { userId, xpReward, dgtReward });
	} catch (error) {
		logger.error('Failed to award X referral reward:', { userId, error });
	}
}
