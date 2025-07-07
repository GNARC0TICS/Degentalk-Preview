import type { UserId } from '@shared/types/ids';
import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import { shopItems } from '../../../utils/shop-utils';
import { db } from '@db';
import { products, userInventory, transactions } from '@schema';
import { eq, isNull, or, and, gte, lte } from 'drizzle-orm';
import { dgtService } from '../wallet/dgt.service';
import { isAuthenticated } from '../auth/middleware/auth.middleware';
import { walletConfig } from '@shared/wallet.config';
import { logger } from '../../core/logger';
import { z } from 'zod';
import { EconomyTransformer } from '../economy/transformers/economy.transformer';
import { ShopTransformer } from './transformers/shop.transformer';
import { vanitySinkAnalyzer } from './services/vanity-sink.analyzer';
import type { DgtAmount, UserId, ItemId, OrderId } from '@shared/types';
import { EntityId } from "@shared/types";

const router = Router();

// GET /api/shop/items
router.get('/items', async (req, res) => {
	try {
		const { category, sort = 'popular', page = 1, limit = 20 } = req.query;
		const requestingUser = userService.getUserFromRequest(req);

		let items = shopItems;

		// Filter by category if specified
		if (category && category !== 'all') {
			items = items.filter(item => item.category === category);
		}

		// Sort items
		switch (sort) {
			case 'price_low':
				items.sort((a, b) => (a.priceDGT || 0) - (b.priceDGT || 0));
				break;
			case 'price_high':
				items.sort((a, b) => (b.priceDGT || 0) - (a.priceDGT || 0));
				break;
			case 'newest':
				items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
				break;
			case 'rarity':
				const rarityOrder = { 'mythic': 5, 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
				items.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
				break;
			case 'popular':
			default:
				items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
				break;
		}

		// Pagination
		const pageNum = parseInt(page as string);
		const limitNum = parseInt(limit as string);
		const startIndex = (pageNum - 1) * limitNum;
		const endIndex = startIndex + limitNum;
		const paginatedItems = items.slice(startIndex, endIndex);

		// Transform items based on user authentication status
		let transformedItems;
		if (requestingUser) {
			// Get user inventory for ownership checking
			const userInventoryData = await db
				.select()
				.from(userInventory)
				.where(eq(userInventory.userId, requestingUser.id));

			transformedItems = paginatedItems.map(item => {
				// Convert mock item to database-like format for transformer
				const dbItem = {
					...item,
					price: item.priceDGT,
					isAvailable: true,
					isActive: true,
					popularityScore: item.popularity || 0
				};
				return ShopTransformer.toAuthenticatedShopItem(dbItem, requestingUser, userInventoryData);
			});
		} else {
			transformedItems = paginatedItems.map(item => {
				const dbItem = {
					...item,
					price: item.priceDGT,
					isAvailable: true,
					isActive: true,
					popularityScore: item.popularity || 0
				};
				return ShopTransformer.toPublicShopItem(dbItem);
			});
		}

		res.json({
			items: transformedItems,
			total: items.length,
			page: pageNum,
			limit: limitNum,
			totalPages: Math.ceil(items.length / limitNum),
			filters: {
				category: category || 'all',
				sort: sort
			},
			user: requestingUser ? {
				isAuthenticated: true,
				dgtBalance: requestingUser.dgtBalance || 0
			} : { isAuthenticated: false }
		});
	} catch (error) {
		logger.error('ShopController', 'Error fetching shop items', { error });
		res.status(500).json({ error: 'Failed to fetch shop items' });
	}
});

// GET /api/shop/items/:id
router.get('/items/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const requestingUser = userService.getUserFromRequest(req);

		// Find in mock data for now
		const item = shopItems.find((item) => item.id === id);

		if (!item) {
			return res.status(404).json({ error: 'Item not found' });
		}

		// Transform item based on user context
		let transformedItem;
		if (requestingUser) {
			// Get user inventory for ownership checking
			const userInventoryData = await db
				.select()
				.from(userInventory)
				.where(eq(userInventory.userId, requestingUser.id));

			const dbItem = {
				...item,
				price: item.priceDGT,
				isAvailable: true,
				isActive: true,
				popularityScore: item.popularity || 0
			};
			transformedItem = ShopTransformer.toAuthenticatedShopItem(dbItem, requestingUser, userInventoryData);
		} else {
			const dbItem = {
				...item,
				price: item.priceDGT,
				isAvailable: true,
				isActive: true,
				popularityScore: item.popularity || 0
			};
			transformedItem = ShopTransformer.toPublicShopItem(dbItem);
		}

		res.json({
			item: transformedItem,
			user: requestingUser ? {
				isAuthenticated: true,
				dgtBalance: requestingUser.dgtBalance || 0
			} : { isAuthenticated: false }
		});
	} catch (error) {
		logger.error('ShopController', 'Error fetching shop item', { error, itemId: req.params.id });
		res.status(500).json({ error: 'Failed to fetch shop item' });
	}
});

// Purchase validation schema
const purchaseSchema = z.object({
	itemId: z.string(),
	paymentMethod: z.enum(['DGT', 'USDT'])
});

// POST /api/shop/purchase
router.post('/purchase', isAuthenticated, async (req, res) => {
	try {
		if (!userService.getUserFromRequest(req)) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const userId = (userService.getUserFromRequest(req) as { id: EntityId }).id;
		const { itemId, paymentMethod } = purchaseSchema.parse(req.body);

		// Find the item in mock data (TODO: replace with database query)
		const item = shopItems.find((item) => item.id === itemId);
		if (!item) {
			return res.status(404).json({ error: 'Item not found' });
		}

		// Check if user already owns this item
		const existingItem = await db
			.select()
			.from(userInventory)
			.where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)))
			.limit(1);

		if (existingItem.length > 0) {
			return res.status(400).json({ error: 'You already own this item' });
		}

		// Get price based on payment method
		let price: number;
		let currency: string;

		if (paymentMethod === 'DGT') {
			if (!item.priceDGT) {
				return res.status(400).json({ error: 'Item not available for DGT purchase' });
			}
			price = item.priceDGT;
			currency = 'DGT';
		} else {
			if (!item.priceUSDT) {
				return res.status(400).json({ error: 'Item not available for USDT purchase' });
			}
			price = item.priceUSDT;
			currency = 'USDT';
		}

		// For DGT payments, check balance and process
		if (paymentMethod === 'DGT') {
			const dgtAmountRequired = BigInt(Math.floor(price * 100000000)); // Convert to smallest unit
			const userBalance = await dgtService.getUserBalance(userId);

			if (userBalance < dgtAmountRequired) {
				return res.status(400).json({
					error: 'Insufficient DGT balance',
					required: price,
					available: Number(userBalance) / 100000000
				});
			}

			// Create transaction metadata for audit trail
			const transactionMetadata = {
				itemId,
				itemName: item.name,
				category: item.category,
				price: price as DgtAmount,
				source: 'shop_purchase',
				ipAddress: req.ip,
				userAgent: req.get('User-Agent')
			};

			// Deduct DGT with enhanced audit trail
			const transactionResult = await dgtService.deductDGT(
				userId,
				dgtAmountRequired,
				'SHOP_PURCHASE',
				`Purchased ${item.name}`,
				transactionMetadata
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
				dgtAmount: price as DgtAmount,
				itemCategory: item.category as any,
				metadata: {
					purchaseSource: 'web_shop',
					itemRarity: item.rarity,
					currency
				}
			});

			// Transform response using both EconomyTransformer and ShopTransformer
			const transformedTransaction = transactionResult?.transaction 
				? EconomyTransformer.toAuthenticatedTransaction(transactionResult.transaction, { id: userId })
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

			res.json({
				success: true,
				message: `Successfully purchased ${item.name}`,
				item: transformedItem,
				inventoryId: inventoryItem.id,
				transaction: transformedTransaction,
				vanityMetrics: {
					dgtBurned: price as DgtAmount,
					category: item.category,
					contributesToDeflation: true
				}
			});
		} else {
			// TODO: Implement USDT payments via CCPayment
			return res.status(501).json({
				error: 'USDT payments not yet implemented',
				message: 'Please use DGT for now'
			});
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ error: 'Invalid request', details: error.errors });
		}
		logger.error('ShopController', 'Error processing purchase', {
			error: error instanceof Error ? error.message : String(error),
			userId: userService.getUserFromRequest(req)?.id
		});
		res.status(500).json({ error: 'Failed to process purchase' });
	}
});

// GET /api/shop/inventory - Get user's purchased items with enhanced transformations
router.get('/inventory', isAuthenticated, async (req, res) => {
	try {
		const requestingUser = userService.getUserFromRequest(req);
		if (!requestingUser) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const userId = requestingUser.id;
		const { category, equipped } = req.query;

		// Get user's inventory
		let inventoryQuery = db.select().from(userInventory).where(eq(userInventory.userId, userId));
		
		// Filter by equipped status if specified
		if (equipped === 'true') {
			inventoryQuery = inventoryQuery.where(eq(userInventory.isEquipped, true));
		} else if (equipped === 'false') {
			inventoryQuery = inventoryQuery.where(eq(userInventory.isEquipped, false));
		}

		const inventory = await inventoryQuery;

		// Transform inventory items using ShopTransformer
		const transformedInventory = inventory
			.map((inv) => {
				const item = shopItems.find((item) => item.id === inv.itemId);
				if (!item) return null;

				// Create enhanced inventory item data
				const inventoryItem = {
					...inv,
					name: item.name,
					category: item.category,
					rarity: item.rarity,
					type: item.category,
					purchasePrice: inv.purchasePrice ? inv.purchasePrice / 100 : undefined // Convert from cents
				};

				return ShopTransformer.toUserInventoryItem(inventoryItem);
			})
			.filter(item => item !== null); // Filter out items that no longer exist

		// Filter by category if specified
		let filteredInventory = transformedInventory;
		if (category && category !== 'all') {
			filteredInventory = transformedInventory.filter(item => item.category === category);
		}

		// Group by category for better organization
		const inventoryByCategory = filteredInventory.reduce((acc, item) => {
			if (!acc[item.category]) {
				acc[item.category] = [];
			}
			acc[item.category].push(item);
			return acc;
		}, {} as Record<string, any[]>);

		// Calculate stats
		const stats = {
			totalItems: filteredInventory.length,
			equippedItems: filteredInventory.filter(item => item.isEquipped).length,
			totalValue: filteredInventory.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
			rareItems: filteredInventory.filter(item => ['epic', 'legendary', 'mythic'].includes(item.rarity)).length
		};

		res.json({
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
		res.status(500).json({ error: 'Failed to get inventory' });
	}
});

export default router;
