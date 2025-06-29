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

const router = Router();

// GET /api/shop/items
router.get('/items', async (req, res) => {
	try {
		const { category } = req.query;

		// TODO: Switch to database query once seeded
		// For now, we'll use mock data but transform it to match ShopItem interface

		// Example database query (commented out until DB is seeded):
		/*
    const now = new Date();
    const dbItems = await db.select().from(products)
      .where(and(
        eq(products.status, 'published'),
        eq(products.isDeleted, false),
        or(
          isNull(products.availableFrom),
          lte(products.availableFrom, now)
        ),
        or(
          isNull(products.availableUntil),
          gte(products.availableUntil, now)
        )
      ));
    */

		// Transform mock items to match ShopItem interface expected by frontend
		const transformedItems = shopItems.map((item) => ({
			...item,
			// These fields are already in mock data
			id: item.id,
			name: item.name,
			description: item.description,
			category: item.category,
			priceDGT: item.priceDGT,
			priceUSDT: item.priceUSDT,
			rarity: item.rarity,
			imageUrl: item.imageUrl,

			// Add missing fields with defaults
			isOwned: false,
			isEquipped: false,
			isLocked: false,
			requiredXP: null,
			expiresAt: null,
			availableFrom: null,
			availableUntil: null,
			stockLimit: null,
			stockLeft: null,
			isFeatured: false,
			featuredUntil: null,
			promotionLabel: null
		}));

		// Filter by category if provided
		if (category && category !== 'all') {
			const filtered = transformedItems.filter((item) => item.category === category);
			return res.json(filtered);
		}

		res.json(transformedItems);
	} catch (error) {
		console.error('Error fetching shop items:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		res.status(500).json({ message: 'Error fetching shop items', error: errorMessage });
	}
});

// GET /api/shop/items/:id
router.get('/items/:id', async (req, res) => {
	try {
		const { id } = req.params;

		// Find in mock data for now
		const item = shopItems.find((item) => item.id === id);

		if (!item) {
			return res.status(404).json({ message: 'Item not found' });
		}

		// Transform to match ShopItem interface
		const transformedItem = {
			...item,
			isOwned: false,
			isEquipped: false,
			isLocked: false,
			requiredXP: null,
			expiresAt: null,
			availableFrom: null,
			availableUntil: null,
			stockLimit: null,
			stockLeft: null,
			isFeatured: false,
			featuredUntil: null,
			promotionLabel: null
		};

		res.json(transformedItem);
	} catch (error) {
		console.error('Error fetching shop item:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		res.status(500).json({ message: 'Error fetching shop item', error: errorMessage });
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

		const userId = (userService.getUserFromRequest(req) as { id: number }).id;
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

			// Deduct DGT
			await dgtService.deductDGT(
				userId,
				dgtAmountRequired,
				'SHOP_PURCHASE',
				`Purchased ${item.name}`,
				{ itemId, itemName: item.name, price }
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
				currency
			});

			res.json({
				success: true,
				message: `Successfully purchased ${item.name}`,
				item: {
					id: item.id,
					name: item.name,
					category: item.category,
					price,
					currency
				},
				inventoryId: inventoryItem.id
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

// GET /api/shop/inventory - Get user's purchased items
router.get('/inventory', isAuthenticated, async (req, res) => {
	try {
		if (!userService.getUserFromRequest(req)) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const userId = (userService.getUserFromRequest(req) as { id: number }).id;

		// Get user's inventory
		const inventory = await db.select().from(userInventory).where(eq(userInventory.userId, userId));

		// Enrich with item details from mock data
		const enrichedInventory = inventory
			.map((inv) => {
				const item = shopItems.find((item) => item.id === inv.itemId);
				return {
					...inv,
					item: item || null,
					purchasePrice: inv.purchasePrice / 100 // Convert from cents
				};
			})
			.filter((inv) => inv.item !== null); // Filter out items that no longer exist

		res.json({
			inventory: enrichedInventory,
			totalItems: enrichedInventory.length
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
