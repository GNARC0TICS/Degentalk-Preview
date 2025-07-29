import type { UserId } from '@shared/types/ids';
import { userService } from '@core/services/user.service';
import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { db } from '@degentalk/db';
import { products, userInventory, transactions, avatarFrames, productCategories } from '@schema';
import { eq, isNull, or, and, gte, lte, sql } from 'drizzle-orm';
import { dgtService } from '@domains/wallet/services/dgtService';
import { walletService } from '@domains/wallet/services/wallet.service';
import { isAuthenticated } from '@domains/auth/middleware/auth.middleware';
import { walletConfig } from '@shared/config/wallet.config';
import { logger } from '@core/logger';
import { z } from 'zod';
import { WalletTransformer } from '../wallet/transformers/wallet.transformer';
import { ShopTransformer } from './transformers/shop.transformer';
import { vanitySinkAnalyzer } from './services/vanity-sink.analyzer';
import type { DgtAmount, UserId, ItemId, OrderId } from '@shared/types/ids';
import type { EntityId } from '@shared/types/ids';
import { toDgtAmount } from '@shared/types/economy';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { validateRequest } from '@middleware/validate-request';
import { shopValidation } from './validation/shop.validation';

const router: RouterType = Router();

// GET /api/shop/items
router.get('/items', validateRequest(shopValidation.getShopItems), async (req, res) => {
	try {
		// req.query is now validated by shopValidation.getShopItems schema
		const { category, sort = 'popular', page = 1, limit = 20 } = req.query;
		const requestingUser = userService.getUserFromRequest(req);

		// Build query for products with frame data
		let query = db
			.select({
				product: products,
				frame: avatarFrames,
				category: productCategories
			})
			.from(products)
			.leftJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
			.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
			.where(and(
				eq(products.status, 'published'),
				eq(products.isDeleted, false)
			));

		// Filter by category if specified
		if (category && category !== 'all') {
			query = query.where(eq(productCategories.slug, category));
		}

		// Get all matching products first
		const allProducts = await query;

		// Sort products
		let sortedProducts = [...allProducts];
		switch (sort) {
			case 'price_low':
				sortedProducts.sort((a, b) => (a.product.price || 0) - (b.product.price || 0));
				break;
			case 'price_high':
				sortedProducts.sort((a, b) => (b.product.price || 0) - (a.product.price || 0));
				break;
			case 'newest':
				sortedProducts.sort(
					(a, b) => new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime()
				);
				break;
			case 'rarity':
				const rarityOrder = { mythic: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
				sortedProducts.sort((a, b) => 
					(rarityOrder[b.frame?.rarity || 'common'] || 0) - 
					(rarityOrder[a.frame?.rarity || 'common'] || 0)
				);
				break;
			case 'popular':
			default:
				// For now, use created date as popularity proxy
				sortedProducts.sort(
					(a, b) => new Date(a.product.createdAt).getTime() - new Date(b.product.createdAt).getTime()
				);
				break;
		}

		// Pagination
		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const startIndex = (pageNum - 1) * limitNum;
		const endIndex = startIndex + limitNum;
		const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

		// Transform items based on user authentication status
		let transformedItems;
		if (requestingUser) {
			// Get user inventory for ownership checking
			const userInventoryData = await db
				.select()
				.from(userInventory)
				.where(eq(userInventory.userId, requestingUser.id));

			transformedItems = paginatedProducts.map(({ product, frame, category }) => {
				// Create shop item format
				const shopItem = {
					id: product.id,
					name: product.name,
					description: product.description || '',
					category: category?.slug || 'uncategorized',
					price: product.price,
					priceDGT: product.price,
					priceUSDT: product.discountPrice,
					rarity: frame?.rarity || 'common',
					imageUrl: frame?.imageUrl || '/assets/placeholder.png',
					isAvailable: true,
					isActive: true,
					frameId: product.frameId,
					animated: frame?.animated || false,
					createdAt: product.createdAt,
					popularityScore: 0 // TODO: Implement popularity tracking
				};
				return ShopTransformer.toAuthenticatedShopItem(shopItem, requestingUser, userInventoryData);
			});
		} else {
			transformedItems = paginatedProducts.map(({ product, frame, category }) => {
				const shopItem = {
					id: product.id,
					name: product.name,
					description: product.description || '',
					category: category?.slug || 'uncategorized',
					price: product.price,
					priceDGT: product.price,
					priceUSDT: product.discountPrice,
					rarity: frame?.rarity || 'common',
					imageUrl: frame?.imageUrl || '/assets/placeholder.png',
					isAvailable: true,
					isActive: true,
					frameId: product.frameId,
					animated: frame?.animated || false,
					createdAt: product.createdAt,
					popularityScore: 0
				};
				return ShopTransformer.toPublicShopItem(shopItem);
			});
		}

		sendSuccessResponse(res, {
			items: transformedItems,
			total: sortedProducts.length,
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(sortedProducts.length / limitNum),
			filters: {
				category: category || 'all',
				sort: sort
			},
			user: requestingUser
				? {
						isAuthenticated: true,
						dgtBalance: requestingUser.dgtBalance || 0
					}
				: { isAuthenticated: false }
		});
	} catch (error) {
		logger.error('ShopController', 'Error fetching shop items', { error });
		sendErrorResponse(res, 'Failed to fetch shop items', 500);
	}
});

// GET /api/shop/items/:id
router.get('/items/:id', validateRequest(shopValidation.getShopItem), async (req, res) => {
	try {
		// req.params is now validated by shopValidation.getShopItem schema
		const { id } = req.params;
		const requestingUser = userService.getUserFromRequest(req);

		// Fetch product with frame data from database
		const result = await db
			.select({
				product: products,
				frame: avatarFrames,
				category: productCategories
			})
			.from(products)
			.leftJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
			.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
			.where(and(
				eq(products.id, id),
				eq(products.status, 'published'),
				eq(products.isDeleted, false)
			))
			.limit(1);

		if (!result || result.length === 0) {
			return sendErrorResponse(res, 'Item not found', 404);
		}

		const { product, frame, category } = result[0];

		// Create shop item format
		const shopItem = {
			id: product.id,
			name: product.name,
			description: product.description || '',
			category: category?.slug || 'uncategorized',
			price: product.price,
			priceDGT: product.price,
			priceUSDT: product.discountPrice,
			rarity: frame?.rarity || 'common',
			imageUrl: frame?.imageUrl || '/assets/placeholder.png',
			isAvailable: true,
			isActive: true,
			frameId: product.frameId,
			animated: frame?.animated || false,
			createdAt: product.createdAt,
			popularityScore: 0
		};

		// Transform item based on user context
		let transformedItem;
		if (requestingUser) {
			// Get user inventory for ownership checking
			const userInventoryData = await db
				.select()
				.from(userInventory)
				.where(eq(userInventory.userId, requestingUser.id));

			transformedItem = ShopTransformer.toAuthenticatedShopItem(
				shopItem,
				requestingUser,
				userInventoryData
			);
		} else {
			transformedItem = ShopTransformer.toPublicShopItem(shopItem);
		}

		sendSuccessResponse(res, {
			item: transformedItem,
			user: requestingUser
				? {
						isAuthenticated: true,
						dgtBalance: requestingUser.dgtBalance || 0
					}
				: { isAuthenticated: false }
		});
	} catch (error) {
		logger.error('ShopController', 'Error fetching shop item', { error, itemId: req.params.id });
		sendErrorResponse(res, 'Failed to fetch shop item', 500);
	}
});

// POST /api/shop/purchase
router.post(
	'/purchase',
	isAuthenticated,
	validateRequest(shopValidation.purchaseItem),
	async (req, res) => {
		try {
			if (!userService.getUserFromRequest(req)) {
				return sendErrorResponse(res, 'User not authenticated', 401);
			}

			const userId = (userService.getUserFromRequest(req) as { id: EntityId }).id;
			// req.body is now validated by shopValidation.purchaseItem schema
			const { itemId, paymentMethod } = req.body;

			// Find the item in database
			const result = await db
				.select({
					product: products,
					frame: avatarFrames,
					category: productCategories
				})
				.from(products)
				.leftJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
				.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
				.where(and(
					eq(products.id, itemId),
					eq(products.status, 'published'),
					eq(products.isDeleted, false)
				))
				.limit(1);

			if (!result || result.length === 0) {
				return sendErrorResponse(res, 'Item not found', 404);
			}

			const { product, frame, category } = result[0];
			const item = {
				id: product.id,
				name: product.name,
				category: category?.slug || 'uncategorized',
				priceDGT: product.price,
				priceUSDT: product.discountPrice,
				rarity: frame?.rarity || 'common'
			};

			// Check if user already owns this item
			const existingItem = await db
				.select()
				.from(userInventory)
				.where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)))
				.limit(1);

			if (existingItem.length > 0) {
				return sendErrorResponse(res, 'You already own this item', 400);
			}

			// Get price based on payment method
			let price: number;
			let currency: string;

			if (paymentMethod === 'DGT') {
				if (!item.priceDGT) {
					return sendErrorResponse(res, 'Item not available for DGT purchase', 400);
				}
				price = item.priceDGT;
				currency = 'DGT';
			} else {
				if (!item.priceUSDT) {
					return sendErrorResponse(res, 'Item not available for USDT purchase', 400);
				}
				price = item.priceUSDT;
				currency = 'USDT';
			}

			// For DGT payments, check balance and process
			if (paymentMethod === 'DGT') {
				const dgtAmountRequired = price; // Use price directly as DGT amount
				const userBalance = await walletService.getUserBalance(userId);

				if (userBalance.dgtBalance < dgtAmountRequired) {
					return sendErrorResponse(res, 'Insufficient DGT balance', 400, {
						required: price,
						available: userBalance.dgtBalance
					});
				}

				// Create transaction metadata for audit trail
				const transactionMetadata = {
					itemId,
					itemName: item.name,
					category: item.category,
					price: toDgtAmount(price),
					source: 'shop_purchase',
					ipAddress: req.ip,
					userAgent: req.get('User-Agent')
				};

				// Deduct DGT via centralized service
				const transactionResult = await dgtService.processShopPurchase(
					userId as UserId,
					dgtAmountRequired,
					item.id,
					item.name
				);

				// Add item to user's inventory
				const [inventoryItem] = await db
					.insert(userInventory)
					.values({
						userId,
						itemId,
						itemType: item.category,
						quantity: 1,
						acquiredAt: new Date(),
						purchasePrice: Math.floor(price * 100), // Store in cents
						purchaseCurrency: currency
					})
					.returning();

				logger.info('ShopController', 'Item purchased with DGT', {
					userId,
					itemId,
					itemName: item.name,
					price,
					currency,
					transactionId: transactionResult?.transactionId
				});

				// Track vanity sink event for analytics
				await vanitySinkAnalyzer.trackShopPurchase({
					userId: userId as UserId,
					orderId: `shop_${Date.now()}` as OrderId,
					itemId: itemId as ItemId,
					dgtAmount: toDgtAmount(price),
					itemCategory: item.category as any,
					metadata: {
						purchaseSource: 'web_shop',
						itemRarity: item.rarity,
						currency
					}
				});

				// Transform response using both WalletTransformer and ShopTransformer
				const transformedTransaction = transactionResult?.transaction
					? WalletTransformer.toAuthenticatedTransaction(transactionResult.transaction, {
							id: userId
						})
					: undefined;

				const requestingUser = userService.getUserFromRequest(req);
				const dbItem = {
					...item,
					price: item.priceDGT,
					isAvailable: true,
					isActive: true
				};
				const transformedItem = ShopTransformer.toAuthenticatedShopItem(
					dbItem,
					{ ...requestingUser, dgtBalance: (requestingUser?.dgtBalance || 0) - price },
					[{ ...inventoryItem, itemId, name: item.name, category: item.category }]
				);

				sendSuccessResponse(res, {
					success: true,
					message: `Successfully purchased ${item.name}`,
					item: transformedItem,
					inventoryId: inventoryItem.id,
					transaction: transformedTransaction,
					vanityMetrics: {
						dgtBurned: toDgtAmount(price),
						category: item.category,
						contributesToDeflation: true
					}
				});
			} else {
				// TODO: Implement USDT payments via CCPayment
				return sendErrorResponse(res, 'USDT payments not yet implemented', 501, {
					message: 'Please use DGT for now'
				});
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				return sendErrorResponse(res, 'Invalid request', 400, { details: error.errors });
			}
			logger.error('ShopController', 'Error processing purchase', {
				error: error instanceof Error ? error.message : String(error),
				userId: userService.getUserFromRequest(req)?.id
			});
			sendErrorResponse(res, 'Failed to process purchase', 500);
		}
	}
);

// GET /api/shop/inventory - Get user's purchased items with enhanced transformations
router.get(
	'/inventory',
	isAuthenticated,
	validateRequest(shopValidation.getUserInventory),
	async (req, res) => {
		try {
			const requestingUser = userService.getUserFromRequest(req);
			if (!requestingUser) {
				return sendErrorResponse(res, 'User not authenticated', 401);
			}

			const userId = requestingUser.id;
			// req.query is now validated by shopValidation.getUserInventory schema
			const { category, equipped } = req.query;

			// Get user's inventory
			let inventoryQuery = db.select().from(userInventory).where(eq(userInventory.userId, userId));

			// Filter by equipped status if specified
			if (equipped === 'true') {
				inventoryQuery = inventoryQuery.where(eq(userInventory.equipped, true));
			} else if (equipped === 'false') {
				inventoryQuery = inventoryQuery.where(eq(userInventory.equipped, false));
			}

			const inventory = await inventoryQuery;

			// Get product details for inventory items
			const inventoryItemIds = inventory.map(inv => inv.itemId);
			const productDetails = await db
				.select({
					product: products,
					frame: avatarFrames,
					category: productCategories
				})
				.from(products)
				.leftJoin(avatarFrames, eq(products.frameId, avatarFrames.id))
				.leftJoin(productCategories, eq(products.categoryId, productCategories.id))
				.where(sql`${products.id} = ANY(${inventoryItemIds})`);

			// Create a map for quick lookup
			const productMap = productDetails.reduce((acc, { product, frame, category }) => {
				acc[product.id] = { product, frame, category };
				return acc;
			}, {} as Record<string, any>);

			// Transform inventory items using ShopTransformer
			const transformedInventory = inventory
				.map((inv) => {
					const productData = productMap[inv.itemId];
					if (!productData) return null;

					const { product, frame, category } = productData;

					// Create enhanced inventory item data
					const inventoryItem = {
						...inv,
						name: product.name,
						category: category?.slug || 'uncategorized',
						rarity: frame?.rarity || 'common',
						type: category?.slug || 'uncategorized',
						purchasePrice: inv.purchasePrice ? inv.purchasePrice / 100 : undefined // Convert from cents
					};

					return ShopTransformer.toUserInventoryItem(inventoryItem);
				})
				.filter((item) => item !== null); // Filter out items that no longer exist

			// Filter by category if specified
			let filteredInventory = transformedInventory;
			if (category && category !== 'all') {
				filteredInventory = transformedInventory.filter((item) => item.category === category);
			}

			// Group by category for better organization
			const inventoryByCategory = filteredInventory.reduce(
				(acc, item) => {
					if (!acc[item.category]) {
						acc[item.category] = [];
					}
					acc[item.category].push(item);
					return acc;
				},
				{} as Record<string, any[]>
			);

			// Calculate stats
			const stats = {
				totalItems: filteredInventory.length,
				equippedItems: filteredInventory.filter((item) => item.isEquipped).length,
				totalValue: filteredInventory.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
				rareItems: filteredInventory.filter((item) =>
					['epic', 'legendary', 'mythic'].includes(item.rarity)
				).length
			};

			sendSuccessResponse(res, {
				inventory: filteredInventory,
				inventoryByCategory,
				stats,
				filters: {
					category: category || 'all',
					equipped: equipped || 'all'
				}
			});
		} catch (error) {
			logger.error('ShopController', 'Error getting inventory', {
				error: error instanceof Error ? error.message : String(error),
				userId: userService.getUserFromRequest(req)?.id
			});
			sendErrorResponse(res, 'Failed to get inventory', 500);
		}
	}
);

export default router;
