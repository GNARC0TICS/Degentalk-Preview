import { db } from '@degentalk/db';
import { products, avatarFrames, userOwnedFrames } from '@schema';
import type { UserId } from '@shared/types/ids';
import { eq, and } from 'drizzle-orm';
import { walletService } from '../wallet/services/wallet.service';
import type { EntityId, ProductId, FrameId } from '@shared/types/ids';
import { logger } from '@core/logger';
import { dgtService } from '../wallet/services/dgtService';
import { defaultFrames, isDefaultFrame } from '@shared/config/default-frames.config';

export interface StoreFrame {
	id: EntityId;
	name: string;
	imageUrl: string;
	rarity: string;
	animated: boolean;
	price: number;
	productId: ProductId;
}

class AvatarFrameStoreService {
	async listAvailableFrames(): Promise<StoreFrame[]> {
		// Get database frames
		const dbFrames = await db
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

		// Convert default frames to StoreFrame format
		const defaultStoreFrames: StoreFrame[] = defaultFrames.map(frame => ({
			id: frame.id as EntityId,
			name: frame.name,
			imageUrl: frame.imageUrl,
			rarity: frame.rarity,
			animated: frame.animated,
			price: frame.price,
			productId: `default-${frame.id}` as ProductId // Use a special productId for defaults
		}));

		// Merge database frames with default frames (database frames take precedence)
		const dbFrameIds = new Set(dbFrames.map(f => f.id));
		const uniqueDefaultFrames = defaultStoreFrames.filter(f => !dbFrameIds.has(f.id));

		return [...dbFrames, ...uniqueDefaultFrames] as StoreFrame[];
	}

	async purchaseFrame(
		userId: string,
		frameId: FrameId
	): Promise<{
		success: boolean;
		frameId: FrameId;
		newBalance?: number;
		message: string;
	}> {
		try {
			let frameName: string;
			let price: number;
			let productId: ProductId;

			// Check if this is a default frame
			if (isDefaultFrame(frameId)) {
				const defaultFrame = defaultFrames.find(f => f.id === frameId);
				if (!defaultFrame) {
					return {
						success: false,
						frameId,
						message: 'Frame not found'
					};
				}
				frameName = defaultFrame.name;
				price = defaultFrame.price;
				productId = `default-${frameId}` as ProductId;
			} else {
				// Get frame and product details from database
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
				frameName = frame.frameName;
				price = frame.price;
				productId = frame.productId;
			}

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
			if (price > 0) {
				const debitResult = await dgtService.debitDGT(userId, price, {
					source: 'shop_purchase',
					shopItemId: productId.toString(),
					reason: `Purchased avatar frame: ${frameName}`
				});
				newBalance = debitResult.balanceAfter;
			}

			// Grant frame ownership
			await db.insert(userOwnedFrames).values({
				userId: userId as UserId,
				frameId: frameId,
				source: isDefaultFrame(frameId) ? 'default' : 'shop'
			});

			return {
				success: true,
				frameId,
				newBalance,
				message:
					price > 0
						? `Successfully purchased ${frameName} for ${price} DGT!`
						: `Successfully obtained ${frameName}!`
			};
		} catch (error) {
			logger.error('Error purchasing frame:', error);

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
