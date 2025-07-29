import { db } from '@degentalk/db';
import type { UserId } from '@shared/types/ids';
import { economySettings } from '@schema';
import { eq } from 'drizzle-orm';
import { dgtService } from '@domains/wallet/services/dgtService';
import { logger, LogAction } from '@core/logger';
import { reportErrorServer } from "@lib/report-error";

async function getSettingInt(key: string, defaultVal: number = 0): Promise<number> {
	try {
		const row = await db
			.select({ value: economySettings.value })
			.from(economySettings)
			.where(eq(economySettings.key, key))
			.limit(1);
		return row.length ? Number(row[0].value) : defaultVal;
	} catch (error) {
		await reportErrorServer(error, {
			service: 'RewardService',
			operation: 'getSettingInt',
			action: LogAction.FAILURE,
			data: { key, defaultVal }
		});
		return defaultVal;
	}
}

export async function awardXShareReward(userId: UserId) {
	try {
		const xpReward = await getSettingInt('X_SHARE_XP', 10);
		const dgtReward = await getSettingInt('X_SHARE_DGT', 0);

		if (dgtReward > 0) {
			await dgtService.processReward(userId, dgtReward, 'x_share_reward', 'X social share reward');
		}

		logger.info('RewardService', 'Issued X share reward', { userId, xpReward, dgtReward });
	} catch (error) {
		await reportErrorServer(error, {
			service: 'RewardService',
			operation: 'awardXShareReward',
			action: LogAction.FAILURE,
			data: { userId }
		});
	}
}

export async function awardXReferralReward(userId: UserId) {
	try {
		const xpReward = await getSettingInt('X_REFERRAL_XP', 50);
		const dgtReward = await getSettingInt('X_REFERRAL_DGT', 100);

		if (dgtReward > 0) {
			await dgtService.processReward(userId, dgtReward, 'x_referral_reward', 'X referral reward');
		}

		logger.info('RewardService', 'Issued X referral reward', { userId, xpReward, dgtReward });
	} catch (error) {
		await reportErrorServer(error, {
			service: 'RewardService',
			operation: 'awardXReferralReward',
			action: LogAction.FAILURE,
			data: { userId }
		});
	}
}
