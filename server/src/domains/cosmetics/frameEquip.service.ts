import { db } from '@db';
import { avatarFrames, userOwnedFrames, users } from '@schema';
import { eq } from 'drizzle-orm';
import { xpService } from '../../xp/xp.service';
import { XP_ACTION } from '../../xp/xp-actions';
import { FrameId } from "@shared/types/ids";
import { logger } from "../../core/logger";

class FrameEquipService {
	async userOwnsFrame(userId: string, frameId: FrameId): Promise<boolean> {
		const res = await db
			.select({ id: userOwnedFrames.id })
			.from(userOwnedFrames)
			.where(eq(userOwnedFrames.userId, userId))
			.where(eq(userOwnedFrames.frameId, frameId))
			.limit(1);
		return res.length > 0;
	}

	async equipFrame(userId: string, frameId: FrameId) {
		const owns = await this.userOwnsFrame(userId, frameId);
		if (!owns) {
			throw new Error('Frame not owned');
		}
		await db.update(users).set({ activeFrameId: frameId }).where(eq(users.id, userId));

		// Award XP for equipping frame
		try {
			await xpService.awardXp(userId as unknown as number, XP_ACTION.FRAME_EQUIPPED, { frameId });
		} catch (err) {
			logger.error('Failed to award XP for frame equip', err);
		}
	}

	async grantOwnership(userId: string, frameId: FrameId, source: string = 'purchase') {
		// Idempotent insert
		const exists = await this.userOwnsFrame(userId, frameId);
		if (exists) return;
		await db.insert(userOwnedFrames).values({ userId, frameId, source });
	}
}

export const frameEquipService = new FrameEquipService();
