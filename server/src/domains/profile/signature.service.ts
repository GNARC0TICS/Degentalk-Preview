/**
 * Signature Service
 *
 * Handles signature management, validation, and retrieval for user profiles.
 */

import { db } from '@degentalk/db';
import { users, signatureShopItems, userSignatureItems } from '@schema';
import { eq, and } from 'drizzle-orm';
import { getSignatureTierForLevel } from '@shared/signature/SignatureTierConfig';
import type { ItemId, UserId } from '@shared/types/ids';

interface UpdateSignatureParams {
	userId: UserId;
	signatureText: string;
}

export class SignatureService {
	/**
	 * Get a user's signature with validation based on their level
	 */
	static async getUserSignature(userId: UserId) {
		const userResult = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				signature: true,
				signatureLevel: true,
				level: true
			}
		});

		if (!userResult) {
			return null;
		}

		return {
			signature: userResult.signature || '',
			signatureLevel: userResult.signatureLevel || 1,
			userLevel: userResult.level,
			tierInfo: getSignatureTierForLevel(userResult.level)
		};
	}

	/**
	 * Update a user's signature with validation based on their level
	 */
	static async updateSignature({ userId, signatureText }: UpdateSignatureParams) {
		// Get the user's current level to validate what's allowed
		const userResult = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				level: true
			}
		});

		if (!userResult) {
			throw new Error('User not found');
		}

		// Get allowed signature capabilities based on level
		const tierInfo = getSignatureTierForLevel(userResult.level);

		// Validate signature length
		if (signatureText.length > tierInfo.maxChars) {
			throw new Error(`Signature exceeds maximum length of ${tierInfo.maxChars} characters`);
		}

		// Validate BBCode usage if needed
		// This is a simple check for now - more sophisticated validation would be needed
		if (!tierInfo.canUseBBCode && (signatureText.includes('[') || signatureText.includes(']'))) {
			throw new Error('BBCode is not allowed at your current level');
		}

		// Validate image usage
		const imgTagCount = (signatureText.match(/\[img\]/gi) || []).length;
		if (!tierInfo.canUseImages && imgTagCount > 0) {
			throw new Error('Images are not allowed in signatures at your current level');
		}

		if (tierInfo.canUseImages && tierInfo.imageLimit && imgTagCount > tierInfo.imageLimit) {
			throw new Error(`Maximum of ${tierInfo.imageLimit} images allowed at your level`);
		}

		// Validate GIF usage (very simplified check)
		const gifCount = (signatureText.match(/\.gif/gi) || []).length;
		if (!tierInfo.canUseGifs && gifCount > 0) {
			throw new Error('GIFs are not allowed in signatures at your current level');
		}

		if (tierInfo.canUseGifs && tierInfo.gifLimit && gifCount > tierInfo.gifLimit) {
			throw new Error(`Maximum of ${tierInfo.gifLimit} GIFs allowed at your level`);
		}

		// Save the signature if validation passes
		await db.update(users).set({ signature: signatureText }).where(eq(users.id, userId));

		return { success: true, message: 'Signature updated successfully' };
	}

	/**
	 * Get signature shop items
	 */
	static async getSignatureShopItems(userLevel: number) {
		const items = await db.query.signatureShopItems.findMany({
			orderBy: (items, { asc }) => [asc(items.requiredLevel)]
		});

		// Mark which items the user can purchase based on level
		return items.map((item) => ({
			...item,
			canPurchase: userLevel >= item.requiredLevel
		}));
	}

	/**
	 * Get user's purchased signature items
	 */
	static async getUserSignatureItems(userId: UserId) {
		return db.query.userSignatureItems.findMany({
			where: eq(userSignatureItems.userId, userId),
			with: {
				signatureItem: true
			}
		});
	}

	/**
	 * Purchase a signature shop item
	 */
	static async purchaseSignatureItem(userId: UserId, itemId: ItemId) {
		// Get user details
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				level: true,
				dgtWalletBalance: true
			}
		});

		if (!user) {
			throw new Error('User not found');
		}

		// Get item details
		const item = await db.query.signatureShopItems.findFirst({
			where: eq(signatureShopItems.id, itemId)
		});

		if (!item) {
			throw new Error('Item not found');
		}

		// Check if user already owns this item
		const existingItem = await db.query.userSignatureItems.findFirst({
			where: and(
				eq(userSignatureItems.userId, userId),
				eq(userSignatureItems.signatureItemId, itemId)
			)
		});

		if (existingItem) {
			throw new Error('You already own this item');
		}

		// Check if user meets level requirement
		if (user.level < item.requiredLevel) {
			throw new Error(`You need to be level ${item.requiredLevel} to purchase this item`);
		}

		// Check if user has enough balance
		if (user.dgtWalletBalance < item.price) {
			throw new Error(`Insufficient balance. You need ${item.price} DGT to purchase this item`);
		}

		// Begin transaction
		// This would ideally use a transaction, but for simplicity we're doing separate queries
		// In a production environment, use proper transaction handling

		// Deduct DGT from user's wallet
		await db
			.update(users)
			.set({ dgtWalletBalance: user.dgtWalletBalance - item.price })
			.where(eq(users.id, userId));

		// Add item to user's inventory
		await db.insert(userSignatureItems).values({
			userId,
			signatureItemId: itemId,
			isActive: false
		});

		return { success: true, message: 'Item purchased successfully' };
	}

	/**
	 * Activate a signature shop item for a user
	 */
	static async activateSignatureItem(userId: UserId, itemId: ItemId) {
		// Check if user owns this item
		const existingItem = await db.query.userSignatureItems.findFirst({
			where: and(
				eq(userSignatureItems.userId, userId),
				eq(userSignatureItems.signatureItemId, itemId)
			)
		});

		if (!existingItem) {
			throw new Error('You do not own this item');
		}

		// Deactivate all other items first
		await db
			.update(userSignatureItems)
			.set({ isActive: false })
			.where(eq(userSignatureItems.userId, userId));

		// Activate the selected item
		await db
			.update(userSignatureItems)
			.set({ isActive: true })
			.where(
				and(eq(userSignatureItems.userId, userId), eq(userSignatureItems.signatureItemId, itemId))
			);

		return { success: true, message: 'Item activated successfully' };
	}
}
