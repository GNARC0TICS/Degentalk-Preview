import { db } from '@db';
import { avatarFrames, users } from '@schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../../../core/logger';
import type { AvatarFrame } from '@schema';
import type { FrameId } from '@db/types';

interface CreateFrameData {
	name: string;
	imageUrl: string;
	rarity: string;
	animated: boolean;
}

interface UpdateFrameData {
	name?: string;
	imageUrl?: string;
	rarity?: string;
	animated?: boolean;
}

class AvatarFrameService {
	async getAllFrames() {
		try {
			const frames = await db.select().from(avatarFrames).orderBy(avatarFrames.createdAt);
			return frames;
		} catch (error) {
			logger.error('AvatarFrameService', 'Failed to get all frames', { error });
			throw error;
		}
	}

	async getFrameById(id: FrameId) {
		try {
			const [frame] = await db.select().from(avatarFrames).where(eq(avatarFrames.id, id)).limit(1);
			return frame || null;
		} catch (error) {
			logger.error('AvatarFrameService', 'Failed to get frame by ID', { error, frameId: id });
			throw error;
		}
	}

	async createFrame(data: CreateFrameData) {
		try {
			const [frame] = await db
				.insert(avatarFrames)
				.values({
					name: data.name,
					imageUrl: data.imageUrl,
					rarity: data.rarity,
					animated: data.animated
				})
				.returning();

			logger.info('AvatarFrameService', 'Frame created', { frameId: frame.id, name: frame.name });
			return frame;
		} catch (error) {
			logger.error('AvatarFrameService', 'Failed to create frame', { error, data });
			throw error;
		}
	}

	async updateFrame(id: FrameId, data: UpdateFrameData) {
		try {
			const [frame] = await db
				.update(avatarFrames)
				.set(data)
				.where(eq(avatarFrames.id, id))
				.returning();

			if (!frame) {
				return null;
			}

			logger.info('AvatarFrameService', 'Frame updated', { frameId: id, updates: data });
			return frame;
		} catch (error) {
			logger.error('AvatarFrameService', 'Failed to update frame', { error, frameId: id, data });
			throw error;
		}
	}

	async deleteFrame(id: FrameId) {
		try {
			// Check if any users are currently using this frame
			const usersWithFrame = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.activeFrameId, id))
				.limit(1);

			if (usersWithFrame.length > 0) {
				throw new Error('Cannot delete frame - it is currently being used by one or more users');
			}

			const [deletedFrame] = await db
				.delete(avatarFrames)
				.where(eq(avatarFrames.id, id))
				.returning();

			if (!deletedFrame) {
				return false;
			}

			logger.info('AvatarFrameService', 'Frame deleted', { frameId: id });
			return true;
		} catch (error) {
			logger.error('AvatarFrameService', 'Failed to delete frame', { error, frameId: id });
			throw error;
		}
	}

	async getFrameUsageCount(id: FrameId) {
		try {
			const [result] = await db
				.select({ count: eq(users.activeFrameId, id) })
				.from(users)
				.where(eq(users.activeFrameId, id));

			return result?.count || 0;
		} catch (error) {
			logger.error('AvatarFrameService', 'Failed to get frame usage count', { error, frameId: id });
			throw error;
		}
	}
}

export const avatarFrameService = new AvatarFrameService();
