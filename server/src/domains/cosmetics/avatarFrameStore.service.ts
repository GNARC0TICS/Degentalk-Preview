import { db } from '@db';
import { products, avatarFrames, userOwnedFrames } from '@schema';
import type { UserId } from '@shared/types';
import { eq, and } from 'drizzle-orm';
import { dgtService } from '../wallet/dgt.service';

export interface StoreFrame {
	id: number;
	name: string;
	imageUrl: string;
	rarity: string;
	animated: boolean;
	price: number;
	productId: number;
}

class AvatarFrameStoreService {
	async listAvailableFrames(): Promise<StoreFrame[]> {
		// Return published, non-deleted products that map to an avatar frame.
		const rows = await db
			.select({
				id: avatarFrames.id,
				name: avatarFrames.name,
				imageUrl: avatarFrames.imageUrl,
				rarity: avatarFrames.rarity,
				animated: avatarFrames.animated,
				price: products.price,
				productId: products.id
			})
			.from(products)
			.innerJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
			.where(eq(products.status, 'published'));

		return rows as StoreFrame[];
	}

	async purchaseFrame(
		userId: string,
		frameId: number
	): Promise<{
		success: boolean;
		frameId: number;
		newBalance?: number;
		message: string;
	}> {
		try {
			// Get frame and product details
			const frameData = await db
				.select({
					frameId: avatarFrames.id,
					frameName: avatarFrames.name,
					price: products.price,
					productId: products.id
				})
				.from(products)
				.innerJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
				.where(and(eq(avatarFrames.id, frameId), eq(products.status, 'published')))
				.limit(1);

			if (frameData.length === 0) {
				return {
					success: false,
					frameId,
					message: 'Frame not found or not available for purchase'
				};
			}

			const frame = frameData[0];

			// Check if user already owns this frame
			const existingOwnership = await db
				.select()
				.from(userOwnedFrames)
				.where(
					and(eq(userOwnedFrames.userId, userId as UserId), eq(userOwnedFrames.frameId, frameId))
				)
				.limit(1);

			if (existingOwnership.length > 0) {
				return {
					success: false,
					frameId,
					message: 'You already own this frame'
				};
			}

			let newBalance: number | undefined;

			// Handle wallet deduction for paid frames
			if (frame.price > 0) {
				const debitResult = await dgtService.debitDGT(userId, frame.price, {
					source: 'shop_purchase',
					shopItemId: frame.productId.toString(),
					reason: `Purchased avatar frame: ${frame.frameName}`
				});
				newBalance = debitResult.balanceAfter;
			}

			// Grant frame ownership
			await db.insert(userOwnedFrames).values({
				userId: userId as UserId,
				frameId: frameId,
				purchasedAt: new Date(),
				isActive: false // User needs to manually equip
			});

			return {
				success: true,
				frameId,
				newBalance,
				message:
					frame.price > 0
						? `Successfully purchased ${frame.frameName} for ${frame.price} DGT!`
						: `Successfully obtained ${frame.frameName}!`
			};
		} catch (error) {
			console.error('Error purchasing frame:', error);

			// Handle specific DGT errors
			if (error.message?.includes('Insufficient DGT balance')) {
				return {
					success: false,
					frameId,
					message: 'Insufficient DGT balance to purchase this frame'
				};
			}

			return {
				success: false,
				frameId,
				message: 'Failed to purchase frame. Please try again.'
			};
		}
	}
}

export const avatarFrameStoreService = new AvatarFrameStoreService();
